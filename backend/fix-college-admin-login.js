const { sequelize } = require('./config/database');
const { User, College, Incubator } = require('./models');

async function fixCollegeAdminLogin() {
  try {
    console.log('🔧 Fixing college admin login issues...');
    
    // Get the incubator
    const incubator = await Incubator.findOne({ where: { name: 'Amravati Innovation Hub' } });
    if (!incubator) {
      console.log('❌ No incubator found');
      return;
    }
    
    // Update all college admins to have the correct incubator_id
    const collegeAdmins = await User.findAll({
      where: { role: 'college_admin' }
    });
    
    console.log(`📝 Found ${collegeAdmins.length} college admins`);
    
    for (const admin of collegeAdmins) {
      await admin.update({
        incubator_id: incubator.id
      });
      console.log(`✅ Updated admin ${admin.email} with incubator_id ${incubator.id}`);
    }
    
    // Also ensure all students have incubator_id
    const students = await User.findAll({
      where: { role: 'student' }
    });
    
    console.log(`📝 Found ${students.length} students`);
    
    for (const student of students) {
      if (!student.incubator_id) {
        await student.update({
          incubator_id: incubator.id
        });
        console.log(`✅ Updated student ${student.email} with incubator_id ${incubator.id}`);
      }
    }
    
    console.log('✅ College admin login issues fixed successfully');
  } catch (error) {
    console.error('❌ Error fixing college admin login:', error);
  }
}

fixCollegeAdminLogin().then(() => process.exit(0));
