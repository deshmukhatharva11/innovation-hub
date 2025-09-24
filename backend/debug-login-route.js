const { sequelize, User, College, Incubator } = require('./models');
const bcrypt = require('bcryptjs');

async function debugLoginRoute() {
  try {
    console.log('🔧 Debugging login route logic...');

    const email = 'admin@test.com';
    const password = 'password123';

    console.log('📧 Testing email:', email);

    // Find user by email with minimal includes for faster login
    const user = await User.findOne({ 
      where: { email: email },
      include: [
        { model: College, as: 'college', attributes: ['id', 'name'] },
        { model: Incubator, as: 'incubator', attributes: ['id', 'name'] }
      ],
      attributes: ['id', 'name', 'email', 'password_hash', 'role', 'college_id', 'incubator_id', 'is_active', 'email_verified', 'profile_image_url']
    });

    if (!user) {
      console.log('❌ User not found:', email);
      return;
    }

    console.log('📋 User found:', {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      is_active: user.is_active,
      email_verified: user.email_verified,
      password_hash: user.password_hash
    });

    // Check if user is active
    if (!user.is_active) {
      console.log('❌ User account is inactive:', email);
      return;
    }

    // Check if email is verified
    if (!user.email_verified) {
      console.log('❌ User email is not verified:', email);
      return;
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    console.log('✅ Password verification:', isValidPassword);

    if (!isValidPassword) {
      console.log('❌ Invalid password for user:', email);
      return;
    }

    console.log('🎉 All checks passed! Login should work.');

  } catch (error) {
    console.error('❌ Error debugging login route:', error);
  }
}

debugLoginRoute()
  .then(() => {
    console.log('\n✅ Debug completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Debug failed:', error);
    process.exit(1);
  });
