const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function debugCurrentErrors() {
  try {
    console.log('🔍 Debugging Current Errors...\n');
    
    // 1. Test College Admin Login
    console.log('1. Testing College Admin Login...');
    const adminLoginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin1@college1.edu',
      password: 'password123'
    });
    
    const adminToken = adminLoginResponse.data.data?.token || adminLoginResponse.data.token;
    const adminHeaders = { Authorization: `Bearer ${adminToken}` };
    console.log('✅ College Admin login successful\n');
    
    // 2. Test Student Management API
    console.log('2. Testing Student Management API...');
    try {
      const studentsResponse = await axios.get(`${BASE_URL}/college-coordinator/students`, { 
        headers: adminHeaders,
        params: { limit: 10 }
      });
      console.log('✅ Students API working:', studentsResponse.data.success);
      console.log('   Students count:', studentsResponse.data.data?.students?.length || 0);
    } catch (error) {
      console.log('❌ Students API error:');
      console.log('   Status:', error.response?.status);
      console.log('   Message:', error.response?.data?.message);
      console.log('   Full error:', error.response?.data);
    }
    
    // 3. Test Idea Evaluation API
    console.log('\n3. Testing Idea Evaluation API...');
    try {
      const evaluationResponse = await axios.post(`${BASE_URL}/college-coordinator/ideas/64/evaluate`, {
        rating: 5,
        comments: 'Test evaluation',
        recommendation: 'forward'
      }, { headers: adminHeaders });
      console.log('✅ Idea evaluation working:', evaluationResponse.data.success);
    } catch (error) {
      console.log('❌ Idea evaluation error:');
      console.log('   Status:', error.response?.status);
      console.log('   Message:', error.response?.data?.message);
      console.log('   Full error:', error.response?.data);
    }
    
    // 4. Test Dashboard API
    console.log('\n4. Testing Dashboard API...');
    try {
      const dashboardResponse = await axios.get(`${BASE_URL}/college-coordinator/dashboard`, { 
        headers: adminHeaders 
      });
      console.log('✅ Dashboard API working:', dashboardResponse.data.success);
      console.log('   Total Students:', dashboardResponse.data.data?.stats?.totalStudents || 0);
    } catch (error) {
      console.log('❌ Dashboard API error:');
      console.log('   Status:', error.response?.status);
      console.log('   Message:', error.response?.data?.message);
    }
    
    // 5. Test Events API
    console.log('\n5. Testing Events API...');
    try {
      const eventsResponse = await axios.get(`${BASE_URL}/events`, { 
        headers: adminHeaders 
      });
      console.log('✅ Events API working:', eventsResponse.data.success);
      console.log('   Events count:', eventsResponse.data.data?.events?.length || 0);
    } catch (error) {
      console.log('❌ Events API error:');
      console.log('   Status:', error.response?.status);
      console.log('   Message:', error.response?.data?.message);
    }
    
    console.log('\n🎯 Debug completed!');
    
  } catch (error) {
    console.error('❌ Debug failed:', error.response?.data || error.message);
  }
}

debugCurrentErrors();
