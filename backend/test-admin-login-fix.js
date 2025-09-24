const bcrypt = require('bcryptjs');
const { User } = require('./models');

async function testAdminLoginFix() {
  try {
    console.log('🔍 Testing admin login fix...\n');

    // Find the admin user
    const admin = await User.findOne({
      where: { email: 'admin1@college1.edu' }
    });

    if (admin) {
      console.log(`👨‍💼 Found admin: ${admin.name} (${admin.email})`);
      console.log(`   Role: ${admin.role}`);
      console.log(`   Active: ${admin.is_active}`);
      console.log(`   Password hash: ${admin.password_hash ? 'Present' : 'Missing'}`);
      
      if (admin.password_hash) {
        // Test the password
        const testPassword = 'admin123';
        const isValid = await bcrypt.compare(testPassword, admin.password_hash);
        console.log(`   Password '${testPassword}' is valid: ${isValid}`);
        
        if (!isValid) {
          // Reset password with proper hashing
          console.log('\n🔄 Resetting admin password...');
          const newPassword = 'admin123';
          const hashedPassword = await bcrypt.hash(newPassword, 10);
          
          // Update password directly in database
          await admin.update({ password_hash: hashedPassword }, { 
            hooks: false,
            individualHooks: false 
          });
          
          console.log(`✅ Password reset for ${admin.name}`);
          
          // Verify the new password
          const newAdmin = await User.findOne({
            where: { email: 'admin1@college1.edu' }
          });
          
          const verifyPassword = await bcrypt.compare(newPassword, newAdmin.password_hash);
          console.log(`   Verification: ${verifyPassword ? '✅ Valid' : '❌ Invalid'}`);
          
          // Also ensure admin is active
          await newAdmin.update({ is_active: true });
          console.log(`   Account status: Active`);
          
        } else {
          console.log('✅ Password is already correct');
        }
      } else {
        console.log('❌ No password hash found');
      }
    } else {
      console.log('❌ Admin not found');
      
      // Check all admins
      console.log('\n📋 All college admins:');
      const allAdmins = await User.findAll({
        where: { role: 'college_admin' },
        attributes: ['id', 'name', 'email', 'is_active']
      });

      allAdmins.forEach(admin => {
        console.log(`- ${admin.name} (${admin.email}) - Active: ${admin.is_active}`);
      });
    }

    console.log('\n🎉 Admin login fix completed!');
    console.log('📝 Login credentials:');
    console.log('   Email: admin1@college1.edu');
    console.log('   Password: admin123');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testAdminLoginFix().then(() => {
  console.log('\n✅ Script completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});
