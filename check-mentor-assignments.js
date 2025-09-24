const sqlite3 = require('sqlite3').verbose();
const path = require('path');

async function checkMentorAssignments() {
  try {
    console.log('🔍 Checking mentor assignments...\n');

    // Connect to database
    const dbPath = path.join(__dirname, 'backend', 'database.sqlite');
    const db = new sqlite3.Database(dbPath);

    // Check mentor assignments
    console.log('1. 📊 Checking mentor assignments...');
    db.all("SELECT * FROM mentor_assignments LIMIT 10", (err, rows) => {
      if (err) {
        console.log('❌ Error reading mentor_assignments:', err.message);
      } else {
        console.log(`✅ Found ${rows.length} mentor assignments:`);
        rows.forEach((assignment, index) => {
          console.log(`   ${index + 1}. Mentor ID: ${assignment.mentor_id}, Student ID: ${assignment.student_id}, Idea ID: ${assignment.idea_id}`);
        });
      }
    });

    // Check mentor chats
    console.log('\n2. 💬 Checking mentor chats...');
    db.all("SELECT * FROM mentor_chats LIMIT 10", (err, rows) => {
      if (err) {
        console.log('❌ Error reading mentor_chats:', err.message);
      } else {
        console.log(`✅ Found ${rows.length} mentor chats:`);
        rows.forEach((chat, index) => {
          console.log(`   ${index + 1}. Chat ID: ${chat.id}, Mentor ID: ${chat.mentor_id}, Student ID: ${chat.student_id}, Idea ID: ${chat.idea_id}`);
        });
      }
    });

    // Check if mentor user exists
    console.log('\n3. 👨‍🏫 Checking mentor user...');
    db.get("SELECT * FROM users WHERE email = 'sarah.johnson@example.com'", (err, row) => {
      if (err) {
        console.log('❌ Error reading mentor user:', err.message);
      } else if (row) {
        console.log('✅ Mentor user found:');
        console.log(`   ID: ${row.id}`);
        console.log(`   Name: ${row.name}`);
        console.log(`   Email: ${row.email}`);
        console.log(`   Role: ${row.role}`);
        console.log(`   College ID: ${row.college_id}`);
        console.log(`   Is Active: ${row.is_active}`);
        console.log(`   Email Verified: ${row.email_verified}`);
      } else {
        console.log('❌ Mentor user not found');
      }
    });

    // Close database
    setTimeout(() => {
      db.close();
      console.log('\n🎉 Database check completed!');
    }, 2000);

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkMentorAssignments();
