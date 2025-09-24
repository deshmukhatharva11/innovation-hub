const axios = require('axios');

async function testMentorAuth() {
  try {
    console.log('🧪 Testing Mentor Authentication...\n');
    
    // Login as mentor
    const loginResponse = await axios.post('http://localhost:3001/api/mentors/login', {
      email: 'test.mentor@example.com',
      password: 'mentor123'
    });
    
    if (loginResponse.data.success) {
      const token = loginResponse.data.token;
      console.log('✅ Login successful');
      console.log('🔑 Token:', token.substring(0, 50) + '...');
      
      // Test a simple authenticated endpoint
      console.log('\n🧪 Testing authenticated endpoint...');
      try {
        const response = await axios.get('http://localhost:3001/api/users', {
          headers: { Authorization: `Bearer ${token}` },
          params: { limit: 1 }
        });
        
        console.log('✅ Users API working with mentor token');
        console.log('   Response:', response.data.success);
      } catch (error) {
        console.log('❌ Users API failed:', error.response?.data?.message || error.message);
        console.log('   Status:', error.response?.status);
      }
      
      // Test the new students endpoint
      console.log('\n🧪 Testing students endpoint...');
      try {
        const response = await axios.get('http://localhost:3001/api/users/students', {
          headers: { Authorization: `Bearer ${token}` },
          params: { limit: 1 }
        });
        
        console.log('✅ Students API working with mentor token');
        console.log('   Response:', response.data.success);
        console.log('   Students count:', response.data.data.students.length);
      } catch (error) {
        console.log('❌ Students API failed:', error.response?.data?.message || error.message);
        console.log('   Status:', error.response?.status);
        console.log('   Data:', error.response?.data);
      }
      
    } else {
      console.log('❌ Login failed:', loginResponse.data.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
  }
}

testMentorAuth();
