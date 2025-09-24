const sqlite3 = require('sqlite3').verbose();
const path = require('path');

async function checkMentorChatsStructure() {
  try {
    console.log('🔍 Checking mentor_chats table structure...\n');

    // Connect to database
    const dbPath = path.join(__dirname, 'backend', 'database.sqlite');
    const db = new sqlite3.Database(dbPath);

    // Check table structure
    console.log('1. 📊 Checking mentor_chats table structure...');
    db.all("PRAGMA table_info(mentor_chats)", (err, columns) => {
      if (err) {
        console.log('❌ Error getting table info:', err.message);
        return;
      }

      console.log('✅ mentor_chats table columns:');
      columns.forEach(col => {
        console.log(`   ${col.name}: ${col.type} (${col.notnull ? 'NOT NULL' : 'NULL'})`);
      });

      // Check if idea_id column exists
      const hasIdeaId = columns.some(col => col.name === 'idea_id');
      console.log(`\n   Has idea_id column: ${hasIdeaId}`);

      if (!hasIdeaId) {
        console.log('\n2. 🔧 Adding idea_id column...');
        db.run("ALTER TABLE mentor_chats ADD COLUMN idea_id INTEGER", (err) => {
          if (err) {
            console.log('❌ Error adding idea_id column:', err.message);
          } else {
            console.log('✅ Added idea_id column to mentor_chats table');
          }
        });
      }

      // Check existing data
      console.log('\n3. 📊 Checking existing mentor_chats data...');
      db.all("SELECT * FROM mentor_chats LIMIT 5", (err, rows) => {
        if (err) {
          console.log('❌ Error reading mentor_chats:', err.message);
        } else {
          console.log(`✅ Found ${rows.length} mentor chats:`);
          rows.forEach((chat, index) => {
            console.log(`   ${index + 1}. Chat ID: ${chat.id}, Mentor ID: ${chat.mentor_id}, Student ID: ${chat.student_id}`);
          });
        }
      });

      db.close();
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkMentorChatsStructure();
