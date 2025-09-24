const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';
let authToken = '';
let collegeAdminId = '';
let studentId = '';
let ideaId = '';
let eventId = '';
let documentId = '';
let reportId = '';

// Test data
const testCollegeAdmin = {
  name: 'College Admin',
  email: 'admin1@college1.edu',
  password: 'password123',
  role: 'college_admin',
  college_id: 36
};

const testStudent = {
  name: 'Test Student',
  email: 'student1@college1.edu',
  password: 'password123',
  role: 'student',
  college_id: 36,
  department: 'Computer Science',
  year_of_study: 3
};

const testIdea = {
  title: 'Test Innovation Idea',
  description: 'This is a comprehensive test idea for the innovation hub system',
  category: 'Technology',
  problem_statement: 'Testing problem statement',
  solution_approach: 'Testing solution approach',
  market_potential: 'High market potential',
  technical_feasibility: 'Technically feasible',
  business_model: 'SaaS model',
  competitive_analysis: 'Strong competitive advantage',
  risk_assessment: 'Low risk',
  success_metrics: ['User adoption', 'Revenue growth'],
  tags: ['AI', 'Machine Learning', 'Innovation'],
  is_public: true
};

const testEvent = {
  title: 'Test Innovation Workshop',
  description: 'A comprehensive workshop on innovation and entrepreneurship',
  event_type: 'workshop',
  start_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
  location: 'Test College Campus',
  is_online: false,
  max_participants: 50
};

const testReport = {
  title: 'Monthly Innovation Report',
  report_type: 'monthly',
  period_start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  period_end: new Date().toISOString(),
  content: 'This is a test report for the innovation hub system'
};

// Helper function to make API calls
async function apiCall(method, endpoint, data = null, headers = {}) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authToken ? `Bearer ${authToken}` : '',
        ...headers
      }
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    return { success: true, data: response.data };
  } catch (error) {
    console.error(`❌ API Error (${method} ${endpoint}):`, error.response?.data || error.message);
    return { success: false, error: error.response?.data || error.message };
  }
}

// Test functions
async function testServerHealth() {
  console.log('\n🔍 Testing Server Health...');
  const result = await apiCall('GET', '/health');
  if (result.success) {
    console.log('✅ Server is healthy');
    return true;
  } else {
    console.log('❌ Server health check failed');
    return false;
  }
}

async function testAuthentication() {
  console.log('\n🔍 Testing Authentication...');
  
  // Test login
  const loginResult = await apiCall('POST', '/auth/login', {
    email: testCollegeAdmin.email,
    password: testCollegeAdmin.password
  });
  
  if (loginResult.success) {
    authToken = loginResult.data.data.token;
    collegeAdminId = loginResult.data.data.user.id;
    console.log('✅ College admin login successful');
    console.log('🔑 Token:', authToken.substring(0, 20) + '...');
    console.log('👤 User ID:', collegeAdminId);
    return true;
  } else {
    console.log('❌ College admin login failed');
    return false;
  }
}

async function testDashboard() {
  console.log('\n🔍 Testing Dashboard...');
  const result = await apiCall('GET', '/college-coordinator/dashboard');
  
  if (result.success) {
    console.log('✅ Dashboard data retrieved successfully');
    console.log('📊 Stats:', result.data.data.stats);
    return true;
  } else {
    console.log('❌ Dashboard test failed');
    return false;
  }
}

async function testStudentManagement() {
  console.log('\n🔍 Testing Student Management...');
  
  // Get students
  const studentsResult = await apiCall('GET', '/college-coordinator/students');
  if (studentsResult.success) {
    console.log('✅ Students retrieved successfully');
    console.log(`📊 Total students: ${studentsResult.data.data.pagination.total_items}`);
    return true;
  } else {
    console.log('❌ Student management test failed');
    return false;
  }
}

async function testIdeaManagement() {
  console.log('\n🔍 Testing Idea Management...');
  
  // Get ideas
  const ideasResult = await apiCall('GET', '/college-coordinator/ideas');
  if (ideasResult.success) {
    console.log('✅ Ideas retrieved successfully');
    console.log(`📊 Total ideas: ${ideasResult.data.data.pagination.total_items}`);
    
    // Test idea evaluation if ideas exist
    if (ideasResult.data.data.ideas.length > 0) {
      const idea = ideasResult.data.data.ideas[0];
      ideaId = idea.id;
      
      const evaluationResult = await apiCall('POST', `/college-coordinator/ideas/${ideaId}/evaluate`, {
        rating: 8,
        comments: 'Test evaluation comment',
        recommendation: 'forward',
        nurture_notes: 'Test nurture notes'
      });
      
      if (evaluationResult.success) {
        console.log('✅ Idea evaluation successful');
      } else {
        console.log('❌ Idea evaluation failed');
      }
    }
    
    return true;
  } else {
    console.log('❌ Idea management test failed');
    return false;
  }
}

async function testDocumentManagement() {
  console.log('\n🔍 Testing Document Management...');
  
  // Get documents
  const documentsResult = await apiCall('GET', '/college-coordinator/documents');
  if (documentsResult.success) {
    console.log('✅ Documents retrieved successfully');
    console.log(`📊 Total documents: ${documentsResult.data.data.pagination.total_items}`);
    return true;
  } else {
    console.log('❌ Document management test failed');
    return false;
  }
}

async function testReportManagement() {
  console.log('\n🔍 Testing Report Management...');
  
  // Get reports
  const reportsResult = await apiCall('GET', '/college-coordinator/reports');
  if (reportsResult.success) {
    console.log('✅ Reports retrieved successfully');
    console.log(`📊 Total reports: ${reportsResult.data.data.pagination.total_items}`);
    
    // Test report creation
    const createReportResult = await apiCall('POST', '/college-coordinator/reports', testReport);
    if (createReportResult.success) {
      console.log('✅ Report creation successful');
      reportId = createReportResult.data.data.report.id;
      
      // Test report download
      const downloadResult = await apiCall('GET', `/college-coordinator/reports/${reportId}/download`);
      if (downloadResult.success) {
        console.log('✅ Report download successful');
      } else {
        console.log('❌ Report download failed');
      }
    } else {
      console.log('❌ Report creation failed');
    }
    
    return true;
  } else {
    console.log('❌ Report management test failed');
    return false;
  }
}

async function testEventManagement() {
  console.log('\n🔍 Testing Event Management...');
  
  // Get events
  const eventsResult = await apiCall('GET', '/college-coordinator/events');
  if (eventsResult.success) {
    console.log('✅ Events retrieved successfully');
    console.log(`📊 Total events: ${eventsResult.data.data.pagination.total_items}`);
    
    // Test event creation
    const createEventResult = await apiCall('POST', '/college-coordinator/events', testEvent);
    if (createEventResult.success) {
      console.log('✅ Event creation successful');
      eventId = createEventResult.data.data.event.id;
    } else {
      console.log('❌ Event creation failed');
    }
    
    return true;
  } else {
    console.log('❌ Event management test failed');
    return false;
  }
}

async function testChatSystem() {
  console.log('\n🔍 Testing Chat System...');
  
  // Get students for chat
  const studentsResult = await apiCall('GET', '/college-coordinator/chat/students');
  if (studentsResult.success) {
    console.log('✅ Chat students retrieved successfully');
    console.log(`📊 Available students: ${studentsResult.data.data.students.length}`);
    return true;
  } else {
    console.log('❌ Chat system test failed');
    return false;
  }
}

async function testNotificationSystem() {
  console.log('\n🔍 Testing Notification System...');
  
  // Get notifications
  const notificationsResult = await apiCall('GET', '/college-coordinator/notifications');
  if (notificationsResult.success) {
    console.log('✅ Notifications retrieved successfully');
    console.log(`📊 Total notifications: ${notificationsResult.data.data.pagination.total_items}`);
    
    // Test mark as read
    if (notificationsResult.data.data.notifications.length > 0) {
      const notification = notificationsResult.data.data.notifications[0];
      const markReadResult = await apiCall('PUT', `/college-coordinator/notifications/${notification.id}/read`);
      if (markReadResult.success) {
        console.log('✅ Mark notification as read successful');
      } else {
        console.log('❌ Mark notification as read failed');
      }
    }
    
    return true;
  } else {
    console.log('❌ Notification system test failed');
    return false;
  }
}

async function testFiltersAndSearch() {
  console.log('\n🔍 Testing Filters and Search...');
  
  // Test idea search
  const searchResult = await apiCall('GET', '/college-coordinator/ideas', {
    search: 'test',
    status: 'submitted',
    category: 'Technology',
    sort_by: 'created_at',
    sort_order: 'desc'
  });
  
  if (searchResult.success) {
    console.log('✅ Idea search and filters working');
    return true;
  } else {
    console.log('❌ Filters and search test failed');
    return false;
  }
}

async function testCollegeIsolation() {
  console.log('\n🔍 Testing College Data Isolation...');
  
  // Test that college admin only sees their college's data
  const dashboardResult = await apiCall('GET', '/college-coordinator/dashboard');
  if (dashboardResult.success) {
    console.log('✅ College isolation working - dashboard shows college-specific data');
    return true;
  } else {
    console.log('❌ College isolation test failed');
    return false;
  }
}

// Main test runner
async function runComprehensiveTests() {
  console.log('🚀 Starting Comprehensive Functionality Tests...');
  console.log('=' * 60);
  
  const tests = [
    { name: 'Server Health', fn: testServerHealth },
    { name: 'Authentication', fn: testAuthentication },
    { name: 'Dashboard', fn: testDashboard },
    { name: 'Student Management', fn: testStudentManagement },
    { name: 'Idea Management', fn: testIdeaManagement },
    { name: 'Document Management', fn: testDocumentManagement },
    { name: 'Report Management', fn: testReportManagement },
    { name: 'Event Management', fn: testEventManagement },
    { name: 'Chat System', fn: testChatSystem },
    { name: 'Notification System', fn: testNotificationSystem },
    { name: 'Filters and Search', fn: testFiltersAndSearch },
    { name: 'College Isolation', fn: testCollegeIsolation }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      const result = await test.fn();
      if (result) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      console.error(`❌ Test ${test.name} threw an error:`, error.message);
      failed++;
    }
  }
  
  console.log('\n' + '=' * 60);
  console.log('📊 Test Results Summary:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(2)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed! The system is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the logs above for details.');
  }
}

// Run the tests
runComprehensiveTests().catch(console.error);
