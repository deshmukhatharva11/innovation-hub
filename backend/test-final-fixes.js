const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function testFinalFixes() {
  try {
    console.log('🔍 Testing Final Fixes...\n');
    
    // 1. Test College Admin Login
    console.log('1. Testing College Admin Login...');
    const adminLoginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin1@college1.edu',
      password: 'password123'
    });
    
    const adminToken = adminLoginResponse.data.data?.token || adminLoginResponse.data.token;
    const adminHeaders = { Authorization: `Bearer ${adminToken}` };
    console.log('✅ College Admin login successful\n');
    
    // 2. Test Event Creation (Real Database)
    console.log('2. Testing Event Creation (Real Database)...');
    try {
      const eventData = {
        title: 'Final Test Innovation Workshop',
        description: 'A comprehensive workshop on innovation and entrepreneurship for students',
        type: 'workshop',
        start_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
        location: 'Test College Campus',
        max_participants: 50
      };
      
      const eventResponse = await axios.post(`${BASE_URL}/events`, eventData, { headers: adminHeaders });
      console.log('✅ Event created successfully:', eventResponse.data.success);
      console.log('   Event ID:', eventResponse.data.data?.event?.id);
    } catch (error) {
      console.log('⚠️ Event creation error:', error.response?.data?.message || error.message);
    }
    
    // 3. Test Event Display (Real Data)
    console.log('\n3. Testing Event Display (Real Data)...');
    try {
      const eventsResponse = await axios.get(`${BASE_URL}/events`, { headers: adminHeaders });
      console.log('✅ Events API working:', eventsResponse.data.success);
      console.log('   Events count:', eventsResponse.data.data?.events?.length || 0);
      
      if (eventsResponse.data.data?.events?.length > 0) {
        const event = eventsResponse.data.data.events[0];
        console.log('   First event:', event.title, 'Status:', event.status);
      }
    } catch (error) {
      console.log('⚠️ Events display error:', error.response?.data?.message || error.message);
    }
    
    // 4. Test Student Management with Real Data
    console.log('\n4. Testing Student Management...');
    try {
      const studentsResponse = await axios.get(`${BASE_URL}/college-coordinator/students`, { headers: adminHeaders });
      console.log('✅ Students API working:', studentsResponse.data.success);
      console.log('   Students count:', studentsResponse.data.data?.students?.length || 0);
      
      if (studentsResponse.data.data?.students?.length > 0) {
        const student = studentsResponse.data.data.students[0];
        console.log('   First student:', student.name, 'Ideas:', student.performance?.totalIdeas || 0);
      }
    } catch (error) {
      console.log('⚠️ Students API error:', error.response?.data?.message || error.message);
    }
    
    // 5. Test Add Student
    console.log('\n5. Testing Add Student...');
    try {
      const studentData = {
        name: 'Test New Student',
        email: 'newstudent@test.com',
        password: 'password123',
        department: 'Computer Science',
        year: '2024',
        roll_number: 'CS2024001'
      };
      
      const addStudentResponse = await axios.post(`${BASE_URL}/college-coordinator/students`, studentData, { headers: adminHeaders });
      console.log('✅ Student added successfully:', addStudentResponse.data.success);
      console.log('   Student ID:', addStudentResponse.data.data?.student?.id);
    } catch (error) {
      console.log('⚠️ Add student error:', error.response?.data?.message || error.message);
    }
    
    // 6. Test Export Students
    console.log('\n6. Testing Export Students...');
    try {
      const exportResponse = await axios.get(`${BASE_URL}/college-coordinator/students/export`, { 
        headers: adminHeaders,
        responseType: 'text'
      });
      console.log('✅ Export working, CSV length:', exportResponse.data.length);
      console.log('   CSV preview:', exportResponse.data.substring(0, 200) + '...');
    } catch (error) {
      console.log('⚠️ Export error:', error.response?.data?.message || error.message);
    }
    
    // 7. Test Report Generation
    console.log('\n7. Testing Report Generation...');
    try {
      const reportData = {
        title: 'Final Test Report',
        report_type: 'quarterly',
        period_start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
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
          console.log('✅ Report CSV download working, content length:', downloadResponse.data.length);
        } catch (downloadError) {
          console.log('⚠️ Report CSV download error:', downloadError.response?.data?.message || downloadError.message);
        }
      }
    } catch (error) {
      console.log('⚠️ Report generation error:', error.response?.data?.message || error.message);
    }
    
    // 8. Test Idea Evaluation (Status Update)
    console.log('\n8. Testing Idea Evaluation...');
    try {
      const ideasResponse = await axios.get(`${BASE_URL}/college-coordinator/ideas`, { headers: adminHeaders });
      const pendingIdeas = ideasResponse.data.data.ideas.filter(idea => 
        ['submitted', 'new_submission', 'under_review'].includes(idea.status)
      );
      
      if (pendingIdeas.length > 0) {
        const ideaToEvaluate = pendingIdeas[0];
        console.log('   Evaluating idea:', ideaToEvaluate.title, 'Status:', ideaToEvaluate.status);
        
        const evaluationResponse = await axios.post(
          `${BASE_URL}/college-coordinator/ideas/${ideaToEvaluate.id}/evaluate`,
          {
            rating: 8,
            comments: 'Final test evaluation',
            recommendation: 'nurture',
            nurture_notes: 'Needs more development'
          },
          { headers: adminHeaders }
        );
        
        console.log('✅ Idea evaluation successful:', evaluationResponse.data.success);
        console.log('   New status:', evaluationResponse.data.data?.idea?.status);
      } else {
        console.log('   No pending ideas to evaluate');
      }
    } catch (error) {
      console.log('⚠️ Idea evaluation error:', error.response?.data?.message || error.message);
    }
    
    console.log('\n🎉 Final fixes testing completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testFinalFixes();
