const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function debugUserData() {
  try {
    console.log('🔍 Debugging User Data...\n');
    
    // 1. Test College Admin Login
    console.log('1. Testing College Admin Login...');
    const adminLoginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin1@college1.edu',
      password: 'password123'
    });
    
    console.log('✅ Login successful');
    console.log('User data:', JSON.stringify(adminLoginResponse.data.data.user, null, 2));
    console.log('College ID:', adminLoginResponse.data.data.user.college_id);
    console.log('Role:', adminLoginResponse.data.data.user.role);
    
    const adminToken = adminLoginResponse.data.data?.token || adminLoginResponse.data.token;
    const adminHeaders = { Authorization: `Bearer ${adminToken}` };
    
    // 2. Test /auth/me endpoint
    console.log('\n2. Testing /auth/me endpoint...');
    const meResponse = await axios.get(`${BASE_URL}/auth/me`, { headers: adminHeaders });
    console.log('✅ /auth/me successful');
    console.log('User data from /auth/me:', JSON.stringify(meResponse.data.data.user, null, 2));
    console.log('College ID from /auth/me:', meResponse.data.data.user.college_id);
    
    // 3. Test Student Management API
    console.log('\n3. Testing Student Management API...');
    try {
      const studentsResponse = await axios.get(`${BASE_URL}/college-coordinator/students`, { 
        headers: adminHeaders,
        params: { limit: 10 }
      });
      console.log('✅ Students API working:', studentsResponse.data.success);
      console.log('Students count:', studentsResponse.data.data?.students?.length || 0);
    } catch (error) {
      console.log('❌ Students API error:');
      console.log('   Status:', error.response?.status);
      console.log('   Message:', error.response?.data?.message);
      console.log('   Full error:', error.response?.data);
    }
    
    console.log('\n🎯 Debug completed!');
    
  } catch (error) {
    console.error('❌ Debug failed:', error.response?.data || error.message);
  }
}

debugUserData();
