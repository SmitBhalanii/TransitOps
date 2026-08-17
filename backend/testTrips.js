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

  // 1) Login as Admin
  let res = await makeRequest('POST', '/auth/login', {
    email: 'admin@transitops.in',
    password: 'AdminSecure2026!',
    role: 'admin',
  });
  const adminToken = res.body.token;

  // 2) Create a test vehicle with capacity = 500 kg, odometer = 10000 km
  console.log('Creating test vehicle...');
  res = await makeRequest(
    'POST',
    '/vehicles',
    {
      registrationNumber: 'TEST-500KG',
      nameModel: 'CargoVan-500',
      type: 'Van',
      capacity: 500,
      odometer: 10000,
      acquisitionCost: 350000,
    },
    adminToken
  );
  const vehicleId = res.body.data.vehicle._id;

  // 3) Create a test driver
  console.log('Creating test driver...');
  res = await makeRequest(
    'POST',
    '/drivers',
    {
      name: 'John Dispatcher',
      licenseNumber: 'DL-DISPATCH-99',
      licenseCategory: 'LMV',
      licenseExpiryDate: '2029-12-31',
      contactNumber: '9000000000',
    },
    adminToken
  );
  const driverId = res.body.data.driver._id;

  // 4) Create a Draft trip with cargo weight = 700 kg
  await logTest('1. Create Trip with Cargo = 700 kg (Vehicle Capacity = 500 kg)');
  res = await makeRequest(
    'POST',
    '/trips',
    {
      tripCode: 'TRIP-700KG',
      source: 'Warehouse A',
      destination: 'Client Outlet B',
      vehicle: vehicleId,
      driver: driverId,
      cargoWeight: 700,
      plannedDistance: 120,
      revenue: 18000,
    },
    adminToken
  );
  logResult(
    res.status === 201 && res.body.data.trip.status === 'Draft',
    'Successfully created Draft trip with cargo = 700 kg',
    'Failed to create Draft trip',
    res
  );
  const tripId = res.body.data.trip._id;

  // 5) Try to Dispatch 700 kg cargo -> EXPECT BLOCKED
  await logTest('2. Attempt Dispatch of oversized cargo (700 kg > 500 kg)');
  res = await makeRequest('PUT', `/trips/${tripId}/dispatch`, null, adminToken);
  logResult(
    res.status === 400 && res.body.message.includes('exceeds vehicle capacity'),
    'Successfully blocked dispatch. Cargo weight exceeds vehicle capacity (400)',
    'Failed to block oversized cargo dispatch',
    res
  );

  // 6) Update cargo weight to 400 kg
  await logTest('3. Update cargo weight to 400 kg');
  res = await makeRequest('PUT', `/trips/${tripId}`, { cargoWeight: 400 }, adminToken);
  logResult(
    res.status === 200 && res.body.data.trip.cargoWeight === 400,
    'Successfully updated trip cargo weight to 400 kg',
    'Failed to update cargo weight',
    res
  );

  // 7) Dispatch 400 kg cargo -> EXPECT SUCCESS
  await logTest('4. Dispatch cargo (400 kg <= 500 kg)');
  res = await makeRequest('PUT', `/trips/${tripId}/dispatch`, null, adminToken);
  logResult(
    res.status === 200 && res.body.status === 'success',
    'Successfully dispatched trip (200)',
    'Failed to dispatch trip',
    res
  );

  // 8) Verify Trip, Vehicle, and Driver statuses are On Trip
  await logTest('5. Verify On Trip states');
  const tripRes = await makeRequest('GET', `/trips/${tripId}`, null, adminToken);
  const vehicleRes = await makeRequest('GET', `/vehicles/${vehicleId}`, null, adminToken);
  const driverRes = await makeRequest('GET', `/drivers/${driverId}`, null, adminToken);

  const statesCorrect =
    tripRes.body.data.trip.status === 'Dispatched' &&
    vehicleRes.body.data.vehicle.status === 'On Trip' &&
    driverRes.body.data.driver.status === 'On Trip';

  logResult(
    statesCorrect,
    'Verified successfully: Trip = Dispatched, Vehicle = On Trip, Driver = On Trip',
    'State updates are inconsistent after dispatch',
    { trip: tripRes.body, vehicle: vehicleRes.body, driver: driverRes.body }
  );

  // 9) Complete the Trip
  await logTest('6. Complete Trip and verify odometer/fuel/expense logs');
  const completionData = {
    actualDistance: 120,
    fuelLiters: 15,
    fuelCost: 1500,
    tollAmount: 200,
    otherAmount: 100,
    description: 'Parking charges',
  };
  res = await makeRequest('PUT', `/trips/${tripId}/complete`, completionData, adminToken);
  logResult(
    res.status === 200 && res.body.status === 'success',
    'Successfully completed trip (200)',
    'Failed to complete trip',
    res
  );

  // 10) Verify Completion states & Odometer updates
  await logTest('7. Verify Available states & Odometer');
  const tripCompRes = await makeRequest('GET', `/trips/${tripId}`, null, adminToken);
  const vehicleCompRes = await makeRequest('GET', `/vehicles/${vehicleId}`, null, adminToken);
  const driverCompRes = await makeRequest('GET', `/drivers/${driverId}`, null, adminToken);

  const compStatesCorrect =
    tripCompRes.body.data.trip.status === 'Completed' &&
    vehicleCompRes.body.data.vehicle.status === 'Available' &&
    vehicleCompRes.body.data.vehicle.odometer === 10120 && // 10000 + 120
    driverCompRes.body.data.driver.status === 'Available';

  logResult(
    compStatesCorrect,
    'Verified successfully: Trip = Completed, Vehicle = Available, Vehicle Odometer = 10120, Driver = Available',
    'Inconsistent states or incorrect odometer calculation after completion',
    { trip: tripCompRes.body, vehicle: vehicleCompRes.body, driver: driverCompRes.body }
  );

  console.log('\nAll Trip Dispatcher Verification Tests Passed Successfully! ✔');
}

runTests();
