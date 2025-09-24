const sqlite3 = require('sqlite3').verbose();
const path = require('path');

async function createMentorChats() {
  try {
    console.log('🔧 Creating mentor chats for assignments...\n');

    // Connect to database
    const dbPath = path.join(__dirname, 'backend', 'database.sqlite');
    const db = new sqlite3.Database(dbPath);

    // Get mentor assignments
    console.log('1. 📊 Getting mentor assignments...');
    db.all("SELECT * FROM mentor_assignments", (err, assignments) => {
      if (err) {
        console.log('❌ Error reading mentor_assignments:', err.message);
        return;
      }

      console.log(`✅ Found ${assignments.length} mentor assignments`);

      // Create mentor chats for each assignment
      console.log('\n2. 💬 Creating mentor chats for assignments...');
      
      let completed = 0;
      assignments.forEach((assignment, index) => {
        // Check if chat already exists
        db.get(
          "SELECT * FROM mentor_chats WHERE mentor_id = ? AND student_id = ?",
          [assignment.mentor_id, assignment.student_id],
          (err, existingChat) => {
            if (err) {
              console.log(`❌ Error checking existing chat for assignment ${index + 1}:`, err.message);
              return;
            }

            if (existingChat) {
              console.log(`   ✅ Chat already exists for assignment ${index + 1}`);
              completed++;
              if (completed === assignments.length) {
                db.close();
              }
              return;
            }

            // Create new mentor chat
            db.run(
              `INSERT INTO mentor_chats 
               (mentor_id, student_id, idea_id, status, is_active, created_at, updated_at) 
               VALUES (?, ?, ?, ?, ?, ?, ?)`,
              [
                assignment.mentor_id,
                assignment.student_id,
                assignment.idea_id,
                'active',
                1,
                new Date().toISOString(),
                new Date().toISOString()
              ],
              function(err) {
                if (err) {
                  console.log(`❌ Error creating chat for assignment ${index + 1}:`, err.message);
                } else {
                  console.log(`✅ Created chat for assignment ${index + 1} (Chat ID: ${this.lastID})`);
                }
                
                completed++;
                if (completed === assignments.length) {
                  // Verify the chats were created
                  console.log('\n3. 🔍 Verifying mentor chats...');
                  db.all("SELECT * FROM mentor_chats WHERE mentor_id = 130", (err, chats) => {
                    if (err) {
                      console.log('❌ Error reading mentor chats:', err.message);
                    } else {
                      console.log(`✅ Found ${chats.length} mentor chats for mentor ID 130:`);
                      chats.forEach((chat, index) => {
                        console.log(`   ${index + 1}. Chat ID: ${chat.id}, Student ID: ${chat.student_id}, Idea ID: ${chat.idea_id}`);
                      });
                    }
                    
                    db.close();
                  });
                }
              }
            );
          }
        );
      });
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createMentorChats();
