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
  // 1. Access Protected Route without Token
  await logTest('1. Access Protected Route without Token');
  let res = await makeRequest('GET', '/users');
  logResult(
    res.status === 401 && res.body.message.includes('not logged in'),
    'Successfully blocked access without token (401)',
    'Failed to block access without token',
    res
  );

  // 2. Access Protected Route with Invalid Token
  await logTest('2. Access Protected Route with Invalid Token');
  res = await makeRequest('GET', '/users', null, 'invalidtoken123');
  logResult(
    res.status === 401 && res.body.message.includes('Invalid token'),
    'Successfully blocked access with invalid token (401)',
    'Failed to block access with invalid token',
    res
  );

  // 3. Invalid Login (Wrong Password)
  await logTest('3. Invalid Login (Wrong Password)');
  const loginBody = {
    email: 'raven.k@transitops.in',
    password: 'WrongPassword',
    role: 'dispatcher',
  };
  res = await makeRequest('POST', '/auth/login', loginBody);
  logResult(
    res.status === 401 && res.body.message.includes('Invalid credentials'),
    'Successfully rejected wrong password (401)',
    'Failed to reject wrong password',
    res
  );

  // 4. Account Lockout Mechanism (Try wrong password 5 times)
  await logTest('4. Account Lockout Mechanism (5 failed attempts)');
  console.log('Performing failed login attempts 2 to 5...');
  for (let i = 2; i <= 5; i++) {
    res = await makeRequest('POST', '/auth/login', loginBody);
  }
  logResult(
    res.status === 401 && res.body.message.includes('locked'),
    'Successfully locked account after 5 failed attempts (401)',
    'Failed to lock account',
    res
  );

  // Let's reset the database seed so we can continue testing without waiting 15 minutes!
  await logTest('Reseeding database to reset lockout...');
  // We can seed by calling the seed script directly from node or calling it via command
  console.log('Resetting DB...');
  const { execSync } = await import('child_process');
  execSync('node config/seed.js');
  console.log('Database reseeded successfully.');

  // 5. Valid Login as Dispatcher
  await logTest('5. Valid Login as Dispatcher');
  const dispatcherLogin = {
    email: 'raven.k@transitops.in',
    password: 'DispatchSecure2026!',
    role: 'dispatcher',
  };
  res = await makeRequest('POST', '/auth/login', dispatcherLogin);
  logResult(
    res.status === 200 && res.body.status === 'success' && res.body.token,
    'Successfully logged in as Dispatcher',
    'Failed valid login',
    res
  );

  const dispatcherToken = res.body.token;

  // 6. Dispatcher tries to access Admin route (RBAC block)
  await logTest('6. Dispatcher accesses Admin Endpoint (/api/users)');
  res = await makeRequest('GET', '/users', null, dispatcherToken);
  logResult(
    res.status === 403 && res.body.message.includes('permission'),
    'Successfully blocked Dispatcher from Admin endpoint (403)',
    'Failed to block Dispatcher from Admin route',
    res
  );

  // 7. Valid Login as Admin
  await logTest('7. Valid Login as Admin');
  const adminLogin = {
    email: 'admin@transitops.in',
    password: 'AdminSecure2026!',
    role: 'admin',
  };
  res = await makeRequest('POST', '/auth/login', adminLogin);
  logResult(
    res.status === 200 && res.body.status === 'success' && res.body.token,
    'Successfully logged in as Admin',
    'Failed valid admin login',
    res
  );

  const adminToken = res.body.token;

  // 8. Admin accesses Protected Route (Allowed RBAC)
  await logTest('8. Admin accesses Admin Endpoint (/api/users)');
  res = await makeRequest('GET', '/users', null, adminToken);
  logResult(
    res.status === 200 && res.body.status === 'success' && res.body.data.users.length >= 5,
    'Successfully fetched all users as Admin (200)',
    'Failed admin access',
    res
  );

  // 9. Query Current Authenticated User (/api/auth/me)
  await logTest('9. Query Current User (/api/auth/me)');
  res = await makeRequest('GET', '/auth/me', null, adminToken);
  logResult(
    res.status === 200 && res.body.status === 'success' && res.body.data.user.email === 'admin@transitops.in',
    'Successfully fetched self info (200)',
    'Failed to query current user',
    res
  );

  // 10. Logout and Clear Session
  await logTest('10. Logout and Clear Session');
  res = await makeRequest('POST', '/auth/logout');
  logResult(
    res.status === 200 && res.body.status === 'success' && res.body.message === 'Logged out successfully',
    'Successfully logged out (200)',
    'Failed logout',
    res
  );

  console.log('\nAll Auth & RBAC Verification Tests Passed Successfully! ✔');
}

runTests();
