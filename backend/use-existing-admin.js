const { sequelize, User } = require('./models');
const bcrypt = require('bcryptjs');

async function useExistingAdmin() {
  try {
    console.log('🔧 Using existing college admin...');

    // Find an existing college admin
    const existingAdmin = await User.findOne({
      where: { 
        role: 'college_admin',
        is_active: true,
        email_verified: true
      }
    });

    if (!existingAdmin) {
      console.log('❌ No existing college admin found');
      return;
    }

    console.log('📋 Found existing admin:', {
      name: existingAdmin.name,
      email: existingAdmin.email,
      role: existingAdmin.role,
      college_id: existingAdmin.college_id
    });

    // Update password
    const hashedPassword = await bcrypt.hash('password123', 10);
    await existingAdmin.update({
      password_hash: hashedPassword
    });

    console.log('✅ Password updated');

    // Test password
    const password = 'password123';
    const isValidPassword = await bcrypt.compare(password, hashedPassword);
    console.log('✅ Password verification:', isValidPassword);

    if (isValidPassword) {
      console.log('🎉 Login should work with:', existingAdmin.email);
    }

  } catch (error) {
    console.error('❌ Error using existing admin:', error);
  }
}

useExistingAdmin()
  .then(() => {
    console.log('\n✅ Setup completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  });
