const { User, Idea, IdeaEvaluation } = require('./models');

async function testDirectEvaluation() {
  try {
    console.log('🔍 Testing Direct Evaluation...\n');
    
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
    
    // 4. Create evaluation with minimal data
    console.log('\n4. Creating evaluation with minimal data...');
    const evaluation = await IdeaEvaluation.create({
      idea_id: idea.id,
      evaluator_id: admin.id,
      rating: 8,
      comments: 'Great idea with potential',
      recommendation: 'nurture',
      mentor_assigned: null,
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
    
    // 6. Test the API endpoint directly
    console.log('\n6. Testing API endpoint...');
    const axios = require('axios');
    
    // Login first
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'admin1@college1.edu',
      password: 'password123'
    });
    
    const token = loginResponse.data.data?.token || loginResponse.data.token;
    const authHeaders = { Authorization: `Bearer ${token}` };
    
    // Find another idea to test
    const anotherIdea = await Idea.findOne({
      where: { 
        college_id: admin.college_id,
        status: 'submitted',
        id: { [require('sequelize').Op.ne]: idea.id }
      }
    });
    
    if (anotherIdea) {
      console.log('Testing API with idea:', anotherIdea.title, anotherIdea.id);
      
      try {
        const response = await axios.post(
          `http://localhost:3001/api/college-coordinator/ideas/${anotherIdea.id}/evaluate`,
          {
            rating: 7,
            comments: 'Good idea',
            recommendation: 'forward',
            nurture_notes: 'Ready for next stage'
          },
          { headers: authHeaders }
        );
        console.log('✅ API evaluation successful:', response.data);
      } catch (apiError) {
        console.log('❌ API evaluation failed:');
        console.log('Status:', apiError.response?.status);
        console.log('Data:', JSON.stringify(apiError.response?.data, null, 2));
        console.log('Error:', apiError.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

testDirectEvaluation();
