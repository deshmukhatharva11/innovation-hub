const { Idea, User, College, Incubator, IdeaEvaluation } = require('../models');
const { sequelize } = require('../config/database');

class WorkflowService {
  /**
   * Update idea status with workflow management
   * @param {number} ideaId - The idea ID
   * @param {string} newStatus - The new status
   * @param {number} userId - The user ID making the change
   * @param {string} reason - Reason for status change
   * @param {object} additionalData - Additional data for the update
   * @returns {Promise<object>} Updated idea
   */
  static async updateIdeaStatus(ideaId, newStatus, userId, reason, additionalData = {}) {
    try {
      console.log('🔄 WorkflowService: Updating idea status', {
        ideaId,
        newStatus,
        userId,
        reason,
        additionalData
      });

      // Find the idea
      const idea = await Idea.findByPk(ideaId, {
        include: [
          { model: User, as: 'student', attributes: ['id', 'name', 'email'] },
          { model: College, as: 'college', attributes: ['id', 'name'] }
        ]
      });

      if (!idea) {
        throw new Error('Idea not found');
      }

      // Validate status transition
      const validTransitions = this.getValidTransitions(idea.status);
      console.log(`🔍 WorkflowService: Validating transition from ${idea.status} to ${newStatus}`);
      console.log(`🔍 WorkflowService: Valid transitions for ${idea.status}:`, validTransitions);
      
      if (!validTransitions.includes(newStatus)) {
        console.error(`❌ WorkflowService: Invalid status transition from ${idea.status} to ${newStatus}`);
        throw new Error(`Invalid status transition from ${idea.status} to ${newStatus}`);
      }

      // Prepare update data
      const updateData = {
        status: newStatus,
        reviewed_by: userId,
        reviewed_at: new Date()
      };

      // Add additional data
      if (reason) updateData.feedback = reason;
      if (additionalData.development_feedback) updateData.development_feedback = additionalData.development_feedback;
      if (additionalData.development_requirements) updateData.development_requirements = additionalData.development_requirements;
      if (additionalData.assigned_mentor_id) updateData.assigned_mentor_id = additionalData.assigned_mentor_id;

      // Special logic for "upgraded" ideas (nurture → under_review)
      if (idea.status === 'nurture' && newStatus === 'under_review') {
        updateData.is_upgraded = true;
        updateData.upgraded_at = new Date();
        updateData.upgraded_by = userId;
        console.log('🔄 WorkflowService: Marking idea as upgraded from nurture to under_review');
      }

      // Update the idea
      await idea.update(updateData);

      // Create evaluation record if this is a status change by college admin
      const user = await User.findByPk(userId);
      if (user && user.role === 'college_admin') {
        await this.createOrUpdateEvaluation(ideaId, userId, newStatus, reason);
      }

      console.log('✅ WorkflowService: Idea status updated successfully', {
        ideaId,
        oldStatus: idea.status,
        newStatus,
        userId
      });

      // Send email notification for status changes
      try {
        const emailService = require('./emailService');
        const student = idea.student;
        
        if (student && student.email) {
          let emailMessage = '';
          let notificationType = 'info';
          
          if (newStatus === 'endorsed') {
            emailMessage = `Your idea "${idea.title}" has been endorsed! 🎉 It will now be reviewed by incubators.`;
            notificationType = 'success';
          } else if (newStatus === 'rejected') {
            emailMessage = `Your idea "${idea.title}" needs revision. Check feedback for details.`;
            notificationType = 'warning';
          } else if (newStatus === 'under_review') {
            emailMessage = `Your idea "${idea.title}" is now under review.`;
            notificationType = 'info';
          } else if (newStatus === 'incubated') {
            emailMessage = `Congratulations! Your idea "${idea.title}" has been selected for incubation! 🚀`;
            notificationType = 'success';
          } else if (newStatus === 'nurture') {
            emailMessage = `Your idea "${idea.title}" has been moved to nurture phase for development.`;
            notificationType = 'info';
          }
          
          if (emailMessage) {
            const emailResult = await emailService.sendIdeaStatusUpdateEmail(
              student.email,
              student.name,
              idea.title,
              newStatus,
              emailMessage,
              reason
            );
            
            if (emailResult.success) {
              console.log('✅ WorkflowService: Email notification sent to student:', {
                student_email: student.email,
                idea_id: ideaId,
                new_status: newStatus
              });
            } else {
              console.error('❌ WorkflowService: Failed to send email notification:', emailResult.error);
            }
          }
        }
      } catch (emailError) {
        console.error('❌ WorkflowService: Error sending email notification:', emailError);
      }

      // Return updated idea with associations
      return await Idea.findByPk(ideaId, {
        include: [
          { model: User, as: 'student', attributes: ['id', 'name', 'email'] },
          { model: College, as: 'college', attributes: ['id', 'name'] }
        ]
      });

    } catch (error) {
      console.error('❌ WorkflowService: Error updating idea status:', error);
      throw error;
    }
  }

  /**
   * Get valid status transitions for a given status
   * @param {string} currentStatus - Current status
   * @returns {Array<string>} Valid next statuses
   */
  static getValidTransitions(currentStatus) {
    const transitions = {
      'draft': ['submitted'],
      'submitted': ['under_review', 'nurture', 'endorsed', 'rejected'],
      'under_review': ['nurture', 'endorsed', 'rejected'],
      'nurture': ['under_review', 'endorsed', 'rejected'], // When updated, goes to under_review
      'endorsed': ['forwarded_to_incubation', 'incubated', 'rejected'],
      'forwarded_to_incubation': ['incubated', 'rejected'],
      'incubated': ['rejected'], // Can only be rejected from incubated
      'rejected': [] // Terminal state
    };

    return transitions[currentStatus] || [];
  }

  /**
   * Create or update evaluation record
   * @param {number} ideaId - The idea ID
   * @param {number} evaluatorId - The evaluator ID
   * @param {string} status - The new status
   * @param {string} reason - Reason for change
   */
  static async createOrUpdateEvaluation(ideaId, evaluatorId, status, reason) {
    try {
      // Check if evaluation already exists
      let evaluation = await IdeaEvaluation.findOne({
        where: {
          idea_id: ideaId,
          evaluator_id: evaluatorId
        }
      });

      const evaluationData = {
        idea_id: ideaId,
        evaluator_id: evaluatorId,
        rating: this.getRatingFromStatus(status),
        comments: reason || '',
        recommendation: this.getRecommendationFromStatus(status),
        evaluation_date: new Date()
      };

      if (evaluation) {
        // Update existing evaluation
        await evaluation.update(evaluationData);
        console.log('📝 WorkflowService: Updated existing evaluation');
      } else {
        // Create new evaluation
        evaluation = await IdeaEvaluation.create(evaluationData);
        console.log('📝 WorkflowService: Created new evaluation');
      }

      return evaluation;
    } catch (error) {
      console.error('❌ WorkflowService: Error creating/updating evaluation:', error);
      // Don't throw error here as it's not critical
    }
  }

  /**
   * Get rating based on status
   * @param {string} status - The status
   * @returns {number} Rating (1-5)
   */
  static getRatingFromStatus(status) {
    const ratingMap = {
      'rejected': 1,
      'needs_development': 2,
      'nurture': 3,
      'under_review': 4,
      'endorsed': 5,
      'incubated': 5
    };
    return ratingMap[status] || 3;
  }

  /**
   * Get recommendation based on status
   * @param {string} status - The status
   * @returns {string} Recommendation
   */
  static getRecommendationFromStatus(status) {
    const recommendationMap = {
      'rejected': 'reject',
      'needs_development': 'nurture',
      'nurture': 'nurture',
      'under_review': 'nurture',
      'endorsed': 'forward',
      'incubated': 'forward'
    };
    return recommendationMap[status] || 'nurture';
  }

  /**
   * Get ideas by workflow stage
   * @param {string} stage - The workflow stage
   * @param {number} collegeId - College ID (optional)
   * @param {number} limit - Number of ideas to return
   * @param {number} offset - Offset for pagination
   * @returns {Promise<object>} Ideas and count
   */
  static async getIdeasByStage(stage, collegeId = null, limit = 10, offset = 0) {
    try {
      console.log('🔄 WorkflowService: Getting ideas by stage', {
        stage,
        collegeId,
        limit,
        offset
      });

      // Map stage names to status values
      const stageToStatusMap = {
        'submission': ['submitted'],
        'nurture': ['nurture'],
        'review': ['under_review'],
        'endorsement': ['endorsed'],
        'incubation': ['incubated', 'forwarded_to_incubation'],
        'rejected': ['rejected']
      };

      const statuses = stageToStatusMap[stage] || [stage];
      console.log(`🔍 WorkflowService: Stage '${stage}' maps to statuses:`, statuses);
      
      const whereClause = {
        status: statuses
      };

      if (collegeId) {
        whereClause.college_id = collegeId;
      }

      console.log(`🔍 WorkflowService: Final where clause:`, whereClause);

      const { count, rows: ideas } = await Idea.findAndCountAll({
        where: whereClause,
        include: [
          { model: User, as: 'student', attributes: ['id', 'name', 'email'] },
          { model: College, as: 'college', attributes: ['id', 'name'] }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['created_at', 'DESC']]
      });

      console.log('✅ WorkflowService: Found ideas by stage', {
        stage,
        count,
        ideasFound: ideas.length
      });

      return { ideas, count };
    } catch (error) {
      console.error('❌ WorkflowService: Error getting ideas by stage:', error);
      throw error;
    }
  }

  /**
   * Get workflow statistics
   * @param {number} collegeId - College ID (optional)
   * @returns {Promise<object>} Workflow statistics
   */
  static async getWorkflowStats(collegeId = null) {
    try {
      const whereClause = collegeId ? { college_id: collegeId } : {};
      
      const stats = await Idea.findAll({
        where: whereClause,
        attributes: [
          'status',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['status'],
        raw: true
      });

      const totalIdeas = await Idea.count({ where: whereClause });
      
      // Get upgraded ideas count
      const upgradedCount = await Idea.count({ 
        where: { 
          ...whereClause,
          is_upgraded: true 
        } 
      });
      
      return {
        total: totalIdeas,
        upgraded: upgradedCount,
        byStatus: stats.reduce((acc, stat) => {
          acc[stat.status] = parseInt(stat.count);
          return acc;
        }, {})
      };
    } catch (error) {
      console.error('❌ WorkflowService: Error getting workflow stats:', error);
      throw error;
    }
  }

  /**
   * Get upgraded ideas (ideas that moved from nurture to under_review)
   * @param {number} collegeId - College ID (optional)
   * @param {number} limit - Number of ideas to return
   * @param {number} offset - Offset for pagination
   * @returns {Promise<object>} Upgraded ideas and count
   */
  static async getUpgradedIdeas(collegeId = null, limit = 10, offset = 0) {
    try {
      const whereClause = {
        is_upgraded: true,
        status: 'under_review'
      };

      if (collegeId) {
        whereClause.college_id = collegeId;
      }

      const { count, rows: ideas } = await Idea.findAndCountAll({
        where: whereClause,
        include: [
          { model: User, as: 'student', attributes: ['id', 'name', 'email'] },
          { model: College, as: 'college', attributes: ['id', 'name'] }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['upgraded_at', 'DESC']]
      });

      return { ideas, count };
    } catch (error) {
      console.error('❌ WorkflowService: Error getting upgraded ideas:', error);
      throw error;
    }
  }
}

module.exports = WorkflowService;