const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function testDepartments() {
  try {
    console.log('Testing department analytics...');
    
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
    
    // Test department analytics endpoint
    const response = await axios.get(`${BASE_URL}/analytics/departments`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Department analytics successful!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error) {
    console.error('Department analytics failed!');
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
    console.error('Message:', error.message);
    return null;
  }
}

testDepartments();
