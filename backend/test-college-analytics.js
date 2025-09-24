const { User, Idea, College } = require('./models');

async function testCollegeAnalytics() {
  try {
    console.log('🧪 Testing college analytics function directly...\n');

    const collegeId = 36;
    
    // Test the exact same queries as in getCollegeAdminAnalytics
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
      attributes: ['id', 'title', 'status', 'created_at', 'views_count', 'likes_count']
    });
    console.log('✅ Recent ideas:', recentIdeas.length);
    
    // Calculate additional metrics
    const totalViews = recentIdeas.reduce((sum, idea) => sum + (idea.views_count || 0), 0);
    const totalLikes = recentIdeas.reduce((sum, idea) => sum + (idea.likes_count || 0), 0);
    
    const result = {
      users: { 
        total: totalUsers,
        students: totalUsers,
        active: totalUsers
      },
      ideas: { 
        total: totalIdeas,
        total_views: totalViews,
        total_likes: totalLikes,
        by_status: ideasByStatus.map(item => ({
          status: item.status,
          count: parseInt(item.count) || 0
        }))
      },
      growth: {
        ideas_monthly: Math.round(totalIdeas * 0.1)
      },
      recent_ideas: recentIdeas.map(idea => ({
        id: idea.id,
        title: idea.title,
        status: idea.status,
        student_name: idea.student?.name || 'Unknown',
        created_at: idea.created_at
      }))
    };
    
    console.log('\n📊 College Analytics Result:');
    console.log(JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('❌ College analytics test failed:', error);
  }
}

testCollegeAnalytics()
  .then(() => {
    console.log('\n🎉 College analytics test completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Test failed:', error);
    process.exit(1);
  });

