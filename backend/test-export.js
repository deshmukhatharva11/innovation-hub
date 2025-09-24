const axios = require('axios');

async function testExport() {
  try {
    console.log('Testing export...');
    
    const login = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'admin1@college1.edu',
      password: 'password123'
    });
    
    const token = login.data.data?.token || login.data.token;
    console.log('Token received:', token ? 'Yes' : 'No');
    
    const exportResponse = await axios.get('http://localhost:3001/api/college-coordinator/students/export', {
      headers: { Authorization: `Bearer ${token}` },
      responseType: 'text'
    });
    
    console.log('Export success!');
    console.log('CSV length:', exportResponse.data.length);
    console.log('First 200 chars:', exportResponse.data.substring(0, 200));
    
  } catch (error) {
    console.log('Export error:');
    console.log('Status:', error.response?.status);
    console.log('Message:', error.response?.data?.message);
    console.log('Full error:', error.response?.data);
  }
}

testExport();
