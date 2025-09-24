const { sequelize } = require('./config/database');
const { QueryInterface } = require('sequelize');

async function fixDatabaseSchema() {
  try {
    console.log('🔧 Fixing database schema...');
    
    // Add missing columns to ideas table
    await sequelize.query(`
      ALTER TABLE ideas ADD COLUMN comments_count INTEGER DEFAULT 0;
    `).catch(() => console.log('comments_count column already exists'));
    
    // Add missing columns to pre_incubatees table
    await sequelize.query(`
      ALTER TABLE pre_incubatees ADD COLUMN mentor_assigned_date DATETIME;
    `).catch(() => console.log('mentor_assigned_date column already exists'));
    
    await sequelize.query(`
      ALTER TABLE pre_incubatees ADD COLUMN incubator_decision VARCHAR(50);
    `).catch(() => console.log('incubator_decision column already exists'));
    
    await sequelize.query(`
      ALTER TABLE pre_incubatees ADD COLUMN incubator_decision_date DATETIME;
    `).catch(() => console.log('incubator_decision_date column already exists'));
    
    await sequelize.query(`
      ALTER TABLE pre_incubatees ADD COLUMN incubator_notes TEXT;
    `).catch(() => console.log('incubator_notes column already exists'));
    
    // Update comments_count for existing ideas
    await sequelize.query(`
      UPDATE ideas SET comments_count = (
        SELECT COUNT(*) FROM comments WHERE idea_id = ideas.id
      );
    `);
    
    console.log('✅ Database schema fixed successfully');
  } catch (error) {
    console.error('❌ Error fixing database schema:', error);
  }
}

fixDatabaseSchema().then(() => process.exit(0));
