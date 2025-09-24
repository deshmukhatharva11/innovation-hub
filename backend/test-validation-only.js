const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function testValidationOnly() {
  try {
    console.log('🔍 Testing Validation Only...\n');
    
    // 1. Login as college admin
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin1@college1.edu',
      password: 'password123'
    });
    
    const token = loginResponse.data.data?.token || loginResponse.data.token;
    const authHeaders = { Authorization: `Bearer ${token}` };
    console.log('✅ Login successful\n');
    
    // 2. Test with minimal data
    console.log('2. Testing with minimal data...');
    const minimalData = {
      rating: 5,
      recommendation: 'nurture'
    };
    
    try {
      const response = await axios.post(
        `${BASE_URL}/college-coordinator/ideas/53/evaluate`,
        minimalData,
        { headers: authHeaders }
      );
      console.log('✅ Minimal evaluation successful:', response.data);
    } catch (error) {
      console.log('❌ Minimal evaluation failed:');
      console.log('Status:', error.response?.status);
      console.log('Data:', JSON.stringify(error.response?.data, null, 2));
    }
    
    // 3. Test with all data
    console.log('\n3. Testing with all data...');
    const fullData = {
      rating: 8,
      comments: 'Great idea with potential',
      recommendation: 'nurture',
      mentor_assigned: null,
      nurture_notes: 'Needs more technical details'
    };
    
    try {
      const response = await axios.post(
        `${BASE_URL}/college-coordinator/ideas/53/evaluate`,
        fullData,
        { headers: authHeaders }
      );
      console.log('✅ Full evaluation successful:', response.data);
    } catch (error) {
      console.log('❌ Full evaluation failed:');
      console.log('Status:', error.response?.status);
      console.log('Data:', JSON.stringify(error.response?.data, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testValidationOnly();
