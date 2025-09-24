const { Sequelize } = require('sequelize');
const path = require('path');

// Create Sequelize instance
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, 'backend/database.sqlite'),
  logging: false
});

async function testDatabaseDirect() {
  console.log('🔍 Testing Database Directly...\n');

  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established');

    // Check ideas table directly
    console.log('1️⃣ Checking Ideas Table Directly...');
    const ideas = await sequelize.query('SELECT id, title, student_id, college_id, created_at, updated_at FROM ideas LIMIT 3', { type: Sequelize.QueryTypes.SELECT });
    
    console.log(`   Total ideas found: ${ideas.length}`);
    ideas.forEach((idea, index) => {
      console.log(`   Idea ${index + 1}:`);
      console.log(`     ID: ${idea.id}`);
      console.log(`     Title: ${idea.title}`);
      console.log(`     Student ID: ${idea.student_id}`);
      console.log(`     College ID: ${idea.college_id}`);
      console.log(`     Created At: ${idea.created_at}`);
      console.log(`     Updated At: ${idea.updated_at}`);
      console.log('');
    });

    // Check users table for college_id
    console.log('2️⃣ Checking Users Table for College IDs...');
    const users = await sequelize.query('SELECT id, name, role, college_id FROM users WHERE role = "student" LIMIT 3', { type: Sequelize.QueryTypes.SELECT });
    
    console.log(`   Students found: ${users.length}`);
    users.forEach((user, index) => {
      console.log(`   Student ${index + 1}:`);
      console.log(`     ID: ${user.id}`);
      console.log(`     Name: ${user.name}`);
      console.log(`     Role: ${user.role}`);
      console.log(`     College ID: ${user.college_id}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Database test failed:', error.message);
  } finally {
    await sequelize.close();
  }
}

testDatabaseDirect();
