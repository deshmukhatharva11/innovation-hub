const { sequelize } = require('./config/database');

async function addMentorPasswordColumn() {
  try {
    console.log('🔧 Adding password_hash column to Mentors table...\n');

    // Add password_hash column to Mentors table
    await sequelize.query(`
      ALTER TABLE Mentors 
      ADD COLUMN password_hash VARCHAR(255) NOT NULL DEFAULT ''
    `);

    console.log('✅ Successfully added password_hash column to Mentors table');

    // Verify the column was added
    const [results] = await sequelize.query(`
      PRAGMA table_info(Mentors)
    `);

    console.log('\n📋 Mentors table structure:');
    results.forEach(column => {
      console.log(`   ${column.name}: ${column.type} ${column.notnull ? 'NOT NULL' : 'NULL'}`);
    });

    console.log('\n🎉 Database migration completed successfully!');

  } catch (error) {
    console.error('❌ Error adding password_hash column:', error);
    
    if (error.message.includes('duplicate column name')) {
      console.log('💡 Column already exists, skipping...');
    }
  }
}

addMentorPasswordColumn()
  .then(() => {
    console.log('\n🎉 Migration completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  });
