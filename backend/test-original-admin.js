const axios = require('axios');

async function testOriginalAdmin() {
  try {
    console.log('🔧 Testing original admin login...');

    const response = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'admin1@college1.edu',
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

testOriginalAdmin();
