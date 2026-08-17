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
  console.log('Logging in as Administrator...');
  let res = await makeRequest('POST', '/auth/login', {
    email: 'admin@transitops.in',
    password: 'AdminSecure2026!',
    role: 'admin',
  });
  const adminToken = res.body.token;

  // Login as Dispatcher
  console.log('Logging in as Dispatcher...');
  res = await makeRequest('POST', '/auth/login', {
    email: 'raven.k@transitops.in',
    password: 'DispatchSecure2026!',
    role: 'dispatcher',
  });
  const dispatcherToken = res.body.token;

  // Login as Financial Analyst
  console.log('Logging in as Financial Analyst...');
  res = await makeRequest('POST', '/auth/login', {
    email: 'financial.analyst@transitops.in',
    password: 'FinanceSecure2026!',
    role: 'financial_analyst',
  });
  const analystToken = res.body.token;

  // 1. Settings Update Persistence & Access Control
  await logTest('1. Settings updates permission lock');
  // Admin tries to update settings
  res = await makeRequest('PUT', '/settings', {
    depotName: 'Ahmedabad HQ Depot',
    currency: 'INR (Rs)',
    distanceUnit: 'Kilometers',
  }, adminToken);
  logResult(
    res.status === 200 && res.body.data.settings.depotName === 'Ahmedabad HQ Depot',
    'Admin successfully updated settings to "Ahmedabad HQ Depot"',
    'Admin settings update failed',
    res
  );

  // Dispatcher tries to update settings
  res = await makeRequest('PUT', '/settings', {
    depotName: 'Malicious Depot Name Change',
  }, dispatcherToken);
  logResult(
    res.status === 403,
    'Dispatcher is successfully blocked from modifying settings (403 Forbidden)',
    'Security failure: Dispatcher was allowed to modify settings',
    res
  );

  // 2. Dispatcher Permission checks (Allowed: Trips, Blocked: Vehicles Write)
  await logTest('2. Dispatcher Permission Verification');
  // Allowed to read/list trips
  res = await makeRequest('GET', '/trips', null, dispatcherToken);
  logResult(
    res.status === 200,
    'Dispatcher is allowed to access Trips endpoint (200 OK)',
    'Dispatcher was blocked from reading trips',
    res
  );

  // Blocked from creating a vehicle
  res = await makeRequest('POST', '/vehicles', {
    registrationNumber: 'TEST-DISP-1',
    nameModel: 'Dispatcher Van',
    type: 'Van',
    capacity: 200,
  }, dispatcherToken);
  logResult(
    res.status === 403,
    'Dispatcher is successfully blocked from creating vehicle (403 Forbidden)',
    'Security failure: Dispatcher was allowed to create vehicle',
    res
  );

  // 3. Financial Analyst Permission checks (Allowed: Reports, Blocked: Drivers Write)
  await logTest('3. Financial Analyst Permission Verification');
  // Allowed to view analytics reports
  res = await makeRequest('GET', '/reports/overview', null, analystToken);
  logResult(
    res.status === 200,
    'Financial Analyst is allowed to access Reports Analytics endpoint (200 OK)',
    'Financial Analyst was blocked from reading reports overview',
    res
  );

  // Blocked from creating a driver
  res = await makeRequest('POST', '/drivers', {
    name: 'Analyst Hack',
    licenseNumber: 'HACK-999',
    licenseCategory: 'LMV',
  }, analystToken);
  logResult(
    res.status === 403,
    'Financial Analyst is successfully blocked from creating driver (403 Forbidden)',
    'Security failure: Financial Analyst was allowed to create driver',
    res
  );

  console.log('\nAll Settings & RBAC Policy Verification Tests Passed Successfully! ✔');
}

runTests();
