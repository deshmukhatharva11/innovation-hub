import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { FiStar, FiMessageSquare, FiThumbsUp, FiThumbsDown, FiSend, FiFileText, FiUser, FiCalendar, FiTag, FiRefreshCw } from 'react-icons/fi';
import { collegeCoordinatorAPI } from '../../services/api';
import { toast } from 'react-toastify';

const IdeaEvaluation = () => {
  const { user } = useSelector(state => state.auth);
  const [ideas, setIdeas] = useState([]);
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [evaluation, setEvaluation] = useState({
    rating: 0,
    comments: '',
    recommendation: '',
    mentor_assigned: null,
    nurture_notes: ''
  });
  const [showEvaluationForm, setShowEvaluationForm] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load ideas for evaluation
    loadIdeasForEvaluation();
  }, []);

  const loadIdeasForEvaluation = async () => {
    try {
      setLoading(true);
      const response = await collegeCoordinatorAPI.getIdeas();
      if (response.data.success) {
        // Filter ideas that need evaluation
        const ideasData = response.data.data.ideas || response.data.data;
        const pendingIdeas = ideasData.filter(idea => 
          ['submitted', 'new_submission', 'under_review'].includes(idea.status)
        );
        console.log('Total ideas from API:', ideasData.length);
        console.log('Pending ideas for evaluation:', pendingIdeas.length);
        setIdeas(pendingIdeas);
      }
    } catch (error) {
      console.error('Error loading ideas:', error);
      toast.error('Failed to load ideas');
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluateIdea = (idea) => {
    setSelectedIdea(idea);
    setShowEvaluationForm(true);
    setEvaluation({
      rating: 0,
      comments: '',
      recommendation: '',
      mentor_assigned: null,
      nurture_notes: ''
    });
  };

  const handleSubmitEvaluation = async () => {
    if (!evaluation.rating || !evaluation.recommendation) {
      toast.error('Please provide rating and recommendation');
      return;
    }

    try {
      setLoading(true);
      const response = await collegeCoordinatorAPI.evaluateIdea(selectedIdea.id, evaluation);
      
      if (response.data.success) {
        toast.success('Idea evaluated successfully');
        setShowEvaluationForm(false);
        setSelectedIdea(null);
        // Reload ideas to get updated status
        await loadIdeasForEvaluation();
      } else {
        toast.error(response.data.message || 'Failed to evaluate idea');
      }
    } catch (error) {
      console.error('Error evaluating idea:', error);
      toast.error('Failed to evaluate idea');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending_evaluation': return 'bg-yellow-100 text-yellow-800';
      case 'nurture': return 'bg-blue-100 text-blue-800';
      case 'forward': return 'bg-green-100 text-green-800';
      case 'reject': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRecommendationColor = (recommendation) => {
    switch (recommendation) {
      case 'Nurture': return 'text-blue-600';
      case 'Forward': return 'text-green-600';
      case 'Reject': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Idea Evaluation System</h1>
        <p className="text-gray-600">Evaluate and provide recommendations for student ideas</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ideas List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Ideas Awaiting Evaluation</h2>
              <button
                onClick={loadIdeasForEvaluation}
                disabled={loading}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <FiRefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
            <div className="p-6">
              {ideas.length === 0 ? (
                <div className="text-center py-8">
                  <FiFileText className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No ideas to evaluate</h3>
                  <p className="mt-1 text-sm text-gray-500">All ideas have been evaluated</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {ideas.map((idea) => (
                    <div key={idea.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{idea.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{idea.description}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(idea.status)}`}>
                          {idea.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div className="flex items-center text-sm text-gray-600">
                          <FiUser className="mr-2" />
                          <span>{idea.student?.name || 'Unknown Student'}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <FiCalendar className="mr-2" />
                          <span>{new Date(idea.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <FiTag className="mr-2" />
                          <span>{idea.category || 'General'}</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          {idea.college?.name || 'Unknown College'}
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="flex space-x-2">
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            Status: {idea.status}
                          </span>
                          {idea.views && (
                            <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                              Views: {idea.views}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => handleEvaluateIdea(idea)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                          disabled={loading}
                        >
                          {loading ? 'Evaluating...' : 'Evaluate'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Evaluation Form */}
        <div className="lg:col-span-1">
          {showEvaluationForm && selectedIdea ? (
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Evaluate Idea</h2>
                <p className="text-sm text-gray-600 mt-1">{selectedIdea.title}</p>
              </div>
              <div className="p-6">
                <form onSubmit={(e) => { e.preventDefault(); handleSubmitEvaluation(); }}>
                  {/* Rating */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Overall Rating (1-10)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={evaluation.rating}
                      onChange={(e) => setEvaluation({...evaluation, rating: parseInt(e.target.value)})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  {/* Recommendation */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Recommendation *
                    </label>
                    <select
                      value={evaluation.recommendation}
                      onChange={(e) => setEvaluation({...evaluation, recommendation: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select Recommendation</option>
                      <option value="nurture">Nurture - Needs Development</option>
                      <option value="forward">Forward - Ready for Incubation</option>
                      <option value="reject">Reject - Not Suitable</option>
                    </select>
                  </div>


                  {/* Comments */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Comments
                    </label>
                    <textarea
                      value={evaluation.comments}
                      onChange={(e) => setEvaluation({...evaluation, comments: e.target.value})}
                      rows={3}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Provide detailed feedback on this idea..."
                    />
                  </div>

                  {/* Nurture Notes */}
                  {evaluation.recommendation === 'nurture' && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nurture Notes
                      </label>
                      <textarea
                        value={evaluation.nurture_notes}
                        onChange={(e) => setEvaluation({...evaluation, nurture_notes: e.target.value})}
                        rows={3}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Specific guidance for nurturing this idea..."
                      />
                    </div>
                  )}

                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Submit Evaluation
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowEvaluationForm(false)}
                      className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-center">
                <FiMessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Select an idea to evaluate</h3>
                <p className="mt-1 text-sm text-gray-500">Choose an idea from the list to start evaluation</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IdeaEvaluation;
