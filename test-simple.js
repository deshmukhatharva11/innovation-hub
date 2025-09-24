const axios = require('axios');

async function test() {
  try {
    const response = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'admin@test.com',
      password: 'password123'
    });
    console.log('SUCCESS:', response.data);
  } catch (error) {
    console.log('ERROR:', error.response?.data || error.message);
  }
}

test();
