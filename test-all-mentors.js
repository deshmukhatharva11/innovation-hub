const axios = require('axios');

async function testAllMentors() {
  try {
    console.log('🔧 Testing All Mentors...\n');

    const mentorEmails = [
      'sarah.johnson@example.com',
      'rajesh.kumar@example.com',
      'priya.sharma@example.com',
      'amit.patel@example.com',
      'sarah.johnson@college.edu',
      'michael.chen@college.edu',
      'emily.rodriguez@college.edu'
    ];

    for (const email of mentorEmails) {
      console.log(`\n👨‍🏫 Testing mentor: ${email}`);
      
      try {
        const response = await axios.post('http://localhost:3001/api/auth/login', {
          email: email,
          password: 'admin123'
        });
        
        console.log('✅ Login successful!');
        console.log(`   Name: ${response.data.data.user.name}`);
        console.log(`   Role: ${response.data.data.user.role}`);
        console.log(`   College ID: ${response.data.data.user.college_id}`);
        
        // Test dashboard
        try {
          const dashboardResponse = await axios.get('http://localhost:3001/api/dashboard', {
            headers: { Authorization: `Bearer ${response.data.data.token}` }
          });
          
          if (dashboardResponse.data.success) {
            const { stats } = dashboardResponse.data.data;
            console.log(`   Dashboard Stats: ${stats.total_students} students, ${stats.my_college} my college, ${stats.other_colleges} other colleges`);
          } else {
            console.log('   ❌ Dashboard failed:', dashboardResponse.data.message);
          }
        } catch (dashboardError) {
          console.log('   ❌ Dashboard error:', dashboardError.response?.data?.message || dashboardError.message);
        }
        
        break; // Stop after first successful login
        
      } catch (error) {
        console.log('   ❌ Login failed:', error.response?.data?.message || error.message);
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAllMentors();
