const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function testFrontendAuth() {
  try {
    console.log('🔍 Testing Frontend Authentication...\n');
    
    // 1. Test login
    console.log('1. Testing login...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin1@college1.edu',
      password: 'password123'
    });
    
    console.log('✅ Login successful');
    console.log('Response structure:', Object.keys(loginResponse.data));
    console.log('Token exists:', !!loginResponse.data.data?.token);
    console.log('User exists:', !!loginResponse.data.data?.user);
    
    const token = loginResponse.data.data?.token || loginResponse.data.token;
    const user = loginResponse.data.data?.user || loginResponse.data.user;
    
    console.log('Token:', token ? 'Present' : 'Missing');
    console.log('User role:', user?.role);
    console.log('User college_id:', user?.college_id);
    
    // 2. Test /auth/me endpoint
    console.log('\n2. Testing /auth/me endpoint...');
    try {
      const meResponse = await axios.get(`${BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ /auth/me successful');
      console.log('User from /auth/me:', meResponse.data.data?.user?.role);
    } catch (error) {
      console.log('❌ /auth/me failed:', error.response?.status, error.response?.data?.message);
    }
    
    // 3. Test events with token
    console.log('\n3. Testing events with token...');
    try {
      const eventsResponse = await axios.get(`${BASE_URL}/events`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Events API successful');
      console.log('Events count:', eventsResponse.data.data.events.length);
    } catch (error) {
      console.log('❌ Events API failed:', error.response?.status, error.response?.data?.message);
    }
    
    console.log('\n🎯 Frontend auth test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testFrontendAuth();
