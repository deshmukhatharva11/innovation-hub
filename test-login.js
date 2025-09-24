const axios = require('axios');

async function testLogin() {
  try {
    console.log('🔐 Testing login...');
    const response = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'admin@test.com',
      password: 'password123'
    });
    
    console.log('✅ Login successful!');
    console.log('Token:', response.data.token.substring(0, 50) + '...');
    console.log('User:', response.data.user);
    
    // Test ideas API with token
    console.log('\n📡 Testing ideas API...');
    const ideasResponse = await axios.get('http://localhost:3001/api/ideas?college_id=1&limit=500&sort_by=created_at&sort_order=desc', {
      headers: {
        'Authorization': `Bearer ${response.data.token}`
      }
    });
    
    console.log('✅ Ideas API successful!');
    console.log('Total ideas:', ideasResponse.data.data.ideas.length);
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testLogin();
