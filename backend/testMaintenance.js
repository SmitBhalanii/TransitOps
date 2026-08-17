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

  // Create a test vehicle
  console.log('Creating test vehicle...');
  res = await makeRequest(
    'POST',
    '/vehicles',
    {
      registrationNumber: 'TEST-M1',
      nameModel: 'ServiceVan-99',
      type: 'Van',
      capacity: 500,
      odometer: 10000,
      acquisitionCost: 300000,
    },
    adminToken
  );
  if (res.status !== 201) {
    console.error('Vehicle creation failed:', res.status, JSON.stringify(res.body, null, 2));
    process.exit(1);
  }
  const vehicleId = res.body.data.vehicle._id;

  // Create a test driver (required to construct a trip)
  console.log('Creating test driver...');
  res = await makeRequest(
    'POST',
    '/drivers',
    {
      name: 'John ShopOperator',
      licenseNumber: 'DL-SHOP-99',
      licenseCategory: 'LMV',
      licenseExpiryDate: '2029-12-31',
      contactNumber: '9000000000',
    },
    adminToken
  );
  const driverId = res.body.data.driver._id;

  // 1. Available -> In Shop
  await logTest('1. Transition Available -> In Shop (Scheduling Maintenance)');
  res = await makeRequest(
    'POST',
    '/maintenance',
    {
      vehicle: vehicleId,
      serviceType: 'Brake Replacement',
      cost: 5000,
      notes: 'Worn brake shoes replacement',
      status: 'Active',
    },
    adminToken
  );
  const maintenanceId = res.body.data.record._id;

  // Verify vehicle is In Shop
  res = await makeRequest('GET', `/vehicles/${vehicleId}`, null, adminToken);
  logResult(
    res.body.data.vehicle.status === 'In Shop',
    'Successfully shifted vehicle status to: In Shop',
    'Vehicle failed to shift to In Shop status',
    res
  );

  // 2. Dispatch Block for In Shop Vehicle
  await logTest('2. Dispatch Check: Block In Shop vehicles');
  // Create a trip draft with this vehicle
  res = await makeRequest(
    'POST',
    '/trips',
    {
      tripCode: 'TRIP-BLOCKED-M',
      source: 'Warehouse A',
      destination: 'Client Outlet B',
      vehicle: vehicleId,
      driver: driverId,
      cargoWeight: 100,
      plannedDistance: 120,
      revenue: 15000,
    },
    adminToken
  );
  const tripId = res.body.data.trip._id;

  // Attempt dispatch
  res = await makeRequest('PUT', `/trips/${tripId}/dispatch`, null, adminToken);
  logResult(
    res.status === 400 && res.body.message.includes('Cannot dispatch'),
    'Successfully blocked dispatch. Vehicle is In Shop (400)',
    'Failed to block dispatch of In Shop vehicle',
    res
  );

  // Clean up blocked trip
  await makeRequest('DELETE', `/trips/${tripId}`, null, adminToken);

  // 3. In Shop -> Available
  await logTest('3. Transition In Shop -> Available (Completing Maintenance)');
  res = await makeRequest('PUT', `/maintenance/${maintenanceId}`, { status: 'Completed' }, adminToken);
  logResult(
    res.status === 200 && res.body.data.record.status === 'Completed',
    'Successfully marked maintenance log as Completed',
    'Failed to update maintenance log to Completed',
    res
  );

  // Verify vehicle is Available
  res = await makeRequest('GET', `/vehicles/${vehicleId}`, null, adminToken);
  logResult(
    res.body.data.vehicle.status === 'Available',
    'Successfully reverted vehicle status to: Available',
    'Vehicle failed to revert to Available status',
    res
  );

  // 4. Retired Exception: Check Retired state remains Retired
  await logTest('4. Retired Exception: Check Retired state remains Retired');
  
  // Set vehicle back to Available first
  await makeRequest('PUT', `/vehicles/${vehicleId}`, { status: 'Available' }, adminToken);

  // Schedule new maintenance (transitions vehicle to In Shop)
  res = await makeRequest(
    'POST',
    '/maintenance',
    {
      vehicle: vehicleId,
      serviceType: 'Final Inspection',
      cost: 2000,
      status: 'Active',
    },
    adminToken
  );
  const retiredMaintenanceId = res.body.data.record._id;

  // Retire the vehicle while it is in the shop
  await makeRequest('PUT', `/vehicles/${vehicleId}`, { status: 'Retired' }, adminToken);

  // Complete maintenance
  await makeRequest('PUT', `/maintenance/${retiredMaintenanceId}`, { status: 'Completed' }, adminToken);

  // Verify vehicle is STILL Retired (Exception lock)
  res = await makeRequest('GET', `/vehicles/${vehicleId}`, null, adminToken);
  logResult(
    res.body.data.vehicle.status === 'Retired',
    'Verified successfully: Retired vehicle status remains Retired after service completion',
    'Retired vehicle was incorrectly reset to Available status',
    res
  );

  // Cleanup
  await makeRequest('DELETE', `/maintenance/${maintenanceId}`, null, adminToken);
  await makeRequest('DELETE', `/maintenance/${retiredMaintenanceId}`, null, adminToken);
  await makeRequest('DELETE', `/vehicles/${vehicleId}`, null, adminToken);
  await makeRequest('DELETE', `/drivers/${driverId}`, null, adminToken);

  console.log('\nAll Maintenance Workflow Verification Tests Passed Successfully! ✔');
}

runTests();
