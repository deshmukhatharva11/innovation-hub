import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiClock, 
  FiCheckCircle, 
  FiAlertCircle, 
  FiEdit3, 
  FiSend, 
  FiUsers, 
  FiTrendingUp,
  FiArrowRight,
  FiRefreshCw,
  FiMessageSquare,
  FiCalendar,
  FiUser,
  FiX
} from 'react-icons/fi';
import { ideasAPI } from '../../services/api';
import { toast } from 'react-hot-toast';

const WorkflowDashboard = ({ user }) => {
  const [workflowStats, setWorkflowStats] = useState({});
  const [ideasByStage, setIdeasByStage] = useState({});
  const [selectedStage, setSelectedStage] = useState('submission');
  const [loading, setLoading] = useState(true);
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [showWorkflowModal, setShowWorkflowModal] = useState(false);

  const workflowStages = [
    { 
      key: 'submission', 
      name: 'New Submissions', 
      icon: FiSend, 
      color: 'bg-orange-500',
      statuses: ['submitted']
    },
    { 
      key: 'nurture', 
      name: 'Nurture', 
      icon: FiEdit3, 
      color: 'bg-yellow-500',
      statuses: ['nurture']
    },
    { 
      key: 'upgraded', 
      name: 'Upgraded', 
      icon: FiTrendingUp, 
      color: 'bg-purple-500',
      statuses: ['under_review'],
      isUpgraded: true
    },
    { 
      key: 'review', 
      name: 'Under Review', 
      icon: FiClock, 
      color: 'bg-cyan-500',
      statuses: ['under_review']
    },
    { 
      key: 'endorsement', 
      name: 'Endorsed', 
      icon: FiCheckCircle, 
      color: 'bg-green-500',
      statuses: ['endorsed']
    },
    { 
      key: 'incubation', 
      name: 'Incubation', 
      icon: FiTrendingUp, 
      color: 'bg-indigo-500',
      statuses: ['forwarded_to_incubation', 'incubated']
    }
  ];

  useEffect(() => {
    fetchWorkflowData();
  }, []);

  const fetchWorkflowData = async () => {
    try {
      setLoading(true);
      
      console.log('🔍 Fetching workflow data for user:', user);
      console.log('🔍 College ID:', user?.college_id);
      
      // Fetch workflow statistics
      const statsResponse = await ideasAPI.getWorkflowStats({ college_id: user?.college_id });
      console.log('📊 Stats response:', statsResponse.data);
      if (statsResponse.data?.success) {
        // The backend returns { total, byStatus } but we need to flatten byStatus
        const statsData = statsResponse.data.data.workflow_stats;
        console.log('📊 Stats data structure:', statsData);
        console.log('📊 ByStatus data:', statsData.byStatus);
        setWorkflowStats(statsData.byStatus || {});
      }

      // Fetch ideas for each stage
      const stageData = {};
      for (const stage of workflowStages) {
        try {
          console.log(`🔍 Fetching ${stage.key} ideas for college ${user?.college_id}`);
          
          // Special handling for upgraded ideas
          if (stage.isUpgraded) {
            const response = await ideasAPI.getUpgradedIdeas({ 
              limit: 10,
              college_id: user?.college_id 
            });
            console.log(`📊 ${stage.key} (upgraded) response:`, response.data);
            if (response.data?.success) {
              stageData[stage.key] = response.data.data.ideas;
              console.log(`✅ ${stage.key} (upgraded) ideas:`, response.data.data.ideas.length);
            }
          } else {
            const response = await ideasAPI.getIdeasByStage(stage.key, { 
              limit: 10,
              college_id: user?.college_id 
            });
            console.log(`📊 ${stage.key} response:`, response.data);
            if (response.data?.success) {
              stageData[stage.key] = response.data.data.ideas;
              console.log(`✅ ${stage.key} ideas:`, response.data.data.ideas.length);
            }
          }
        } catch (error) {
          console.error(`Error fetching ${stage.key} ideas:`, error);
          stageData[stage.key] = [];
        }
      }
      setIdeasByStage(stageData);
    } catch (error) {
      console.error('Error fetching workflow data:', error);
      toast.error('Failed to fetch workflow data');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (ideaId, newStatus, reason = null, additionalData = {}) => {
    try {
      const response = await ideasAPI.updateWorkflowStatus(ideaId, {
        status: newStatus,
        reason,
        ...additionalData
      });

      if (response.data?.success) {
        toast.success('Idea status updated successfully');
        fetchWorkflowData(); // Refresh data
        setShowWorkflowModal(false);
        setSelectedIdea(null);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      
      // Handle authentication errors
      if (error.response?.status === 401) {
        toast.error('Session expired. Please log in again.');
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return;
      }
      
      // Handle other errors
      if (error.response?.status === 500) {
        toast.error('Server error. Please try again or contact support.');
      } else {
        toast.error('Failed to update idea status');
      }
    }
  };

  const getStatusColor = (status) => {
    const colorMap = {
      'new_submission': 'bg-orange-100 text-orange-800 border-orange-200',
      'submitted': 'bg-blue-100 text-blue-800 border-blue-200',
      'nurture': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'pending_review': 'bg-purple-100 text-purple-800 border-purple-200',
      'under_review': 'bg-cyan-100 text-cyan-800 border-cyan-200',
      'needs_development': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'updated_pending_review': 'bg-purple-100 text-purple-800 border-purple-200',
      'endorsed': 'bg-green-100 text-green-800 border-green-200',
      'forwarded_to_incubation': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'incubated': 'bg-purple-100 text-purple-800 border-purple-200',
      'rejected': 'bg-red-100 text-red-800 border-red-200'
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusIcon = (status) => {
    const iconMap = {
      'new_submission': FiSend,
      'submitted': FiSend,
      'nurture': FiEdit3,
      'pending_review': FiClock,
      'under_review': FiClock,
      'needs_development': FiEdit3,
      'updated_pending_review': FiRefreshCw,
      'endorsed': FiCheckCircle,
      'forwarded_to_incubation': FiArrowRight,
      'incubated': FiTrendingUp,
      'rejected': FiAlertCircle
    };
    const Icon = iconMap[status] || FiClock;
    return <Icon className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Workflow Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {workflowStages.map((stage) => {
          let count = 0;
          
          if (stage.isUpgraded) {
            // For upgraded ideas, use the upgraded count from stats
            count = workflowStats.upgraded || 0;
            console.log(`📊 Stage ${stage.key} (upgraded) count: ${count}`);
          } else {
            // For regular stages, sum up the status counts
            count = stage.statuses.reduce((total, status) => {
              const statusCount = workflowStats[status] || 0;
              console.log(`📊 Stage ${stage.key}, Status ${status}: ${statusCount}`);
              return total + statusCount;
            }, 0);
            console.log(`📊 Stage ${stage.key} total count: ${count}`);
          }
          
          return (
            <motion.div
              key={stage.key}
              className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 cursor-pointer hover:shadow-md transition-shadow"
              whileHover={{ scale: 1.02 }}
              onClick={() => setSelectedStage(stage.key)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stage.name}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {count}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${stage.color} text-white`}>
                  <stage.icon className="w-6 h-6" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Workflow Pipeline */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Idea Pooling Pipeline (Evaluation System)
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Track ideas through each stage of the innovation process
          </p>
        </div>

        <div className="p-6">
          {/* Stage Tabs */}
          <div className="flex space-x-1 mb-6 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            {workflowStages.map((stage) => {
              let count = 0;
              
              if (stage.isUpgraded) {
                // For upgraded ideas, use the upgraded count from stats
                count = workflowStats.upgraded || 0;
                console.log(`📊 Pipeline Stage ${stage.key} (upgraded) count: ${count}`);
              } else {
                // For regular stages, sum up the status counts
                count = stage.statuses.reduce((total, status) => {
                  const statusCount = workflowStats[status] || 0;
                  console.log(`📊 Pipeline Stage ${stage.key}, Status ${status}: ${statusCount}`);
                  return total + statusCount;
                }, 0);
                console.log(`📊 Pipeline Stage ${stage.key} total count: ${count}`);
              }
              
              return (
                <button
                  key={stage.key}
                  onClick={() => setSelectedStage(stage.key)}
                  className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    selectedStage === stage.key
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <stage.icon className="w-4 h-4" />
                  <span>{stage.name}</span>
                  {count > 0 && (
                    <span className={`px-2 py-1 text-xs rounded-full ${stage.color} text-white`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Ideas List */}
          <div className="space-y-4">
            <AnimatePresence mode="wait">
              {ideasByStage[selectedStage]?.map((idea) => (
                <motion.div
                  key={idea.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                          {idea.title}
                        </h4>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(idea.status)}`}>
                          {getStatusIcon(idea.status)}
                          <span className="ml-1">{idea.status.replace('_', ' ').toUpperCase()}</span>
                        </span>
                      </div>
                      
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                        {idea.description}
                      </p>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center space-x-1">
                          <FiUser className="w-4 h-4" />
                          <span>{idea.student?.name}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <FiCalendar className="w-4 h-4" />
                          <span>{new Date(idea.created_at).toLocaleDateString()}</span>
                        </div>
                        {idea.assigned_mentor && (
                          <div className="flex items-center space-x-1">
                            <FiUsers className="w-4 h-4" />
                            <span>Mentor: {idea.assigned_mentor.name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setSelectedIdea(idea);
                          setShowWorkflowModal(true);
                        }}
                        className="px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                      >
                        Manage
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {(!ideasByStage[selectedStage] || ideasByStage[selectedStage].length === 0) && (
              <div className="text-center py-8">
                <div className="text-gray-400 dark:text-gray-500 mb-2">
                  <FiClock className="w-12 h-12 mx-auto" />
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  No ideas in this stage
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Workflow Management Modal */}
      {showWorkflowModal && selectedIdea && (
        <WorkflowModal
          idea={selectedIdea}
          onClose={() => {
            setShowWorkflowModal(false);
            setSelectedIdea(null);
          }}
          onStatusUpdate={handleStatusUpdate}
        />
      )}
    </div>
  );
};

// Workflow Management Modal Component
const WorkflowModal = ({ idea, onClose, onStatusUpdate }) => {
  const [selectedStatus, setSelectedStatus] = useState('');
  const [reason, setReason] = useState('');
  const [developmentFeedback, setDevelopmentFeedback] = useState('');
  const [developmentRequirements, setDevelopmentRequirements] = useState('');
  const [assignedMentorId, setAssignedMentorId] = useState(idea.assigned_mentor_id || '');
  const [loading, setLoading] = useState(false);

  const validTransitions = {
    'new_submission': ['submitted', 'under_review', 'nurture', 'endorsed', 'rejected'],
    'submitted': ['under_review', 'nurture', 'endorsed', 'rejected'],
    'nurture': ['pending_review', 'under_review', 'endorsed', 'rejected'],
    'pending_review': ['under_review', 'nurture', 'endorsed', 'rejected'],
    'under_review': ['needs_development', 'nurture', 'endorsed', 'rejected'],
    'needs_development': ['updated_pending_review', 'rejected'],
    'updated_pending_review': ['under_review', 'endorsed', 'rejected'],
    'endorsed': ['forwarded_to_incubation', 'rejected'],
    'forwarded_to_incubation': ['incubated', 'rejected'],
    'incubated': ['rejected'],
    'rejected': ['new_submission']
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStatus) return;

    setLoading(true);
    try {
      const additionalData = {};
      if (developmentFeedback) additionalData.development_feedback = developmentFeedback;
      if (developmentRequirements) additionalData.development_requirements = developmentRequirements.split(',').map(req => req.trim());
      if (assignedMentorId) additionalData.assigned_mentor_id = parseInt(assignedMentorId);

      await onStatusUpdate(idea.id, selectedStatus, reason, additionalData);
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Manage Idea Workflow
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {idea.title}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Status Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Update Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              required
            >
              <option value="">Select new status</option>
              {validTransitions[idea.status]?.map((status) => (
                <option key={status} value={status}>
                  {status.replace('_', ' ').toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Reason for Status Change
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Explain why you're changing the status..."
            />
          </div>

          {/* Development Feedback (for needs_development status) */}
          {selectedStatus === 'needs_development' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Development Feedback
              </label>
              <textarea
                value={developmentFeedback}
                onChange={(e) => setDevelopmentFeedback(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Provide detailed feedback on what needs to be improved..."
              />
            </div>
          )}

          {/* Development Requirements */}
          {selectedStatus === 'needs_development' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Development Requirements (comma-separated)
              </label>
              <input
                type="text"
                value={developmentRequirements}
                onChange={(e) => setDevelopmentRequirements(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="e.g., Improve technical feasibility, Add market research, Enhance business model"
              />
            </div>
          )}

          {/* Mentor Assignment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Assign Mentor (Optional)
            </label>
            <input
              type="number"
              value={assignedMentorId}
              onChange={(e) => setAssignedMentorId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Mentor ID"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !selectedStatus}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors"
            >
              {loading ? 'Updating...' : 'Update Status'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default WorkflowDashboard;
