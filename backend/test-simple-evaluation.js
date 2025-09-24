const { User, Idea, IdeaEvaluation } = require('./models');

async function testSimpleEvaluation() {
  try {
    console.log('🔍 Testing Simple Evaluation...\n');
    
    // 1. Find a college admin
    const admin = await User.findOne({
      where: { 
        email: 'admin1@college1.edu',
        role: 'college_admin'
      }
    });
    
    if (!admin) {
      throw new Error('Admin not found');
    }
    
    console.log('✅ Admin found:', admin.name, admin.id);
    
    // 2. Find an idea that needs evaluation
    const idea = await Idea.findOne({
      where: { 
        college_id: admin.college_id,
        status: 'submitted'
      }
    });
    
    if (!idea) {
      throw new Error('No idea found for evaluation');
    }
    
    console.log('✅ Idea found:', idea.title, idea.id, idea.status);
    
    // 3. Check if already evaluated
    const existingEvaluation = await IdeaEvaluation.findOne({
      where: { 
        idea_id: idea.id,
        evaluator_id: admin.id 
      }
    });
    
    if (existingEvaluation) {
      console.log('⚠️ Idea already evaluated by this admin');
      console.log('Evaluation:', existingEvaluation.toJSON());
      return;
    }
    
    // 4. Create evaluation directly
    console.log('\n4. Creating evaluation directly...');
    const evaluation = await IdeaEvaluation.create({
      idea_id: idea.id,
      evaluator_id: admin.id,
      rating: 8,
      comments: 'Great idea with potential',
      recommendation: 'nurture',
      nurture_notes: 'Needs more technical details',
      evaluation_date: new Date()
    });
    
    console.log('✅ Evaluation created:', evaluation.toJSON());
    
    // 5. Update idea status
    await idea.update({ 
      status: 'nurture',
      reviewed_by: admin.id,
      reviewed_at: new Date()
    });
    
    console.log('✅ Idea status updated to:', idea.status);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

testSimpleEvaluation();
