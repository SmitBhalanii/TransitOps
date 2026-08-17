const baseUrl = 'http://localhost:5000/api';

async function logTest(title) {
  console.log(`\n========================================`);
  console.log(`E2E FLOW: ${title}`);
  console.log(`========================================`);
}

function logResult(condition, successMessage, failMessage, actualResponse = null) {
  if (condition) {
    console.log(`✔ SUCCESS: ${successMessage}`);
  } else {
    console.error(`✘ FAILED: ${failMessage}`);
    if (actualResponse) {
      console.error(`Status Code: ${actualResponse.status}`);
      console.error('Body:', JSON.stringify(actualResponse.body, null, 2));
    }
    process.exit(1);
  }
}

async function makeRequest(method, endpoint, body = null, token = null) {
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options = {
    method,
    headers,
  };
  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const res = await fetch(`${baseUrl}${endpoint}`, options);
    let responseBody;
    try {
      responseBody = await res.json();
    } catch (e) {
      responseBody = await res.text();
    }
    return { status: res.status, body: responseBody };
  } catch (error) {
    return { status: 500, body: error.message };
  }
}

async function runSystemIntegrationTests() {
  console.log('Resetting and seeding database for clean slate...');
  const { execSync } = await import('child_process');
  execSync('node config/seed.js');
  console.log('Database seeded.');

  // Login as all roles to acquire tokens
  console.log('\nAcquiring authentication tokens...');
  
  let res = await makeRequest('POST', '/auth/login', {
    email: 'admin@transitops.in',
    password: 'AdminSecure2026!',
    role: 'admin',
  });
  const adminToken = res.body.token;

  res = await makeRequest('POST', '/auth/login', {
    email: 'fleet.manager@transitops.in',
    password: 'FleetSecure2026!',
    role: 'fleet_manager',
  });
  const fleetManagerToken = res.body.token;

  res = await makeRequest('POST', '/auth/login', {
    email: 'raven.k@transitops.in',
    password: 'DispatchSecure2026!',
    role: 'dispatcher',
  });
  const dispatcherToken = res.body.token;

  res = await makeRequest('POST', '/auth/login', {
    email: 'safety.officer@transitops.in',
    password: 'SafetySecure2026!',
    role: 'safety_officer',
  });
  const safetyOfficerToken = res.body.token;

  res = await makeRequest('POST', '/auth/login', {
    email: 'financial.analyst@transitops.in',
    password: 'FinanceSecure2026!',
    role: 'financial_analyst',
  });
  const analystToken = res.body.token;

  logResult(
    adminToken && fleetManagerToken && dispatcherToken && safetyOfficerToken && analystToken,
    'All five user role tokens successfully acquired',
    'Failed to acquire credentials'
  );

  // ==================================================
  // END-TO-END FLOW 1: Trip Dispatch -> Cost Ledger -> Metrics Engine
  // ==================================================
  await logTest('1. Trip Dispatch -> Cost Ledger -> Metrics Engine');
  
  // 1. Create a Vehicle (Acq Cost: 250,000 INR)
  console.log('Creating test vehicle...');
  res = await makeRequest('POST', '/vehicles', {
    registrationNumber: 'GJ-04-E2E',
    nameModel: 'Tata Ultra E2E',
    type: 'Truck',
    capacity: 2000,
    odometer: 50000,
    acquisitionCost: 250000,
  }, fleetManagerToken);
  console.log('Vehicle Creation Response:', res.status, JSON.stringify(res.body));
  const vehicleId = res.body.data.vehicle._id;

  // 2. Create a Driver
  console.log('Creating test driver...');
  res = await makeRequest('POST', '/drivers', {
    name: 'Dilip Patel',
    licenseNumber: 'DL-GJ04-E2E',
    licenseCategory: 'HMV',
    licenseExpiryDate: '2030-05-15',
    contactNumber: '9123456789',
  }, safetyOfficerToken);
  console.log('Driver Creation Response:', res.status, JSON.stringify(res.body));
  const driverId = res.body.data.driver._id;

  // 3. Create a Trip (Revenue: 20,000 INR)
  console.log('Creating trip draft...');
  res = await makeRequest('POST', '/trips', {
    tripCode: 'TRIP-E2E-1',
    source: 'Surat Cargo Hub',
    destination: 'Mumbai Port Depot',
    vehicle: vehicleId,
    driver: driverId,
    cargoWeight: 1200,
    plannedDistance: 150,
    revenue: 20000,
  }, dispatcherToken);
  const tripId = res.body.data.trip._id;

  // 4. Dispatch Trip
  console.log('Dispatching trip...');
  res = await makeRequest('PUT', `/trips/${tripId}/dispatch`, null, dispatcherToken);
  logResult(res.status === 200, 'Trip dispatched successfully', 'Failed to dispatch trip', res);

  // Assert Vehicle & Driver statuses are On Trip
  const vehicleCheck = await makeRequest('GET', `/vehicles/${vehicleId}`, null, adminToken);
  const driverCheck = await makeRequest('GET', `/drivers/${driverId}`, null, adminToken);
  logResult(
    vehicleCheck.body.data.vehicle.status === 'On Trip' && driverCheck.body.data.driver.status === 'On Trip',
    'Vehicle and Driver status successfully updated and locked to "On Trip"',
    'Status lock failure',
    vehicleCheck
  );

  // Attempt to schedule another trip with the same vehicle (Must fail)
  const doubleTrip = await makeRequest('POST', '/trips', {
    tripCode: 'TRIP-DOUBLE',
    source: 'Surat Cargo Hub',
    destination: 'Mumbai Port Depot',
    vehicle: vehicleId,
    driver: driverId,
    cargoWeight: 500,
    plannedDistance: 100,
    revenue: 8000,
  }, dispatcherToken);
  const doubleTripId = doubleTrip.body.data.trip._id;

  // Try to dispatch the busy vehicle/driver
  const doubleTripDispatch = await makeRequest('PUT', `/trips/${doubleTripId}/dispatch`, null, dispatcherToken);
  logResult(
    doubleTripDispatch.status === 400,
    'Backend correctly rejected dispatching already active/busy vehicle or driver (400 Bad Request)',
    'Security failure: Allowed double dispatching of busy assets',
    doubleTripDispatch
  );

  // Clean up double trip draft
  await makeRequest('DELETE', `/trips/${doubleTripId}`, null, adminToken);

  // 5. Complete Trip (Distance: 150 km, Fuel Consumed: 20 Liters, Fuel Cost: 2,000 INR)
  console.log('Completing trip and logging fuel...');
  res = await makeRequest('PUT', `/trips/${tripId}/complete`, {
    actualDistance: 150,
    fuelLiters: 20,
    fuelCost: 2000,
  }, dispatcherToken);
  logResult(res.status === 200, 'Trip successfully completed', 'Trip completion request failed', res);

  // Verify Reversions & Odometer
  const finalVehicleCheck = await makeRequest('GET', `/vehicles/${vehicleId}`, null, adminToken);
  const finalDriverCheck = await makeRequest('GET', `/drivers/${driverId}`, null, adminToken);
  logResult(
    finalVehicleCheck.body.data.vehicle.status === 'Available' && 
      finalDriverCheck.body.data.driver.status === 'Available' &&
      finalVehicleCheck.body.data.vehicle.odometer === 50150,
    'Reversion check passed: Vehicle & Driver returned to "Available". Odometer incremented to 50,150 km',
    'Reversion or odometer increment failure',
    finalVehicleCheck
  );

  // Verify dynamic ROI is populated
  // ROI = ((Revenue - FuelCost) / Acquisition) * 100 = ((20000 - 2000) / 250000) * 100 = (18000 / 250000) * 100 = 7.2%
  console.log('Verifying server-side calculated ROI...');
  res = await makeRequest('GET', '/reports/roi', null, adminToken);
  const vRoi = res.body.data.roiReport.find(v => v.registrationNumber === 'GJ-04-E2E');
  logResult(
    vRoi && vRoi.roi === 7.2,
    `ROI calculations verified: Vehicle GJ-04-E2E return-on-investment is exactly ${vRoi?.roi}%`,
    'Calculations engine failed to match expected ROI',
    res
  );

  // ==================================================
  // END-TO-END FLOW 2: Maintenance Blocks & Reversions
  // ==================================================
  await logTest('2. Maintenance Blocks & Reversions');

  // 1. Create Maintenance log (Active status)
  console.log('Scheduling active maintenance on vehicle...');
  res = await makeRequest('POST', '/maintenance', {
    vehicle: vehicleId,
    serviceType: 'Tire replacement',
    cost: 3000,
    status: 'Active',
  }, fleetManagerToken);
  const maintenanceId = res.body.data.record._id;

  // Assert vehicle transitions to In Shop
  const maintVehicleCheck = await makeRequest('GET', `/vehicles/${vehicleId}`, null, adminToken);
  logResult(
    maintVehicleCheck.body.data.vehicle.status === 'In Shop',
    'Vehicle status successfully set to "In Shop" upon scheduling checkup',
    'Maintenance state hook failure',
    maintVehicleCheck
  );

  // Assert backend rejects dispatch attempts of vehicle in shop
  const blockedMaintTrip = await makeRequest('POST', '/trips', {
    tripCode: 'TRIP-BLOCKED-MAINT',
    source: 'Surat Cargo Hub',
    destination: 'Mumbai Port Depot',
    vehicle: vehicleId,
    driver: driverId,
    cargoWeight: 100,
    plannedDistance: 100,
    revenue: 5000,
  }, dispatcherToken);
  const blockedMaintTripId = blockedMaintTrip.body.data.trip._id;

  // Try to dispatch the vehicle that is In Shop
  const blockedMaintDispatch = await makeRequest('PUT', `/trips/${blockedMaintTripId}/dispatch`, null, dispatcherToken);
  logResult(
    blockedMaintDispatch.status === 400 && blockedMaintDispatch.body.message.includes('In Shop'),
    'Backend correctly rejected dispatching on vehicle currently under maintenance in shop (400 Bad Request)',
    'Security failure: Dispatch permitted on vehicle under maintenance',
    blockedMaintDispatch
  );

  // Clean up the draft trip
  await makeRequest('DELETE', `/trips/${blockedMaintTripId}`, null, adminToken);

  // 2. Complete Maintenance
  console.log('Completing vehicle maintenance...');
  await makeRequest('PUT', `/maintenance/${maintenanceId}`, { status: 'Completed' }, fleetManagerToken);

  // Assert vehicle returns to Available
  const finalMaintVehicleCheck = await makeRequest('GET', `/vehicles/${vehicleId}`, null, adminToken);
  logResult(
    finalMaintVehicleCheck.body.data.vehicle.status === 'Available',
    'Vehicle returned back to "Available" status upon maintenance completion',
    'Vehicle reversion check failed',
    finalMaintVehicleCheck
  );

  // ==================================================
  // END-TO-END FLOW 3: Driver License / Safety Checks
  // ==================================================
  await logTest('3. Driver Safety & Expiry checks');

  // 1. Expire driver license
  console.log('Simulating expired license for driver...');
  await makeRequest('PUT', `/drivers/${driverId}`, {
    licenseExpiryDate: '2026-08-17', // Yesterday (expired)
  }, safetyOfficerToken);

  // Dispatch should fail
  const blockedDriverTrip = await makeRequest('POST', '/trips', {
    tripCode: 'TRIP-BLOCKED-DRIVER',
    source: 'Surat',
    destination: 'Mumbai',
    vehicle: vehicleId,
    driver: driverId,
    cargoWeight: 100,
    plannedDistance: 100,
    revenue: 5000,
  }, dispatcherToken);
  const blockedDriverTripId = blockedDriverTrip.body.data.trip._id;

  // Try to dispatch the driver with the expired license
  const blockedDriverDispatch = await makeRequest('PUT', `/trips/${blockedDriverTripId}/dispatch`, null, dispatcherToken);
  logResult(
    blockedDriverDispatch.status === 400 && blockedDriverDispatch.body.message.includes('expired'),
    'Backend correctly rejected driver with an expired license from dispatch execution (400 Bad Request)',
    'Security failure: Dispatch permitted on operator with expired license',
    blockedDriverDispatch
  );

  // Clean up the draft trip
  await makeRequest('DELETE', `/trips/${blockedDriverTripId}`, null, adminToken);

  // Restore license expiry
  console.log('Restoring license validity...');
  await makeRequest('PUT', `/drivers/${driverId}`, {
    licenseExpiryDate: '2030-05-15',
  }, safetyOfficerToken);

  // ==================================================
  // ROLE PERMISSIONS MATRIX VERIFICATION
  // ==================================================
  await logTest('4. Role Permissions & Access Checks');

  // Financial Analyst trying to update Drivers (Must be 403)
  const analystDriverUpdate = await makeRequest('PUT', `/drivers/${driverId}`, {
    name: 'Hack Name',
  }, analystToken);

  // Dispatcher trying to edit settings (Must be 403)
  const dispatcherSettingsUpdate = await makeRequest('PUT', '/settings', {
    depotName: 'Dispatcher Hack Depot',
  }, dispatcherToken);

  // Safety Officer trying to read analytics report overview (Must be 403)
  const safetyOfficerReport = await makeRequest('GET', '/reports/overview', null, safetyOfficerToken);

  // Admin trying to edit settings (Must be 200)
  const adminSettingsUpdate = await makeRequest('PUT', '/settings', {
    depotName: 'TransitOps Gandhinagar Hub',
  }, adminToken);

  logResult(
    analystDriverUpdate.status === 403 &&
      dispatcherSettingsUpdate.status === 403 &&
      safetyOfficerReport.status === 403 &&
      adminSettingsUpdate.status === 200,
    'Role-Based Access Control (RBAC) permission blocks and access matrix verify successfully',
    'RBAC authorization failure',
    dispatcherSettingsUpdate
  );

  // Clean up E2E records
  console.log('Cleaning up E2E test entries...');
  await makeRequest('DELETE', `/maintenance/${maintenanceId}`, null, adminToken);
  await makeRequest('DELETE', `/trips/${tripId}`, null, adminToken);
  await makeRequest('DELETE', `/vehicles/${vehicleId}`, null, adminToken);
  await makeRequest('DELETE', `/drivers/${driverId}`, null, adminToken);

  console.log('\n========================================');
  console.log('ALL TRANSITOPS SYSTEM INTEGRATION TESTS PASSED!');
  console.log('========================================');
}

runSystemIntegrationTests();
