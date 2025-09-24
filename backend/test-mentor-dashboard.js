const axios = require('axios');

async function testMentorDashboard() {
  try {
    console.log('🧪 Testing Mentor Dashboard API...\n');
    
    // First, login as mentor
    console.log('1. Logging in as mentor...');
    const loginResponse = await axios.post('http://localhost:3001/api/mentors/login', {
      email: 'test.mentor@example.com',
      password: 'mentor123'
    });
    
    if (loginResponse.data.success) {
      console.log('✅ Mentor login successful');
      const token = loginResponse.data.token;
      
      // Test getting students from mentor's college
      console.log('\n2. Testing get students from mentor\'s college...');
      try {
        const myCollegeResponse = await axios.get('http://localhost:3001/api/users/students', {
          headers: { Authorization: `Bearer ${token}` },
          params: { college_id: loginResponse.data.data.college_id, limit: 10 }
        });
        
        console.log('✅ My college students API working');
        console.log(`   Found ${myCollegeResponse.data.data.students.length} students`);
        
        if (myCollegeResponse.data.data.students.length > 0) {
          const student = myCollegeResponse.data.data.students[0];
          console.log(`   Sample student: ${student.name} (${student.email})`);
          console.log(`   Ideas count: ${student.ideas_count}`);
        }
      } catch (error) {
        console.log('❌ My college students API failed:', error.response?.data?.message || error.message);
      }
      
      // Test getting students from other colleges
      console.log('\n3. Testing get students from other colleges...');
      try {
        const otherCollegesResponse = await axios.get('http://localhost:3001/api/users/students', {
          headers: { Authorization: `Bearer ${token}` },
          params: { exclude_college_id: loginResponse.data.data.college_id, limit: 10 }
        });
        
        console.log('✅ Other colleges students API working');
        console.log(`   Found ${otherCollegesResponse.data.data.students.length} students from other colleges`);
        
        if (otherCollegesResponse.data.data.students.length > 0) {
          const student = otherCollegesResponse.data.data.students[0];
          console.log(`   Sample student: ${student.name} (${student.email})`);
          console.log(`   College: ${student.college?.name}`);
        }
      } catch (error) {
        console.log('❌ Other colleges students API failed:', error.response?.data?.message || error.message);
      }
      
      // Test mentor chats
      console.log('\n4. Testing mentor chats...');
      try {
        const chatsResponse = await axios.get('http://localhost:3001/api/mentor-chat/conversations', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('✅ Mentor chats API working');
        console.log(`   Found ${chatsResponse.data.data.conversations.length} conversations`);
      } catch (error) {
        console.log('❌ Mentor chats API failed:', error.response?.data?.message || error.message);
      }
      
    } else {
      console.log('❌ Mentor login failed:', loginResponse.data.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
  }
}

testMentorDashboard();
