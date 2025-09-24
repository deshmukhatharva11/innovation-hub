const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

async function updateMentorPassword() {
  try {
    console.log('🔧 Updating mentor password to mentor123...\n');

    // Connect to database
    const dbPath = path.join(__dirname, 'backend', 'database.sqlite');
    const db = new sqlite3.Database(dbPath);

    // Update mentor password
    console.log('1. 🔑 Updating mentor password...');
    const newPassword = 'mentor123';
    const newHash = bcrypt.hashSync(newPassword, 10);
    
    db.run(
      "UPDATE users SET password_hash = ? WHERE role = 'mentor'",
      [newHash],
      function(err) {
        if (err) {
          console.log('❌ Error updating mentor password:', err.message);
        } else {
          console.log(`✅ Updated mentor password for ${this.changes} mentors`);
          
          // Verify the update
          console.log('\n2. 🔍 Verifying password update...');
          db.get("SELECT * FROM users WHERE email = 'sarah.johnson@example.com'", (err, row) => {
            if (err) {
              console.log('❌ Error verifying password:', err.message);
            } else if (row) {
              const isValid = bcrypt.compareSync(newPassword, row.password_hash);
              console.log(`✅ Password verification: ${isValid ? 'VALID' : 'INVALID'}`);
              console.log(`   Mentor: ${row.name} (${row.email})`);
            } else {
              console.log('❌ Mentor not found');
            }
            
            db.close();
          });
        }
      }
    );

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

updateMentorPassword();
