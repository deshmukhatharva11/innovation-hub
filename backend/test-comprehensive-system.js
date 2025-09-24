const { Idea, User, College, Incubator, PreIncubatee, Document } = require('./models');

async function testComprehensiveSystem() {
  try {
    console.log('🧪 Testing Comprehensive System Issues...\n');

    // Test 1: Check Ideas API
    console.log('📋 Test 1: Checking Ideas API');
    const ideas = await Idea.findAll({
      include: [
        { model: User, as: 'student', attributes: ['id', 'name', 'email'] },
        { model: College, as: 'college', attributes: ['id', 'name', 'district', 'state'] }
      ],
      limit: 5
    });

    console.log(`✅ Found ${ideas.length} ideas:`);
    ideas.forEach((idea, index) => {
      console.log(`   ${index + 1}. ${idea.title}`);
      console.log(`      Status: ${idea.status}`);
      console.log(`      Student: ${idea.student?.name}`);
      console.log(`      College: ${idea.college?.name}`);
      console.log(`      District: ${idea.college?.district}, ${idea.college?.state}`);
    });

    // Test 2: Check Pre-Incubatees
    console.log('\n📋 Test 2: Checking Pre-Incubatees');
    const preIncubatees = await PreIncubatee.findAll({
      include: [
        { model: Idea, as: 'idea', attributes: ['id', 'title', 'status'] },
        { model: User, as: 'student', attributes: ['id', 'name', 'email'] },
        { model: College, as: 'college', attributes: ['id', 'name', 'district'] },
        { model: Incubator, as: 'incubator', attributes: ['id', 'name'] }
      ]
    });

    console.log(`✅ Found ${preIncubatees.length} pre-incubatees:`);
    preIncubatees.forEach((preInc, index) => {
      console.log(`   ${index + 1}. ${preInc.idea?.title}`);
      console.log(`      Status: ${preInc.status}`);
      console.log(`      Phase: ${preInc.current_phase}`);
      console.log(`      Student: ${preInc.student?.name}`);
      console.log(`      College: ${preInc.college?.name}`);
      console.log(`      Incubator: ${preInc.incubator?.name}`);
    });

    // Test 3: Check College-Admin to Incubator Relationship
    console.log('\n📋 Test 3: Checking College-Admin to Incubator Relationship');
    const collegeAdmins = await User.findAll({
      where: { role: 'college_admin' },
      include: [{ model: College, as: 'college', attributes: ['id', 'name', 'district', 'state'] }]
    });

    const incubatorManagers = await User.findAll({
      where: { role: 'incubator_manager' },
      include: [{ model: Incubator, as: 'incubator', attributes: ['id', 'name'] }]
    });

    console.log(`✅ College Admins: ${collegeAdmins.length}`);
    collegeAdmins.forEach((admin, index) => {
      console.log(`   ${index + 1}. ${admin.name} - ${admin.college?.name}`);
      console.log(`      District: ${admin.college?.district}, ${admin.college?.state}`);
    });

    console.log(`✅ Incubator Managers: ${incubatorManagers.length}`);
    incubatorManagers.forEach((manager, index) => {
      console.log(`   ${index + 1}. ${manager.name} - ${manager.incubator?.name}`);
    });

    // Test 4: Check Students by College
    console.log('\n📋 Test 4: Checking Students by College');
    const students = await User.findAll({
      where: { role: 'student' },
      include: [{ model: College, as: 'college', attributes: ['id', 'name', 'district', 'state'] }]
    });

    // Group students by college
    const studentsByCollege = {};
    students.forEach(student => {
      const collegeName = student.college?.name || 'Unknown';
      if (!studentsByCollege[collegeName]) {
        studentsByCollege[collegeName] = [];
      }
      studentsByCollege[collegeName].push(student);
    });

    console.log(`✅ Students by College:`);
    Object.keys(studentsByCollege).forEach(collegeName => {
      console.log(`   ${collegeName}: ${studentsByCollege[collegeName].length} students`);
      studentsByCollege[collegeName].forEach(student => {
        console.log(`      - ${student.name} (${student.department || 'N/A'}) - GPA: ${student.gpa || 'N/A'}`);
      });
    });

    // Test 5: Check Ideas by District
    console.log('\n📋 Test 5: Checking Ideas by District');
    const ideasByDistrict = {};
    ideas.forEach(idea => {
      const district = idea.college?.district || 'Unknown';
      if (!ideasByDistrict[district]) {
        ideasByDistrict[district] = [];
      }
      ideasByDistrict[district].push(idea);
    });

    console.log(`✅ Ideas by District:`);
    Object.keys(ideasByDistrict).forEach(district => {
      console.log(`   ${district}: ${ideasByDistrict[district].length} ideas`);
      ideasByDistrict[district].forEach(idea => {
        console.log(`      - ${idea.title} (${idea.college?.name})`);
      });
    });

    // Test 6: Check Documents by Access Level
    console.log('\n📋 Test 6: Checking Documents by Access Level');
    const documents = await Document.findAll({
      where: { is_active: true },
      include: [
        { model: User, as: 'uploader', attributes: ['name'] },
        { model: College, as: 'college', attributes: ['name', 'district'] }
      ]
    });

    const docsByAccessLevel = {};
    documents.forEach(doc => {
      const accessLevel = doc.access_level || 'unknown';
      if (!docsByAccessLevel[accessLevel]) {
        docsByAccessLevel[accessLevel] = [];
      }
      docsByAccessLevel[accessLevel].push(doc);
    });

    console.log(`✅ Documents by Access Level:`);
    Object.keys(docsByAccessLevel).forEach(accessLevel => {
      console.log(`   ${accessLevel}: ${docsByAccessLevel[accessLevel].length} documents`);
      docsByAccessLevel[accessLevel].forEach(doc => {
        console.log(`      - ${doc.title} (${doc.college?.name || 'N/A'})`);
      });
    });

    console.log('\n🎉 Comprehensive System Test Completed!');
    console.log('\n📋 Summary:');
    console.log(`✅ Ideas: ${ideas.length} found`);
    console.log(`✅ Pre-Incubatees: ${preIncubatees.length} found`);
    console.log(`✅ College Admins: ${collegeAdmins.length} found`);
    console.log(`✅ Incubator Managers: ${incubatorManagers.length} found`);
    console.log(`✅ Students: ${students.length} found`);
    console.log(`✅ Documents: ${documents.length} found`);

  } catch (error) {
    console.error('❌ Error testing comprehensive system:', error);
  }
}

testComprehensiveSystem()
  .then(() => {
    console.log('\n🎉 Test completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Test failed:', error);
    process.exit(1);
  });
