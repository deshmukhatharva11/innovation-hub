const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function testMe() {
  try {
    console.log('Testing /auth/me endpoint...');
    
    // First login to get token
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'college@example.com',
      password: 'password123'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const token = loginResponse.data.data.token;
    console.log('Got token:', token.substring(0, 50) + '...');
    
    // Now test /auth/me endpoint
    const meResponse = await axios.get(`${BASE_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Me endpoint successful!');
    console.log('Response:', JSON.stringify(meResponse.data, null, 2));
    
    return meResponse.data;
  } catch (error) {
    console.error('Me endpoint failed!');
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
    console.error('Message:', error.message);
    return null;
  }
}

testMe();
