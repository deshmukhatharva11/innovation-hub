const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function testIdeaEndorsement() {
  try {
    console.log('Testing idea endorsement...');
    
    // First login to get token
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'college@example.com',
      password: 'password123'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const token = loginResponse.data.data.token;
    console.log('Got token:', token.substring(0, 50) + '...');
    
    // Get the idea details first
    const ideaResponse = await axios.get(`${BASE_URL}/ideas/1`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Idea details:', JSON.stringify(ideaResponse.data, null, 2));
    
    // Try to endorse the idea
    const endorseResponse = await axios.put(`${BASE_URL}/ideas/1/status`, {
      status: 'endorsed',
      feedback: 'Great idea! Approved for incubation.'
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Endorsement successful!');
    console.log('Response:', JSON.stringify(endorseResponse.data, null, 2));
    
    return endorseResponse.data;
  } catch (error) {
    console.error('Endorsement failed!');
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
    console.error('Message:', error.message);
    return null;
  }
}

testIdeaEndorsement();
