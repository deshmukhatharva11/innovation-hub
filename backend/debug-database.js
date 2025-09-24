const { sequelize } = require('./config/database');
const { QueryTypes } = require('sequelize');

const debugDatabase = async () => {
  try {
    console.log('🔍 Checking database for ideas...');
    
    // Check if ideas table exists and has data
    const ideas = await sequelize.query("SELECT * FROM ideas ORDER BY created_at DESC LIMIT 5", { type: QueryTypes.SELECT });
    console.log('📋 Recent ideas:', ideas.length);
    
    ideas.forEach((idea, index) => {
      console.log(`\n--- Idea ${index + 1} ---`);
      console.log('ID:', idea.id);
      console.log('Title:', idea.title);
      console.log('Team Members:', idea.team_members);
      console.log('Tech Stack:', idea.tech_stack);
      console.log('Implementation Plan:', idea.implementation_plan);
      console.log('Status:', idea.status);
      console.log('Student ID:', idea.student_id);
    });
    
    // Check table structure
    const tableInfo = await sequelize.query("PRAGMA table_info(ideas)", { type: QueryTypes.SELECT });
    console.log('\n📋 Table structure:');
    tableInfo.forEach(col => {
      if (col.name.includes('team') || col.name.includes('tech') || col.name.includes('implementation')) {
        console.log(`${col.name}: ${col.type} (default: ${col.dflt_value})`);
      }
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sequelize.close();
  }
};

debugDatabase();
