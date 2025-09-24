const { sequelize } = require('../config/database');

async function addWorkflowFields() {
  try {
    console.log('🔄 Adding workflow fields to ideas table...');
    
    // Add new workflow fields to ideas table
    await sequelize.query(`
      ALTER TABLE ideas ADD COLUMN assigned_mentor_id INTEGER REFERENCES users(id);
    `);
    console.log('✅ Added assigned_mentor_id field');

    await sequelize.query(`
      ALTER TABLE ideas ADD COLUMN development_feedback TEXT;
    `);
    console.log('✅ Added development_feedback field');

    await sequelize.query(`
      ALTER TABLE ideas ADD COLUMN development_requirements JSON DEFAULT '[]';
    `);
    console.log('✅ Added development_requirements field');

    await sequelize.query(`
      ALTER TABLE ideas ADD COLUMN review_timeline_start DATETIME;
    `);
    console.log('✅ Added review_timeline_start field');

    await sequelize.query(`
      ALTER TABLE ideas ADD COLUMN review_timeline_end DATETIME;
    `);
    console.log('✅ Added review_timeline_end field');

    await sequelize.query(`
      ALTER TABLE ideas ADD COLUMN workflow_stage VARCHAR(50) DEFAULT 'submission';
    `);
    console.log('✅ Added workflow_stage field');

    await sequelize.query(`
      ALTER TABLE ideas ADD COLUMN previous_status VARCHAR(50);
    `);
    console.log('✅ Added previous_status field');

    await sequelize.query(`
      ALTER TABLE ideas ADD COLUMN status_change_reason TEXT;
    `);
    console.log('✅ Added status_change_reason field');

    await sequelize.query(`
      ALTER TABLE ideas ADD COLUMN admin_notes TEXT;
    `);
    console.log('✅ Added admin_notes field');

    await sequelize.query(`
      ALTER TABLE ideas ADD COLUMN mentor_notes TEXT;
    `);
    console.log('✅ Added mentor_notes field');

    // Update existing ideas to have proper workflow_stage based on their current status
    await sequelize.query(`
      UPDATE ideas SET workflow_stage = 'submission' WHERE status IN ('draft', 'submitted', 'new_submission');
    `);
    console.log('✅ Updated workflow_stage for submission ideas');

    await sequelize.query(`
      UPDATE ideas SET workflow_stage = 'review' WHERE status IN ('under_review', 'nurture');
    `);
    console.log('✅ Updated workflow_stage for review ideas');

    await sequelize.query(`
      UPDATE ideas SET workflow_stage = 'development' WHERE status = 'needs_development';
    `);
    console.log('✅ Updated workflow_stage for development ideas');

    await sequelize.query(`
      UPDATE ideas SET workflow_stage = 'endorsement' WHERE status = 'endorsed';
    `);
    console.log('✅ Updated workflow_stage for endorsed ideas');

    await sequelize.query(`
      UPDATE ideas SET workflow_stage = 'incubation' WHERE status IN ('forwarded', 'incubated');
    `);
    console.log('✅ Updated workflow_stage for incubation ideas');

    console.log('🎉 All workflow fields added successfully!');
    
  } catch (error) {
    console.error('❌ Error adding workflow fields:', error);
    throw error;
  }
}

// Run the migration
addWorkflowFields()
  .then(() => {
    console.log('✅ Migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  });
