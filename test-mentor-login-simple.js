const axios = require('axios');

async function testMentorLoginSimple() {
  try {
    console.log('🔧 Testing Mentor Login (Simple)...\n');

    // Test mentor login
    console.log('1. 👨‍🏫 Testing mentor login...');
    
    try {
      const response = await axios.post('http://localhost:3001/api/auth/login', {
        email: 'sarah.johnson@example.com',
        password: 'admin123'
      });
      
      console.log('✅ Login successful!');
      console.log('📊 Response:', JSON.stringify(response.data, null, 2));
      
    } catch (error) {
      console.log('❌ Login failed!');
      console.log('   Status:', error.response?.status);
      console.log('   Message:', error.response?.data?.message);
      console.log('   Full error:', error.response?.data);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testMentorLoginSimple();
