const { sequelize } = require('./config/database');
const { QueryTypes } = require('sequelize');

const checkLatestIdea = async () => {
  try {
    console.log('🔍 Checking latest idea in database...');
    
    const idea = await sequelize.query("SELECT * FROM ideas WHERE id = (SELECT MAX(id) FROM ideas)", { type: QueryTypes.SELECT });
    
    if (idea.length > 0) {
      const latestIdea = idea[0];
      console.log('📋 Latest idea details:');
      console.log('ID:', latestIdea.id);
      console.log('Title:', latestIdea.title);
      console.log('Team Members (raw):', latestIdea.team_members);
      console.log('Tech Stack (raw):', latestIdea.tech_stack);
      console.log('Implementation Plan (raw):', latestIdea.implementation_plan);
      
      // Try to parse the JSON fields
      try {
        const teamMembers = JSON.parse(latestIdea.team_members || '[]');
        const techStack = JSON.parse(latestIdea.tech_stack || '[]');
        console.log('Team Members (parsed):', teamMembers);
        console.log('Tech Stack (parsed):', techStack);
      } catch (e) {
        console.log('Failed to parse JSON fields:', e.message);
      }
    } else {
      console.log('No ideas found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sequelize.close();
  }
};

checkLatestIdea();
