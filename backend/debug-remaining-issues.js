const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function debugRemainingIssues() {
  try {
    console.log('🔍 Debugging Remaining Issues...\n');
    
    // 1. Test College Admin Login
    console.log('1. Testing College Admin Login...');
    const adminLoginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin1@college1.edu',
      password: 'password123'
    });
    
    const adminToken = adminLoginResponse.data.data?.token || adminLoginResponse.data.token;
    const adminHeaders = { Authorization: `Bearer ${adminToken}` };
    console.log('✅ College Admin login successful\n');
    
    // 2. Debug Event Creation
    console.log('2. Debugging Event Creation...');
    try {
      const eventData = {
        title: 'Debug Test Event',
        description: 'Testing event creation with detailed debugging',
        type: 'workshop',
        start_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
        location: 'Debug Campus',
        max_participants: 30
      };
      
      console.log('   Event data being sent:', JSON.stringify(eventData, null, 2));
      
      const eventResponse = await axios.post(`${BASE_URL}/events`, eventData, { headers: adminHeaders });
      console.log('✅ Event created successfully:', eventResponse.data);
    } catch (error) {
      console.log('❌ Event creation failed:');
      console.log('   Status:', error.response?.status);
      console.log('   Message:', error.response?.data?.message);
      console.log('   Full error:', JSON.stringify(error.response?.data, null, 2));
    }
    
    // 3. Debug Add Student
    console.log('\n3. Debugging Add Student...');
    try {
      const studentData = {
        name: 'Debug Test Student',
        email: 'debugstudent@test.com',
        password: 'password123',
        department: 'Computer Science',
        year: '2024',
        roll_number: 'CS2024002'
      };
      
      console.log('   Student data being sent:', JSON.stringify(studentData, null, 2));
      
      const studentResponse = await axios.post(`${BASE_URL}/college-coordinator/students`, studentData, { headers: adminHeaders });
      console.log('✅ Student added successfully:', studentResponse.data);
    } catch (error) {
      console.log('❌ Add student failed:');
      console.log('   Status:', error.response?.status);
      console.log('   Message:', error.response?.data?.message);
      console.log('   Full error:', JSON.stringify(error.response?.data, null, 2));
    }
    
    // 4. Debug Report Generation
    console.log('\n4. Debugging Report Generation...');
    try {
      const reportData = {
        title: 'Debug Test Report',
        report_type: 'quarterly',
        period_start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        period_end: new Date().toISOString()
      };
      
      console.log('   Report data being sent:', JSON.stringify(reportData, null, 2));
      
      const reportResponse = await axios.post(`${BASE_URL}/college-coordinator/reports`, reportData, { headers: adminHeaders });
      console.log('✅ Report created successfully:', reportResponse.data);
    } catch (error) {
      console.log('❌ Report generation failed:');
      console.log('   Status:', error.response?.status);
      console.log('   Message:', error.response?.data?.message);
      console.log('   Full error:', JSON.stringify(error.response?.data, null, 2));
    }
    
    // 5. Test Working Features
    console.log('\n5. Testing Working Features...');
    
    // Test Events Display
    try {
      const eventsResponse = await axios.get(`${BASE_URL}/events`, { headers: adminHeaders });
      console.log('✅ Events display working:', eventsResponse.data.success);
      console.log('   Events count:', eventsResponse.data.data?.events?.length || 0);
    } catch (error) {
      console.log('❌ Events display failed:', error.response?.data?.message);
    }
    
    // Test Students Display
    try {
      const studentsResponse = await axios.get(`${BASE_URL}/college-coordinator/students`, { headers: adminHeaders });
      console.log('✅ Students display working:', studentsResponse.data.success);
      console.log('   Students count:', studentsResponse.data.data?.students?.length || 0);
    } catch (error) {
      console.log('❌ Students display failed:', error.response?.data?.message);
    }
    
    // Test Export
    try {
      const exportResponse = await axios.get(`${BASE_URL}/college-coordinator/students/export`, { 
        headers: adminHeaders,
        responseType: 'text'
      });
      console.log('✅ Export working, CSV length:', exportResponse.data.length);
    } catch (error) {
      console.log('❌ Export failed:', error.response?.data?.message || error.message);
    }
    
    console.log('\n🎯 Debugging completed!');
    
  } catch (error) {
    console.error('❌ Debug test failed:', error.response?.data || error.message);
  }
}

debugRemainingIssues();