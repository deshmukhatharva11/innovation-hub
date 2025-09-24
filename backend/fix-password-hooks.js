const { sequelize, User, College } = require('./models');
const bcrypt = require('bcryptjs');

async function fixPasswordHooks() {
  try {
    console.log('🔧 Fixing password hooks issue...');

    // Find college
    const college = await College.findOne({
      where: { name: 'Government College of Engineering, Amravati' }
    });

    if (!college) {
      console.log('❌ College not found');
      return;
    }

    // Create password hash
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('📋 Created hash:', hashedPassword);

    // Test the hash
    const testHash = await bcrypt.compare(password, hashedPassword);
    console.log('✅ Hash test:', testHash);

    // Update user directly in database to bypass hooks
    await sequelize.query(
      "UPDATE Users SET password_hash = ? WHERE email = 'admin@test.com'",
      {
        replacements: [hashedPassword],
        type: sequelize.QueryTypes.UPDATE
      }
    );

    console.log('✅ Password updated directly in database');

    // Test the updated password
    const updatedUser = await User.findOne({ where: { email: 'admin@test.com' } });
    const testUpdatedPassword = await bcrypt.compare(password, updatedUser.password_hash);
    console.log('✅ Updated password test:', testUpdatedPassword);

    if (testUpdatedPassword) {
      console.log('🎉 Password is now working!');
      console.log('📧 Email: admin@test.com');
      console.log('🔑 Password: password123');
    }

  } catch (error) {
    console.error('❌ Error fixing password hooks:', error);
  }
}

fixPasswordHooks()
  .then(() => {
    console.log('\n✅ Password hooks fixed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Fix failed:', error);
    process.exit(1);
  });
