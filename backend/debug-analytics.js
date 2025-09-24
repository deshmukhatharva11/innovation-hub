const jwt = require('jsonwebtoken');

// Test token parsing
const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjk1LCJyb2xlIjoiY29sbGVnZV9hZG1pbiIsImNvbGxlZ2VfaWQiOjM2LCJpYXQiOjE3MzQ5NzQ4NzQsImV4cCI6MTczNDk3ODQ3NH0.placeholder';

try {
  const decoded = jwt.decode(testToken);
  console.log('🔍 Decoded token:', decoded);
  
  if (decoded) {
    console.log('✅ Role:', decoded.role);
    console.log('✅ College ID:', decoded.college_id);
    console.log('✅ User ID:', decoded.userId);
  } else {
    console.log('❌ Failed to decode token');
  }
} catch (error) {
  console.error('❌ Token decode error:', error);
}

// Test analytics function call
const { User, Idea, College } = require('./models');

async function testCollegeAnalytics() {
  try {
    console.log('\n🧪 Testing college analytics function...');
    
    const collegeId = 36;
    
    // Test basic queries
    const totalUsers = await User.count({ where: { college_id: collegeId, is_active: true } });
    console.log('✅ Total users:', totalUsers);
    
    const totalIdeas = await Idea.count({ where: { college_id: collegeId } });
    console.log('✅ Total ideas:', totalIdeas);
    
    const ideasByStatus = await Idea.findAll({
      attributes: ['status', [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']],
      where: { college_id: collegeId },
      group: ['status'],
      raw: true
    });
    console.log('✅ Ideas by status:', ideasByStatus);
    
    const recentIdeas = await Idea.findAll({
      where: { college_id: collegeId },
      include: [{ model: User, as: 'student', attributes: ['id', 'name'] }],
      order: [['created_at', 'DESC']],
      limit: 5,
      attributes: ['id', 'title', 'status', 'created_at']
    });
    console.log('✅ Recent ideas:', recentIdeas.length);
    
    console.log('\n📊 College Analytics Summary:');
    console.log(`- College ID: ${collegeId}`);
    console.log(`- Total Users: ${totalUsers}`);
    console.log(`- Total Ideas: ${totalIdeas}`);
    console.log(`- Ideas by Status: ${JSON.stringify(ideasByStatus)}`);
    console.log(`- Recent Ideas: ${recentIdeas.length}`);
    
  } catch (error) {
    console.error('❌ College analytics test failed:', error);
  }
}

testCollegeAnalytics()
  .then(() => {
    console.log('\n🎉 Analytics debug completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Debug failed:', error);
    process.exit(1);
  });

