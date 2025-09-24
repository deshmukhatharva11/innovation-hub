const { sequelize, User } = require('./models');
const bcrypt = require('bcryptjs');

async function fixPasswordFinal() {
  try {
    console.log('🔧 Final password fix...');

    // Find the admin user
    const admin = await User.findOne({
      where: { email: 'admin1@college1.edu' }
    });

    if (!admin) {
      console.log('❌ Admin user not found');
      return;
    }

    console.log('📋 Current password hash:', admin.password_hash);

    // Create a completely new password hash
    const password = 'password123';
    const newHash = await bcrypt.hash(password, 12);
    console.log('📋 New password hash:', newHash);

    // Test the new hash immediately
    const testNewHash = await bcrypt.compare(password, newHash);
    console.log('✅ New hash test:', testNewHash);

    // Update the user with the new hash
    await admin.update({
      password_hash: newHash
    });

    console.log('✅ Password updated in database');

    // Test the database password
    const updatedAdmin = await User.findOne({
      where: { email: 'admin1@college1.edu' }
    });

    const testDbPassword = await bcrypt.compare(password, updatedAdmin.password_hash);
    console.log('✅ Database password test:', testDbPassword);

    if (testDbPassword) {
      console.log('🎉 Password is now working!');
      console.log('📧 Email: admin1@college1.edu');
      console.log('🔑 Password: password123');
    } else {
      console.log('❌ Password still not working');
    }

  } catch (error) {
    console.error('❌ Error fixing password:', error);
  }
}

fixPasswordFinal()
  .then(() => {
    console.log('\n✅ Password fix completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Password fix failed:', error);
    process.exit(1);
  });
