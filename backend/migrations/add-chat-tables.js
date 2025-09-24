const { sequelize } = require('../config/database');

async function addChatTables() {
  try {
    console.log('🔧 Adding chat tables...');

    // Create conversations table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS "conversations" (
        "id" INTEGER PRIMARY KEY AUTOINCREMENT,
        "student_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "college_admin_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "subject" VARCHAR(255),
        "status" VARCHAR(20) DEFAULT 'active' CHECK ("status" IN ('active', 'archived', 'closed')),
        "last_message_at" DATETIME,
        "unread_count_student" INTEGER DEFAULT 0,
        "unread_count_admin" INTEGER DEFAULT 0,
        "created_at" DATETIME DEFAULT CURRENT_TIMESTAMP,
        "updated_at" DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create messages table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS "messages" (
        "id" INTEGER PRIMARY KEY AUTOINCREMENT,
        "conversation_id" INTEGER NOT NULL REFERENCES "conversations"("id") ON DELETE CASCADE,
        "sender_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "content" TEXT NOT NULL,
        "message_type" VARCHAR(20) DEFAULT 'text' CHECK ("message_type" IN ('text', 'image', 'file', 'system')),
        "is_read" BOOLEAN DEFAULT 0,
        "read_at" DATETIME,
        "file_path" VARCHAR(500),
        "file_name" VARCHAR(255),
        "file_size" INTEGER,
        "mime_type" VARCHAR(100),
        "created_at" DATETIME DEFAULT CURRENT_TIMESTAMP,
        "updated_at" DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create indexes for better performance
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS "idx_conversations_student" ON "conversations"("student_id");
    `);

    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS "idx_conversations_admin" ON "conversations"("college_admin_id");
    `);

    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS "idx_messages_conversation" ON "messages"("conversation_id");
    `);

    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS "idx_messages_sender" ON "messages"("sender_id");
    `);

    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS "idx_messages_created_at" ON "messages"("created_at");
    `);

    console.log('✅ Chat tables created successfully!');

  } catch (error) {
    console.error('❌ Error creating chat tables:', error);
    throw error;
  }
}

addChatTables()
  .then(() => {
    console.log('\n✅ Chat tables migration completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  });