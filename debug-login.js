const { User } = require('./models');
const bcrypt = require('bcryptjs');

async function debugLogin() {
  try {
    console.log('🔍 Debugging login...');
    
    // Find user
    const user = await User.findOne({ 
      where: { email: 'admin@test.com' },
      attributes: ['id', 'email', 'role', 'college_id', 'is_active', 'password_hash']
    });
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log('✅ User found:', {
      id: user.id,
      email: user.email,
      role: user.role,
      college_id: user.college_id,
      is_active: user.is_active
    });
    
    // Test password
    const password = 'password123';
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    console.log('🔑 Password valid:', isValidPassword);
    
    if (!isValidPassword) {
      console.log('🔧 Fixing password...');
      const newHash = await bcrypt.hash(password, 10);
      await user.update({ password_hash: newHash });
      console.log('✅ Password fixed');
      
      const newIsValid = await bcrypt.compare(password, newHash);
      console.log('🔑 New password valid:', newIsValid);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

debugLogin();