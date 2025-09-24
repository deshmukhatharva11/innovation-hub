const { sequelize, User } = require('./models');
const bcrypt = require('bcryptjs');

async function debugLogin() {
  try {
    console.log('🔧 Debugging login process...');

    // Find the college admin user
    const collegeAdmin = await User.findOne({
      where: { email: 'college.admin@test.com' }
    });

    if (!collegeAdmin) {
      console.log('❌ College admin user not found');
      return;
    }

    console.log('📋 User found:', {
      id: collegeAdmin.id,
      name: collegeAdmin.name,
      email: collegeAdmin.email,
      role: collegeAdmin.role,
      is_active: collegeAdmin.is_active,
      email_verified: collegeAdmin.email_verified,
      password_hash: collegeAdmin.password_hash
    });

    // Test password
    const password = 'password123';
    const isValidPassword = await bcrypt.compare(password, collegeAdmin.password_hash);
    console.log('✅ Password verification:', isValidPassword);

    // Check if user is active and verified
    if (!collegeAdmin.is_active) {
      console.log('❌ User is not active');
    }
    if (!collegeAdmin.email_verified) {
      console.log('❌ User email is not verified');
    }

    // Try to find user by exact email match
    const exactUser = await User.findOne({
      where: { 
        email: 'college.admin@test.com',
        is_active: true,
        email_verified: true
      }
    });

    console.log('📋 Exact user found:', !!exactUser);

    if (exactUser) {
      const exactPasswordValid = await bcrypt.compare(password, exactUser.password_hash);
      console.log('✅ Exact user password verification:', exactPasswordValid);
    }

  } catch (error) {
    console.error('❌ Error debugging login:', error);
  }
}

debugLogin()
  .then(() => {
    console.log('\n✅ Debug completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Debug failed:', error);
    process.exit(1);
  });
