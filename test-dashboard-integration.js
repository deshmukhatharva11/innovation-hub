/**
 * Dashboard Integration Test Script
 * 
 * This script tests the dashboard API integration for different user roles.
 * It logs in with different user roles and tests the dashboard API response.
 */

const axios = require('axios');

// Configuration
const API_URL = 'http://localhost:3001/api';
const TEST_USERS = [
  { email: 'admin@innovationhub.com', password: 'admin123', role: 'admin' },
  { email: 'mentor@innovationhub.com', password: 'mentor123', role: 'mentor' },
  { email: 'college@innovationhub.com', password: 'college123', role: 'college_admin' },
  { email: 'student@innovationhub.com', password: 'student123', role: 'student' }
];

// Helper function to login and get token
async function login(email, password) {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, { email, password });
    if (response.data.success) {
      console.log(`✅ Login successful for ${email}`);
      return response.data.data.token;
    } else {
      console.error(`❌ Login failed for ${email}:`, response.data.message);
      return null;
    }
  } catch (error) {
    console.error(`❌ Login error for ${email}:`, error.message);
    return null;
  }
}

// Helper function to test dashboard API
async function testDashboard(token, role) {
  try {
    const response = await axios.get(`${API_URL}/dashboard`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (response.data.success) {
      console.log(`✅ Dashboard API successful for ${role}`);
      console.log(`📊 Dashboard data for ${role}:`, JSON.stringify(response.data.data, null, 2));
      return true;
    } else {
      console.error(`❌ Dashboard API failed for ${role}:`, response.data.message);
      return false;
    }
  } catch (error) {
    console.error(`❌ Dashboard API error for ${role}:`, error.message);
    return false;
  }
}

// Helper function to test admin-specific APIs
async function testAdminAPIs(token) {
  try {
    // Test global analytics API
    const globalAnalyticsResponse = await axios.get(`${API_URL}/admin/analytics/global`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (globalAnalyticsResponse.data.success) {
      console.log('✅ Global Analytics API successful');
      console.log('📊 Global Analytics data:', JSON.stringify(globalAnalyticsResponse.data.data.overview, null, 2));
      return true;
    } else {
      console.error('❌ Global Analytics API failed:', globalAnalyticsResponse.data.message);
      return false;
    }
  } catch (error) {
    console.error('❌ Global Analytics API error:', error.message);
    return false;
  }
}

// Main test function
async function runTests() {
  console.log('🔍 Starting dashboard integration tests...');
  
  for (const user of TEST_USERS) {
    console.log(`\n📝 Testing ${user.role} user: ${user.email}`);
    
    // Login
    const token = await login(user.email, user.password);
    if (!token) {
      console.log(`⏭️ Skipping tests for ${user.role} due to login failure`);
      continue;
    }
    
    // Test dashboard API
    const dashboardSuccess = await testDashboard(token, user.role);
    
    // Test admin-specific APIs for admin users
    if (user.role === 'admin' && dashboardSuccess) {
      await testAdminAPIs(token);
    }
    
    console.log(`\n✅ Completed tests for ${user.role} user`);
  }
  
  console.log('\n🏁 All dashboard integration tests completed!');
}

// Run the tests
runTests().catch(error => {
  console.error('❌ Unhandled error in tests:', error);
});
