const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function testFrontendConnection() {
  try {
    console.log('🔍 Testing Frontend Connection...\n');
    
    // 1. Test College Admin Login
    console.log('1. Testing College Admin Login...');
    const adminLoginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin1@college1.edu',
      password: 'password123'
    });
    
    const adminToken = adminLoginResponse.data.data?.token || adminLoginResponse.data.token;
    const adminHeaders = { Authorization: `Bearer ${adminToken}` };
    console.log('✅ College Admin login successful');
    console.log('User data:', JSON.stringify(adminLoginResponse.data.data.user, null, 2));
    
    // 2. Test /auth/me endpoint (what frontend calls)
    console.log('\n2. Testing /auth/me endpoint...');
    try {
      const meResponse = await axios.get(`${BASE_URL}/auth/me`, { headers: adminHeaders });
      console.log('✅ /auth/me successful');
      console.log('User data from /auth/me:', JSON.stringify(meResponse.data.data.user, null, 2));
    } catch (error) {
      console.log('❌ /auth/me failed:', error.response?.data?.message || error.message);
    }
    
    // 3. Test Student Management with proper headers
    console.log('\n3. Testing Student Management with proper headers...');
    try {
      const studentsResponse = await axios.get(`${BASE_URL}/college-coordinator/students`, { 
        headers: adminHeaders,
        params: { limit: 10 }
      });
      console.log('✅ Students API working');
      console.log('Students count:', studentsResponse.data.data.students.length);
      console.log('First student:', studentsResponse.data.data.students[0]);
    } catch (error) {
      console.log('❌ Students API failed:', error.response?.data?.message || error.message);
    }
    
    console.log('\n🎯 Frontend connection test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testFrontendConnection();
