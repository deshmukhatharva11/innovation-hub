const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';
const FRONTEND_URL = 'http://localhost:3000';

// Test credentials
const TEST_CREDENTIALS = {
  college_admin: {
    email: 'college@example.com',
    password: 'password123'
  },
  student: {
    email: 'student@example.com', 
    password: 'password123'
  },
  admin: {
    email: 'admin@example.com',
    password: 'password123'
  }
};

let authToken = null;
let collegeId = null;

// Utility functions
const log = (message, data = null) => {
  console.log(`[${new Date().toISOString()}] ${message}`);
  if (data) console.log(JSON.stringify(data, null, 2));
};

const makeRequest = async (method, endpoint, data = null, token = authToken) => {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      ...(data && { data })
    };
    
    const response = await axios(config);
    return response;
  } catch (error) {
    log(`Request failed: ${method} ${endpoint}`, {
      status: error.response?.status,
      message: error.response?.data?.message || error.message
    });
    throw error;
  }
};

// Test functions
const testLogin = async (credentials) => {
  log('Testing login...');
  
  try {
    const response = await makeRequest('POST', '/auth/login', credentials);
    
    if (response.data?.success && response.data?.data?.token) {
      authToken = response.data.data.token;
      const user = response.data.data.user;
      collegeId = user.college_id;
      
      log('Login successful', {
        user: user.name,
        role: user.role,
        college_id: user.college_id
      });
      
      return true;
    } else {
      log('Login failed: Invalid response');
      return false;
    }
  } catch (error) {
    log('Login failed', error.response?.data);
    return false;
  }
};

const testGetProfile = async () => {
  log('Testing get profile...');
  
  try {
    const response = await makeRequest('GET', '/auth/me');
    
    if (response.data?.success) {
      log('Profile retrieved successfully', {
        name: response.data.data.user.name,
        role: response.data.data.user.role,
        college_id: response.data.data.user.college_id
      });
      return true;
    } else {
      log('Get profile failed: Invalid response');
      return false;
    }
  } catch (error) {
    log('Get profile failed', error.response?.data);
    return false;
  }
};

const testGetDashboardStats = async () => {
  log('Testing dashboard analytics...');
  
  try {
    const response = await makeRequest('GET', '/analytics/dashboard?period=30d');
    
    if (response.data?.success) {
      const analytics = response.data.data.analytics;
      log('Dashboard analytics retrieved successfully', {
        total_students: analytics.users?.students || 0,
        total_ideas: analytics.ideas?.total || 0,
        pending_endorsements: analytics.ideas?.by_status?.find(s => s.status === 'submitted')?.count || 0,
        endorsed_ideas: analytics.ideas?.by_status?.find(s => s.status === 'endorsed')?.count || 0
      });
      return true;
    } else {
      log('Dashboard analytics failed: Invalid response');
      return false;
    }
  } catch (error) {
    log('Dashboard analytics failed', error.response?.data);
    return false;
  }
};

const testGetStudents = async () => {
  log('Testing get students...');
  
  try {
    const response = await makeRequest('GET', `/users/students?college_id=${collegeId}`);
    
    if (response.data?.success) {
      const students = response.data.data.students;
      log(`Students retrieved successfully: ${students.length} students`, {
        students: students.map(s => ({
          name: s.name,
          department: s.department,
          ideas_count: s.ideas_count
        }))
      });
      return true;
    } else {
      log('Get students failed: Invalid response');
      return false;
    }
  } catch (error) {
    log('Get students failed', error.response?.data);
    return false;
  }
};

const testGetIdeas = async () => {
  log('Testing get ideas...');
  
  try {
    const response = await makeRequest('GET', `/ideas?college_id=${collegeId}&status=submitted`);
    
    if (response.data?.success) {
      const ideas = response.data.data.ideas;
      log(`Ideas retrieved successfully: ${ideas.length} ideas`, {
        ideas: ideas.map(i => ({
          title: i.title,
          status: i.status,
          student: i.student?.name
        }))
      });
      return true;
    } else {
      log('Get ideas failed: Invalid response');
      return false;
    }
  } catch (error) {
    log('Get ideas failed', error.response?.data);
    return false;
  }
};

const testEndorseIdea = async () => {
  log('Testing idea endorsement...');
  
  try {
    // First get a submitted idea
    const ideasResponse = await makeRequest('GET', `/ideas?college_id=${collegeId}&status=submitted&limit=1`);
    
    if (!ideasResponse.data?.success || ideasResponse.data.data.ideas.length === 0) {
      log('No ideas available for endorsement');
      return false;
    }
    
    const idea = ideasResponse.data.data.ideas[0];
    
    // Endorse the idea
    const response = await makeRequest('PUT', `/ideas/${idea.id}/status`, {
      status: 'endorsed',
      feedback: 'Great idea! Approved for incubation.'
    });
    
    if (response.data?.success) {
      log('Idea endorsed successfully', {
        idea_id: idea.id,
        title: idea.title,
        new_status: 'endorsed'
      });
      return true;
    } else {
      log('Idea endorsement failed: Invalid response');
      return false;
    }
  } catch (error) {
    log('Idea endorsement failed', error.response?.data);
    return false;
  }
};

const testUpdateProfile = async () => {
  log('Testing profile update...');
  
  try {
    const updateData = {
      department: 'Computer Science',
      phone: '+91-9876543210',
      bio: 'Updated bio for testing'
    };
    
    const response = await makeRequest('PUT', '/users/2', updateData);
    
    if (response.data?.success) {
      log('Profile updated successfully', {
        updated_fields: Object.keys(updateData)
      });
      return true;
    } else {
      log('Profile update failed: Invalid response');
      return false;
    }
  } catch (error) {
    log('Profile update failed', error.response?.data);
    return false;
  }
};

const testGetCollegeDetails = async () => {
  log('Testing get college details...');
  
  try {
    const response = await makeRequest('GET', `/colleges/${collegeId}`);
    
    if (response.data?.success) {
      const college = response.data.data.college;
      log('College details retrieved successfully', {
        name: college.name,
        city: college.city,
        state: college.state,
        students_count: college.students_count
      });
      return true;
    } else {
      log('Get college details failed: Invalid response');
      return false;
    }
  } catch (error) {
    log('Get college details failed', error.response?.data);
    return false;
  }
};

const testStudentPerformance = async () => {
  log('Testing student performance analytics...');
  
  try {
    const response = await makeRequest('GET', `/users/students?college_id=${collegeId}&sort_by=ideas_count&sort_order=desc&limit=5`);
    
    if (response.data?.success) {
      const students = response.data.data.students;
      log('Student performance analytics retrieved successfully', {
        top_performers: students.map(s => ({
          name: s.name,
          ideas_count: s.ideas_count,
          endorsed_ideas: s.endorsed_ideas_count
        }))
      });
      return true;
    } else {
      log('Student performance analytics failed: Invalid response');
      return false;
    }
  } catch (error) {
    log('Student performance analytics failed', error.response?.data);
    return false;
  }
};

const testDepartmentAnalytics = async () => {
  log('Testing department analytics...');
  
  try {
    const response = await makeRequest('GET', '/analytics/departments');
    
    if (response.data?.success) {
      const departments = response.data.data.departments;
      log('Department analytics retrieved successfully', {
        departments: departments.map(d => ({
          department: d.department,
          students_count: d.students_count,
          ideas_count: d.ideas_count
        }))
      });
      return true;
    } else {
      log('Department analytics failed: Invalid response');
      return false;
    }
  } catch (error) {
    log('Department analytics failed', error.response?.data);
    return false;
  }
};

// Main test runner
const runCollegeAdminTests = async () => {
  log('=== STARTING COLLEGE ADMIN MODULE TESTS ===');
  
  const results = {
    login: false,
    profile: false,
    dashboard: false,
    students: false,
    ideas: false,
    endorsement: false,
    profile_update: false,
    college_details: false,
    performance: false,
    department_analytics: false
  };
  
  try {
    // Test 1: Login
    results.login = await testLogin(TEST_CREDENTIALS.college_admin);
    if (!results.login) {
      log('Login failed, stopping tests');
      return results;
    }
    
    // Test 2: Get Profile
    results.profile = await testGetProfile();
    
    // Test 3: Dashboard Analytics
    results.dashboard = await testGetDashboardStats();
    
    // Test 4: Get Students
    results.students = await testGetStudents();
    
    // Test 5: Get Ideas
    results.ideas = await testGetIdeas();
    
    // Test 6: Endorse Idea
    results.endorsement = await testEndorseIdea();
    
    // Test 7: Update Profile
    results.profile_update = await testUpdateProfile();
    
    // Test 8: Get College Details
    results.college_details = await testGetCollegeDetails();
    
    // Test 9: Student Performance
    results.performance = await testStudentPerformance();
    
    // Test 10: Department Analytics
    results.department_analytics = await testDepartmentAnalytics();
    
  } catch (error) {
    log('Test execution error:', error.message);
  }
  
  // Summary
  log('=== TEST RESULTS SUMMARY ===');
  const passed = Object.values(results).filter(Boolean).length;
  const total = Object.keys(results).length;
  
  Object.entries(results).forEach(([test, result]) => {
    log(`${test}: ${result ? '✅ PASS' : '❌ FAIL'}`);
  });
  
  log(`Overall: ${passed}/${total} tests passed`);
  
  return results;
};

// Run tests if this file is executed directly
if (require.main === module) {
  runCollegeAdminTests()
    .then(results => {
      process.exit(Object.values(results).every(Boolean) ? 0 : 1);
    })
    .catch(error => {
      log('Test execution failed:', error);
      process.exit(1);
    });
}

module.exports = {
  runCollegeAdminTests,
  testLogin,
  testGetProfile,
  testGetDashboardStats,
  testGetStudents,
  testGetIdeas,
  testEndorseIdea,
  testUpdateProfile,
  testGetCollegeDetails,
  testStudentPerformance,
  testDepartmentAnalytics
};
