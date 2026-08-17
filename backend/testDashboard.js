const baseUrl = 'http://localhost:5000/api';

async function logTest(title) {
  console.log(`\n=== TEST: ${title} ===`);
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

async function runTests() {
  console.log('Resetting database...');
  const { execSync } = await import('child_process');
  execSync('node config/seed.js');
  console.log('Database seeded.');

  // Login as Admin
  let res = await makeRequest('POST', '/auth/login', {
    email: 'admin@transitops.in',
    password: 'AdminSecure2026!',
    role: 'admin',
  });
  const adminToken = res.body.token;

  // 1. Initial Baseline KPI Check
  await logTest('1. Fetch Baseline KPIs');
  res = await makeRequest('GET', '/dashboard', null, adminToken);
  logResult(
    res.status === 200 && res.body.status === 'success' && res.body.data.kpis,
    'Successfully fetched baseline dashboard KPIs',
    'Failed to fetch dashboard stats',
    res
  );
  
  const baselineKpis = res.body.data.kpis;
  console.log(`Initial Available Vehicles: ${baselineKpis.availableVehicles}`);
  console.log(`Initial Vehicles in Maintenance: ${baselineKpis.vehiclesInMaintenance}`);

  // Create a test vehicle (starts as Available)
  console.log('Creating test vehicle...');
  res = await makeRequest(
    'POST',
    '/vehicles',
    {
      registrationNumber: 'TEST-D1',
      nameModel: 'DashVan-11',
      type: 'Van',
      capacity: 500,
      odometer: 10000,
      acquisitionCost: 350000,
    },
    adminToken
  );
  const vehicleId = res.body.data.vehicle._id;

  // Create a test driver
  console.log('Creating test driver...');
  res = await makeRequest(
    'POST',
    '/drivers',
    {
      name: 'John Dasher',
      licenseNumber: 'DL-DASH-11',
      licenseCategory: 'LMV',
      licenseExpiryDate: '2029-12-31',
      contactNumber: '9000000000',
    },
    adminToken
  );
  const driverId = res.body.data.driver._id;

  // Verify counts change (Available should increment by 1)
  res = await makeRequest('GET', '/dashboard', null, adminToken);
  logResult(
    res.body.data.kpis.availableVehicles === baselineKpis.availableVehicles + 1,
    `Verified: Available vehicles count correctly incremented to ${res.body.data.kpis.availableVehicles}`,
    'Available vehicles count failed to increment',
    res
  );

  // 2. Maintenance Trigger Count Changes
  await logTest('2. Maintenance Trigger Count Check (Available -> In Shop)');
  res = await makeRequest(
    'POST',
    '/maintenance',
    {
      vehicle: vehicleId,
      serviceType: 'Routine check',
      cost: 1200,
      status: 'Active',
    },
    adminToken
  );
  const maintenanceId = res.body.data.record._id;

  // Fetch stats and verify Available decrements and In Shop increments
  res = await makeRequest('GET', '/dashboard', null, adminToken);
  logResult(
    res.body.data.kpis.vehiclesInMaintenance === baselineKpis.vehiclesInMaintenance + 1 &&
      res.body.data.kpis.availableVehicles === baselineKpis.availableVehicles,
    `Verified: Vehicles in Maintenance incremented to ${res.body.data.kpis.vehiclesInMaintenance} & Available decremented back to ${res.body.data.kpis.availableVehicles}`,
    'Maintenance triggers failed to update dashboard counts',
    res
  );

  // Close maintenance to make vehicle available again for trip testing
  console.log('Closing maintenance...');
  await makeRequest('PUT', `/maintenance/${maintenanceId}`, { status: 'Completed' }, adminToken);

  // 3. Dispatch Trigger Count Check
  await logTest('3. Dispatch Trigger Count Check (Dispatched Trip -> Active Counts)');
  // Create trip draft
  res = await makeRequest(
    'POST',
    '/trips',
    {
      tripCode: 'TRIP-DASH-1',
      source: 'Warehouse A',
      destination: 'Client Outlet B',
      vehicle: vehicleId,
      driver: driverId,
      cargoWeight: 200,
      plannedDistance: 80,
      revenue: 12000,
    },
    adminToken
  );
  const tripId = res.body.data.trip._id;

  // Dispatch trip
  await makeRequest('PUT', `/trips/${tripId}/dispatch`, null, adminToken);

  // Fetch dashboard and verify active counts and utilization
  res = await makeRequest('GET', '/dashboard', null, adminToken);
  const updatedKpis = res.body.data.kpis;
  logResult(
    updatedKpis.activeTrips === 1 &&
      updatedKpis.activeVehicles === 1 &&
      updatedKpis.fleetUtilization > 0,
    `Verified: Active Trips = ${updatedKpis.activeTrips}, Active Vehicles = ${updatedKpis.activeVehicles}, Fleet Utilization = ${updatedKpis.fleetUtilization}%`,
    'Dispatch triggers failed to update dashboard counts',
    res
  );

  // 4. Completion Reversion Check
  await logTest('4. Complete Trip and verify Reversions');
  await makeRequest(
    'PUT',
    `/trips/${tripId}/complete`,
    {
      actualDistance: 80,
    },
    adminToken
  );

  // Fetch dashboard and verify counts reverted
  res = await makeRequest('GET', '/dashboard', null, adminToken);
  const finalKpis = res.body.data.kpis;
  logResult(
    finalKpis.activeTrips === 0 &&
      finalKpis.activeVehicles === 0 &&
      finalKpis.availableVehicles === baselineKpis.availableVehicles + 1,
    'Verified successfully: Active counts reverted back to 0, Available vehicles returned to service',
    'Dashboard failed to revert counters upon completion',
    res
  );

  // Cleanup
  await makeRequest('DELETE', `/maintenance/${maintenanceId}`, null, adminToken);
  await makeRequest('DELETE', `/trips/${tripId}`, null, adminToken);
  await makeRequest('DELETE', `/vehicles/${vehicleId}`, null, adminToken);
  await makeRequest('DELETE', `/drivers/${driverId}`, null, adminToken);

  console.log('\nAll Dashboard operational KPI Verification Tests Passed Successfully! ✔');
}

runTests();
