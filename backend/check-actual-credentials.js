const { User } = require('./models');
const bcrypt = require('bcryptjs');

async function checkActualCredentials() {
  try {
    console.log('🔍 Checking actual credentials in database...');
    
    // Find all users
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'role', 'college_id', 'is_active'],
      order: [['id', 'ASC']]
    });
    
    console.log('\n📋 All users in database:');
    users.forEach(user => {
      console.log(`ID: ${user.id} | Name: ${user.name} | Email: ${user.email} | Role: ${user.role} | College ID: ${user.college_id} | Active: ${user.is_active}`);
    });
    
    // Test login for each user
    console.log('\n🔐 Testing login for each user...');
    for (const user of users) {
      try {
        // Get the actual password hash
        const fullUser = await User.findByPk(user.id, {
          attributes: ['id', 'email', 'password_hash']
        });
        
        if (fullUser) {
          // Test with common passwords
          const passwords = ['password123', 'password', 'admin123', '123456', 'test123'];
          
          for (const password of passwords) {
            const isValid = await bcrypt.compare(password, fullUser.password_hash);
            if (isValid) {
              console.log(`✅ Working credentials: ${user.email} / ${password} (Role: ${user.role})`);
            }
          }
        }
      } catch (error) {
        console.log(`❌ Error testing ${user.email}:`, error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Error checking credentials:', error);
  }
}

checkActualCredentials();
