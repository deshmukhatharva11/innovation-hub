const { sequelize, User, College } = require('./models');
const bcrypt = require('bcryptjs');

async function createNewAdmin() {
  try {
    console.log('🔧 Creating new college admin...');

    // Find or create college
    const [college, collegeCreated] = await College.findOrCreate({
      where: { name: 'Test College' },
      defaults: {
        name: 'Test College',
        city: 'Test City',
        state: 'Test State',
        country: 'India',
        is_active: true
      }
    });

    console.log('✅ College found/created:', college.name);

    // Delete existing admin
    await User.destroy({
      where: { email: 'college.admin@test.com' }
    });

    console.log('✅ Old admin deleted');

    // Create new admin
    const hashedPassword = await bcrypt.hash('password123', 10);
    const newAdmin = await User.create({
      name: 'College Admin',
      email: 'college.admin@test.com',
      password_hash: hashedPassword,
      role: 'college_admin',
      college_id: college.id,
      is_active: true,
      email_verified: true
    });

    console.log('✅ New admin created:', newAdmin.name);

    // Test password
    const password = 'password123';
    const isValidPassword = await bcrypt.compare(password, newAdmin.password_hash);
    console.log('✅ Password verification:', isValidPassword);

    if (isValidPassword) {
      console.log('🎉 New admin login should work!');
    } else {
      console.log('❌ Password verification failed');
    }

  } catch (error) {
    console.error('❌ Error creating new admin:', error);
  }
}

createNewAdmin()
  .then(() => {
    console.log('\n✅ Creation completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Creation failed:', error);
    process.exit(1);
  });
