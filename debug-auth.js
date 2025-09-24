const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function testAuth() {
  try {
    console.log('Testing authorization...');
    
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
    const user = loginResponse.data.data.user;
    
    console.log('User details:', {
      id: user.id,
      name: user.name,
      role: user.role,
      college_id: user.college_id
    });
    
    // Test a simple endpoint that requires college_admin role
    const testResponse = await axios.get(`${BASE_URL}/users/students?college_id=1`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Authorization test successful!');
    console.log('Response status:', testResponse.status);
    
    return testResponse.data;
  } catch (error) {
    console.error('Authorization test failed!');
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
    console.error('Message:', error.message);
    return null;
  }
}

testAuth();
