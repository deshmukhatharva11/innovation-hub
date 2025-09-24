const { User } = require('./models');
const bcrypt = require('bcrypt');

async function verifyPassword() {
  try {
    console.log('🔍 Verifying password for college.admin@test.com...');
    
    const user = await User.findOne({
      where: { email: 'college.admin@test.com' },
      attributes: ['id', 'name', 'email', 'password_hash']
    });
    
    if (user) {
      console.log('✅ User found:', user.email);
      console.log('🔐 Current password hash:', user.password_hash);
      
      // Test the password
      const isValid = await bcrypt.compare('admin123', user.password_hash);
      console.log(`🔑 Password "admin123" is valid: ${isValid ? '✅ YES' : '❌ NO'}`);
      
      if (!isValid) {
        console.log('🔧 Setting password to admin123...');
        const newHash = await bcrypt.hash('admin123', 10);
        await user.update({ password_hash: newHash });
        console.log('✅ Password updated to admin123');
        
        // Verify again
        const isValidAfter = await bcrypt.compare('admin123', newHash);
        console.log(`🔑 After update, password "admin123" is valid: ${isValidAfter ? '✅ YES' : '❌ NO'}`);
      }
      
    } else {
      console.log('❌ User not found');
    }
    
  } catch (error) {
    console.error('❌ Error verifying password:', error);
  }
}

verifyPassword();
