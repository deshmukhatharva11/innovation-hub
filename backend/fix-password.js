const { sequelize, User } = require('./models');
const bcrypt = require('bcryptjs');

async function fixPassword() {
  try {
    console.log('🔧 Fixing password hash...');

    // Find the college admin user
    const collegeAdmin = await User.findOne({
      where: { email: 'college.admin@test.com' }
    });

    if (!collegeAdmin) {
      console.log('❌ College admin user not found');
      return;
    }

    console.log('📋 Current password hash:', collegeAdmin.password_hash);

    // Create new password hash
    const newPassword = 'password123';
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    console.log('📋 New password hash:', hashedPassword);

    // Update password
    await collegeAdmin.update({
      password_hash: hashedPassword
    });

    console.log('✅ Password updated');

    // Test login
    const isValidPassword = await bcrypt.compare(newPassword, hashedPassword);
    console.log('✅ Password verification:', isValidPassword);

    // Test with database password
    const dbPassword = await collegeAdmin.reload();
    const isValidDbPassword = await bcrypt.compare(newPassword, dbPassword.password_hash);
    console.log('✅ Database password verification:', isValidDbPassword);

  } catch (error) {
    console.error('❌ Error fixing password:', error);
  }
}

fixPassword()
  .then(() => {
    console.log('\n✅ Fix completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Fix failed:', error);
    process.exit(1);
  });
