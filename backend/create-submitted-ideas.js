const { User, Idea, College } = require('./models');

async function createSubmittedIdeas() {
  try {
    console.log('🔄 Creating submitted ideas for testing...');

    // Get a student to create ideas for
    const student = await User.findOne({
      where: { role: 'student' },
      include: [{ model: College, as: 'college' }]
    });

    if (!student) {
      console.log('❌ No student found. Please create a student first.');
      return;
    }

    console.log(`📚 Found student: ${student.name} (${student.email})`);

    // Create multiple submitted ideas
    const submittedIdeas = [
      {
        title: 'AI-Powered Study Assistant',
        description: 'An intelligent study assistant that helps students organize their learning materials and track progress.',
        problem_statement: 'Students struggle to organize their study materials and track their learning progress effectively.',
        solution_approach: 'Develop an AI-powered app that categorizes study materials and provides personalized learning recommendations.',
        category: 'Education',
        status: 'submitted',
        student_id: student.id,
        college_id: student.college_id,
        tech_stack: ['React', 'Node.js', 'Python', 'TensorFlow'],
        target_audience: 'College students',
        business_model: 'Freemium with premium features',
        expected_outcome: 'Improved student academic performance',
        is_public: true,
        submitted_at: new Date()
      },
      {
        title: 'Smart Campus Navigation',
        description: 'A mobile app that provides real-time navigation and information about campus facilities.',
        problem_statement: 'New students and visitors often get lost on campus and struggle to find specific buildings or facilities.',
        solution_approach: 'Create an AR-based navigation app with real-time updates about campus events and facility availability.',
        category: 'Technology',
        status: 'submitted',
        student_id: student.id,
        college_id: student.college_id,
        tech_stack: ['React Native', 'ARCore', 'Google Maps API'],
        target_audience: 'Campus visitors and new students',
        business_model: 'Ad-supported with premium features',
        expected_outcome: 'Improved campus experience and reduced confusion',
        is_public: true,
        submitted_at: new Date()
      },
      {
        title: 'Sustainable Food Waste Management',
        description: 'A platform connecting restaurants with food banks to reduce food waste.',
        problem_statement: 'Restaurants waste significant amounts of food while many people go hungry.',
        solution_approach: 'Create a platform that connects restaurants with local food banks and charities for food donation.',
        category: 'Social Impact',
        status: 'submitted',
        student_id: student.id,
        college_id: student.college_id,
        tech_stack: ['Vue.js', 'Express.js', 'PostgreSQL'],
        target_audience: 'Restaurants and food banks',
        business_model: 'Commission-based model',
        expected_outcome: 'Reduced food waste and increased food security',
        is_public: true,
        submitted_at: new Date()
      },
      {
        title: 'Virtual Reality Learning Platform',
        description: 'An immersive VR platform for interactive learning experiences.',
        problem_statement: 'Traditional learning methods are not engaging enough for modern students.',
        solution_approach: 'Develop VR experiences for various subjects to make learning more interactive and engaging.',
        category: 'Education',
        status: 'submitted',
        student_id: student.id,
        college_id: student.college_id,
        tech_stack: ['Unity', 'C#', 'WebXR'],
        target_audience: 'Educational institutions',
        business_model: 'Subscription-based SaaS',
        expected_outcome: 'Improved learning outcomes and student engagement',
        is_public: true,
        submitted_at: new Date()
      },
      {
        title: 'Blockchain-based Certificate Verification',
        description: 'A decentralized system for verifying academic certificates and credentials.',
        problem_statement: 'Certificate fraud is a growing problem in education and employment.',
        solution_approach: 'Use blockchain technology to create tamper-proof digital certificates.',
        category: 'Technology',
        status: 'submitted',
        student_id: student.id,
        college_id: student.college_id,
        tech_stack: ['Ethereum', 'Solidity', 'Web3.js'],
        target_audience: 'Educational institutions and employers',
        business_model: 'Transaction fees for certificate verification',
        expected_outcome: 'Reduced certificate fraud and improved trust',
        is_public: true,
        submitted_at: new Date()
      }
    ];

    // Create the ideas
    for (const ideaData of submittedIdeas) {
      const idea = await Idea.create(ideaData);
      console.log(`✅ Created idea: ${idea.title} (ID: ${idea.id})`);
    }

    console.log(`\n🎉 Successfully created ${submittedIdeas.length} submitted ideas!`);
    console.log('📋 Ideas created:');
    submittedIdeas.forEach((idea, index) => {
      console.log(`${index + 1}. ${idea.title} - ${idea.category}`);
    });

    console.log('\n🔍 You can now test the Review Ideas page to see these submissions.');

  } catch (error) {
    console.error('❌ Error creating submitted ideas:', error);
  }
}

// Run the script
createSubmittedIdeas().then(() => {
  console.log('\n✅ Script completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});
