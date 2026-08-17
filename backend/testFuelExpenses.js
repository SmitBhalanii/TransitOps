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
      registrationNumber: 'TEST-F1',
      nameModel: 'CargoVan-Fuel',
      type: 'Van',
      capacity: 500,
      odometer: 10000,
      acquisitionCost: 350000,
    },
    adminToken
  );
  const vehicleId = res.body.data.vehicle._id;

  // 1. Refueling Creation & Ledger Sync
  await logTest('1. Refueling Creation & Ledger Sync');
  res = await makeRequest(
    'POST',
    '/fuel',
    {
      vehicle: vehicleId,
      liters: 40,
      fuelCost: 4000,
      date: '2026-08-18',
    },
    adminToken
  );
  const fuelLogId = res.body.data.log._id;

  // Fetch expenses to verify synced record
  res = await makeRequest('GET', `/expenses?vehicle=${vehicleId}&expenseType=Fuel`, null, adminToken);
  logResult(
    res.body.results === 1 && res.body.data.expenses[0].amount === 4000,
    'Verified successfully: FuelLog creation automatically registered a corresponding Fuel expense in ledger (4000 INR)',
    'Failed to sync FuelLog to Expense collection',
    res
  );

  // 2. Maintenance Creation & Ledger Sync
  await logTest('2. Maintenance Creation & Ledger Sync');
  res = await makeRequest(
    'POST',
    '/maintenance',
    {
      vehicle: vehicleId,
      serviceType: 'Engine Tuning',
      cost: 6500,
      notes: 'Routine 10k engine servicing',
      status: 'Active',
    },
    adminToken
  );
  const maintenanceId = res.body.data.record._id;

  // Fetch expenses to verify synced record
  res = await makeRequest('GET', `/expenses?vehicle=${vehicleId}&expenseType=Maintenance`, null, adminToken);
  logResult(
    res.body.results === 1 && res.body.data.expenses[0].amount === 6500,
    'Verified successfully: Maintenance creation automatically registered a corresponding Maintenance expense in ledger (6500 INR)',
    'Failed to sync Maintenance log to Expense collection',
    res
  );

  // Log a manual toll expense
  console.log('Logging manual toll expense...');
  await makeRequest(
    'POST',
    '/expenses',
    {
      vehicle: vehicleId,
      expenseType: 'Toll',
      amount: 450,
      description: 'National Highway toll',
    },
    adminToken
  );

  // 3. Operational Cost Calculation Engine
  await logTest('3. Server-Side Operational Cost Engine');
  res = await makeRequest('GET', `/expenses/operational-cost?vehicle=${vehicleId}`, null, adminToken);
  const expectedTotal = 4000 + 6500 + 450; // Fuel + Maintenance + Toll = 10950
  logResult(
    res.status === 200 &&
      res.body.data.breakdown.Fuel === 4000 &&
      res.body.data.breakdown.Maintenance === 6500 &&
      res.body.data.breakdown.Toll === 450 &&
      res.body.data.totalOperationalCost === expectedTotal,
    'Verified successfully: Total operational cost aggregated by server is correct (10,950 INR) with zero double counting',
    'Server-side operational cost aggregation calculations are incorrect',
    res
  );

  // 4. Cascade Cleanup on Delete
  await logTest('4. Cascade Cleanup Integrity');
  // Delete Fuel Log
  await makeRequest('DELETE', `/fuel/${fuelLogId}`, null, adminToken);
  // Delete Maintenance
  await makeRequest('DELETE', `/maintenance/${maintenanceId}`, null, adminToken);

  // Verify expenses are cleared
  res = await makeRequest('GET', `/expenses?vehicle=${vehicleId}`, null, adminToken);
  logResult(
    res.body.results === 1 && res.body.data.expenses[0].expenseType === 'Toll', // Only toll should remain
    'Verified successfully: Synced Expense logs were cleanly cascaded and removed upon deleting Fuel & Maintenance records',
    'Synced expense records remained after deleting source records',
    res
  );

  // Cleanup
  await makeRequest('DELETE', `/expenses/${res.body.data.expenses[0]._id}`, null, adminToken);
  await makeRequest('DELETE', `/vehicles/${vehicleId}`, null, adminToken);

  console.log('\nAll Fuel & Expense Ledger Verification Tests Passed Successfully! ✔');
}

runTests();
