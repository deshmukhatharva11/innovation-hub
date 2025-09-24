const { User } = require('./models');
const bcrypt = require('bcryptjs');
const { sequelize } = require('./config/database');

async function fixIncubatorPasswords() {
  try {
    console.log('🔧 Fixing incubator manager passwords...');
    
    // Fix the failing manager
    const failingManager = await User.findOne({ 
      where: { email: 'manager@amravatiinnovationhub.com' } 
    });
    
    if (failingManager) {
      const newPassword = 'password123';
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      
      await sequelize.query(
        'UPDATE users SET password_hash = ? WHERE email = ?',
        {
          replacements: [hashedPassword, 'manager@amravatiinnovationhub.com']
        }
      );
      
      console.log('✅ Fixed manager@amravatiinnovationhub.com password');
    }
    
    // Also fix sarah.wilson@incubator.edu to use consistent password
    const sarahManager = await User.findOne({ 
      where: { email: 'sarah.wilson@incubator.edu' } 
    });
    
    if (sarahManager) {
      const newPassword = 'password123';
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      
      await sequelize.query(
        'UPDATE users SET password_hash = ? WHERE email = ?',
        {
          replacements: [hashedPassword, 'sarah.wilson@incubator.edu']
        }
      );
      
      console.log('✅ Fixed sarah.wilson@incubator.edu password');
    }
    
    console.log('\n🎉 Incubator manager passwords standardized!');
    console.log('🔑 All incubator managers now use password: password123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixIncubatorPasswords();
