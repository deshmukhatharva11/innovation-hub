const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

async function testMentorPassword() {
  try {
    console.log('🔧 Testing Mentor Password...\n');

    // Connect to database
    const dbPath = path.join(__dirname, 'backend', 'database.sqlite');
    const db = new sqlite3.Database(dbPath);

    // Get mentor record
    console.log('1. 👨‍🏫 Getting mentor record...');
    db.get("SELECT * FROM users WHERE email = 'sarah.johnson@example.com'", (err, row) => {
      if (err) {
        console.log('❌ Error getting mentor record:', err.message);
        return;
      }

      if (!row) {
        console.log('❌ Mentor record not found');
        return;
      }

      console.log('✅ Mentor record found:');
      console.log(`   ID: ${row.id}`);
      console.log(`   Name: ${row.name}`);
      console.log(`   Email: ${row.email}`);
      console.log(`   Role: ${row.role}`);
      console.log(`   Password Hash: ${row.password_hash ? row.password_hash.substring(0, 30) + '...' : 'NULL'}`);

      // Test password verification
      console.log('\n2. 🔑 Testing password verification...');
      const testPassword = 'admin123';
      console.log(`   Testing password: "${testPassword}"`);
      
      const isValid = bcrypt.compareSync(testPassword, row.password_hash);
      console.log(`   Password verification result: ${isValid ? 'VALID' : 'INVALID'}`);

      if (!isValid) {
        console.log('\n3. 🔧 Fixing password...');
        const newHash = bcrypt.hashSync(testPassword, 10);
        console.log(`   New hash: ${newHash.substring(0, 30)}...`);
        
        db.run(
          "UPDATE users SET password_hash = ? WHERE email = 'sarah.johnson@example.com'",
          [newHash],
          function(err) {
            if (err) {
              console.log('❌ Error updating password:', err.message);
            } else {
              console.log(`✅ Password updated successfully (${this.changes} rows affected)`);
              
              // Test again
              const isValidAfter = bcrypt.compareSync(testPassword, newHash);
              console.log(`✅ Password verification after update: ${isValidAfter ? 'VALID' : 'INVALID'}`);
            }
          }
        );
      }

      db.close();
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testMentorPassword();
