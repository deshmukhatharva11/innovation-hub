const { User } = require('./models');
const bcrypt = require('bcryptjs');

async function fixCollegeAdminPassword() {
  try {
    console.log('🔧 Fixing college admin password...');

    const admin = await User.findOne({
      where: { email: 'admin1@college1.edu' }
    });

    if (!admin) {
      console.log('❌ College admin not found');
      return;
    }

    // Set password to admin123
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await admin.update({ password_hash: hashedPassword });

    console.log('✅ College admin password updated to: admin123');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

fixCollegeAdminPassword().then(() => {
  console.log('\n✅ Script completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});
