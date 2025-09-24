const { Idea } = require('./models');

async function checkAllIdeasStatus() {
  try {
    console.log('🔍 Checking all ideas and their statuses...');
    
    const ideas = await Idea.findAll({
      attributes: ['id', 'title', 'status', 'created_at'],
      order: [['created_at', 'DESC']]
    });
    
    console.log(`📊 Found ${ideas.length} ideas:`);
    console.log('='.repeat(50));
    
    ideas.forEach((idea, index) => {
      console.log(`${index + 1}. ID: ${idea.id}`);
      console.log(`   Title: ${idea.title}`);
      console.log(`   Status: "${idea.status}"`);
      console.log(`   Created: ${idea.created_at}`);
      console.log('-'.repeat(30));
    });
    
    // Count by status
    const statusCounts = {};
    ideas.forEach(idea => {
      const status = idea.status || 'unknown';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });
    
    console.log('\n📈 Status Counts:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`   "${status}": ${count}`);
    });
    
  } catch (error) {
    console.error('❌ Error checking ideas:', error);
  } finally {
    process.exit(0);
  }
}

checkAllIdeasStatus();
