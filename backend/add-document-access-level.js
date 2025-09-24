const { sequelize } = require('./config/database');

async function addDocumentAccessLevel() {
  try {
    console.log('🔧 Adding access_level column to Documents table...\n');

    // Add access_level column to Documents table
    await sequelize.query(`
      ALTER TABLE Documents 
      ADD COLUMN access_level VARCHAR(20) DEFAULT 'public' 
      CHECK (access_level IN ('public', 'student_restricted', 'private'))
    `);

    console.log('✅ Successfully added access_level column to Documents table');

    // Update existing documents with appropriate access levels
    await sequelize.query(`
      UPDATE Documents 
      SET access_level = 'public' 
      WHERE is_public = 1
    `);

    await sequelize.query(`
      UPDATE Documents 
      SET access_level = 'student_restricted' 
      WHERE is_public = 0 AND college_id IS NOT NULL
    `);

    await sequelize.query(`
      UPDATE Documents 
      SET access_level = 'private' 
      WHERE is_public = 0 AND college_id IS NULL
    `);

    console.log('✅ Updated existing documents with appropriate access levels');

    // Verify the column was added
    const [results] = await sequelize.query(`
      PRAGMA table_info(Documents)
    `);

    console.log('\n📋 Documents table structure:');
    results.forEach(column => {
      console.log(`   ${column.name}: ${column.type} ${column.notnull ? 'NOT NULL' : 'NULL'}`);
    });

    // Show documents by access level
    const [documents] = await sequelize.query(`
      SELECT access_level, COUNT(*) as count FROM Documents GROUP BY access_level
    `);

    console.log('\n📊 Documents by Access Level:');
    documents.forEach(doc => {
      console.log(`   ${doc.access_level}: ${doc.count} documents`);
    });

    console.log('\n🎉 Database migration completed successfully!');

  } catch (error) {
    console.error('❌ Error adding access_level column:', error);
    
    if (error.message.includes('duplicate column name')) {
      console.log('💡 Column already exists, skipping...');
    }
  }
}

addDocumentAccessLevel()
  .then(() => {
    console.log('\n🎉 Migration completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  });
