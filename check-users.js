const { User } = require('./backend/models');
const bcrypt = require('bcrypt');

async function checkUsers() {
  try {
    console.log('🔍 Checking users in database...');
    
    const users = await User.findAll({
      where: { role: 'college_admin' },
      attributes: ['id', 'name', 'email', 'role', 'is_active']
    });
    
    console.log('📋 College Admin Users:');
    users.forEach(user => {
      console.log(`- ID: ${user.id}, Name: ${user.name}, Email: ${user.email}, Active: ${user.is_active}`);
    });
    
    if (users.length === 0) {
      console.log('❌ No college admin users found!');
      
      // Create a test college admin user
      console.log('🔧 Creating test college admin user...');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      const newUser = await User.create({
        name: 'Test College Admin',
        email: 'admin1@college1.edu',
        password_hash: hashedPassword,
        role: 'college_admin',
        college_id: 1,
        is_active: true
      });
      
      console.log('✅ Created test user:', newUser.email);
    }
    
  } catch (error) {
    console.error('❌ Error checking users:', error);
  }
}

checkUsers();
