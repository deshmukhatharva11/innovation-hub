const { User, College } = require('./models');

async function checkCollegeAdmin() {
  try {
    console.log('🔍 Checking college admin users...');

    const collegeAdmins = await User.findAll({
      where: { role: 'college_admin' },
      include: [{ model: College, as: 'college' }]
    });

    console.log(`Found ${collegeAdmins.length} college admins:`);
    
    collegeAdmins.forEach(admin => {
      console.log(`- ${admin.name} (${admin.email}) - College: ${admin.college?.name || 'No college'}`);
    });

    if (collegeAdmins.length === 0) {
      console.log('\n⚠️ No college admins found. Creating one...');
      
      // Get first college
      const college = await College.findOne();
      if (!college) {
        console.log('❌ No colleges found. Please create a college first.');
        return;
      }

      // Create college admin
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      const newAdmin = await User.create({
        name: 'College Admin',
        email: 'admin@college1.edu',
        password_hash: hashedPassword,
        role: 'college_admin',
        college_id: college.id,
        is_active: true
      });

      console.log(`✅ Created college admin: ${newAdmin.name} (${newAdmin.email})`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkCollegeAdmin().then(() => {
  console.log('\n✅ Script completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});
