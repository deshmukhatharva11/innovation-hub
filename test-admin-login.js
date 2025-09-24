const axios = require('axios');

async function testAdminLogin() {
  try {
    console.log('🔧 Testing Admin Login...\n');

    // Test admin login
    console.log('1. 👨‍💼 Testing admin login...');
    
    try {
      const response = await axios.post('http://localhost:3001/api/auth/login', {
        email: 'admin1@college1.edu',
        password: 'admin123'
      });
      
      console.log('✅ Admin login successful!');
      console.log('📊 Response:', JSON.stringify(response.data, null, 2));
      
    } catch (error) {
      console.log('❌ Admin login failed!');
      console.log('   Status:', error.response?.status);
      console.log('   Message:', error.response?.data?.message);
      console.log('   Full error:', error.response?.data);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAdminLogin();
