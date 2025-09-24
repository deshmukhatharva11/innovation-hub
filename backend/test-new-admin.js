const axios = require('axios');

async function testNewAdmin() {
  try {
    console.log('🔧 Testing new admin login...');

    const response = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'admin@test.com',
      password: 'password123'
    });

    console.log('✅ Login successful!');
    console.log('📋 Response:', {
      success: response.data.success,
      message: response.data.message,
      hasToken: !!response.data.data?.token,
      userRole: response.data.data?.user?.role,
      userName: response.data.data?.user?.name
    });

    return response.data.data.token;

  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
    return null;
  }
}

testNewAdmin();
