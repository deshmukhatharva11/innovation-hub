const { sequelize, User, College } = require('./models');
const bcrypt = require('bcryptjs');

async function fixLoginCredentials() {
  try {
    console.log('🔧 Fixing login credentials...');

    // Find or create college
    const [college, collegeCreated] = await College.findOrCreate({
      where: { name: 'Government College of Engineering, Amravati' },
      defaults: {
        name: 'Government College of Engineering, Amravati',
        city: 'Amravati',
        state: 'Maharashtra',
        country: 'India',
        is_active: true
      }
    });

    console.log('✅ College found/created:', college.name);

    // Find the existing admin user
    const existingAdmin = await User.findOne({
      where: { email: 'admin1@college1.edu' }
    });

    if (existingAdmin) {
      console.log('📋 Found existing admin:', existingAdmin.name);
      
      // Update password and ensure user is active
      const hashedPassword = await bcrypt.hash('password123', 10);
      await existingAdmin.update({
        password_hash: hashedPassword,
        is_active: true,
        email_verified: true,
        college_id: college.id
      });

      console.log('✅ Admin credentials updated');
      
      // Test password
      const testPassword = await bcrypt.compare('password123', hashedPassword);
      console.log('✅ Password verification:', testPassword);
      
      if (testPassword) {
        console.log('🎉 Login should work now!');
        console.log('📧 Email: admin1@college1.edu');
        console.log('🔑 Password: password123');
      }
    } else {
      console.log('❌ Admin user not found');
    }

  } catch (error) {
    console.error('❌ Error fixing credentials:', error);
  }
}

fixLoginCredentials()
  .then(() => {
    console.log('\n✅ Credentials fixed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Fix failed:', error);
    process.exit(1);
  });
