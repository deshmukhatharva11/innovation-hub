const { sequelize } = require('./config/database');
const bcrypt = require('bcryptjs');

async function fixPasswordDirect() {
  try {
    console.log('🔧 Fixing password directly in database...');
    
    // Generate new password hash
    const newPasswordHash = await bcrypt.hash('password123', 10);
    console.log('New password hash:', newPasswordHash);
    
    // Test the hash
    const testResult = await bcrypt.compare('password123', newPasswordHash);
    console.log('Password test result:', testResult);
    
    // Update directly in database bypassing hooks
    await sequelize.query(
      `UPDATE Users SET password_hash = ? WHERE email = ?`,
      {
        replacements: [newPasswordHash, 'admin@testcollege.edu'],
        type: sequelize.QueryTypes.UPDATE
      }
    );
    
    console.log('✅ Password updated directly in database');
    
    // Verify the update
    const result = await sequelize.query(
      `SELECT password_hash FROM Users WHERE email = ?`,
      {
        replacements: ['admin@testcollege.edu'],
        type: sequelize.QueryTypes.SELECT
      }
    );
    
    if (result.length > 0) {
      const storedHash = result[0].password_hash;
      const finalTest = await bcrypt.compare('password123', storedHash);
      console.log('Final password test result:', finalTest);
      
      if (finalTest) {
        console.log('🎉 Password is now working!');
      } else {
        console.log('❌ Password still not working');
      }
    }
    
  } catch (error) {
    console.error('❌ Error fixing password:', error);
  }
}

fixPasswordDirect();
