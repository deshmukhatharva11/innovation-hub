const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function debugUserData() {
  console.log('🔍 Debugging User Data Flow...\n');

  try {
    // Test 1: Login as college admin
    console.log('1️⃣ Testing Login as College Admin...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'college@example.com',
      password: 'password123'
    });

    if (loginResponse.data.success) {
      const { user, token } = loginResponse.data.data;
      console.log('   ✅ Login successful');
      console.log(`   👤 User: ${user.name}`);
      console.log(`   🏫 College ID: ${user.college_id}`);
      console.log(`   🎭 Role: ${user.role}`);
      console.log(`   🔑 Token: ${token.substring(0, 20)}...`);

      // Test 2: Get students with the token
      console.log('\n2️⃣ Testing Get Students API...');
      const studentsResponse = await axios.get(`${BASE_URL}/users/students`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        params: {
          college_id: user.college_id,
          limit: 10
        }
      });

      if (studentsResponse.data.success) {
        const students = studentsResponse.data.data.students;
        console.log(`   ✅ Students found: ${students.length}`);
        
        if (students.length > 0) {
          const firstStudent = students[0];
          console.log(`   👤 First student: ${firstStudent.name}`);
          console.log(`   🏫 Student college_id: ${firstStudent.college_id}`);
          console.log(`   📧 Email: ${firstStudent.email}`);
        }
      } else {
        console.log('   ❌ Failed to get students:', studentsResponse.data.message);
      }

          // Test 3: Check if ideas exist for this college
    console.log('\n3️⃣ Testing Ideas API...');
    const ideasResponse = await axios.get(`${BASE_URL}/ideas`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      params: {
        college_id: user.college_id,
        limit: 10
      }
    });

    if (ideasResponse.data.success) {
      const ideas = ideasResponse.data.data.ideas;
      console.log(`   ✅ Ideas found: ${ideas.length}`);
      
      if (ideas.length > 0) {
        const firstIdea = ideas[0];
        console.log(`   💡 First idea: ${firstIdea.title}`);
        console.log(`   👤 Student ID: ${firstIdea.student_id}`);
        console.log(`   🏫 College ID: ${firstIdea.college_id}`);
        console.log(`   📅 Created: ${firstIdea.created_at}`);
      }
    } else {
      console.log('   ❌ Failed to get ideas:', ideasResponse.data.message);
    }

    } else {
      console.log('   ❌ Login failed:', loginResponse.data.message);
    }

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
    if (error.response) {
      console.error('   Response status:', error.response.status);
      console.error('   Response data:', error.response.data);
    }
  }
}

debugUserData();
