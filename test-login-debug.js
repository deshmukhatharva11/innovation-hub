const { User } = require('./models');
const bcrypt = require('bcryptjs');

async function testLogin() {
  try {
    console.log('🔍 Testing login process...');
    
    // Find user
    const user = await User.findOne({ 
      where: { email: 'admin1@college1.edu' },
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
    const password = 'admin123';
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
    
    // Test login route logic
    console.log('\n🧪 Testing login route logic...');
    
    if (!user.is_active) {
      console.log('❌ User account is inactive');
      return;
    }
    
    const finalPasswordCheck = await bcrypt.compare(password, user.password_hash);
    if (!finalPasswordCheck) {
      console.log('❌ Password verification failed');
      return;
    }
    
    console.log('✅ Login should work!');
    console.log('📧 Email:', user.email);
    console.log('🔑 Password:', password);
    console.log('🏫 College ID:', user.college_id);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testLogin();
