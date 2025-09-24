const { User } = require('./models');
const bcrypt = require('bcryptjs');

async function fixTestUserPassword() {
  try {
    console.log('🔧 Fixing test user password...');
    
    const user = await User.findOne({
      where: { email: 'admin@testcollege.edu' }
    });
    
    if (user) {
      console.log('✅ User found:', user.email);
      console.log('Current password hash:', user.password_hash);
      
      // Generate new password hash
      const newPasswordHash = await bcrypt.hash('password123', 10);
      console.log('New password hash:', newPasswordHash);
      
      // Test the new hash
      const testResult = await bcrypt.compare('password123', newPasswordHash);
      console.log('Password test result:', testResult);
      
      // Update the user's password
      await user.update({ password_hash: newPasswordHash });
      console.log('✅ Password updated successfully');
      
      // Test login again
      const loginTest = await bcrypt.compare('password123', user.password_hash);
      console.log('Login test result:', loginTest);
      
    } else {
      console.log('❌ User not found');
    }
  } catch (error) {
    console.error('❌ Error fixing password:', error);
  }
}

fixTestUserPassword();
