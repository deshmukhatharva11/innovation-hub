const { Idea } = require('./models');

async function checkIdeaStatuses() {
  try {
    const ideas = await Idea.findAll({
      attributes: ['id', 'title', 'status'],
      limit: 10
    });
    
    console.log('Ideas with their statuses:');
    ideas.forEach(idea => {
      console.log(`ID: ${idea.id}, Title: ${idea.title}, Status: ${idea.status}`);
    });
    
    // Check unique statuses
    const uniqueStatuses = [...new Set(ideas.map(idea => idea.status))];
    console.log('\nUnique statuses found:', uniqueStatuses);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkIdeaStatuses();
