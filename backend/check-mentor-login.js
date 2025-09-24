const { Mentor, College, Incubator } = require('./models');

async function checkMentorLogin() {
  try {
    console.log('🔍 Checking Mentor Login System...\n');
    
    // Get all mentors
    const mentors = await Mentor.findAll({
      include: [
        {
          model: College,
          as: 'college',
          attributes: ['id', 'name', 'district']
        },
        {
          model: Incubator,
          as: 'incubator',
          attributes: ['id', 'name']
        }
      ]
    });
    
    if (mentors.length === 0) {
      console.log('❌ No mentors found in the system.');
      console.log('💡 You need to create mentors first using the College Admin or Incubator Manager interface.');
      return;
    }
    
    console.log(`✅ Found ${mentors.length} mentors in the system:\n`);
    
    mentors.forEach((mentor, index) => {
      console.log(`${index + 1}. Mentor Details:`);
      console.log(`   Name: ${mentor.name}`);
      console.log(`   Email: ${mentor.email}`);
      console.log(`   Specialization: ${mentor.specialization}`);
      console.log(`   Experience: ${mentor.experience_years} years`);
      console.log(`   Availability: ${mentor.availability}`);
      console.log(`   Active: ${mentor.is_active ? 'Yes' : 'No'}`);
      
      if (mentor.college) {
        console.log(`   College: ${mentor.college.name} (${mentor.college.district})`);
      }
      if (mentor.incubator) {
        console.log(`   Incubator: ${mentor.incubator.name}`);
      }
      
      console.log(`   Login URL: http://localhost:3000/login`);
      console.log(`   Login Type: Select "Mentor" in the login form`);
      console.log(`   Email: ${mentor.email}`);
      console.log(`   Password: [The password you set when creating this mentor]`);
      console.log('');
    });
    
    console.log('🔐 How to Login as a Mentor:');
    console.log('1. Go to: http://localhost:3000/login');
    console.log('2. Select "Mentor" from the "Login As" options');
    console.log('3. Enter the mentor email and password');
    console.log('4. Click "Sign In"');
    console.log('');
    console.log('📝 Note: Each mentor has an independent login with their own email and password.');
    console.log('   The password was set when the mentor was created by a College Admin or Incubator Manager.');
    console.log('');
    console.log('🎯 Mentor Dashboard Features:');
    console.log('- View students from their assigned college');
    console.log('- View students from other colleges');
    console.log('- Chat with assigned students');
    console.log('- Manage their profile and availability');
    
  } catch (error) {
    console.error('❌ Error checking mentor login:', error);
  }
}

checkMentorLogin();
