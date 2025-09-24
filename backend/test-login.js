const axios = require('axios');

async function testLogin() {
  try {
    console.log('🔍 Testing login...');
    
    const response = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'admin@testcollege.edu',
      password: 'password123'
    });
    
    console.log('✅ Login successful:', response.data);
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
  }
}

testLogin();