const { sequelize } = require('../config/database');
const { QueryTypes } = require('sequelize');

const addMissingFields = async () => {
  try {
    console.log('🔄 Adding missing fields to Ideas table...');
    
    // Check if fields exist first
    const tableInfo = await sequelize.query("PRAGMA table_info(ideas)", { type: QueryTypes.SELECT });
    const existingColumns = tableInfo.map(col => col.name);
    
    console.log('📋 Existing columns:', existingColumns);
    
    // Add missing fields if they don't exist
    const fieldsToAdd = [
      { name: 'tech_stack', type: 'TEXT', defaultValue: '[]' },
      { name: 'team_members', type: 'TEXT', defaultValue: '[]' },
      { name: 'implementation_plan', type: 'TEXT', defaultValue: '' }
    ];
    
    for (const field of fieldsToAdd) {
      if (!existingColumns.includes(field.name)) {
        console.log(`➕ Adding field: ${field.name}`);
        await sequelize.query(`ALTER TABLE ideas ADD COLUMN ${field.name} ${field.type} DEFAULT '${field.defaultValue}'`);
      } else {
        console.log(`✅ Field already exists: ${field.name}`);
      }
    }
    
    // Update status enum to include new_submission
    console.log('🔄 Updating status enum...');
    try {
      await sequelize.query(`
        CREATE TABLE ideas_new (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title VARCHAR(200) NOT NULL,
          description TEXT NOT NULL,
          category VARCHAR(100) NOT NULL,
          status VARCHAR(20) NOT NULL DEFAULT 'draft',
          student_id INTEGER NOT NULL,
          college_id INTEGER NOT NULL,
          incubator_id INTEGER,
          team_size INTEGER,
          funding_required DECIMAL(15,2),
          timeline VARCHAR(100),
          likes_count INTEGER NOT NULL DEFAULT 0,
          views_count INTEGER NOT NULL DEFAULT 0,
          problem_statement TEXT,
          solution_approach TEXT,
          market_potential TEXT,
          tech_stack TEXT DEFAULT '[]',
          team_members TEXT DEFAULT '[]',
          implementation_plan TEXT DEFAULT '',
          technical_feasibility TEXT,
          business_model TEXT,
          competitive_analysis TEXT,
          risk_assessment TEXT,
          success_metrics TEXT DEFAULT '[]',
          tags TEXT DEFAULT '[]',
          submission_date DATETIME,
          review_date DATETIME,
          endorsement_date DATETIME,
          incubation_start_date DATETIME,
          rejection_reason TEXT,
          reviewer_notes TEXT,
          is_featured BOOLEAN DEFAULT 0,
          is_public BOOLEAN DEFAULT 1,
          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (student_id) REFERENCES users (id),
          FOREIGN KEY (college_id) REFERENCES colleges (id),
          FOREIGN KEY (incubator_id) REFERENCES incubators (id)
        )
      `);
      
      await sequelize.query(`
        INSERT INTO ideas_new SELECT * FROM ideas
      `);
      
      await sequelize.query(`DROP TABLE ideas`);
      await sequelize.query(`ALTER TABLE ideas_new RENAME TO ideas`);
      
      console.log('✅ Status enum updated successfully');
    } catch (error) {
      console.log('⚠️ Status enum update failed (might already be updated):', error.message);
    }
    
    console.log('✅ Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await sequelize.close();
  }
};

addMissingFields();
