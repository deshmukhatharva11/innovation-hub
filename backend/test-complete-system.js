const { sequelize } = require('./config/database');
const { User, College, Idea, PreIncubatee, Incubator } = require('./models');

async function testCompleteSystem() {
  try {
    console.log('🧪 Testing complete system...');
    
    // Test 1: Check database connection
    console.log('\n1️⃣ Testing database connection...');
    await sequelize.authenticate();
    console.log('✅ Database connected');
    
    // Test 2: Check data exists
    console.log('\n2️⃣ Checking data exists...');
    const userCount = await User.count();
    const collegeCount = await College.count();
    const ideaCount = await Idea.count();
    const preIncubateeCount = await PreIncubatee.count();
    const incubatorCount = await Incubator.count();
    
    console.log(`📊 Data Summary:`);
    console.log(`   - Users: ${userCount}`);
    console.log(`   - Colleges: ${collegeCount}`);
    console.log(`   - Ideas: ${ideaCount}`);
    console.log(`   - Pre-incubatees: ${preIncubateeCount}`);
    console.log(`   - Incubators: ${incubatorCount}`);
    
    // Test 3: Check incubator manager
    console.log('\n3️⃣ Checking incubator manager...');
    const incubatorManager = await User.findOne({
      where: { role: 'incubator_manager' },
      include: [{ model: Incubator, as: 'incubator' }]
    });
    
    if (incubatorManager) {
      console.log(`✅ Incubator Manager: ${incubatorManager.name} (${incubatorManager.email})`);
      console.log(`   - Incubator ID: ${incubatorManager.incubator_id}`);
      console.log(`   - Incubator Name: ${incubatorManager.incubator?.name}`);
    } else {
      console.log('❌ No incubator manager found');
    }
    
    // Test 4: Check pre-incubatees for incubator
    console.log('\n4️⃣ Checking pre-incubatees...');
    if (incubatorManager?.incubator_id) {
      const preIncubatees = await PreIncubatee.findAll({
        where: { incubator_id: incubatorManager.incubator_id },
        include: [
          { model: Idea, as: 'idea' },
          { model: User, as: 'student' },
          { model: College, as: 'college' }
        ],
        limit: 5
      });
      
      console.log(`✅ Found ${preIncubatees.length} pre-incubatees for incubator ${incubatorManager.incubator_id}`);
      preIncubatees.forEach((pi, index) => {
        console.log(`   ${index + 1}. ${pi.idea?.title} by ${pi.student?.name} from ${pi.college?.name}`);
      });
    }
    
    // Test 5: Check endorsed ideas
    console.log('\n5️⃣ Checking endorsed ideas...');
    const endorsedIdeas = await Idea.findAll({
      where: { status: 'endorsed' },
      include: [
        { model: User, as: 'student' },
        { model: College, as: 'college' }
      ],
      limit: 5
    });
    
    console.log(`✅ Found ${endorsedIdeas.length} endorsed ideas`);
    endorsedIdeas.forEach((idea, index) => {
      console.log(`   ${index + 1}. ${idea.title} by ${idea.student?.name} from ${idea.college?.name}`);
    });
    
    // Test 6: Check college admins
    console.log('\n6️⃣ Checking college admins...');
    const collegeAdmins = await User.findAll({
      where: { role: 'college_admin' },
      include: [{ model: College, as: 'college' }],
      limit: 5
    });
    
    console.log(`✅ Found ${collegeAdmins.length} college admins`);
    collegeAdmins.forEach((admin, index) => {
      console.log(`   ${index + 1}. ${admin.name} (${admin.email}) - College: ${admin.college?.name}`);
    });
    
    console.log('\n🎉 System test completed successfully!');
    console.log('\n📋 Next Steps:');
    console.log('1. Start the frontend: cd frontend && npm start');
    console.log('2. Login with any of the provided credentials');
    console.log('3. Test the complete workflow');
    
  } catch (error) {
    console.error('❌ System test failed:', error);
  }
}

testCompleteSystem().then(() => process.exit(0));
