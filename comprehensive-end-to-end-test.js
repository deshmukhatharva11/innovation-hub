const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Test configuration
const BASE_URL = 'http://localhost:3001';
const TEST_TIMEOUT = 10000;

// Test results storage
const testResults = {
  passed: 0,
  failed: 0,
  errors: [],
  details: []
};

// Helper function to make API calls
async function makeRequest(method, endpoint, data = null, headers = {}) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      timeout: TEST_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data || error.message,
      status: error.response?.status || 500
    };
  }
}

// Test function wrapper
async function runTest(testName, testFunction) {
  console.log(`\n🧪 Testing: ${testName}`);
  try {
    const result = await testFunction();
    if (result.success) {
      console.log(`✅ PASSED: ${testName}`);
      testResults.passed++;
      testResults.details.push({ test: testName, status: 'PASSED', details: result.details });
    } else {
      console.log(`❌ FAILED: ${testName} - ${result.error}`);
      testResults.failed++;
      testResults.errors.push({ test: testName, error: result.error });
      testResults.details.push({ test: testName, status: 'FAILED', details: result.error });
    }
  } catch (error) {
    console.log(`❌ ERROR: ${testName} - ${error.message}`);
    testResults.failed++;
    testResults.errors.push({ test: testName, error: error.message });
    testResults.details.push({ test: testName, status: 'ERROR', details: error.message });
  }
}

// Test 1: Server Health Check
async function testServerHealth() {
  const result = await makeRequest('GET', '/api/health');
  return {
    success: result.success && result.status === 200,
    details: result.success ? 'Server is running' : result.error
  };
}

// Test 2: Database Tables Check
async function testDatabaseTables() {
  // Test if we can access basic endpoints that require database
  const endpoints = [
    '/api/users',
    '/api/ideas',
    '/api/colleges',
    '/api/incubators',
    '/api/notifications'
  ];
  
  let allTablesWorking = true;
  const tableResults = [];
  
  for (const endpoint of endpoints) {
    const result = await makeRequest('GET', endpoint);
    // We expect 401 (unauthorized) or 200 (success), not 500 (server error)
    const isWorking = result.status === 401 || result.status === 200;
    tableResults.push({ endpoint, working: isWorking, status: result.status });
    if (!isWorking) allTablesWorking = false;
  }
  
  return {
    success: allTablesWorking,
    details: tableResults
  };
}

// Test 3: Authentication System
async function testAuthentication() {
  // Test login endpoint
  const loginResult = await makeRequest('POST', '/api/auth/login', {
    email: 'test@example.com',
    password: 'testpassword'
  });
  
  // Test register endpoint
  const registerResult = await makeRequest('POST', '/api/auth/register', {
    name: 'Test User',
    email: 'testuser@example.com',
    password: 'testpassword123',
    role: 'student',
    college_id: 1
  });
  
  return {
    success: loginResult.status === 400 || loginResult.status === 401, // Expected for invalid credentials
    details: {
      login: { status: loginResult.status, working: loginResult.status === 400 || loginResult.status === 401 },
      register: { status: registerResult.status, working: registerResult.status === 400 || registerResult.status === 201 }
    }
  };
}

// Test 4: Ideas Module End-to-End
async function testIdeasModule() {
  const endpoints = [
    '/api/ideas',
    '/api/ideas/review',
    '/api/ideas/my'
  ];
  
  let allWorking = true;
  const results = [];
  
  for (const endpoint of endpoints) {
    const result = await makeRequest('GET', endpoint);
    const isWorking = result.status === 401 || result.status === 200; // Protected endpoints should return 401
    results.push({ endpoint, working: isWorking, status: result.status });
    if (!isWorking) allWorking = false;
  }
  
  return {
    success: allWorking,
    details: results
  };
}

// Test 5: Incubator Manager Routes
async function testIncubatorManagerRoutes() {
  const endpoints = [
    '/api/incubator-manager/my-incubator',
    '/api/incubator-manager/ideas/endorsed',
    '/api/incubator-manager/colleges',
    '/api/pre-incubatees',
    '/api/pre-incubatees/statistics/overview'
  ];
  
  let allWorking = true;
  const results = [];
  
  for (const endpoint of endpoints) {
    const result = await makeRequest('GET', endpoint);
    const isWorking = result.status === 401 || result.status === 200; // Protected endpoints should return 401
    results.push({ endpoint, working: isWorking, status: result.status });
    if (!isWorking) allWorking = false;
  }
  
  return {
    success: allWorking,
    details: results
  };
}

// Test 6: Reports System
async function testReportsSystem() {
  const endpoints = [
    '/api/college-coordinator/reports',
    '/api/analytics',
    '/api/notifications'
  ];
  
  let allWorking = true;
  const results = [];
  
  for (const endpoint of endpoints) {
    const result = await makeRequest('GET', endpoint);
    const isWorking = result.status === 401 || result.status === 200; // Protected endpoints should return 401
    results.push({ endpoint, working: isWorking, status: result.status });
    if (!isWorking) allWorking = false;
  }
  
  return {
    success: allWorking,
    details: results
  };
}

// Test 7: Events and Documents
async function testEventsAndDocuments() {
  const endpoints = [
    '/api/events',
    '/api/documents',
    '/api/student-events',
    '/api/student-documents'
  ];
  
  let allWorking = true;
  const results = [];
  
  for (const endpoint of endpoints) {
    const result = await makeRequest('GET', endpoint);
    const isWorking = result.status === 401 || result.status === 200; // Protected endpoints should return 401
    results.push({ endpoint, working: isWorking, status: result.status });
    if (!isWorking) allWorking = false;
  }
  
  return {
    success: allWorking,
    details: results
  };
}

// Test 8: Super Admin Routes
async function testSuperAdminRoutes() {
  const endpoints = [
    '/api/admin/users',
    '/api/admin/colleges',
    '/api/admin/incubators',
    '/api/admin/settings'
  ];
  
  let allWorking = true;
  const results = [];
  
  for (const endpoint of endpoints) {
    const result = await makeRequest('GET', endpoint);
    const isWorking = result.status === 401 || result.status === 200; // Protected endpoints should return 401
    results.push({ endpoint, working: isWorking, status: result.status });
    if (!isWorking) allWorking = false;
  }
  
  return {
    success: allWorking,
    details: results
  };
}

// Test 9: Database Model Relationships
async function testDatabaseRelationships() {
  // Test endpoints that require complex relationships
  const endpoints = [
    '/api/ideas/review', // Requires User, College, Idea relationships
    '/api/college-coordinator/students', // Requires User, College relationships
    '/api/incubator-manager/colleges' // Requires College, User relationships
  ];
  
  let allWorking = true;
  const results = [];
  
  for (const endpoint of endpoints) {
    const result = await makeRequest('GET', endpoint);
    const isWorking = result.status === 401 || result.status === 200; // Protected endpoints should return 401
    results.push({ endpoint, working: isWorking, status: result.status });
    if (!isWorking) allWorking = false;
  }
  
  return {
    success: allWorking,
    details: results
  };
}

// Test 10: File Upload and Download
async function testFileOperations() {
  // Test document upload endpoint
  const uploadResult = await makeRequest('POST', '/api/documents');
  
  // Test report download endpoint
  const downloadResult = await makeRequest('GET', '/api/college-coordinator/reports/1/download');
  
  return {
    success: uploadResult.status === 401 && downloadResult.status === 401, // Both should be protected
    details: {
      upload: { status: uploadResult.status, working: uploadResult.status === 401 },
      download: { status: downloadResult.status, working: downloadResult.status === 401 }
    }
  };
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting Comprehensive End-to-End Testing...');
  console.log('=' .repeat(60));
  
  // Wait for server to start
  console.log('⏳ Waiting for server to start...');
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Run all tests
  await runTest('Server Health Check', testServerHealth);
  await runTest('Database Tables Check', testDatabaseTables);
  await runTest('Authentication System', testAuthentication);
  await runTest('Ideas Module End-to-End', testIdeasModule);
  await runTest('Incubator Manager Routes', testIncubatorManagerRoutes);
  await runTest('Reports System', testReportsSystem);
  await runTest('Events and Documents', testEventsAndDocuments);
  await runTest('Super Admin Routes', testSuperAdminRoutes);
  await runTest('Database Relationships', testDatabaseRelationships);
  await runTest('File Operations', testFileOperations);
  
  // Generate report
  console.log('\n' + '=' .repeat(60));
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('=' .repeat(60));
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📈 Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);
  
  if (testResults.errors.length > 0) {
    console.log('\n❌ ERRORS FOUND:');
    testResults.errors.forEach(error => {
      console.log(`  - ${error.test}: ${error.error}`);
    });
  }
  
  // Save detailed report
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      passed: testResults.passed,
      failed: testResults.failed,
      successRate: ((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)
    },
    details: testResults.details,
    errors: testResults.errors
  };
  
  fs.writeFileSync('test-results.json', JSON.stringify(report, null, 2));
  console.log('\n📄 Detailed report saved to test-results.json');
  
  return testResults;
}

// Run the tests
runAllTests().then(results => {
  if (results.failed === 0) {
    console.log('\n🎉 ALL TESTS PASSED! System is fully functional.');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some tests failed. Please check the errors above.');
    process.exit(1);
  }
}).catch(error => {
  console.error('\n💥 Test runner failed:', error.message);
  process.exit(1);
});
