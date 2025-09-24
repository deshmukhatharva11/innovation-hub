const { User, Idea, IdeaEvaluation } = require('./models');

async function checkEvaluationStatus() {
  try {
    console.log('🔍 Checking Evaluation Status...\n');
    
    // 1. Check recent evaluations
    const recentEvaluations = await IdeaEvaluation.findAll({
      order: [['created_at', 'DESC']],
      limit: 5,
      include: [
        { model: Idea, as: 'idea', attributes: ['id', 'title', 'status'] },
        { model: User, as: 'evaluator', attributes: ['id', 'name', 'email'] }
      ]
    });
    
    console.log('Recent evaluations:');
    recentEvaluations.forEach(eval => {
      console.log(`- Idea: ${eval.idea.title} (${eval.idea.status}) | Evaluator: ${eval.evaluator.name} | Rating: ${eval.rating} | Recommendation: ${eval.recommendation}`);
    });
    
    // 2. Check ideas that need evaluation
    const admin = await User.findOne({
      where: { email: 'admin1@college1.edu', role: 'college_admin' }
    });
    
    const pendingIdeas = await Idea.findAll({
      where: { 
        college_id: admin.college_id,
        status: ['submitted', 'new_submission', 'under_review']
      },
      include: [
        { model: User, as: 'student', attributes: ['id', 'name', 'email'] }
      ]
    });
    
    console.log('\nIdeas needing evaluation:');
    pendingIdeas.forEach(idea => {
      console.log(`- ${idea.title} (${idea.status}) | Student: ${idea.student.name}`);
    });
    
    // 3. Check if evaluation is actually working by looking at the last evaluation
    if (recentEvaluations.length > 0) {
      const lastEval = recentEvaluations[0];
      console.log('\nLast evaluation details:');
      console.log(JSON.stringify(lastEval.toJSON(), null, 2));
    }
    
  } catch (error) {
    console.error('❌ Check failed:', error.message);
  }
}

checkEvaluationStatus();
