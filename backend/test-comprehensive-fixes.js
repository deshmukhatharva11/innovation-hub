const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function testComprehensiveFixes() {
  try {
    console.log('🔍 Testing Comprehensive Fixes...\n');
    
    // 1. Test College Admin Login
    console.log('1. Testing College Admin Login...');
    const adminLoginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin1@college1.edu',
      password: 'password123'
    });
    
    const adminToken = adminLoginResponse.data.data?.token || adminLoginResponse.data.token;
    const adminHeaders = { Authorization: `Bearer ${adminToken}` };
    console.log('✅ College Admin login successful\n');
    
    // 2. Test Student Login
    console.log('2. Testing Student Login...');
    const studentLoginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'student1@college1.edu',
      password: 'password123'
    });
    
    const studentToken = studentLoginResponse.data.data?.token || studentLoginResponse.data.token;
    const studentHeaders = { Authorization: `Bearer ${studentToken}` };
    console.log('✅ Student login successful\n');
    
    // 3. Test Reports API (should not crash)
    console.log('3. Testing Reports API...');
    try {
      const reportsResponse = await axios.get(`${BASE_URL}/college-coordinator/reports`, { headers: adminHeaders });
      console.log('✅ Reports API working:', reportsResponse.data.success);
    } catch (error) {
      console.log('⚠️ Reports API error:', error.response?.data?.message || error.message);
    }
    
    // 4. Test Events API for both sides
    console.log('\n4. Testing Events API...');
    try {
      const adminEventsResponse = await axios.get(`${BASE_URL}/college-coordinator/events`, { headers: adminHeaders });
      console.log('✅ College Admin Events API working:', adminEventsResponse.data.success);
    } catch (error) {
      console.log('⚠️ College Admin Events API error:', error.response?.data?.message || error.message);
    }
    
    try {
      const studentEventsResponse = await axios.get(`${BASE_URL}/student-events`, { headers: studentHeaders });
      console.log('✅ Student Events API working:', studentEventsResponse.data.success);
    } catch (error) {
      console.log('⚠️ Student Events API error:', error.response?.data?.message || error.message);
    }
    
    // 5. Test Chat Students API
    console.log('\n5. Testing Chat Students API...');
    try {
      const chatStudentsResponse = await axios.get(`${BASE_URL}/college-coordinator/chat/students`, { headers: adminHeaders });
      console.log('✅ Chat Students API working:', chatStudentsResponse.data.success);
      if (chatStudentsResponse.data.data?.students) {
        console.log('   Students available for chat:', chatStudentsResponse.data.data.students.length);
      }
    } catch (error) {
      console.log('⚠️ Chat Students API error:', error.response?.data?.message || error.message);
    }
    
    // 6. Test Idea Evaluation
    console.log('\n6. Testing Idea Evaluation...');
    try {
      // Get pending ideas
      const ideasResponse = await axios.get(`${BASE_URL}/college-coordinator/ideas`, { headers: adminHeaders });
      const pendingIdeas = ideasResponse.data.data.ideas.filter(idea => 
        ['submitted', 'new_submission', 'under_review'].includes(idea.status)
      );
      
      if (pendingIdeas.length > 0) {
        const ideaToEvaluate = pendingIdeas[0];
        console.log('   Evaluating idea:', ideaToEvaluate.title);
        
        const evaluationResponse = await axios.post(
          `${BASE_URL}/college-coordinator/ideas/${ideaToEvaluate.id}/evaluate`,
          {
            rating: 8,
            comments: 'Test evaluation for comprehensive testing',
            recommendation: 'nurture',
            nurture_notes: 'Needs more development'
          },
          { headers: adminHeaders }
        );
        
        console.log('✅ Idea evaluation successful:', evaluationResponse.data.success);
      } else {
        console.log('   No pending ideas to evaluate');
      }
    } catch (error) {
      console.log('⚠️ Idea evaluation error:', error.response?.data?.message || error.message);
    }
    
    // 7. Test File Download URLs
    console.log('\n7. Testing File Download URLs...');
    try {
      const ideasResponse = await axios.get(`${BASE_URL}/ideas`, { headers: studentHeaders });
      const ideasWithFiles = ideasResponse.data.data.ideas.filter(idea => idea.files && idea.files.length > 0);
      
      if (ideasWithFiles.length > 0) {
        const ideaWithFile = ideasWithFiles[0];
        console.log('   Idea with files found:', ideaWithFile.title);
        console.log('   Files:', ideaWithFile.files.length);
        
        // Test file URL construction
        ideaWithFile.files.forEach((file, index) => {
          const fileUrl = `http://localhost:3001/files/${file.file_path || file.filename}`;
          console.log(`   File ${index + 1} URL:`, fileUrl);
        });
      } else {
        console.log('   No ideas with files found');
      }
    } catch (error) {
      console.log('⚠️ File download test error:', error.response?.data?.message || error.message);
    }
    
    // 8. Test Notifications
    console.log('\n8. Testing Notifications...');
    try {
      const notificationsResponse = await axios.get(`${BASE_URL}/notifications`, { headers: studentHeaders });
      console.log('✅ Notifications API working:', notificationsResponse.data.success);
      if (notificationsResponse.data.data?.notifications) {
        console.log('   Notifications count:', notificationsResponse.data.data.notifications.length);
      }
    } catch (error) {
      console.log('⚠️ Notifications API error:', error.response?.data?.message || error.message);
    }
    
    console.log('\n🎉 Comprehensive testing completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testComprehensiveFixes();
