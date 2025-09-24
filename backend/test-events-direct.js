const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function testEventsDirect() {
  try {
    console.log('🔍 Testing Events Direct Access...\n');
    
    // 1. Test without authentication
    console.log('1. Testing Events API without authentication...');
    try {
      const response = await axios.get(`${BASE_URL}/events`);
      console.log('❌ Should have failed but got:', response.status);
    } catch (error) {
      console.log('✅ Correctly rejected without auth:', error.response?.status);
    }
    
    // 2. Test with authentication
    console.log('\n2. Testing Events API with authentication...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin1@college1.edu',
      password: 'password123'
    });
    
    const token = loginResponse.data.data?.token || loginResponse.data.token;
    const headers = { Authorization: `Bearer ${token}` };
    
    try {
      const eventsResponse = await axios.get(`${BASE_URL}/events`, { headers });
      console.log('✅ Events API with auth working');
      console.log('Status:', eventsResponse.status);
      console.log('Events count:', eventsResponse.data.data.events.length);
    } catch (error) {
      console.log('❌ Events API with auth failed:');
      console.log('Status:', error.response?.status);
      console.log('Message:', error.response?.data?.message);
      console.log('Full error:', error.response?.data);
    }
    
    console.log('\n🎯 Direct test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testEventsDirect();
