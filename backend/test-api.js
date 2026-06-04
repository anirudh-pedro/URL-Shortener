import app from './src/app.js';
import connectDB from './src/config/db.js';
import mongoose from 'mongoose';

const PORT = 5001;

// Define helper for assertions
const assert = (condition, message) => {
  if (!condition) {
    throw new Error(`Assertion Failed: ${message}`);
  }
  console.log(`[PASS] ${message}`);
};

const runTests = async () => {
  console.log('Starting integration tests...');
  
  await connectDB();
  const server = app.listen(PORT, async () => {
    console.log(`Test server running on port ${PORT}`);
    
    try {
      const baseUrl = `http://localhost:${PORT}`;
      const uniqueSuffix = Date.now();
      const testUser = {
        name: 'Test Tester',
        email: `test-${uniqueSuffix}@example.com`,
        password: 'password123',
      };

      let token = '';
      let urlId = '';
      let shortCode = '';

      console.log('\n--- Testing User Registration ---');
      const regRes = await fetch(`${baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testUser),
      });
      const regData = await regRes.json();
      assert(regRes.status === 201, `Status code is 201 (got ${regRes.status})`);
      assert(regData.success === true, 'Response success is true');
      assert(regData.data.token !== undefined, 'Token is returned');
      assert(regData.data.email === testUser.email, 'Email matches');
      token = regData.data.token;

      // --- TEST LOGIN ---
      console.log('\n--- Testing User Login ---');
      const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testUser.email, password: testUser.password }),
      });
      const loginData = await loginRes.json();
      assert(loginRes.status === 200, `Status code is 200 (got ${loginRes.status})`);
      assert(loginData.success === true, 'Response success is true');
      assert(loginData.data.token !== undefined, 'Token is returned on login');

      // --- TEST PROFILE ---
      console.log('\n--- Testing User Profile ---');
      const profileRes = await fetch(`${baseUrl}/api/auth/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      const profileData = await profileRes.json();
      assert(profileRes.status === 200, `Status code is 200 (got ${profileRes.status})`);
      assert(profileData.success === true, 'Response success is true');
      assert(profileData.data.email === testUser.email, 'Profile email matches');

      // --- TEST CREATE URL (With custom alias) ---
      console.log('\n--- Testing Create URL (Custom Alias) ---');
      const alias = `google-${uniqueSuffix}`;
      const urlRes1 = await fetch(`${baseUrl}/api/urls`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          originalUrl: 'https://google.com',
          customAlias: alias,
        }),
      });
      const urlData1 = await urlRes1.json();
      assert(urlRes1.status === 201, `Status code is 201 (got ${urlRes1.status})`);
      assert(urlData1.success === true, 'Response success is true');
      assert(urlData1.data.shortUrl.endsWith(alias), `Short URL ends with custom alias ${alias}`);
      assert(urlData1.data.qrCodeUrl.startsWith('data:image/png;base64,'), 'QR Code matches base64 Data URI format');

      // --- TEST CREATE URL (Auto shortcode) ---
      console.log('\n--- Testing Create URL (Auto code) ---');
      const urlRes2 = await fetch(`${baseUrl}/api/urls`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          originalUrl: 'https://github.com',
        }),
      });
      const urlData2 = await urlRes2.json();
      assert(urlRes2.status === 201, `Status code is 201 (got ${urlRes2.status})`);
      assert(urlData2.success === true, 'Response success is true');
      assert(urlData2.data.shortCode.length === 7, 'Auto shortcode has length 7');
      urlId = urlData2.data._id;
      shortCode = urlData2.data.shortCode;

      // --- TEST GET ALL URLS ---
      console.log('\n--- Testing Get All User URLs ---');
      const listRes = await fetch(`${baseUrl}/api/urls`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const listData = await listRes.json();
      assert(listRes.status === 200, `Status code is 200 (got ${listRes.status})`);
      assert(listData.success === true, 'Response success is true');
      assert(listData.data.urls !== undefined, 'Response contains urls array');
      assert(Array.isArray(listData.data.urls), 'urls is an array');
      assert(listData.data.urls.length >= 2, 'urls array has at least 2 items');
      assert(listData.data.pagination !== undefined, 'Response contains pagination details');
      assert(listData.data.pagination.totalItems >= 2, 'pagination totalItems is correct');
      assert(listData.data.pagination.currentPage === 1, 'pagination currentPage is 1');
      
      const sampleItem = listData.data.urls[0];
      assert(sampleItem.originalUrl !== undefined, 'Contains originalUrl');
      assert(sampleItem.shortCode !== undefined, 'Contains shortCode');
      assert(sampleItem.clickCount !== undefined, 'Contains clickCount');
      assert(sampleItem.createdAt !== undefined, 'Contains createdAt');

      // --- TEST GET SINGLE URL ---
      console.log('\n--- Testing Get Single URL Details ---');
      const singleRes = await fetch(`${baseUrl}/api/urls/${urlId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const singleData = await singleRes.json();
      assert(singleRes.status === 200, `Status code is 200 (got ${singleRes.status})`);
      assert(singleData.success === true, 'Response success is true');
      assert(singleData.data.shortCode === shortCode, 'Shortcode matches');

      // --- TEST REDIRECT API ---
      console.log('\n--- Testing Redirection (GET /:shortCode) ---');
      const redirectRes = await fetch(`${baseUrl}/${shortCode}`, {
        method: 'GET',
        redirect: 'manual', // Do not follow redirect
      });
      assert(redirectRes.status === 302, `Redirect status is 302 (got ${redirectRes.status})`);
      assert(redirectRes.headers.get('location') === 'https://github.com', `Redirect location matches 'https://github.com'`);

      // --- TEST ANALYTICS API ---
      console.log('\n--- Testing URL Analytics ---');
      const analRes = await fetch(`${baseUrl}/api/analytics/${urlId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const analData = await analRes.json();
      assert(analRes.status === 200, `Status code is 200 (got ${analRes.status})`);
      assert(analData.success === true, 'Response success is true');
      assert(analData.data.totalClicks === 1, 'Total clicks count is 1');
      assert(analData.data.recentVisits.length === 1, 'Recent visits array has length 1');
      assert(analData.data.clicksByDay.length === 1, 'Clicks by day groups contains 1 record');
      assert(analData.data.clicksByDay[0].count === 1, 'Daily clicks count matches');

      // --- TEST DELETE URL ---
      console.log('\n--- Testing Delete URL ---');
      const delRes = await fetch(`${baseUrl}/api/urls/${urlId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const delData = await delRes.json();
      assert(delRes.status === 200, `Status code is 200 (got ${delRes.status})`);
      assert(delData.success === true, 'Response success is true');

      // --- TEST VERIFY DELETED ---
      console.log('\n--- Testing Verify URL Deleted ---');
      const getDeletedRes = await fetch(`${baseUrl}/api/urls/${urlId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      assert(getDeletedRes.status === 404, `Status code is 404 for deleted URL (got ${getDeletedRes.status})`);

      console.log('\n======================================');
      console.log('ALL INTEGRATION TESTS PASSED SUCCESSFULLY!');
      console.log('======================================');
    } catch (err) {
      console.error('\n======================================');
      console.error('TEST FAIL:', err.message);
      console.error(err.stack);
      console.error('======================================');
      process.exitCode = 1;
    } finally {
      console.log('Shutting down test server and DB connections...');
      server.close(() => {
        console.log('HTTP Server closed.');
        mongoose.connection.close().then(() => {
          console.log('MongoDB Connection closed.');
          process.exit();
        });
      });
    }
  });
};

runTests();
