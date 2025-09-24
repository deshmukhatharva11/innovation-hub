const { sequelize } = require('./config/database');

async function checkDatabasePassword() {
  try {
    console.log('🔧 Checking database password storage...');

    // Check the actual database content
    const result = await sequelize.query(
      "SELECT id, name, email, password_hash FROM Users WHERE email = 'test@example.com'",
      { type: sequelize.QueryTypes.SELECT }
    );

    if (result.length === 0) {
      console.log('❌ User not found in database');
      return;
    }

    const user = result[0];
    console.log('📋 Database user:', {
      id: user.id,
      name: user.name,
      email: user.email,
      password_hash: user.password_hash
    });

    // Test the password from database
    const bcrypt = require('bcryptjs');
    const password = 'test123';
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    console.log('✅ Password verification from database:', isValidPassword);

    // Test with different passwords
    const testPasswords = ['test123', 'password123', '123456', 'admin123'];
    for (const testPassword of testPasswords) {
      const isValid = await bcrypt.compare(testPassword, user.password_hash);
      console.log(`🔑 Testing password "${testPassword}": ${isValid}`);
    }

  } catch (error) {
    console.error('❌ Error checking database password:', error);
  }
}

checkDatabasePassword()
  .then(() => {
    console.log('\n✅ Database check completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Database check failed:', error);
    process.exit(1);
  });
