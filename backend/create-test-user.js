const { sequelize, User, College } = require('./models');
const bcrypt = require('bcryptjs');

async function createTestUser() {
  try {
    console.log('🔧 Creating test user...');

    // Find college
    const college = await College.findOne({
      where: { name: 'Government College of Engineering, Amravati' }
    });

    if (!college) {
      console.log('❌ College not found');
      return;
    }

    // Create a completely new user
    const password = 'test123';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    console.log('📋 Creating user with password:', password);
    console.log('📋 Hash:', hashedPassword);

    // Test the hash before saving
    const testBeforeSave = await bcrypt.compare(password, hashedPassword);
    console.log('✅ Hash test before save:', testBeforeSave);

    const newUser = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password_hash: hashedPassword,
      role: 'college_admin',
      college_id: college.id,
      is_active: true,
      email_verified: true
    });

    console.log('✅ User created:', newUser.name);

    // Test password after saving
    const testAfterSave = await bcrypt.compare(password, newUser.password_hash);
    console.log('✅ Hash test after save:', testAfterSave);

    // Test by fetching from database
    const fetchedUser = await User.findOne({ where: { email: 'test@example.com' } });
    const testFetched = await bcrypt.compare(password, fetchedUser.password_hash);
    console.log('✅ Hash test after fetch:', testFetched);

    if (testFetched) {
      console.log('🎉 Test user works!');
      console.log('📧 Email: test@example.com');
      console.log('🔑 Password: test123');
    }

  } catch (error) {
    console.error('❌ Error creating test user:', error);
  }
}

createTestUser()
  .then(() => {
    console.log('\n✅ Test user created!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Creation failed:', error);
    process.exit(1);
  });
