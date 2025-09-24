const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

// Test credentials
const COLLEGE_ADMIN_CREDENTIALS = {
  email: 'college@example.com',
  password: 'password123'
};

async function testAddStudent() {
  try {
    console.log('🔄 Testing Add Student API...');
    
    // Login as college admin
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, COLLEGE_ADMIN_CREDENTIALS);
    const token = loginResponse.data.data.token;
    console.log('✅ College admin login successful');
    
    // Test adding a student
    const studentData = {
      name: 'Test Student ' + Date.now(),
      email: `test.student.${Date.now()}@example.com`,
      password: 'password123',
      phone: '+91-9876543210',
      department: 'Computer Science',
      year_of_study: 2,
      roll_number: 'CS2023001'
    };
    
    console.log('1. Testing add student endpoint...');
    const addResponse = await axios.post(`${BASE_URL}/users/students`, studentData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Student added successfully');
    console.log(`👤 Student: ${addResponse.data.data.student.name}`);
    console.log(`📧 Email: ${addResponse.data.data.student.email}`);
    console.log(`🏫 College ID: ${addResponse.data.data.student.college_id}`);
    
    // Test getting students to verify
    console.log('2. Verifying student appears in list...');
    const studentsResponse = await axios.get(`${BASE_URL}/users/students?college_id=1&limit=100`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`✅ Total students: ${studentsResponse.data.data?.students?.length || 0}`);
    
    // Find our newly added student
    const addedStudent = studentsResponse.data.data?.students?.find(s => s.email === studentData.email);
    if (addedStudent) {
      console.log('🎉 New student found in list!');
    } else {
      console.log('⚠️ New student not found in list');
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

testAddStudent();
