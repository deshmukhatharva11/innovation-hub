const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

// Database connection
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, 'database.sqlite'),
  logging: false
});

async function fixWorkflowStages() {
  try {
    console.log('🔍 Checking and fixing workflow stages in database...\n');
    
    // Connect to database
    await sequelize.authenticate();
    console.log('✅ Connected to database');
    
    // Get all ideas with their current status and workflow_stage
    const [ideas] = await sequelize.query(`
      SELECT id, title, status, workflow_stage, college_id 
      FROM ideas 
      WHERE college_id = 94
      ORDER BY id
    `);
    
    console.log(`📊 Found ${ideas.length} ideas in college 94:\n`);
    
    // Check each idea and fix workflow_stage if needed
    let fixedCount = 0;
    
    for (const idea of ideas) {
      console.log(`Idea ${idea.id}: "${idea.title}"`);
      console.log(`   Current status: ${idea.status}`);
      console.log(`   Current workflow_stage: ${idea.workflow_stage}`);
      
      // Determine correct workflow_stage based on status
      let correctWorkflowStage = '';
      switch (idea.status) {
        case 'submitted':
        case 'new_submission':
          correctWorkflowStage = 'submission';
          break;
        case 'nurture':
          correctWorkflowStage = 'nurture';
          break;
        case 'pending_review':
          correctWorkflowStage = 'pending_review';
          break;
        case 'under_review':
        case 'updated_pending_review':
          correctWorkflowStage = 'review';
          break;
        case 'needs_development':
          correctWorkflowStage = 'development';
          break;
        case 'endorsed':
          correctWorkflowStage = 'endorsement';
          break;
        case 'forwarded_to_incubation':
        case 'incubated':
          correctWorkflowStage = 'incubation';
          break;
        case 'rejected':
          correctWorkflowStage = 'rejected';
          break;
        default:
          correctWorkflowStage = idea.workflow_stage; // Keep current if unknown
      }
      
      if (idea.workflow_stage !== correctWorkflowStage) {
        console.log(`   ❌ MISMATCH! Should be: ${correctWorkflowStage}`);
        
        // Update the workflow_stage
        await sequelize.query(`
          UPDATE ideas 
          SET workflow_stage = '${correctWorkflowStage}' 
          WHERE id = ${idea.id}
        `);
        
        console.log(`   ✅ Fixed: ${idea.workflow_stage} → ${correctWorkflowStage}`);
        fixedCount++;
      } else {
        console.log(`   ✅ Correct workflow_stage`);
      }
      console.log('');
    }
    
    console.log(`🎉 Fixed ${fixedCount} ideas with incorrect workflow_stage`);
    
    // Verify the fix by checking each stage
    console.log('\n📊 Verifying fix by checking each stage:');
    const stages = ['submission', 'nurture', 'pending_review', 'review', 'development', 'endorsement', 'incubation'];
    
    for (const stage of stages) {
      const [stageIdeas] = await sequelize.query(`
        SELECT id, title, status, workflow_stage 
        FROM ideas 
        WHERE college_id = 94 AND workflow_stage = '${stage}'
        ORDER BY id
      `);
      
      console.log(`\n${stage.toUpperCase()} stage (${stageIdeas.length} ideas):`);
      stageIdeas.forEach(idea => {
        console.log(`   - "${idea.title}" (status: ${idea.status})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sequelize.close();
  }
}

fixWorkflowStages();
