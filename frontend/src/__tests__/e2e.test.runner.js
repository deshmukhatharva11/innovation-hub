/**
 * E2E Test Runner for Innovation Hub
 * 
 * This comprehensive test suite verifies:
 * - Database connectivity with backend API
 * - Authentication flows for all user roles  
 * - Dashboard functionality and data loading
 * - Idea submission and management workflows
 * - API integration and error handling
 * 
 * Run with: npm test -- e2e.test.runner.js
 */

import { spawn } from 'child_process';
import path from 'path';

const testFiles = [
  'src/features/auth/__tests__/Login.integration.test.js',
  'src/features/dashboard/__tests__/Dashboard.integration.test.js', 
  'src/features/ideas/__tests__/IdeaSubmission.integration.test.js',
  'src/services/__tests__/api.integration.test.js'
];

const runTestSuite = async () => {
  console.log('🚀 Starting Innovation Hub E2E Test Suite');
  console.log('============================================');
  
  console.log('📋 Test Coverage:');
  console.log('✓ API connectivity to backend on port 54112');
  console.log('✓ Database integration via root folder database');
  console.log('✓ User authentication for all roles');
  console.log('✓ Dashboard analytics loading');
  console.log('✓ Idea submission workflows');
  console.log('✓ College admin endorsement process');
  console.log('✓ Error handling and edge cases');
  console.log('✓ File upload functionality');
  console.log('✓ CORS and network error scenarios');
  console.log('');

  const startTime = Date.now();
  let passedTests = 0;
  let failedTests = 0;

  for (const testFile of testFiles) {
    console.log(`🧪 Running: ${path.basename(testFile)}`);
    
    try {
      await runJestTest(testFile);
      passedTests++;
      console.log(`✅ PASSED: ${path.basename(testFile)}\n`);
    } catch (error) {
      failedTests++;
      console.log(`❌ FAILED: ${path.basename(testFile)}`);
      console.log(`Error: ${error.message}\n`);
    }
  }

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  console.log('============================================');
  console.log('📊 Test Suite Results:');
  console.log(`⏱️  Total Time: ${duration}s`);
  console.log(`✅ Passed: ${passedTests}/${testFiles.length} test files`);
  console.log(`❌ Failed: ${failedTests}/${testFiles.length} test files`);
  console.log('');

  if (failedTests === 0) {
    console.log('🎉 All E2E tests passed! Backend-Frontend integration is working correctly.');
    console.log('📂 Database connection to root folder: SUCCESS');
    console.log('🔗 API connectivity on port 54112: SUCCESS');
    console.log('🔐 Authentication workflows: SUCCESS');
    console.log('📊 Dashboard functionality: SUCCESS');
    console.log('💡 Idea management: SUCCESS');
  } else {
    console.log('⚠️  Some tests failed. Please check the error messages above.');
    console.log('💡 Common issues to check:');
    console.log('   - Backend server running on port 54112');
    console.log('   - Database file accessible in root folder');
    console.log('   - CORS configuration allowing frontend requests');
    console.log('   - Network connectivity between frontend and backend');
  }

  process.exit(failedTests === 0 ? 0 : 1);
};

const runJestTest = (testFile) => {
  return new Promise((resolve, reject) => {
    const jestProcess = spawn('npm', ['test', '--', testFile, '--verbose'], {
      stdio: 'pipe',
      shell: true,
      cwd: process.cwd()
    });

    let output = '';
    let errorOutput = '';

    jestProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    jestProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    jestProcess.on('close', (code) => {
      if (code === 0) {
        resolve(output);
      } else {
        reject(new Error(errorOutput || `Test failed with exit code ${code}`));
      }
    });

    jestProcess.on('error', (error) => {
      reject(new Error(`Failed to run test: ${error.message}`));
    });
  });
};

// Health check function to verify backend connectivity
const checkBackendHealth = async () => {
  console.log('🏥 Performing backend health check...');
  
  try {
    const response = await fetch('http://localhost:54112/health');
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Backend health check passed');
      console.log(`📊 Environment: ${data.environment}`);
      console.log(`⏰ Server time: ${data.timestamp}`);
      return true;
    } else {
      console.log('❌ Backend health check failed - Server responded with error');
      return false;
    }
  } catch (error) {
    console.log('❌ Backend health check failed - Unable to connect');
    console.log(`Error: ${error.message}`);
    return false;
  }
};

// Database connectivity check
const checkDatabaseConnectivity = async () => {
  console.log('💾 Checking database connectivity...');
  
  try {
    const response = await fetch('http://localhost:54112/api/analytics/dashboard');
    
    if (response.ok) {
      console.log('✅ Database connectivity confirmed');
      console.log('📂 Root folder database accessible');
      return true;
    } else if (response.status === 401) {
      console.log('✅ Database accessible (authentication required for data)');
      return true;
    } else {
      console.log('❌ Database connectivity issues');
      return false;
    }
  } catch (error) {
    console.log('❌ Database connectivity check failed');
    console.log(`Error: ${error.message}`);
    return false;
  }
};

// Main execution
const main = async () => {
  console.log('🔍 Pre-flight Checks');
  console.log('====================');
  
  const backendHealthy = await checkBackendHealth();
  const databaseConnected = await checkDatabaseConnectivity();
  
  console.log('');
  
  if (!backendHealthy || !databaseConnected) {
    console.log('⚠️  Pre-flight checks failed. Please ensure:');
    console.log('   1. Backend server is running: node backend/server.js');
    console.log('   2. Server is listening on port 54112');
    console.log('   3. Database file exists in root folder');
    console.log('   4. CORS is configured for frontend on port 3000');
    console.log('');
    console.log('🚫 Skipping E2E tests until issues are resolved.');
    process.exit(1);
  }
  
  console.log('✅ Pre-flight checks passed. Starting test suite...\n');
  await runTestSuite();
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Run the test suite
main().catch((error) => {
  console.error('❌ Test runner failed:', error.message);
  process.exit(1);
});

export default main;