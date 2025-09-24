const { sequelize } = require('../config/database');

async function addCollegeCoordinatorTables() {
  try {
    console.log('Creating College Coordinator tables...');

    // Create Events table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS "Events" (
        "id" INTEGER PRIMARY KEY AUTOINCREMENT,
        "title" VARCHAR(200) NOT NULL,
        "description" TEXT,
        "event_type" VARCHAR(20) NOT NULL CHECK ("event_type" IN ('webinar', 'ideathon', 'workshop', 'competition', 'seminar', 'conference', 'other')),
        "start_date" DATETIME NOT NULL,
        "end_date" DATETIME,
        "location" VARCHAR(200),
        "is_online" BOOLEAN DEFAULT 0,
        "meeting_link" VARCHAR(500),
        "max_participants" INTEGER,
        "registration_deadline" DATETIME,
        "status" VARCHAR(20) DEFAULT 'draft' CHECK ("status" IN ('draft', 'published', 'cancelled', 'completed')),
        "college_id" INTEGER NOT NULL REFERENCES "Colleges"("id") ON DELETE CASCADE,
        "created_by" INTEGER NOT NULL REFERENCES "Users"("id") ON DELETE CASCADE,
        "is_active" BOOLEAN DEFAULT 1,
        "created_at" DATETIME DEFAULT CURRENT_TIMESTAMP,
        "updated_at" DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create Reports table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS "Reports" (
        "id" INTEGER PRIMARY KEY AUTOINCREMENT,
        "title" VARCHAR(200) NOT NULL,
        "report_type" VARCHAR(20) NOT NULL CHECK ("report_type" IN ('biannual', 'annual', 'quarterly', 'monthly', 'custom')),
        "period_start" DATETIME NOT NULL,
        "period_end" DATETIME NOT NULL,
        "content" TEXT,
        "file_path" VARCHAR(500),
        "status" VARCHAR(20) DEFAULT 'draft' CHECK ("status" IN ('draft', 'submitted', 'approved', 'rejected')),
        "submitted_at" DATETIME,
        "college_id" INTEGER NOT NULL REFERENCES "Colleges"("id") ON DELETE CASCADE,
        "created_by" INTEGER NOT NULL REFERENCES "Users"("id") ON DELETE CASCADE,
        "is_active" BOOLEAN DEFAULT 1,
        "created_at" DATETIME DEFAULT CURRENT_TIMESTAMP,
        "updated_at" DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create Documents table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS "Documents" (
        "id" INTEGER PRIMARY KEY AUTOINCREMENT,
        "title" VARCHAR(200) NOT NULL,
        "description" TEXT,
        "document_type" VARCHAR(20) NOT NULL CHECK ("document_type" IN ('circular', 'template', 'poster', 'guideline', 'form', 'other')),
        "file_path" VARCHAR(500) NOT NULL,
        "file_size" INTEGER,
        "mime_type" VARCHAR(100),
        "is_public" BOOLEAN DEFAULT 1,
        "college_id" INTEGER REFERENCES "Colleges"("id") ON DELETE CASCADE,
        "uploaded_by" INTEGER NOT NULL REFERENCES "Users"("id") ON DELETE CASCADE,
        "is_active" BOOLEAN DEFAULT 1,
        "created_at" DATETIME DEFAULT CURRENT_TIMESTAMP,
        "updated_at" DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create IdeaEvaluations table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS "IdeaEvaluations" (
        "id" INTEGER PRIMARY KEY AUTOINCREMENT,
        "idea_id" INTEGER NOT NULL REFERENCES "Ideas"("id") ON DELETE CASCADE,
        "evaluator_id" INTEGER NOT NULL REFERENCES "Users"("id") ON DELETE CASCADE,
        "rating" INTEGER NOT NULL CHECK ("rating" >= 1 AND "rating" <= 10),
        "comments" TEXT,
        "recommendation" VARCHAR(20) NOT NULL CHECK ("recommendation" IN ('nurture', 'forward', 'reject')),
        "mentor_assigned" INTEGER REFERENCES "Users"("id") ON DELETE SET NULL,
        "nurture_notes" TEXT,
        "evaluation_date" DATETIME DEFAULT CURRENT_TIMESTAMP,
        "is_active" BOOLEAN DEFAULT 1,
        "created_at" DATETIME DEFAULT CURRENT_TIMESTAMP,
        "updated_at" DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create indexes for better performance
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS "idx_events_college_id" ON "Events"("college_id");
      CREATE INDEX IF NOT EXISTS "idx_events_created_by" ON "Events"("created_by");
      CREATE INDEX IF NOT EXISTS "idx_events_status" ON "Events"("status");
      CREATE INDEX IF NOT EXISTS "idx_events_start_date" ON "Events"("start_date");
    `);

    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS "idx_reports_college_id" ON "Reports"("college_id");
      CREATE INDEX IF NOT EXISTS "idx_reports_created_by" ON "Reports"("created_by");
      CREATE INDEX IF NOT EXISTS "idx_reports_status" ON "Reports"("status");
      CREATE INDEX IF NOT EXISTS "idx_reports_period_start" ON "Reports"("period_start");
    `);

    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS "idx_documents_college_id" ON "Documents"("college_id");
      CREATE INDEX IF NOT EXISTS "idx_documents_uploaded_by" ON "Documents"("uploaded_by");
      CREATE INDEX IF NOT EXISTS "idx_documents_document_type" ON "Documents"("document_type");
      CREATE INDEX IF NOT EXISTS "idx_documents_is_public" ON "Documents"("is_public");
    `);

    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS "idx_idea_evaluations_idea_id" ON "IdeaEvaluations"("idea_id");
      CREATE INDEX IF NOT EXISTS "idx_idea_evaluations_evaluator_id" ON "IdeaEvaluations"("evaluator_id");
      CREATE INDEX IF NOT EXISTS "idx_idea_evaluations_recommendation" ON "IdeaEvaluations"("recommendation");
      CREATE INDEX IF NOT EXISTS "idx_idea_evaluations_evaluation_date" ON "IdeaEvaluations"("evaluation_date");
    `);

    console.log('✅ College Coordinator tables created successfully!');
    console.log('Tables created: Events, Reports, Documents, IdeaEvaluations');
    
  } catch (error) {
    console.error('❌ Error creating College Coordinator tables:', error);
    throw error;
  }
}

// Run the migration
if (require.main === module) {
  addCollegeCoordinatorTables()
    .then(() => {
      console.log('Migration completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = addCollegeCoordinatorTables;
