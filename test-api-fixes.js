const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

// Test credentials
const COLLEGE_ADMIN_CREDENTIALS = {
  email: 'college@example.com',
  password: 'password123'
};

async function testAPIFixes() {
  try {
    console.log('🔄 Testing API fixes...');
    
    // Login
    console.log('1. Testing login...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, COLLEGE_ADMIN_CREDENTIALS);
    console.log('Login response structure:', JSON.stringify(loginResponse.data, null, 2));
    
    const token = loginResponse.data.data?.token || loginResponse.data.token;
    if (!token) {
      throw new Error('No token received from login');
    }
    console.log('✅ Login successful, token:', token ? 'received' : 'missing');
    
    // Test students endpoint with proper headers
    console.log('2. Testing students endpoint...');
    const studentsResponse = await axios.get(`${BASE_URL}/users/students?college_id=1&limit=100&sort=created_at&order=desc`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    console.log(`✅ Students API working: ${studentsResponse.data.data?.students?.length || 0} students found`);
    
    // Test ideas review endpoint
    console.log('3. Testing ideas review endpoint...');
    const reviewResponse = await axios.get(`${BASE_URL}/ideas/review?status=submitted&limit=10`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    console.log(`✅ Ideas review API working: ${reviewResponse.data.data?.ideas?.length || 0} ideas for review`);
    
    // Test profile endpoint
    console.log('4. Testing profile endpoint...');
    const profileResponse = await axios.get(`${BASE_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    console.log(`✅ Profile API working: ${profileResponse.data.data?.user?.name || 'Unknown'}`);
    
    console.log('\n🎉 All API tests passed successfully!');
    
  } catch (error) {
    console.error('❌ API test failed:', error.response?.data || error.message);
  }
}

testAPIFixes();
