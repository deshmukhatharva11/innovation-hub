const { sequelize } = require('./config/database');

async function addDistrictColumn() {
  try {
    console.log('🔧 Adding district column to colleges table...\n');

    // Add district column to colleges table
    await sequelize.query(`
      ALTER TABLE colleges 
      ADD COLUMN district VARCHAR(100)
    `);

    console.log('✅ Successfully added district column to colleges table');

    // Update some colleges with district information
    await sequelize.query(`
      UPDATE colleges 
      SET district = 'Amravati' 
      WHERE name LIKE '%Amravati%'
    `);

    await sequelize.query(`
      UPDATE colleges 
      SET district = 'Shegaon' 
      WHERE name LIKE '%Shegaon%'
    `);

    console.log('✅ Updated colleges with district information');

    // Verify the column was added
    const [results] = await sequelize.query(`
      PRAGMA table_info(colleges)
    `);

    console.log('\n📋 Colleges table structure:');
    results.forEach(column => {
      console.log(`   ${column.name}: ${column.type} ${column.notnull ? 'NOT NULL' : 'NULL'}`);
    });

    // Show updated colleges
    const [colleges] = await sequelize.query(`
      SELECT name, city, district, state FROM colleges WHERE district IS NOT NULL
    `);

    console.log('\n🏫 Colleges with district information:');
    colleges.forEach(college => {
      console.log(`   ${college.name} - ${college.district}, ${college.state}`);
    });

    console.log('\n🎉 Database migration completed successfully!');

  } catch (error) {
    console.error('❌ Error adding district column:', error);
    
    if (error.message.includes('duplicate column name')) {
      console.log('💡 Column already exists, skipping...');
    }
  }
}

addDistrictColumn()
  .then(() => {
    console.log('\n🎉 Migration completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  });
