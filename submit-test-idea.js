const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function submitTestIdea() {
  try {
    console.log('Submitting test idea...');
    
    // First login as a student to submit the idea
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'student@example.com',
      password: 'password123'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const token = loginResponse.data.data.token;
    console.log('Logged in as student');
    
    // Submit the idea (update status to submitted)
    const response = await axios.put(`${BASE_URL}/ideas/6`, {
      status: 'submitted'
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Test idea submitted successfully!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error) {
    console.error('Failed to submit test idea!');
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
    console.error('Message:', error.message);
    return null;
  }
}

submitTestIdea();
