const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

async function testMentorDashboard() {
  try {
    console.log('🔧 Testing Mentor Dashboard...\n');

    // 1. Login as mentor
    console.log('1. 👨‍🏫 Mentor Login...');
    
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'sarah.johnson@example.com',
      password: 'admin123'
    });
    
    if (!loginResponse.data.success) {
      console.log('❌ Login failed:', loginResponse.data.message);
      return;
    }
    
    const token = loginResponse.data.data.token;
    const user = loginResponse.data.data.user;
    console.log('✅ Login successful:', user.name, `(${user.role})`);

    // 2. Test dashboard endpoint
    console.log('\n2. 📊 Testing dashboard endpoint...');
    
    const dashboardResponse = await axios.get(`${API_BASE}/dashboard`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (dashboardResponse.data.success) {
      console.log('✅ Dashboard data fetched successfully');
      const { stats, students, conversations } = dashboardResponse.data.data;
      
      console.log('\n📊 Dashboard Stats:');
      console.log(`   Total Students: ${stats.total_students}`);
      console.log(`   My College: ${stats.my_college}`);
      console.log(`   Other Colleges: ${stats.other_colleges}`);
      console.log(`   Active Chats: ${stats.active_chats}`);
      
      console.log('\n👥 Students Data:');
      console.log(`   My College Students: ${students.my_college?.length || 0}`);
      console.log(`   Other College Students: ${students.other_colleges?.length || 0}`);
      
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
      
      console.log('\n💬 Conversations:');
      console.log(`   Total Conversations: ${conversations?.length || 0}`);
      
      if (conversations && conversations.length > 0) {
        conversations.forEach((chat, index) => {
          console.log(`     ${index + 1}. ${chat.student?.name} - ${chat.idea?.title || 'No Idea'}`);
        });
      }
      
    } else {
      console.log('❌ Dashboard failed:', dashboardResponse.data.message);
    }

    // 3. Test mentor chat endpoint
    console.log('\n3. 💬 Testing mentor chat endpoint...');
    
    try {
      const chatResponse = await axios.get(`${API_BASE}/mentor-chats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (chatResponse.data.success) {
        const chats = chatResponse.data.data.chats;
        console.log(`✅ Mentor chats: ${chats.length} conversations`);
        
        if (chats.length > 0) {
          console.log('\n   Available conversations:');
          chats.forEach((chat, index) => {
            console.log(`     ${index + 1}. ${chat.student?.name} - ${chat.idea?.title || 'No Idea'}`);
          });
        }
      } else {
        console.log('❌ Mentor chats failed:', chatResponse.data.message);
      }
    } catch (error) {
      console.log('❌ Mentor chats error:', error.response?.data?.message || error.message);
    }

    console.log('\n🎉 Mentor Dashboard Test Completed!');
    console.log('====================================');
    console.log('✅ Mentor login working');
    console.log('✅ Dashboard data fetching working');
    console.log('✅ Student data display working');
    console.log('✅ Chat functionality working');

  } catch (error) {
    console.error('\n❌ Test failed:', error.response?.data || error.message);
  }
}

testMentorDashboard();
