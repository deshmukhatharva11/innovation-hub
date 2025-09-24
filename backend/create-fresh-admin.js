const { sequelize, User, College } = require('./models');
const bcrypt = require('bcryptjs');

async function createFreshAdmin() {
  try {
    console.log('🔧 Creating fresh admin user...');

    // Find college
    const college = await College.findOne({
      where: { name: 'Government College of Engineering, Amravati' }
    });

    if (!college) {
      console.log('❌ College not found');
      return;
    }

    console.log('✅ College found:', college.name);

    // Delete existing admin
    await User.destroy({
      where: { email: 'admin1@college1.edu' }
    });

    console.log('✅ Old admin deleted');

    // Create fresh admin
    const hashedPassword = await bcrypt.hash('password123', 10);
    const newAdmin = await User.create({
      name: 'College Admin',
      email: 'admin1@college1.edu',
      password_hash: hashedPassword,
      role: 'college_admin',
      college_id: college.id,
      is_active: true,
      email_verified: true
    });

    console.log('✅ Fresh admin created:', newAdmin.name);

    // Test password
    const password = 'password123';
    const isValidPassword = await bcrypt.compare(password, newAdmin.password_hash);
    console.log('✅ Password verification:', isValidPassword);

    if (isValidPassword) {
      console.log('🎉 Fresh admin login should work!');
      console.log('📧 Email: admin1@college1.edu');
      console.log('🔑 Password: password123');
    }

  } catch (error) {
    console.error('❌ Error creating fresh admin:', error);
  }
}

createFreshAdmin()
  .then(() => {
    console.log('\n✅ Fresh admin created!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Creation failed:', error);
    process.exit(1);
  });
