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
  // Reset database first
  console.log('Resetting database...');
  const { execSync } = await import('child_process');
  execSync('node config/seed.js');
  console.log('Database seeded.');

  // Login tokens
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
  const managerToken = res.body.token;

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
  const safetyToken = res.body.token;

  // 1. Dispatcher Permission Check: Vehicle & Driver writes blocked
  await logTest('1. Dispatcher RBAC Write Block Check');
  const testVehicle = {
    registrationNumber: 'GJ01AB1111',
    nameModel: 'TEST-VAN',
    type: 'Van',
    capacity: 600,
    odometer: 12000,
    acquisitionCost: 400000,
  };
  res = await makeRequest('POST', '/vehicles', testVehicle, dispatcherToken);
  logResult(
    res.status === 403 && res.body.message.includes('permission'),
    'Successfully blocked Dispatcher from adding vehicle (403)',
    'Failed to block dispatcher from vehicle write',
    res
  );

  const testDriver = {
    name: 'Test Operator',
    licenseNumber: 'DL-99999',
    licenseCategory: 'LMV',
    licenseExpiryDate: '2028-12-31',
    contactNumber: '9999999999',
  };
  res = await makeRequest('POST', '/drivers', testDriver, dispatcherToken);
  logResult(
    res.status === 403 && res.body.message.includes('permission'),
    'Successfully blocked Dispatcher from adding driver (403)',
    'Failed to block dispatcher from driver write',
    res
  );

  // 2. Fleet Manager creates vehicle successfully
  await logTest('2. Fleet Manager creates vehicle successfully');
  res = await makeRequest('POST', '/vehicles', testVehicle, managerToken);
  logResult(
    res.status === 201 && res.body.status === 'success' && res.body.data.vehicle.registrationNumber === 'GJ01AB1111',
    'Successfully registered vehicle as Fleet Manager (201)',
    'Failed to create vehicle as Fleet Manager',
    res
  );
  const createdVehicleId = res.body.data.vehicle._id;

  // 3. Duplicate vehicle registration block
  await logTest('3. Duplicate vehicle registration block');
  res = await makeRequest('POST', '/vehicles', testVehicle, managerToken);
  logResult(
    res.status === 400 && res.body.message.includes('already exists'),
    'Successfully blocked duplicate vehicle registration (400)',
    'Failed to block duplicate vehicle registration',
    res
  );

  // 4. Update vehicle status and verification
  await logTest('4. Update vehicle status');
  res = await makeRequest('PUT', `/vehicles/${createdVehicleId}`, { status: 'In Shop' }, managerToken);
  logResult(
    res.status === 200 && res.body.data.vehicle.status === 'In Shop',
    'Successfully updated vehicle status to In Shop',
    'Failed to update vehicle status',
    res
  );

  // 5. Query vehicles with filters
  await logTest('5. Query vehicles filter check');
  res = await makeRequest('GET', '/vehicles?status=In Shop', null, dispatcherToken);
  logResult(
    res.status === 200 && res.body.data.vehicles.every((v) => v.status === 'In Shop'),
    'Successfully retrieved only In Shop status vehicles',
    'Failed to filter vehicles by status',
    res
  );

  // 6. Safety Officer creates driver successfully
  await logTest('6. Safety Officer creates driver successfully');
  res = await makeRequest('POST', '/drivers', testDriver, safetyToken);
  logResult(
    res.status === 201 && res.body.status === 'success' && res.body.data.driver.licenseNumber === 'DL-99999',
    'Successfully registered driver as Safety Officer (201)',
    'Failed to create driver as Safety Officer',
    res
  );
  const createdDriverId = res.body.data.driver._id;

  // 7. Duplicate driver license block
  await logTest('7. Duplicate driver license block');
  res = await makeRequest('POST', '/drivers', testDriver, safetyToken);
  logResult(
    res.status === 400 && res.body.message.includes('already exists'),
    'Successfully blocked duplicate driver license registration (400)',
    'Failed to block duplicate license registration',
    res
  );

  // 8. Suspend driver verification
  await logTest('8. Suspend driver status toggle');
  res = await makeRequest('PUT', `/drivers/${createdDriverId}/suspend`, null, safetyToken);
  logResult(
    res.status === 200 && res.body.data.driver.status === 'Suspended',
    'Successfully suspended driver (Status: Suspended)',
    'Failed to suspend driver',
    res
  );

  // 9. Query drivers filter check
  await logTest('9. Query drivers filter check');
  res = await makeRequest('GET', '/drivers?status=Suspended', null, safetyToken);
  logResult(
    res.status === 200 && res.body.data.drivers.every((d) => d.status === 'Suspended'),
    'Successfully retrieved only Suspended drivers',
    'Failed to filter drivers by status',
    res
  );

  // 10. Clean up test records
  await logTest('10. Clean up test entries');
  res = await makeRequest('DELETE', `/vehicles/${createdVehicleId}`, null, managerToken);
  logResult(res.status === 200, 'Successfully deleted test vehicle', 'Failed to delete vehicle', res);

  res = await makeRequest('DELETE', `/drivers/${createdDriverId}`, null, safetyToken);
  logResult(res.status === 200, 'Successfully deleted test driver', 'Failed to delete driver', res);

  console.log('\nAll Vehicles & Drivers Verification Tests Passed Successfully! ✔');
}

runTests();
