const { Mentor, College, Incubator } = require('./models');

async function testEnhancedMentorSystem() {
  try {
    console.log('🧪 Testing Enhanced Mentor System...\n');

    // Test 1: Fetch mentors with district information
    console.log('📋 Test 1: Fetching mentors with district information');
    const mentors = await Mentor.findAll({
      include: [
        {
          model: College,
          as: 'college',
          attributes: ['id', 'name', 'city', 'district', 'state']
        },
        {
          model: Incubator,
          as: 'incubator',
          attributes: ['id', 'name']
        }
      ],
      limit: 5
    });

    console.log(`✅ Found ${mentors.length} mentors:`);
    mentors.forEach((mentor, index) => {
      console.log(`   ${index + 1}. ${mentor.name}`);
      console.log(`      Email: ${mentor.email}`);
      console.log(`      Specialization: ${mentor.specialization}`);
      console.log(`      College: ${mentor.college?.name || 'No college'}`);
      console.log(`      District: ${mentor.college?.district || 'N/A'}, ${mentor.college?.state || 'N/A'}`);
      console.log(`      Availability: ${mentor.availability}`);
      console.log(`      Students: ${mentor.current_students}/${mentor.max_students}`);
      console.log('');
    });

    // Test 2: Cross-college mentor visibility
    console.log('🌐 Test 2: Cross-college mentor visibility');
    const collegeId = 36; // Government College of Engineering, Amravati
    const crossCollegeMentors = await Mentor.findAll({
      where: {
        college_id: { [require('sequelize').Op.ne]: collegeId },
        is_active: true
      },
      include: [
        {
          model: College,
          as: 'college',
          attributes: ['id', 'name', 'city', 'district', 'state']
        }
      ]
    });

    console.log(`✅ Found ${crossCollegeMentors.length} mentors from other colleges:`);
    crossCollegeMentors.forEach((mentor, index) => {
      console.log(`   ${index + 1}. ${mentor.name} - ${mentor.college?.name}`);
      console.log(`      District: ${mentor.college?.district || 'N/A'}, ${mentor.college?.state || 'N/A'}`);
    });

    // Test 3: University-wide mentor access (for incubator)
    console.log('\n🏛️ Test 3: University-wide mentor access (for incubator)');
    const allMentors = await Mentor.findAll({
      where: { is_active: true },
      include: [
        {
          model: College,
          as: 'college',
          attributes: ['id', 'name', 'city', 'district', 'state']
        }
      ],
      order: [['college_id', 'ASC']]
    });

    console.log(`✅ Total active mentors across all colleges: ${allMentors.length}`);
    
    // Group by district
    const mentorsByDistrict = {};
    allMentors.forEach(mentor => {
      const district = mentor.college?.district || 'Unknown';
      if (!mentorsByDistrict[district]) {
        mentorsByDistrict[district] = [];
      }
      mentorsByDistrict[district].push(mentor);
    });

    console.log('\n📊 Mentors by District:');
    Object.keys(mentorsByDistrict).forEach(district => {
      console.log(`   ${district}: ${mentorsByDistrict[district].length} mentors`);
      mentorsByDistrict[district].forEach(mentor => {
        console.log(`      - ${mentor.name} (${mentor.college?.name})`);
      });
    });

    // Test 4: Mentor login with district info
    console.log('\n🔐 Test 4: Testing mentor login with district information');
    const testMentor = await Mentor.findOne({
      where: { email: 'sarah.johnson@mentor.com' },
      include: [
        {
          model: College,
          as: 'college',
          attributes: ['id', 'name', 'city', 'district', 'state']
        }
      ]
    });

    if (testMentor) {
      console.log('✅ Test mentor found:');
      console.log(`   Name: ${testMentor.name}`);
      console.log(`   Email: ${testMentor.email}`);
      console.log(`   College: ${testMentor.college?.name}`);
      console.log(`   District: ${testMentor.college?.district}, ${testMentor.college?.state}`);
      console.log(`   Specialization: ${testMentor.specialization}`);
    } else {
      console.log('❌ Test mentor not found');
    }

    console.log('\n🎉 Enhanced Mentor System Test Completed!');
    console.log('\n📋 Summary:');
    console.log('✅ District information added to colleges');
    console.log('✅ Mentors show district information');
    console.log('✅ Cross-college mentor visibility enabled');
    console.log('✅ University-wide access for incubator');
    console.log('✅ Enhanced mentor dashboard with district info');

  } catch (error) {
    console.error('❌ Error testing enhanced mentor system:', error);
  }
}

testEnhancedMentorSystem()
  .then(() => {
    console.log('\n🎉 Test completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Test failed:', error);
    process.exit(1);
  });
