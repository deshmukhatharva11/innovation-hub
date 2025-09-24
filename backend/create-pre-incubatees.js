const { Idea, User, College, Incubator, PreIncubatee } = require('./models');

async function createPreIncubatees() {
  try {
    console.log('🔧 Creating Pre-Incubatees from incubated ideas...\n');

    // Find incubated ideas
    const incubatedIdeas = await Idea.findAll({
      where: { status: 'incubated' },
      include: [
        { model: User, as: 'student', attributes: ['id', 'name', 'email'] },
        { model: College, as: 'college', attributes: ['id', 'name'] }
      ]
    });

    console.log(`✅ Found ${incubatedIdeas.length} incubated ideas`);

    if (incubatedIdeas.length === 0) {
      console.log('❌ No incubated ideas found to create pre-incubatees');
      return;
    }

    // Find incubator managers
    const incubatorManagers = await User.findAll({
      where: { role: 'incubator_manager' },
      include: [{ model: Incubator, as: 'incubator', attributes: ['id', 'name'] }]
    });

    if (incubatorManagers.length === 0) {
      console.log('❌ No incubator managers found');
      return;
    }

    const primaryIncubator = incubatorManagers[0];
    console.log(`✅ Using incubator: ${primaryIncubator.incubator?.name}`);

    // Create pre-incubatees
    for (const idea of incubatedIdeas) {
      // Check if pre-incubatee already exists
      const existingPreIncubatee = await PreIncubatee.findOne({
        where: { idea_id: idea.id }
      });

      if (existingPreIncubatee) {
        console.log(`⚠️ Pre-incubatee already exists for idea: ${idea.title}`);
        continue;
      }

      // Create pre-incubatee
      const preIncubatee = await PreIncubatee.create({
        idea_id: idea.id,
        student_id: idea.student_id,
        college_id: idea.college_id,
        incubator_id: primaryIncubator.incubator_id,
        status: 'active',
        current_phase: 'ideation',
        progress_percentage: 10,
        funding_received: 0,
        funding_target: idea.funding_requirement || 100000,
        milestones_completed: 0,
        total_milestones: 5,
        start_date: new Date(),
        expected_completion_date: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000), // 6 months from now
        notes: `Pre-incubatee created from incubated idea: ${idea.title}`
      });

      console.log(`✅ Created pre-incubatee for idea: ${idea.title}`);
      console.log(`   Student: ${idea.student?.name}`);
      console.log(`   College: ${idea.college?.name}`);
      console.log(`   Status: ${preIncubatee.status}`);
      console.log(`   Phase: ${preIncubatee.current_phase}`);
      console.log(`   Progress: ${preIncubatee.progress_percentage}%`);
    }

    // Verify created pre-incubatees
    const allPreIncubatees = await PreIncubatee.findAll({
      include: [
        { model: Idea, as: 'idea', attributes: ['id', 'title', 'status'] },
        { model: User, as: 'student', attributes: ['id', 'name'] },
        { model: College, as: 'college', attributes: ['id', 'name', 'district'] },
        { model: Incubator, as: 'incubator', attributes: ['id', 'name'] }
      ]
    });

    console.log(`\n✅ Total pre-incubatees created: ${allPreIncubatees.length}`);
    allPreIncubatees.forEach((preInc, index) => {
      console.log(`   ${index + 1}. ${preInc.idea?.title}`);
      console.log(`      Student: ${preInc.student?.name}`);
      console.log(`      College: ${preInc.college?.name} (${preInc.college?.district})`);
      console.log(`      Status: ${preInc.status}, Phase: ${preInc.current_phase}`);
      console.log(`      Progress: ${preInc.progress_percentage}%`);
    });

    console.log('\n🎉 Pre-Incubatees creation completed successfully!');

  } catch (error) {
    console.error('❌ Error creating pre-incubatees:', error);
  }
}

createPreIncubatees()
  .then(() => {
    console.log('\n🎉 Process completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Process failed:', error);
    process.exit(1);
  });
