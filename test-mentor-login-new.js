const axios = require('axios');

async function testMentorLoginNew() {
  try {
    console.log('🔧 Testing Mentor Login with mentor123...\n');

    // Test mentor login
    console.log('1. 👨‍🏫 Testing mentor login...');
    
    try {
      const response = await axios.post('http://localhost:3001/api/auth/login', {
        email: 'sarah.johnson@example.com',
        password: 'mentor123'
      });
      
      console.log('✅ Login successful!');
      console.log('📊 Response:', JSON.stringify(response.data, null, 2));
      
      // Test dashboard
      console.log('\n2. 📊 Testing mentor dashboard...');
      const dashboardResponse = await axios.get('http://localhost:3001/api/dashboard', {
        headers: { Authorization: `Bearer ${response.data.data.token}` }
      });
      
      if (dashboardResponse.data.success) {
        const { stats, students, conversations } = dashboardResponse.data.data;
        console.log('✅ Dashboard data fetched successfully');
        console.log(`   Total Students: ${stats.total_students}`);
        console.log(`   My College: ${stats.my_college}`);
        console.log(`   Other Colleges: ${stats.other_colleges}`);
        console.log(`   Active Chats: ${stats.active_chats}`);
        
        if (students.my_college && students.my_college.length > 0) {
          console.log('\n   My College Students:');
          students.my_college.forEach((student, index) => {
            console.log(`     ${index + 1}. ${student.name} (${student.email}) - ${student.ideas_count} ideas`);
          });
        }
        
        if (students.other_colleges && students.other_colleges.length > 0) {
          console.log('\n   Other College Students:');
          students.other_colleges.forEach((student, index) => {
            console.log(`     ${index + 1}. ${student.name} (${student.email}) - ${student.ideas_count} ideas`);
          });
        }
        
        console.log(`\n   Conversations: ${conversations?.length || 0}`);
      } else {
        console.log('❌ Dashboard failed:', dashboardResponse.data.message);
      }
      
    } catch (error) {
      console.log('❌ Login failed!');
      console.log('   Status:', error.response?.status);
      console.log('   Message:', error.response?.data?.message);
      console.log('   Full error:', error.response?.data);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testMentorLoginNew();
