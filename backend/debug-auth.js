const { sequelize, User } = require('./models');
const bcrypt = require('bcryptjs');

async function debugAuth() {
  try {
    console.log('🔧 Debugging authentication...');

    // Find the admin user
    const admin = await User.findOne({
      where: { email: 'admin1@college1.edu' }
    });

    if (!admin) {
      console.log('❌ Admin user not found');
      return;
    }

    console.log('📋 Admin found:', {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      is_active: admin.is_active,
      email_verified: admin.email_verified,
      password_hash: admin.password_hash
    });

    // Test password
    const password = 'password123';
    const isValidPassword = await bcrypt.compare(password, admin.password_hash);
    console.log('✅ Password verification:', isValidPassword);

    // Test the exact same logic as in the auth route
    if (!admin || !admin.is_active || !admin.email_verified) {
      console.log('❌ User validation failed:', {
        exists: !!admin,
        is_active: admin?.is_active,
        email_verified: admin?.email_verified
      });
    } else {
      console.log('✅ User validation passed');
    }

    if (!isValidPassword) {
      console.log('❌ Password validation failed');
    } else {
      console.log('✅ Password validation passed');
    }

    // Test with different password
    const testPasswords = ['password123', 'password', 'admin123', '123456'];
    for (const testPassword of testPasswords) {
      const isValid = await bcrypt.compare(testPassword, admin.password_hash);
      console.log(`🔑 Testing password "${testPassword}": ${isValid}`);
    }

  } catch (error) {
    console.error('❌ Error debugging auth:', error);
  }
}

debugAuth()
  .then(() => {
    console.log('\n✅ Debug completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Debug failed:', error);
    process.exit(1);
  });
