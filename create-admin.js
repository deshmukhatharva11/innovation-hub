const { User } = require('./models');
const bcrypt = require('bcryptjs');

async function createAdmin() {
  try {
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const admin = await User.create({
      email: 'test@admin.com',
      password: hashedPassword,
      role: 'college_admin',
      college_id: 1,
      first_name: 'Test',
      last_name: 'Admin',
      is_active: true
    });
    
    console.log('✅ Admin created:', admin.dataValues);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createAdmin();
