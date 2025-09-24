const { User, Idea } = require('./models');

async function createTestIdea() {
  try {
    console.log('🔍 Creating Test Idea...\n');
    
    // 1. Find a student
    const student = await User.findOne({
      where: { 
        email: 'student1@college1.edu',
        role: 'student'
      }
    });
    
    if (!student) {
      throw new Error('Student not found');
    }
    
    console.log('✅ Student found:', student.name, student.id);
    
    // 2. Create a new idea
    const idea = await Idea.create({
      title: 'Test Evaluation Idea',
      description: 'This is a test idea for evaluation testing',
      category: 'Technology',
      status: 'submitted',
      student_id: student.id,
      college_id: student.college_id,
      team_size: 2,
      funding_required: 30000,
      timeline: '6 months',
      problem_statement: 'Testing the evaluation system',
      solution_approach: 'Automated testing and validation',
      market_potential: 'High potential market',
      tech_stack: JSON.stringify(['React', 'Node.js']),
      team_members: JSON.stringify([
        { name: 'Test Member', role: 'Developer', email: 'test@example.com' }
      ]),
      implementation_plan: 'Step by step implementation plan',
      technical_feasibility: 'High',
      business_model: 'SaaS',
      competitive_analysis: 'Limited competition',
      risk_assessment: 'Low',
      success_metrics: ['User adoption', 'Revenue growth'],
      tags: ['testing', 'evaluation'],
      submission_date: new Date(),
      is_public: true
    });
    
    console.log('✅ Test idea created:', idea.title, idea.id, idea.status);
    
  } catch (error) {
    console.error('❌ Failed to create test idea:', error.message);
  }
}

createTestIdea();
