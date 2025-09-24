const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

// Test credentials
const COLLEGE_ADMIN_CREDENTIALS = {
  email: 'college@example.com',
  password: 'password123'
};

async function testIdeasReview() {
  try {
    console.log('🔄 Testing Ideas Review API...');
    
    // Login
    console.log('1. Testing login...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, COLLEGE_ADMIN_CREDENTIALS);
    console.log('Login response data keys:', Object.keys(loginResponse.data));
    
    if (loginResponse.data.data && loginResponse.data.data.token) {
      const token = loginResponse.data.data.token;
      console.log('✅ Login successful with nested token');
      
      // Test health first
      console.log('2. Testing backend health...');
      const healthResponse = await axios.get('http://localhost:3001/health');
      console.log('✅ Backend health OK');
      
      // Test ideas review endpoint
      console.log('3. Testing ideas/review endpoint...');
      const reviewResponse = await axios.get(`${BASE_URL}/ideas/review?status=submitted&limit=10`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log(`✅ Ideas review API working: ${reviewResponse.data.data?.ideas?.length || 0} ideas for review`);
      
      // Test idea by ID (if any exist)
      console.log('4. Testing ideas endpoint...');
      const ideasResponse = await axios.get(`${BASE_URL}/ideas?limit=5`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log(`✅ Ideas API working: ${ideasResponse.data.data?.ideas?.length || 0} ideas found`);
      
      if (ideasResponse.data.data?.ideas?.length > 0) {
        const firstIdea = ideasResponse.data.data.ideas[0];
        console.log('5. Testing idea details...');
        const ideaDetailsResponse = await axios.get(`${BASE_URL}/ideas/${firstIdea.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        console.log(`✅ Idea details working: ${ideaDetailsResponse.data.data?.idea?.title || 'Unknown'}`);
        console.log(`Team members: ${ideaDetailsResponse.data.data?.idea?.teamMembers?.length || 0}`);
      }
      
    } else {
      console.log('❌ Login response structure:', JSON.stringify(loginResponse.data, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Test failed:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url
    });
  }
}

testIdeasReview();
