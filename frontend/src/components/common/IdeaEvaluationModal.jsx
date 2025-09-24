import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { 
  FiX, 
  FiStar, 
  FiMessageSquare, 
  FiThumbsUp, 
  FiThumbsDown, 
  FiSend, 
  FiUser, 
  FiCalendar, 
  FiTag, 
  FiRefreshCw,
  FiEye,
  FiTarget,
  FiCheckCircle,
  FiClock,
  FiAward
} from 'react-icons/fi';
import { ideasAPI, usersAPI } from '../../services/api';
import { toast } from 'react-hot-toast';

const IdeaEvaluationModal = ({ isOpen, onClose, idea, onEvaluationComplete }) => {
  const { user } = useSelector(state => state.auth);
  const [loading, setLoading] = useState(false);
  const [evaluation, setEvaluation] = useState({
    rating: 5,
    comments: '',
    recommendation: 'nurture', // nurture, forward, reject
    mentor_assigned: '',
    nurture_notes: '',
    feedback: ''
  });
  const [mentors, setMentors] = useState([]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    if (isOpen && idea) {
      // Reset evaluation form
      setEvaluation({
        rating: 5,
        comments: '',
        recommendation: 'nurture',
        mentor_assigned: '',
        nurture_notes: '',
        feedback: ''
      });
      
      // Load mentors for college
      loadMentors();
    }
  }, [isOpen, idea]);

  const loadMentors = async () => {
    try {
      const response = await usersAPI.getMentors({ college_id: user?.college_id });
      if (response.data?.success && response.data?.data?.mentors) {
        setMentors(response.data.data.mentors);
      }
    } catch (error) {
      console.error('Error loading mentors:', error);
    }
  };

  const handleSubmit = async () => {
    if (!evaluation.comments.trim()) {
      toast.error('Please provide comments for your evaluation');
      return;
    }

    try {
      setLoading(true);
      
      // Determine new status based on recommendation - Sequential Workflow
      let newStatus = '';
      switch (evaluation.recommendation) {
        case 'nurture':
          newStatus = 'under_review'; // Keep under review for nurturing
          break;
        case 'forward':
          newStatus = 'endorsed'; // Forward to incubation
          break;
        case 'reject':
          newStatus = 'rejected'; // Reject the idea
          break;
        default:
          newStatus = 'under_review'; // Default to under review
      }

      // Update idea status
      const updateData = {
        status: newStatus,
        rating: evaluation.rating,
        feedback: evaluation.comments,
        coordinator_notes: evaluation.feedback,
        mentor_id: evaluation.mentor_assigned || null,
        nurture_notes: evaluation.nurture_notes || null
      };

      await ideasAPI.updateStatus(idea.id, updateData);
      
      toast.success(`Idea ${evaluation.recommendation === 'nurture' ? 'kept under review for nurturing' : 
                    evaluation.recommendation === 'forward' ? 'endorsed and forwarded to incubator' : 'rejected'}`);
      
      onEvaluationComplete?.(idea, newStatus);
      onClose();
      
    } catch (error) {
      console.error('Error evaluating idea:', error);
      toast.error('Failed to evaluate idea');
    } finally {
      setLoading(false);
    }
  };

  const getRecommendationColor = (recommendation) => {
    switch (recommendation) {
      case 'nurture':
        return 'text-blue-600 bg-blue-100';
      case 'forward':
        return 'text-green-600 bg-green-100';
      case 'reject':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getRecommendationIcon = (recommendation) => {
    switch (recommendation) {
      case 'nurture':
        return <FiTarget className="h-4 w-4" />;
      case 'forward':
        return <FiCheckCircle className="h-4 w-4" />;
      case 'reject':
        return <FiX className="h-4 w-4" />;
      default:
        return <FiClock className="h-4 w-4" />;
    }
  };

  if (!isOpen || !idea) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Evaluate Idea
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {idea.title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <FiX className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Idea Details */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">Idea Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Student:</span>
                <span className="ml-2 text-gray-900 dark:text-white">{idea.student?.name || 'Unknown'}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Department:</span>
                <span className="ml-2 text-gray-900 dark:text-white">{idea.student?.department || 'N/A'}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Submitted:</span>
                <span className="ml-2 text-gray-900 dark:text-white">
                  {new Date(idea.created_at).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Status:</span>
                <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                  idea.status === 'new_submission' ? 'bg-orange-100 text-orange-800' :
                  idea.status === 'under_review' ? 'bg-yellow-100 text-yellow-800' :
                  idea.status === 'endorsed' ? 'bg-green-100 text-green-800' :
                  idea.status === 'rejected' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {idea.status?.replace('_', ' ').toUpperCase()}
                </span>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-gray-500 dark:text-gray-400">Description:</span>
              <p className="mt-1 text-gray-900 dark:text-white">{idea.description}</p>
            </div>
          </div>

          {/* Evaluation Form */}
          <div className="space-y-6">
            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Rating (1-5 stars)
              </label>
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setEvaluation(prev => ({ ...prev, rating: star }))}
                    className={`p-1 ${
                      star <= evaluation.rating
                        ? 'text-yellow-400'
                        : 'text-gray-300 dark:text-gray-600'
                    }`}
                  >
                    <FiStar className="h-6 w-6 fill-current" />
                  </button>
                ))}
                <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                  {evaluation.rating}/5
                </span>
              </div>
            </div>

            {/* Recommendation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Recommendation
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { value: 'nurture', label: 'Nurture', description: 'Needs development' },
                  { value: 'forward', label: 'Forward', description: 'Ready for incubation' },
                  { value: 'reject', label: 'Reject', description: 'Not suitable' }
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setEvaluation(prev => ({ ...prev, recommendation: option.value }))}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      evaluation.recommendation === option.value
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      {getRecommendationIcon(option.value)}
                      <div className="text-left">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {option.label}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {option.description}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Comments */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Comments *
              </label>
              <textarea
                value={evaluation.comments}
                onChange={(e) => setEvaluation(prev => ({ ...prev, comments: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Provide detailed feedback about the idea..."
                required
              />
            </div>

            {/* Advanced Options */}
            <div>
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                <FiRefreshCw className={`h-4 w-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
                <span>Advanced Options</span>
              </button>
            </div>

            {showAdvanced && (
              <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                {/* Mentor Assignment */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Assign Mentor (Optional)
                  </label>
                  <select
                    value={evaluation.mentor_assigned}
                    onChange={(e) => setEvaluation(prev => ({ ...prev, mentor_assigned: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select a mentor</option>
                    {mentors.map((mentor) => (
                      <option key={mentor.id} value={mentor.id}>
                        {mentor.name} - {mentor.expertise}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Nurture Notes */}
                {evaluation.recommendation === 'nurture' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nurture Notes
                    </label>
                    <textarea
                      value={evaluation.nurture_notes}
                      onChange={(e) => setEvaluation(prev => ({ ...prev, nurture_notes: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Specific guidance for nurturing this idea..."
                    />
                  </div>
                )}

                {/* Additional Feedback */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Additional Feedback
                  </label>
                  <textarea
                    value={evaluation.feedback}
                    onChange={(e) => setEvaluation(prev => ({ ...prev, feedback: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Any additional comments or suggestions..."
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !evaluation.comments.trim()}
            className={`px-4 py-2 text-sm font-medium text-white rounded-md flex items-center space-x-2 ${
              loading || !evaluation.comments.trim()
                ? 'bg-gray-400 cursor-not-allowed'
                : evaluation.recommendation === 'nurture'
                ? 'bg-blue-600 hover:bg-blue-700'
                : evaluation.recommendation === 'forward'
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {loading ? (
              <>
                <FiRefreshCw className="h-4 w-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                {getRecommendationIcon(evaluation.recommendation)}
                <span>
                  {evaluation.recommendation === 'nurture' ? 'Mark for Nurturing' :
                   evaluation.recommendation === 'forward' ? 'Forward to Incubation' :
                   'Reject Idea'}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default IdeaEvaluationModal;
