const axios = require('axios');

async function testAPILogin() {
  try {
    console.log('🔧 Testing API login...');

    const response = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'college.admin@test.com',
      password: 'password123'
    });

    console.log('✅ Login successful:', response.data);
    return response.data.data.token;

  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
    return null;
  }
}

testAPILogin();
