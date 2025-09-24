const { sequelize, User } = require('./models');
const bcrypt = require('bcryptjs');

async function fixOriginalAdmin() {
  try {
    console.log('🔧 Fixing original admin...');

    // Create password hash
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('📋 Created hash:', hashedPassword);

    // Test the hash
    const testHash = await bcrypt.compare(password, hashedPassword);
    console.log('✅ Hash test:', testHash);

    // Update original admin directly in database to bypass hooks
    await sequelize.query(
      "UPDATE Users SET password_hash = ? WHERE email = 'admin1@college1.edu'",
      {
        replacements: [hashedPassword],
        type: sequelize.QueryTypes.UPDATE
      }
    );

    console.log('✅ Original admin password updated');

    // Test the updated password
    const updatedUser = await User.findOne({ where: { email: 'admin1@college1.edu' } });
    const testUpdatedPassword = await bcrypt.compare(password, updatedUser.password_hash);
    console.log('✅ Updated password test:', testUpdatedPassword);

    if (testUpdatedPassword) {
      console.log('🎉 Original admin is now working!');
      console.log('📧 Email: admin1@college1.edu');
      console.log('🔑 Password: password123');
    }

  } catch (error) {
    console.error('❌ Error fixing original admin:', error);
  }
}

fixOriginalAdmin()
  .then(() => {
    console.log('\n✅ Original admin fixed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Fix failed:', error);
    process.exit(1);
  });
