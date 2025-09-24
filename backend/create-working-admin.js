const { sequelize, User, College } = require('./models');
const bcrypt = require('bcryptjs');

async function createWorkingAdmin() {
  try {
    console.log('🔧 Creating working admin...');

    // Find college
    const college = await College.findOne({
      where: { name: 'Government College of Engineering, Amravati' }
    });

    if (!college) {
      console.log('❌ College not found');
      return;
    }

    // Create a new admin with different email
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newAdmin = await User.create({
      name: 'Working Admin',
      email: 'admin@test.com',
      password_hash: hashedPassword,
      role: 'college_admin',
      college_id: college.id,
      is_active: true,
      email_verified: true
    });

    console.log('✅ New admin created:', newAdmin.name);

    // Test password
    const isValidPassword = await bcrypt.compare(password, hashedPassword);
    console.log('✅ Password verification:', isValidPassword);

    if (isValidPassword) {
      console.log('🎉 Working admin created!');
      console.log('📧 Email: admin@test.com');
      console.log('🔑 Password: password123');
    }

  } catch (error) {
    console.error('❌ Error creating working admin:', error);
  }
}

createWorkingAdmin()
  .then(() => {
    console.log('\n✅ Working admin created!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Creation failed:', error);
    process.exit(1);
  });
