const express = require('express');
const { User, Idea, IdeaEvaluation } = require('./models');
const { authenticateToken, authorizeRoles } = require('./middleware/auth');

const app = express();
app.use(express.json());

// Simple evaluation route without validation
app.post('/test-evaluate/:id', authenticateToken, authorizeRoles('college_admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comments, recommendation, nurture_notes } = req.body;
    const evaluatorId = req.user.id;
    const collegeId = req.user.college_id;

    console.log('Evaluation request:', { id, rating, comments, recommendation, nurture_notes, evaluatorId, collegeId });

    // Check if idea exists
    const idea = await Idea.findOne({
      where: { 
        id: id,
        college_id: collegeId 
      }
    });

    if (!idea) {
      return res.status(404).json({
        success: false,
        message: 'Idea not found'
      });
    }

    // Check if already evaluated
    const existingEvaluation = await IdeaEvaluation.findOne({
      where: { 
        idea_id: id,
        evaluator_id: evaluatorId 
      }
    });

    if (existingEvaluation) {
      return res.status(400).json({
        success: false,
        message: 'Idea already evaluated by this coordinator'
      });
    }

    // Create evaluation
    const evaluation = await IdeaEvaluation.create({
      idea_id: id,
      evaluator_id: evaluatorId,
      rating: rating || 5,
      comments: comments || '',
      recommendation: recommendation || 'nurture',
      mentor_assigned: null,
      nurture_notes: nurture_notes || '',
      evaluation_date: new Date()
    });

    // Update idea status
    let newStatus = idea.status;
    if (recommendation === 'forward') {
      newStatus = 'endorsed';
    } else if (recommendation === 'reject') {
      newStatus = 'rejected';
    } else if (recommendation === 'nurture') {
      newStatus = 'nurture';
    }

    await idea.update({ 
      status: newStatus,
      reviewed_by: evaluatorId,
      reviewed_at: new Date()
    });

    res.json({
      success: true,
      message: 'Idea evaluated successfully',
      data: { 
        evaluation,
        idea: {
          id: idea.id,
          title: idea.title,
          status: idea.status
        }
      }
    });
  } catch (error) {
    console.error('Evaluation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to evaluate idea',
      error: error.message
    });
  }
});

const PORT = 3002;
app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
});
