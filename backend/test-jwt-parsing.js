const jwt = require('jsonwebtoken');

// Test JWT token parsing
const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjk1LCJyb2xlIjoiY29sbGVnZV9hZG1pbiIsImNvbGxlZ2VfaWQiOjM2LCJpYXQiOjE3MzQ5NzQ4NzQsImV4cCI6MTczNDk3ODQ3NH0.placeholder';

try {
  const decoded = jwt.decode(testToken);
  console.log('🔍 Decoded token:', decoded);
  
  if (decoded) {
    console.log('✅ Role:', decoded.role);
    console.log('✅ College ID:', decoded.college_id);
    console.log('✅ User ID:', decoded.userId);
    
    // Test the analytics logic
    const { role, college_id, incubator_id, userId } = decoded;
    
    console.log('\n🧪 Testing analytics logic:');
    console.log('Role:', role);
    console.log('College ID:', college_id);
    console.log('Incubator ID:', incubator_id);
    console.log('User ID:', userId);
    
    if (role === 'admin') {
      console.log('📊 Would call getAdminAnalytics');
    } else if (role === 'college_admin') {
      console.log('📊 Would call getCollegeAdminAnalytics with collegeId:', college_id);
    } else if (role === 'incubator_manager') {
      console.log('📊 Would call getIncubatorManagerAnalytics with incubatorId:', incubator_id);
    } else {
      console.log('📊 Would call getStudentAnalytics with userId:', userId);
    }
  } else {
    console.log('❌ Failed to decode token');
  }
} catch (error) {
  console.error('❌ Token decode error:', error);
}

