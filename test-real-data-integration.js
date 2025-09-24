const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';
let adminToken = '';
let testCollegeId = null;
let testIncubatorId = null;

// Test data
const testCollege = {
  name: 'Test Engineering College',
  city: 'Mumbai',
  state: 'Maharashtra',
  country: 'India',
  address: '123 Test Street, Mumbai',
  phone: '912212345678',
  contact_email: 'test@testcollege.edu',
  website: 'https://testcollege.edu',
  established_year: 2020,
  description: 'A test engineering college for testing purposes',
  is_active: true
};

const testIncubator = {
  name: 'Test Innovation Incubator',
  city: 'Bangalore',
  state: 'Karnataka',
  country: 'India',
  address: '456 Innovation Road, Bangalore',
  phone: '918087654321',
  contact_email: 'info@testincubator.org',
  website: 'https://testincubator.org',
  established_year: 2019,
  description: 'A test incubator for testing purposes',
  focus_areas: ['Technology', 'Healthcare'],
  funding_available: 1000000,
  capacity: 50,
  is_active: true
};

async function testAdminLogin() {
  console.log('\n🔐 Testing Admin Login...');
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@innovationhub.com',
      password: 'password123'
    });

    if (response.data?.success && response.data?.data?.token) {
      adminToken = response.data.data.token;
      console.log('✅ Admin login successful');
      return true;
    } else {
      console.log('❌ Admin login failed: Invalid response format');
      return false;
    }
  } catch (error) {
    console.log('❌ Admin login failed:', error.response?.data?.message || error.message);
    return false;
  }
}

async function testSystemAnalytics() {
  console.log('\n📊 Testing System Analytics...');
  try {
    const response = await axios.get(`${BASE_URL}/admin/analytics/system`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    if (response.data?.success) {
      const data = response.data.data;
      console.log('✅ System analytics fetched successfully');
      console.log(`   - Total Users: ${data.overview?.total_users || 0}`);
      console.log(`   - Total Colleges: ${data.overview?.total_colleges || 0}`);
      console.log(`   - Total Incubators: ${data.overview?.total_incubators || 0}`);
      console.log(`   - Total Ideas: ${data.overview?.total_ideas || 0}`);
      return true;
    } else {
      console.log('❌ System analytics failed: Invalid response format');
      return false;
    }
  } catch (error) {
    console.log('❌ System analytics failed:', error.response?.data?.message || error.message);
    return false;
  }
}

async function testUserAnalytics() {
  console.log('\n👥 Testing User Analytics...');
  try {
    const response = await axios.get(`${BASE_URL}/admin/analytics/users`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      params: { limit: 5 }
    });

    if (response.data?.success) {
      const data = response.data.data;
      console.log('✅ User analytics fetched successfully');
      console.log(`   - Total Users: ${data.pagination?.total_items || 0}`);
      console.log(`   - Users in response: ${data.users?.length || 0}`);
      return true;
    } else {
      console.log('❌ User analytics failed: Invalid response format');
      return false;
    }
  } catch (error) {
    console.log('❌ User analytics failed:', error.response?.data?.message || error.message);
    return false;
  }
}

async function testIdeaAnalytics() {
  console.log('\n💡 Testing Idea Analytics...');
  try {
    const response = await axios.get(`${BASE_URL}/admin/analytics/ideas`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      params: { limit: 5 }
    });

    if (response.data?.success) {
      const data = response.data.data;
      console.log('✅ Idea analytics fetched successfully');
      console.log(`   - Total Ideas: ${data.pagination?.total_items || 0}`);
      console.log(`   - Ideas in response: ${data.ideas?.length || 0}`);
      return true;
    } else {
      console.log('❌ Idea analytics failed: Invalid response format');
      return false;
    }
  } catch (error) {
    console.log('❌ Idea analytics failed:', error.response?.data?.message || error.message);
    return false;
  }
}

async function testSystemHealth() {
  console.log('\n🏥 Testing System Health...');
  try {
    const response = await axios.get(`${BASE_URL}/admin/analytics/health`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    if (response.data?.success) {
      const data = response.data.data;
      console.log('✅ System health fetched successfully');
      console.log(`   - Total Notifications: ${data.notifications?.total || 0}`);
      console.log(`   - Unread Notifications: ${data.notifications?.unread || 0}`);
      return true;
    } else {
      console.log('❌ System health failed: Invalid response format');
      return false;
    }
  } catch (error) {
    console.log('❌ System health failed:', error.response?.data?.message || error.message);
    return false;
  }
}

async function testCollegeManagement() {
  console.log('\n🏫 Testing College Management...');
  try {
    // Test creating a college
    const response = await axios.post(`${BASE_URL}/colleges`, testCollege, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    if (response.data?.success) {
      testCollegeId = response.data.data.college.id;
      console.log('✅ College created successfully');
      
      // Test fetching colleges
      const fetchResponse = await axios.get(`${BASE_URL}/colleges`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      
      if (fetchResponse.data?.success) {
        console.log(`✅ Colleges fetched successfully - Total: ${fetchResponse.data.data.colleges.length}`);
      }
      
      return true;
    } else {
      console.log('❌ College creation failed: Invalid response format');
      return false;
    }
  } catch (error) {
    console.log('❌ College creation failed:', error.response?.data?.message || error.message);
    if (error.response?.data?.errors) {
      console.log('   Validation errors:', error.response.data.errors);
    }
    return false;
  }
}

async function testIncubatorManagement() {
  console.log('\n🚀 Testing Incubator Management...');
  try {
    // Test creating an incubator
    const response = await axios.post(`${BASE_URL}/incubators`, testIncubator, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    if (response.data?.success) {
      testIncubatorId = response.data.data.incubator.id;
      console.log('✅ Incubator created successfully');
      
      // Test fetching incubators
      const fetchResponse = await axios.get(`${BASE_URL}/incubators`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      
      if (fetchResponse.data?.success) {
        console.log(`✅ Incubators fetched successfully - Total: ${fetchResponse.data.data.incubators.length}`);
      }
      
      return true;
    } else {
      console.log('❌ Incubator creation failed: Invalid response format');
      return false;
    }
  } catch (error) {
    console.log('❌ Incubator creation failed:', error.response?.data?.message || error.message);
    if (error.response?.data?.errors) {
      console.log('   Validation errors:', error.response.data.errors);
    }
    return false;
  }
}

async function testDatabaseRelationships() {
  console.log('\n🔗 Testing Database Relationships...');
  try {
    // Test if users have college_id values
    const usersResponse = await axios.get(`${BASE_URL}/users`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      params: { limit: 10 }
    });

    if (usersResponse.data?.success) {
      const users = usersResponse.data.data.users;
      console.log(`✅ Users fetched: ${users.length}`);
      
      const usersWithCollege = users.filter(u => u.college_id);
      const studentsWithCollege = users.filter(u => u.role === 'student' && u.college_id);
      
      console.log(`   - Users with college_id: ${usersWithCollege.length}`);
      console.log(`   - Students with college_id: ${studentsWithCollege.length}`);
      
      if (studentsWithCollege.length > 0) {
        console.log('   - Sample student college_id:', studentsWithCollege[0].college_id);
      }
    }

    // Test college stats
    const collegesResponse = await axios.get(`${BASE_URL}/colleges`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    if (collegesResponse.data?.success) {
      const colleges = collegesResponse.data.data.colleges;
      console.log(`✅ Colleges fetched: ${colleges.length}`);
      
      const collegesWithStudents = colleges.filter(c => c.total_students > 0);
      console.log(`   - Colleges with students: ${collegesWithStudents.length}`);
      
      if (collegesWithStudents.length > 0) {
        console.log('   - Sample college stats:', {
          name: collegesWithStudents[0].name,
          total_students: collegesWithStudents[0].total_students,
          total_ideas: collegesWithStudents[0].total_ideas
        });
      }
    }

    return true;
  } catch (error) {
    console.log('❌ Database relationships test failed:', error.response?.data?.message || error.message);
    return false;
  }
}

async function testCleanup() {
  console.log('\n🧹 Testing Cleanup...');
  
  // Delete test college
  if (testCollegeId) {
    try {
      await axios.delete(`${BASE_URL}/colleges/${testCollegeId}`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      console.log('✅ Test college deleted successfully');
    } catch (error) {
      console.log('❌ Test college deletion failed:', error.response?.data?.message || error.message);
    }
  }

  // Delete test incubator
  if (testIncubatorId) {
    try {
      await axios.delete(`${BASE_URL}/incubators/${testIncubatorId}`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      console.log('✅ Test incubator deleted successfully');
    } catch (error) {
      console.log('❌ Test incubator deletion failed:', error.response?.data?.message || error.message);
    }
  }
}

async function runAllTests() {
  console.log('🚀 Starting Real Data Integration Tests...\n');

  const tests = [
    { name: 'Admin Login', fn: testAdminLogin },
    { name: 'System Analytics', fn: testSystemAnalytics },
    { name: 'User Analytics', fn: testUserAnalytics },
    { name: 'Idea Analytics', fn: testIdeaAnalytics },
    { name: 'System Health', fn: testSystemHealth },
    { name: 'College Management', fn: testCollegeManagement },
    { name: 'Incubator Management', fn: testIncubatorManagement },
    { name: 'Database Relationships', fn: testDatabaseRelationships }
  ];

  let passedTests = 0;
  let totalTests = tests.length;

  for (const test of tests) {
    try {
      const result = await test.fn();
      if (result) {
        passedTests++;
      }
    } catch (error) {
      console.log(`❌ ${test.name} failed with error:`, error.message);
    }
  }

  // Cleanup
  await testCleanup();

  console.log('\n📊 Test Results Summary:');
  console.log(`✅ Passed: ${passedTests}/${totalTests}`);
  console.log(`❌ Failed: ${totalTests - passedTests}/${totalTests}`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 All tests passed! Real data integration is working correctly.');
  } else {
    console.log('\n⚠️ Some tests failed. Please check the implementation.');
  }
}

// Run tests
runAllTests().catch(console.error);
