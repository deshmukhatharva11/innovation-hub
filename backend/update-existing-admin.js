const { sequelize, User, College } = require('./models');
const bcrypt = require('bcryptjs');

async function updateExistingAdmin() {
  try {
    console.log('🔧 Updating existing admin user...');

    // Find the existing admin
    const existingAdmin = await User.findOne({
      where: { email: 'admin1@college1.edu' }
    });

    if (!existingAdmin) {
      console.log('❌ Admin user not found');
      return;
    }

    console.log('📋 Found admin:', existingAdmin.name);

    // Find college
    const college = await College.findOne({
      where: { name: 'Government College of Engineering, Amravati' }
    });

    if (!college) {
      console.log('❌ College not found');
      return;
    }

    // Update admin with fresh password
    const hashedPassword = await bcrypt.hash('password123', 10);
    await existingAdmin.update({
      password_hash: hashedPassword,
      is_active: true,
      email_verified: true,
      college_id: college.id,
      name: 'College Admin'
    });

    console.log('✅ Admin updated');

    // Test password
    const password = 'password123';
    const isValidPassword = await bcrypt.compare(password, hashedPassword);
    console.log('✅ Password verification:', isValidPassword);

    if (isValidPassword) {
      console.log('🎉 Admin login should work!');
      console.log('📧 Email: admin1@college1.edu');
      console.log('🔑 Password: password123');
    }

  } catch (error) {
    console.error('❌ Error updating admin:', error);
  }
}

updateExistingAdmin()
  .then(() => {
    console.log('\n✅ Admin updated!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Update failed:', error);
    process.exit(1);
  });
