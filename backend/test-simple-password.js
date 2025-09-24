const { sequelize, User } = require('./models');
const bcrypt = require('bcryptjs');

async function testSimplePassword() {
  try {
    console.log('🔧 Testing simple password...');

    const email = 'admin@test.com';
    const password = '123456'; // Simple password

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      console.log('❌ User not found');
      return;
    }

    // Create simple password hash
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('📋 New hash:', hashedPassword);

    // Test the hash immediately
    const testHash = await bcrypt.compare(password, hashedPassword);
    console.log('✅ Hash test:', testHash);

    // Update user
    await user.update({ password_hash: hashedPassword });
    console.log('✅ User updated');

    // Test database password
    const updatedUser = await User.findOne({ where: { email } });
    const testDbPassword = await bcrypt.compare(password, updatedUser.password_hash);
    console.log('✅ Database password test:', testDbPassword);

    if (testDbPassword) {
      console.log('🎉 Simple password works!');
      console.log('📧 Email: admin@test.com');
      console.log('🔑 Password: 123456');
    }

  } catch (error) {
    console.error('❌ Error testing simple password:', error);
  }
}

testSimplePassword()
  .then(() => {
    console.log('\n✅ Test completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });
