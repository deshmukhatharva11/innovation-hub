const { sequelize, User, College } = require('./models');
const bcrypt = require('bcryptjs');

async function fixCollegeAdmin() {
  try {
    console.log('🔧 Fixing College Admin credentials...');

    // Find the college admin user
    const collegeAdmin = await User.findOne({
      where: { email: 'college.admin@test.com' }
    });

    if (!collegeAdmin) {
      console.log('❌ College admin user not found');
      return;
    }

    console.log('📋 Current user:', {
      name: collegeAdmin.name,
      email: collegeAdmin.email,
      role: collegeAdmin.role,
      is_active: collegeAdmin.is_active,
      email_verified: collegeAdmin.email_verified
    });

    // Update password
    const hashedPassword = await bcrypt.hash('password123', 10);
    await collegeAdmin.update({
      password_hash: hashedPassword,
      is_active: true,
      email_verified: true
    });

    console.log('✅ College admin credentials updated');

    // Test login
    const isValidPassword = await bcrypt.compare('password123', collegeAdmin.password_hash);
    console.log('✅ Password verification:', isValidPassword);

  } catch (error) {
    console.error('❌ Error fixing college admin:', error);
  }
}

fixCollegeAdmin()
  .then(() => {
    console.log('\n✅ Fix completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Fix failed:', error);
    process.exit(1);
  });
