const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function testAllFixes() {
  try {
    console.log('🔍 Testing All Fixes...\n');
    
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
    
    // 3. Test Event Creation
    console.log('3. Testing Event Creation...');
    try {
      const eventData = {
        title: 'Test Innovation Workshop',
        description: 'A comprehensive workshop on innovation and entrepreneurship for students',
        type: 'workshop',
        start_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(), // 2 hours later
        location: 'Test College Campus',
        max_participants: 50
      };
      
      const eventResponse = await axios.post(`${BASE_URL}/events`, eventData, { headers: adminHeaders });
      console.log('✅ Event created successfully:', eventResponse.data.success);
    } catch (error) {
      console.log('⚠️ Event creation error:', error.response?.data?.message || error.message);
    }
    
    // 4. Test Event Display for Both Sides
    console.log('\n4. Testing Event Display...');
    try {
      const adminEventsResponse = await axios.get(`${BASE_URL}/college-coordinator/events`, { headers: adminHeaders });
      console.log('✅ College Admin Events:', adminEventsResponse.data.success, 'Count:', adminEventsResponse.data.data?.events?.length || 0);
    } catch (error) {
      console.log('⚠️ College Admin Events error:', error.response?.data?.message || error.message);
    }
    
    try {
      const studentEventsResponse = await axios.get(`${BASE_URL}/student-events`, { headers: studentHeaders });
      console.log('✅ Student Events:', studentEventsResponse.data.success, 'Count:', studentEventsResponse.data.data?.allEvents?.length || 0);
    } catch (error) {
      console.log('⚠️ Student Events error:', error.response?.data?.message || error.message);
    }
    
    // 5. Test Student Count Consistency
    console.log('\n5. Testing Student Count Consistency...');
    try {
      const dashboardResponse = await axios.get(`${BASE_URL}/college-coordinator/dashboard`, { headers: adminHeaders });
      const dashboardStudents = dashboardResponse.data.data.stats.totalStudents;
      console.log('✅ Dashboard Students:', dashboardStudents);
      
      const studentsResponse = await axios.get(`${BASE_URL}/college-coordinator/students`, { headers: adminHeaders });
      const studentsCount = studentsResponse.data.data.pagination.total_items;
      console.log('✅ Students Management Count:', studentsCount);
      
      if (dashboardStudents === studentsCount) {
        console.log('✅ Student counts match!');
      } else {
        console.log('⚠️ Student count mismatch detected');
      }
    } catch (error) {
      console.log('⚠️ Student count test error:', error.response?.data?.message || error.message);
    }
    
    // 6. Test Report Generation
    console.log('\n6. Testing Report Generation...');
    try {
      const reportData = {
        title: 'Test Report',
        report_type: 'quarterly',
        period_start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
        period_end: new Date().toISOString()
      };
      
      const reportResponse = await axios.post(`${BASE_URL}/college-coordinator/reports`, reportData, { headers: adminHeaders });
      console.log('✅ Report created successfully:', reportResponse.data.success);
      
      if (reportResponse.data.data?.report?.id) {
        const reportId = reportResponse.data.data.report.id;
        console.log('   Report ID:', reportId);
        
        // Test CSV download
        try {
          const downloadResponse = await axios.get(`${BASE_URL}/college-coordinator/reports/${reportId}/download`, { 
            headers: adminHeaders,
            responseType: 'text'
          });
          console.log('✅ CSV download working, content length:', downloadResponse.data.length);
        } catch (downloadError) {
          console.log('⚠️ CSV download error:', downloadError.response?.data?.message || downloadError.message);
        }
      }
    } catch (error) {
      console.log('⚠️ Report generation error:', error.response?.data?.message || error.message);
    }
    
    // 7. Test Notifications
    console.log('\n7. Testing Notifications...');
    try {
      const adminNotificationsResponse = await axios.get(`${BASE_URL}/notifications`, { headers: adminHeaders });
      console.log('✅ Admin Notifications:', adminNotificationsResponse.data.success, 'Count:', adminNotificationsResponse.data.data?.notifications?.length || 0);
      
      const studentNotificationsResponse = await axios.get(`${BASE_URL}/notifications`, { headers: studentHeaders });
      console.log('✅ Student Notifications:', studentNotificationsResponse.data.success, 'Count:', studentNotificationsResponse.data.data?.notifications?.length || 0);
    } catch (error) {
      console.log('⚠️ Notifications error:', error.response?.data?.message || error.message);
    }
    
    // 8. Test Chat Students
    console.log('\n8. Testing Chat Students...');
    try {
      const chatStudentsResponse = await axios.get(`${BASE_URL}/college-coordinator/chat/students`, { headers: adminHeaders });
      console.log('✅ Chat Students:', chatStudentsResponse.data.success, 'Count:', chatStudentsResponse.data.data?.students?.length || 0);
    } catch (error) {
      console.log('⚠️ Chat Students error:', error.response?.data?.message || error.message);
    }
    
    // 9. Test File Download URLs
    console.log('\n9. Testing File Download URLs...');
    try {
      const ideasResponse = await axios.get(`${BASE_URL}/ideas`, { headers: studentHeaders });
      const ideasWithFiles = ideasResponse.data.data.ideas.filter(idea => idea.files && idea.files.length > 0);
      
      if (ideasWithFiles.length > 0) {
        const ideaWithFiles = ideasWithFiles[0];
        console.log('✅ Ideas with files found:', ideasWithFile.files.length);
        
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
    
    console.log('\n🎉 All fixes testing completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testAllFixes();
