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

  // 1) Create a vehicle with acquisitionCost = 200,000 INR
  console.log('Creating test vehicle (Acq Cost: 200,000 INR)...');
  res = await makeRequest(
    'POST',
    '/vehicles',
    {
      registrationNumber: 'TEST-A1',
      nameModel: 'AnalyticsVan-99',
      type: 'Van',
      capacity: 500,
      odometer: 10000,
      acquisitionCost: 200000,
    },
    adminToken
  );
  const vehicleId = res.body.data.vehicle._id;

  // 2) Create a driver
  console.log('Creating test driver...');
  res = await makeRequest(
    'POST',
    '/drivers',
    {
      name: 'John Analyst',
      licenseNumber: 'DL-ANALYST-99',
      licenseCategory: 'LMV',
      licenseExpiryDate: '2029-12-31',
      contactNumber: '9000000000',
    },
    adminToken
  );
  const driverId = res.body.data.driver._id;

  // 3) Create and dispatch a trip
  console.log('Scheduling and dispatching trip (Planned Revenue: 15,000 INR)...');
  res = await makeRequest(
    'POST',
    '/trips',
    {
      tripCode: 'TRIP-A1',
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

  await makeRequest('PUT', `/trips/${tripId}/dispatch`, null, adminToken);

  // 4) Complete trip: actual distance = 120 km, fuel = 15 liters, fuelCost = 1500
  console.log('Completing trip (Actual Distance: 120 km, Fuel Liters: 15, Cost: 1,500 INR)...');
  await makeRequest(
    'PUT',
    `/trips/${tripId}/complete`,
    {
      actualDistance: 120,
      fuelLiters: 15,
      fuelCost: 1500,
    },
    adminToken
  );

  // 5) Create maintenance record: cost = 2,500
  console.log('Creating maintenance log (Cost: 2,500 INR)...');
  await makeRequest(
    'POST',
    '/maintenance',
    {
      vehicle: vehicleId,
      serviceType: 'Oil change & Filter',
      cost: 2500,
      status: 'Completed',
    },
    adminToken
  );

  // 6) Verify report overview (Fuel Efficiency = 120 / 15 = 8.0 km/L)
  await logTest('1. Fuel Efficiency & Monthly Revenue Calculation');
  res = await makeRequest('GET', '/reports/overview', null, adminToken);
  logResult(
    res.status === 200 &&
      res.body.data.summary.overallFuelEfficiency === 8 &&
      res.body.data.monthlyRevenueTrend[0].revenue === 15000,
    'Verified successfully: Fuel Efficiency is 8.0 km/L, Monthly Revenue is 15,000 INR',
    'Report overview calculations are incorrect',
    res
  );

  // 7) Verify vehicle ROI report
  // ROI = ((Revenue - (Maintenance + Fuel)) / AcquisitionCost) * 100
  // ROI = ((15000 - (2500 + 1500)) / 200000) * 100 = (11000 / 200000) * 100 = 5.5%
  await logTest('2. Vehicle Return-On-Investment (ROI) Calculation');
  res = await makeRequest('GET', '/reports/roi', null, adminToken);
  const reportItem = res.body.data.roiReport.find((v) => v.registrationNumber === 'TEST-A1');
  logResult(
    reportItem && reportItem.roi === 5.5,
    'Verified successfully: Vehicle TEST-A1 ROI is exactly 5.5% according to the approved ROI formula',
    'Vehicle ROI calculation is incorrect',
    res
  );

  // Cleanup
  // Delete the completed maintenance logs, expenses, fuel logs, and trip records
  console.log('Cleaning up test entries...');
  await makeRequest('DELETE', `/trips/${tripId}`, null, adminToken);
  await makeRequest('DELETE', `/vehicles/${vehicleId}`, null, adminToken);
  await makeRequest('DELETE', `/drivers/${driverId}`, null, adminToken);

  console.log('\nAll Reports & Analytics Verification Tests Passed Successfully! ✔');
}

runTests();
