const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function testAddStudent() {
  try {
    console.log('🔍 Testing Add Student...\n');
    
    // 1. Test College Admin Login
    console.log('1. Testing College Admin Login...');
    const adminLoginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin1@college1.edu',
      password: 'password123'
    });
    
    const adminToken = adminLoginResponse.data.data?.token || adminLoginResponse.data.token;
    const adminHeaders = { Authorization: `Bearer ${adminToken}` };
    console.log('✅ College Admin login successful');
    console.log('   Token:', adminToken.substring(0, 20) + '...');
    
    // 2. Test Add Student
    console.log('\n2. Testing Add Student...');
    const studentData = {
      name: 'Test New Student',
      email: 'newstudent@test.com',
      password: 'password123',
      department: 'Computer Science',
      year: '2024',
      roll_number: 'CS2024001'
    };
    
    console.log('   Sending data:', studentData);
    
    try {
      const addStudentResponse = await axios.post(`${BASE_URL}/college-coordinator/students`, studentData, { headers: adminHeaders });
      console.log('✅ Add student successful!');
      console.log('   Response:', addStudentResponse.data);
    } catch (error) {
      console.log('❌ Add student failed:');
      console.log('   Status:', error.response?.status);
      console.log('   Message:', error.response?.data?.message);
      console.log('   Full response:', error.response?.data);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAddStudent();
