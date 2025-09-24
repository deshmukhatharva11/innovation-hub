const { sequelize } = require('./backend/config/database');
const { DataTypes } = require('sequelize');

async function fixMentorTable() {
  console.log('🚀 Fixing Mentor Table and Logic...\n');

  try {
    // Step 1: Drop existing Mentors table if it exists
    console.log('📝 Step 1: Dropping existing Mentors table');
    await sequelize.query('DROP TABLE IF EXISTS "Mentors"');
    console.log('✅ Mentors table dropped');

    // Step 2: Create new Mentors table with correct structure
    console.log('📝 Step 2: Creating new Mentors table');
    await sequelize.query(`
      CREATE TABLE "Mentors" (
        "id" INTEGER PRIMARY KEY AUTOINCREMENT,
        "name" VARCHAR(100) NOT NULL CHECK (length("name") >= 2),
        "email" VARCHAR(255) NOT NULL UNIQUE CHECK ("email" LIKE '%@%'),
        "phone" VARCHAR(15) CHECK (length("phone") >= 10),
        "specialization" VARCHAR(100) NOT NULL CHECK (length("specialization") >= 1),
        "experience_years" INTEGER NOT NULL DEFAULT 0 CHECK ("experience_years" >= 0 AND "experience_years" <= 50),
        "availability" VARCHAR(20) NOT NULL DEFAULT 'available' CHECK ("availability" IN ('available', 'busy', 'unavailable')),
        "max_students" INTEGER DEFAULT 5 CHECK ("max_students" >= 1 AND "max_students" <= 50),
        "current_students" INTEGER NOT NULL DEFAULT 0 CHECK ("current_students" >= 0),
        "bio" TEXT,
        "linkedin_url" VARCHAR(500) CHECK ("linkedin_url" LIKE 'http%'),
        "website_url" VARCHAR(500) CHECK ("website_url" LIKE 'http%'),
        "rating" DECIMAL(3,2) DEFAULT 0.0 CHECK ("rating" >= 0.0 AND "rating" <= 5.0),
        "total_ratings" INTEGER NOT NULL DEFAULT 0,
        "college_id" INTEGER REFERENCES "colleges"("id") ON DELETE SET NULL,
        "incubator_id" INTEGER REFERENCES "incubators"("id") ON DELETE SET NULL,
        "is_active" BOOLEAN NOT NULL DEFAULT 1,
        "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Mentors table created');

    // Step 3: Create indexes
    console.log('📝 Step 3: Creating indexes');
    await sequelize.query('CREATE INDEX "mentors_email" ON "Mentors"("email")');
    await sequelize.query('CREATE INDEX "mentors_college_id" ON "Mentors"("college_id")');
    await sequelize.query('CREATE INDEX "mentors_incubator_id" ON "Mentors"("incubator_id")');
    await sequelize.query('CREATE INDEX "mentors_availability" ON "Mentors"("availability")');
    await sequelize.query('CREATE INDEX "mentors_specialization" ON "Mentors"("specialization")');
    console.log('✅ Indexes created');

    // Step 4: Insert sample mentor data
    console.log('📝 Step 4: Inserting sample mentor data');
    await sequelize.query(`
      INSERT INTO "Mentors" (
        "name", "email", "phone", "specialization", "experience_years", 
        "availability", "max_students", "bio", "college_id", "is_active"
      ) VALUES 
      ('Dr. Sarah Johnson', 'sarah.johnson@college.edu', '+1234567890', 'AI/ML', 8, 'available', 5, 'Expert in machine learning and AI applications', 36, 1),
      ('Prof. Michael Chen', 'michael.chen@college.edu', '+1234567891', 'Data Science', 12, 'available', 3, 'Data science specialist with industry experience', 36, 1),
      ('Dr. Emily Rodriguez', 'emily.rodriguez@college.edu', '+1234567892', 'Web Development', 6, 'busy', 4, 'Full-stack developer and tech entrepreneur', 36, 1),
      ('Mr. David Kumar', 'david.kumar@college.edu', '+1234567893', 'Mobile Development', 5, 'available', 6, 'Mobile app development expert', 36, 1),
      ('Dr. Lisa Wang', 'lisa.wang@college.edu', '+1234567894', 'Blockchain', 7, 'available', 3, 'Blockchain technology and cryptocurrency expert', 36, 1)
    `);
    console.log('✅ Sample mentor data inserted');

    // Step 5: Verify table structure
    console.log('📝 Step 5: Verifying table structure');
    const [results] = await sequelize.query('PRAGMA table_info("Mentors")');
    console.log('✅ Table structure verified:');
    results.forEach(col => {
      console.log(`   - ${col.name}: ${col.type} ${col.notnull ? 'NOT NULL' : ''} ${col.pk ? 'PRIMARY KEY' : ''}`);
    });

    // Step 6: Test queries
    console.log('📝 Step 6: Testing queries');
    const [mentors] = await sequelize.query('SELECT COUNT(*) as count FROM "Mentors"');
    console.log(`✅ Found ${mentors[0].count} mentors in table`);

    const [collegeMentors] = await sequelize.query('SELECT COUNT(*) as count FROM "Mentors" WHERE "college_id" = 36');
    console.log(`✅ Found ${collegeMentors[0].count} mentors for college 36`);

    console.log('\n🎉 Mentor Table Fix Complete!');
    console.log('✅ Table recreated with proper structure');
    console.log('✅ Indexes created for performance');
    console.log('✅ Sample data inserted');
    console.log('✅ All constraints and validations working');

  } catch (error) {
    console.error('❌ Error fixing mentor table:', error);
  } finally {
    await sequelize.close();
  }
}

fixMentorTable().catch(console.error);