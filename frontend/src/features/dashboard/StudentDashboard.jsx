import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import {
  FiPlus,
  FiEye, 
  FiHeart, 
  FiMessageSquare, 
  FiBookOpen, 
  FiTarget,
  FiTrendingUp,
  FiUsers,
  FiAward,
  FiClock,
  FiBell,
  FiChevronRight,
  FiRefreshCw,
  FiCheckCircle,
  FiFile,
  FiEdit3,
  FiX,
  FiCalendar,
  FiMapPin,
  FiGlobe
} from 'react-icons/fi';
import { 
  ideasAPI, 
  usersAPI, 
  notificationsAPI,
  eventsAPI,
  documentsAPI
} from '../../services/api';
import WorkflowDashboard from '../../components/workflow/WorkflowDashboard';
import ActivityFeed from '../../components/activity/ActivityFeed';
import MentorChatModal from '../../components/common/MentorChatModal';
import useMentorChatModal from '../../hooks/useMentorChatModal';
import useIdeaStatusUpdates from '../../hooks/useIdeaStatusUpdates';
import IdeaActionButtons from '../../components/common/IdeaActionButtons';
import IdeaEvaluationModal from '../../components/common/IdeaEvaluationModal';
import StudentPreIncubateeProgress from '../pre-incubatees/StudentPreIncubateeProgress';
import { preIncubateesAPI } from '../../services/api';

// MyPreIncubateeProjects Component
const MyPreIncubateeProjects = () => {
  const [preIncubatees, setPreIncubatees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingProgress, setUpdatingProgress] = useState({});
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [updateData, setUpdateData] = useState({
    progress_percentage: 0,
    phase_description: '',
    notes: ''
  });

  useEffect(() => {
    fetchMyPreIncubatees();
  }, []);

  const fetchMyPreIncubatees = async () => {
    try {
      setLoading(true);
      const response = await preIncubateesAPI.getMyPreIncubatees();
      if (response.data.success) {
        setPreIncubatees(response.data.preIncubatees || []);
      }
    } catch (error) {
      console.error('Error fetching my pre-incubatees:', error);
      toast.error('Failed to load your projects');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProgress = (project) => {
    setSelectedProject(project);
    setUpdateData({
      progress_percentage: project.progress_percentage || 0,
      phase_description: project.phase_description || '',
      notes: ''
    });
    setShowUpdateModal(true);
  };

  const handleSubmitUpdate = async () => {
    if (!selectedProject) return;

    try {
      setUpdatingProgress(prev => ({ ...prev, [selectedProject.id]: true }));
      
      const response = await preIncubateesAPI.updateStudentProgress(
        selectedProject.id,
        updateData
      );

      if (response.data.success) {
        toast.success('Progress updated successfully! Incubator has been notified.');
        
        // Update local state
        setPreIncubatees(prev => prev.map(project => 
          project.id === selectedProject.id 
            ? { ...project, ...updateData, last_updated: new Date() }
            : project
        ));
        
        setShowUpdateModal(false);
        setSelectedProject(null);
        setUpdateData({ progress_percentage: 0, phase_description: '', notes: '' });
      } else {
        toast.error(response.data.message || 'Failed to update progress');
      }
    } catch (error) {
      console.error('Error updating progress:', error);
      toast.error('Failed to update progress');
    } finally {
      setUpdatingProgress(prev => ({ ...prev, [selectedProject.id]: false }));
    }
  };

  const getPhaseColor = (phase) => {
    switch (phase?.toLowerCase()) {
      case 'research': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'development': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'testing': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'market_validation': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'scaling': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'paused': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'terminated': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <FiRefreshCw className="animate-spin text-blue-600" size={24} />
        <span className="ml-2 text-gray-600 dark:text-gray-400">Loading your projects...</span>
      </div>
    );
  }

  if (preIncubatees.length === 0) {
    return (
      <div className="text-center py-8">
        <FiTarget className="mx-auto text-gray-400 mb-4" size={48} />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Projects Yet</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Your endorsed ideas will appear here as pre-incubatee projects.
        </p>
        <Link
          to="/submit-idea"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FiPlus className="mr-2" size={16} />
          Submit Your First Idea
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {preIncubatees.map((project) => (
          <div
            key={project.id}
            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {project.Idea?.title || 'Untitled Project'}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPhaseColor(project.current_phase)}`}>
                    {project.current_phase?.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                    {project.status?.toUpperCase()}
                  </span>
                </div>
                
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                  {project.Idea?.description || 'No description available'}
                </p>
                
                <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center">
                    <FiTrendingUp className="mr-1" size={14} />
                    <span>{project.progress_percentage}% Complete</span>
                  </div>
                  <div className="flex items-center">
                    <FiClock className="mr-1" size={14} />
                    <span>
                      Started {new Date(project.start_date).toLocaleDateString()}
                    </span>
                  </div>
                  {project.expected_completion_date && (
                    <div className="flex items-center">
                      <FiTarget className="mr-1" size={14} />
                      <span>
                        Due {new Date(project.expected_completion_date).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={() => handleUpdateProgress(project)}
                  disabled={updatingProgress[project.id]}
                  className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updatingProgress[project.id] ? (
                    <FiRefreshCw className="mr-1 animate-spin" size={14} />
                  ) : (
                    <FiEdit3 className="mr-1" size={14} />
                  )}
                  Update Progress
                </button>
                <Link
                  to={`/pre-incubatees/${project.id}`}
                  className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <FiEye className="mr-1" size={14} />
                  View Details
                </Link>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-3">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${project.progress_percentage}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Progress Update Modal */}
      {showUpdateModal && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Update Progress
                </h3>
                <button
                  onClick={() => setShowUpdateModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <FiX size={20} />
                </button>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {selectedProject.Idea?.title || 'Untitled Project'}
              </p>
            </div>
            
            <div className="px-6 py-4 space-y-4">
              {/* Progress Percentage */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Progress Percentage
                </label>
                <select
                  value={updateData.progress_percentage}
                  onChange={(e) => setUpdateData(prev => ({ ...prev, progress_percentage: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(value => (
                    <option key={value} value={value}>{value}%</option>
                  ))}
                </select>
              </div>
              
              {/* Phase Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phase Description
                </label>
                <textarea
                  value={updateData.phase_description}
                  onChange={(e) => setUpdateData(prev => ({ ...prev, phase_description: e.target.value }))}
                  placeholder="Describe what you've accomplished in this phase..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              {/* Additional Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Additional Notes
                </label>
                <textarea
                  value={updateData.notes}
                  onChange={(e) => setUpdateData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Any additional updates or challenges you'd like to share with your incubator..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
              <button
                onClick={() => setShowUpdateModal(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitUpdate}
                disabled={updatingProgress[selectedProject.id]}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {updatingProgress[selectedProject.id] ? (
                  <>
                    <FiRefreshCw className="mr-2 animate-spin" size={16} />
                    Updating...
                  </>
                ) : (
                  <>
                    <FiCheckCircle className="mr-2" size={16} />
                    Update Progress
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// MyEvents Component
const MyEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('latest');

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const response = await eventsAPI.getAll({ 
        filter: filter,
        limit: 10 
      });
      setEvents(response.data.data.events || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const getEventTypeColor = (type) => {
    const colors = {
      workshop: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      seminar: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      competition: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      webinar: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      ideathon: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
      hackathon: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      conference: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
      networking: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      other: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    };
    return colors[type] || colors.other;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isUpcoming = (startDate) => {
    return new Date(startDate) > new Date();
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <FiCalendar className="mr-3 text-blue-600 dark:text-blue-400" size={24} />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            College Events
          </h3>
        </div>
        
        <div className="flex items-center space-x-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="latest">Latest</option>
            <option value="upcoming">Upcoming</option>
            <option value="past">Past</option>
          </select>
          <button
            onClick={fetchEvents}
            disabled={loading}
            className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <FiRefreshCw className={`${loading ? 'animate-spin' : ''}`} size={16} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <FiRefreshCw className="animate-spin text-blue-600" size={24} />
          <span className="ml-2 text-gray-600 dark:text-gray-400">Loading events...</span>
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-8">
          <FiCalendar className="mx-auto text-gray-400 dark:text-gray-500 mb-3" size={48} />
          <p className="text-gray-500 dark:text-gray-400">
            {filter === 'latest' ? 'No recent events' : 
             filter === 'upcoming' ? 'No upcoming events' : 'No past events'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <div
              key={event.id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                      {event.title}
                    </h4>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getEventTypeColor(event.event_type)}`}>
                      {event.event_type.replace('_', ' ').toUpperCase()}
                    </span>
                    {isUpcoming(event.start_date) && (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        UPCOMING
                      </span>
                    )}
                  </div>
                  
                  {event.description && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                      {event.description}
                    </p>
                  )}
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center">
                      <FiClock className="mr-1" size={14} />
                      <span>{formatDate(event.start_date)}</span>
                    </div>
                    
                    {event.location && (
                      <div className="flex items-center">
                        <FiMapPin className="mr-1" size={14} />
                        <span>{event.location}</span>
                      </div>
                    )}
                    
                    {event.is_online && (
                      <div className="flex items-center">
                        <FiGlobe className="mr-1" size={14} />
                        <span>Online Event</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="ml-4">
                  <button className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const StudentDashboard = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  
  console.log('🔍 Redux state check:', { user, isAuthenticated, authState: useSelector((state) => state.auth) });
  const { isOpen: isMentorChatOpen, openModal: openMentorChat, closeModal: closeMentorChat } = useMentorChatModal();
  useIdeaStatusUpdates(); // Listen for status updates
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalIdeas: 0,
    submittedIdeas: 0,
    newSubmissions: 0,
    underReviewIdeas: 0,
    approvedIdeas: 0,
    rejectedIdeas: 0,
    forwardedIdeas: 0,
    endorsedIdeas: 0,
    incubatedIdeas: 0,
    nurturedIdeas: 0,
    // College Admin specific stats
    totalStudents: 0,
    pendingReviews: 0,
    totalViews: 0,
    // Mentor specific stats
    myCollege: 0,
    otherColleges: 0,
    activeChats: 0,
  });
  
  const [recentIdeas, setRecentIdeas] = useState([]);
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [availableResources, setAvailableResources] = useState([]);
  const [feedbackComments, setFeedbackComments] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  
  // Idea evaluation modal state
  const [showIdeaEvaluation, setShowIdeaEvaluation] = useState(false);
  const [selectedIdeaForEvaluation, setSelectedIdeaForEvaluation] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);

  const fetchDashboardData = async () => {
    console.log('🔍 Authentication check:', { isAuthenticated, userId: user?.id, user: user });
    if (!isAuthenticated || !user?.id) {
      console.log('❌ Authentication failed - not fetching data');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      console.log('🔄 Fetching dashboard data for user:', user.id);
      console.log('🔑 User object:', user);
      console.log('🔑 Token exists:', !!localStorage.getItem('token'));
      
      // Check user role
      const isMentor = user?.role === 'mentor';
      const isCollegeAdmin = user?.role === 'college_admin';
      const isAdmin = user?.role === 'admin';
      const isIncubatorManager = user?.role === 'incubator_manager';
      
      console.log('👨‍🏫 Role check:', { 
        isMentor, 
        isCollegeAdmin, 
        isAdmin, 
        isIncubatorManager,
        college_id: user?.college_id, 
        role: user?.role 
      });
      
      // Call the general dashboard API for all roles
      try {
        const dashboardResponse = await fetch('http://localhost:3001/api/analytics/dashboard', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (dashboardResponse.ok) {
          const dashboardData = await dashboardResponse.json();
          console.log('✅ Dashboard data:', dashboardData);
          
          if (dashboardData.success) {
            // Handle mentor-specific data
            if (isMentor) {
              const { stats, students, conversations } = dashboardData.data;
              
              // Update stats for mentor
              setStats({
                totalIdeas: 0,
                submittedIdeas: 0,
                newSubmissions: 0,
                underReviewIdeas: 0,
                approvedIdeas: 0,
                rejectedIdeas: 0,
                forwardedIdeas: 0,
                endorsedIdeas: 0,
                incubatedIdeas: 0,
                nurturedIdeas: 0,
                // Mentor specific stats
                totalStudents: stats.total_students || 0,
                pendingReviews: 0,
                totalViews: 0,
                myCollege: stats.my_college || 0,
                otherColleges: stats.other_colleges || 0,
                activeChats: stats.active_chats || 0
              });
              
              // Set students data for mentor
              setRecentIdeas([]); // Clear ideas for mentor
              setRecentNotifications([]);
              setUpcomingEvents([]);
              setAvailableResources([]);
              setFeedbackComments([]);
              setChatMessages([]);
              
              // Store students and conversations for mentor display
              window.mentorStudents = students;
              window.mentorConversations = conversations;
              
              console.log('✅ Mentor dashboard data loaded successfully');
              setLoading(false);
              return;
            } 
            // Handle admin-specific data
            else if (isAdmin) {
              // For admin, we'll fetch additional data from admin endpoints
              try {
                const globalAnalyticsResponse = await fetch('http://localhost:3001/api/admin/analytics/global', {
                  headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                  }
                });
                
                if (globalAnalyticsResponse.ok) {
                  const analyticsData = await globalAnalyticsResponse.json();
                  console.log('✅ Admin global analytics data:', analyticsData);
                  
                  // Store global analytics data for admin dashboard
                  window.adminGlobalAnalytics = analyticsData.data;
                }
              } catch (adminError) {
                console.error('❌ Admin analytics API failed:', adminError);
              }
              
              setLoading(false);
              return;
            }
            // Handle college admin or incubator manager data
            else if (isCollegeAdmin || isIncubatorManager) {
              // Process analytics data from the response
              const analytics = dashboardData.data?.analytics || {};
              const ideas = analytics.ideas || {};
              const users = analytics.users || {};
              
              // Process ideas by status into individual counts
              const ideasByStatus = ideas.by_status || [];
              const statusCounts = {};
              ideasByStatus.forEach(item => {
                statusCounts[item.status] = item.count || 0;
              });
              
              setStats({
                totalIdeas: ideas.total || 0,
                submittedIdeas: statusCounts.submitted || 0,
                newSubmissions: statusCounts.new_submission || 0,
                underReviewIdeas: statusCounts.under_review || 0,
                endorsedIdeas: statusCounts.endorsed || 0,
                rejectedIdeas: statusCounts.rejected || 0,
                incubatedIdeas: statusCounts.incubated || 0,
                nurturedIdeas: statusCounts.nurtured || 0,
                forwardedIdeas: statusCounts.forwarded || 0,
                // Add any other stats from the response
                totalStudents: users.students || 0,
                pendingReviews: statusCounts.pending_review || 0,
              });
              
              setRecentIdeas(analytics.recent_ideas || []);
              
              console.log('✅ College admin/incubator dashboard data loaded successfully');
              setLoading(false);
              return;
            }
            
            // For student role, continue with the regular dashboard data
            const analytics = dashboardData.data?.analytics || {};
            const ideas = analytics.ideas || {};
            
            // Process ideas by status into individual counts
            const ideasByStatus = ideas.by_status || [];
            const statusCounts = {};
            ideasByStatus.forEach(item => {
              statusCounts[item.status] = item.count || 0;
            });
            
            setStats({
              totalIdeas: ideas.total || 0,
              submittedIdeas: statusCounts.submitted || 0,
              newSubmissions: statusCounts.new_submission || 0,
              underReviewIdeas: statusCounts.under_review || 0,
              approvedIdeas: statusCounts.approved || 0,
              rejectedIdeas: statusCounts.rejected || 0,
              forwardedIdeas: statusCounts.forwarded || 0,
              endorsedIdeas: statusCounts.endorsed || 0,
              incubatedIdeas: statusCounts.incubated || 0,
              nurturedIdeas: statusCounts.nurtured || 0,
            });
            
            setRecentIdeas(analytics.recent_ideas || []);
            
            console.log('✅ Student dashboard data loaded successfully');
            // Continue with fetching other data for students below
          }
        }
      } catch (error) {
        console.error('❌ Dashboard API failed:', error);
        toast.error('Failed to load dashboard data');
      }
      
      // For student role, we'll fetch additional data
      if (!isMentor && !isAdmin && !isCollegeAdmin && !isIncubatorManager) {
        try {
          // Fetch documents for student
          setDocumentsLoading(true);
          const documentsResponse = await documentsAPI.getAll();
          if (documentsResponse.data?.success) {
            setDocuments(documentsResponse.data.data?.documents || []);
            console.log('✅ Loaded documents:', documentsResponse.data.data?.documents?.length);
          }
          setDocumentsLoading(false);
        } catch (docsError) {
          console.error('❌ Documents API failed:', docsError);
          setDocumentsLoading(false);
        }
        
        // Fetch notifications
        try {
          const notificationsResponse = await notificationsAPI.getAll({
            user_id: user.id,
            limit: 5,
            sort_by: 'created_at',
            sort_order: 'desc'
          });
          
          if (notificationsResponse.data?.success) {
            setRecentNotifications(notificationsResponse.data.notifications || []);
            console.log('✅ Loaded notifications:', notificationsResponse.data.notifications?.length);
          }
        } catch (notifError) {
          console.error('❌ Notifications API failed:', notifError);
        }
        
        // Fetch upcoming events
        try {
          const eventsResponse = await eventsAPI.getAll({
            limit: 5,
            sort_by: 'start_date',
            sort_order: 'asc',
            filter: 'upcoming'
          });
          
          if (eventsResponse.data?.success) {
            setUpcomingEvents(eventsResponse.data.events || []);
            console.log('✅ Loaded events:', eventsResponse.data.events?.length);
          }
        } catch (eventsError) {
          console.error('❌ Events API failed:', eventsError);
        }
      }
      
      setLoading(false);
    } catch (error) {
      console.error('❌ Dashboard data fetch failed:', error);
      toast.error('Failed to load dashboard data');
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('🔄 useEffect triggered:', { isAuthenticated, userId: user?.id, user: user });
    if (isAuthenticated && user?.id) {
      console.log('✅ Calling fetchDashboardData from useEffect');
      fetchDashboardData();
    } else {
      console.log('❌ Not calling fetchDashboardData - missing auth or user');
    }
  }, [user?.id, isAuthenticated]);

  // Listen for idea updates to refresh dashboard
  useEffect(() => {
    const handleIdeaUpdate = () => {
      console.log('🔄 Idea updated, refreshing dashboard...');
      fetchDashboardData();
    };

    window.addEventListener('ideaUpdated', handleIdeaUpdate);

    return () => {
      window.removeEventListener('ideaUpdated', handleIdeaUpdate);
    };
  }, [fetchDashboardData]);

  // Auto-refresh dashboard every 30 seconds for live counters
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('🔄 Auto-refreshing dashboard for live counters...');
      fetchDashboardData();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  // Listen for idea status changes and refresh dashboard
  useEffect(() => {
    const handleIdeaStatusChanged = () => {
      console.log('🔄 Idea status changed, refreshing dashboard...');
      fetchDashboardData();
    };

    const handleIdeaCreated = () => {
      console.log('✨ New idea created, refreshing dashboard...');
      fetchDashboardData();
    };

    window.addEventListener('ideaStatusChanged', handleIdeaStatusChanged);
    window.addEventListener('ideaCreated', handleIdeaCreated);

    return () => {
      window.removeEventListener('ideaStatusChanged', handleIdeaStatusChanged);
      window.removeEventListener('ideaCreated', handleIdeaCreated);
    };
  }, [fetchDashboardData]);

  // Handle idea evaluation
  const handleEvaluateIdea = (idea) => {
    setSelectedIdeaForEvaluation(idea);
    setShowIdeaEvaluation(true);
  };

  const handleEvaluationComplete = (idea, newStatus) => {
    // Update the idea in recentIdeas
    setRecentIdeas(prevIdeas => 
      prevIdeas.map(i => 
        i.id === idea.id ? { ...i, status: newStatus } : i
      )
    );
    
    // Refresh dashboard data
    fetchDashboardData();
    
    // Close modal
    setShowIdeaEvaluation(false);
    setSelectedIdeaForEvaluation(null);
  };

  // Handle marking all notifications as read
  const markAllNotificationsAsRead = async () => {
    try {
      // Call the API to mark all notifications as read
      await notificationsAPI.markAllAsRead();
      
      // Update local state
      setRecentNotifications(prev => 
        prev.map(notification => ({ ...notification, is_read: true }))
      );
      
      console.log('✅ All notifications marked as read');
    } catch (error) {
      console.error('❌ Error marking all notifications as read:', error);
    }
  };

  const getStatusColor = (status) => {
    const normalizedStatus = status?.toLowerCase();
    switch (normalizedStatus) {
      case 'submitted': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'new_submission': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20';
      case 'nurture': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'pending_review': return 'text-purple-600 bg-purple-100 dark:bg-purple-900/20';
      case 'under_review': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      case 'endorsed': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'forwarded': return 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900/20';
      case 'approved': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'rejected': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'incubated': return 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/20';
      case 'nurtured': return 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900/20';
      default: return 'text-secondary-600 bg-secondary-100 dark:bg-secondary-900/20';
    }
  };

  const getEvaluationBadge = (idea) => {
    // Check if idea has been evaluated by college admin (case-insensitive)
    const status = idea.status?.toLowerCase();
    console.log('🔍 Checking evaluation badge for idea:', idea.title, 'Status:', idea.status, 'Normalized:', status);
    
    if (status === 'endorsed' || status === 'incubated' || status === 'rejected') {
      console.log('✅ Showing evaluation badge for:', idea.title);
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 ml-2">
          <FiCheckCircle className="w-3 h-3 mr-1" />
          Evaluated
        </span>
      );
    }
    return null;
  };

  const getStatusIcon = (status) => {
    const normalizedStatus = status?.toLowerCase();
    switch (normalizedStatus) {
      case 'submitted': return '📝';
      case 'new_submission': return '📝';
      case 'nurture': return '🌱';
      case 'pending_review': return '⏳';
      case 'under_review': return '🔍';
      case 'endorsed': return '✅';
      case 'forwarded': return '➡️';
      case 'approved': return '✅';
      case 'rejected': return '❌';
      case 'incubated': return '🚀';
      default: return '📄';
    }
  };

  const handleViewIdea = (ideaId) => {
    navigate(`/ideas/${ideaId}`);
  };

  const handleEditIdea = (ideaId) => {
    navigate(`/ideas/${ideaId}/edit`);
  };

  const handleLikeIdea = async (ideaId, isLiked) => {
    try {
      // The backend toggles likes, so we just call the like endpoint
      const response = await ideasAPI.addLike(ideaId, { like_type: 'like' });
      
      if (response.data && response.data.success) {
        const newLikedState = response.data.data.liked;
        
        setRecentIdeas(prev => prev.map(idea => 
          idea.id === ideaId 
            ? { 
                ...idea, 
                isLiked: newLikedState, 
                likes: newLikedState ? idea.likes + 1 : Math.max(0, idea.likes - 1)
              }
            : idea
        ));
        
        toast.success(newLikedState ? 'Liked!' : 'Removed like!');
      }
    } catch (error) {
      console.error('Error updating like:', error);
      toast.error('Failed to update like. Please try again.');
    }
  };

  const handleCommentIdea = (ideaId) => {
    // TODO: Implement comment functionality
    toast('Comment functionality will be implemented soon!');
  };

  const handlePitchIdea = (ideaId) => {
    // TODO: Implement pitch functionality
    toast('Pitch functionality will be implemented soon!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {notifications.map((notification, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg shadow-lg max-w-sm ${
                notification.type === 'success' 
                  ? 'bg-green-500 text-white' 
                  : notification.type === 'error'
                  ? 'bg-red-500 text-white'
                  : 'bg-blue-500 text-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{notification.title}</p>
                  <p className="text-sm opacity-90">{notification.message}</p>
                </div>
                <button
                  onClick={() => setNotifications(prev => prev.filter((_, i) => i !== index))}
                  className="ml-2 text-white hover:text-gray-200"
                >
                  <FiX className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {user?.role === 'college_admin' ? 'Welcome, College Admin!' : `Welcome back, ${user?.name || 'Student'}!`}
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                {user?.role === 'college_admin' 
                  ? 'Manage student innovations and endorse promising ideas for incubation.'
                  : "Here's what's happening with your ideas and activities."
                }
              </p>
            </div>
            <button
              onClick={fetchDashboardData}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              <FiRefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Cards - Sequential Workflow for College Admin */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 mb-8">
          {/* Total Ideas */}
          <div 
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <FiTarget className="h-5 w-5 text-blue-600" />
                </div>
                <div className="ml-3">
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Total Ideas</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.totalIdeas}</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">All submissions</p>
            </div>
          </div>

          {/* Stage 1: New Submissions */}
          <div 
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border-l-4 border-orange-500"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                  <FiPlus className="h-5 w-5 text-orange-600" />
                </div>
                <div className="ml-3">
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">🆕 New</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.newSubmissions}</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Awaiting review</p>
            </div>
          </div>

          {/* Stage 2: Submitted */}
          <div 
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border-l-4 border-blue-500"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <FiFile className="h-5 w-5 text-blue-600" />
                </div>
                <div className="ml-3">
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">📝 Submitted</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.submittedIdeas}</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Awaiting review</p>
            </div>
          </div>

          {/* Stage 3: Nurture */}
          <div 
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border-l-4 border-yellow-500"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                  <FiTarget className="h-5 w-5 text-yellow-600" />
                </div>
                <div className="ml-3">
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">🌱 Nurture</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.nurtureIdeas}</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Needs improvement</p>
            </div>
          </div>

          {/* Stage 4: Pending Review */}
          <div 
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border-l-4 border-purple-500"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                  <FiClock className="h-5 w-5 text-purple-600" />
                </div>
                <div className="ml-3">
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">⏳ Pending</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.pendingReviewIdeas}</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Ready for review</p>
            </div>
          </div>

          {/* Stage 5: Under Review */}
          <div 
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border-l-4 border-blue-500"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <FiEye className="h-5 w-5 text-blue-600" />
                </div>
                <div className="ml-3">
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">🔍 Review</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.underReviewIdeas}</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">In progress</p>
            </div>
          </div>

          {/* Stage 6: Endorsed */}
          <div 
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border-l-4 border-green-500"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <FiCheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div className="ml-3">
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">✅ Endorsed</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.endorsedIdeas}</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Ready for incubation</p>
            </div>
          </div>

          {/* Stage 7: Forwarded */}
          <div 
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border-l-4 border-indigo-500"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg">
                  <FiTrendingUp className="h-5 w-5 text-indigo-600" />
                </div>
                <div className="ml-3">
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">➡️ Forwarded</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.forwardedIdeas}</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Sent to incubator</p>
            </div>
          </div>

          {/* Stage 8: Incubated */}
          <div 
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border-l-4 border-purple-500"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                  <FiAward className="h-5 w-5 text-purple-600" />
                </div>
                <div className="ml-3">
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">🚀 Incubated</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.incubatedIdeas}</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">In development</p>
            </div>
          </div>

          {/* Rejected Ideas */}
          <div 
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border-l-4 border-red-500"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                  <FiX className="h-5 w-5 text-red-600" />
                </div>
                <div className="ml-3">
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">❌ Rejected</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.rejectedIdeas}</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Not selected</p>
            </div>
          </div>

          {/* College Admin Specific Cards */}
          {user?.role === 'college_admin' && (
            <>
              {/* Total Students */}
              <div
                className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
                onClick={() => navigate('/students')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg">
                      <FiUsers className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Students</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.totalStudents}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Active learners</p>
                </div>
              </div>

              {/* Pending Reviews */}
              <div
                className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
                onClick={() => navigate('/ideas/evaluate')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-2 bg-amber-100 dark:bg-amber-900/20 rounded-lg">
                      <FiClock className="h-5 w-5 text-amber-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Pending</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.pendingReviews}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Awaiting evaluation</p>
                </div>
              </div>
            </>
          )}

          {/* Mentor Specific Cards */}
          {user?.role === 'mentor' && (
            <>
              {/* Total Students */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg">
                      <FiUsers className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Total Students</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.totalStudents}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Assigned to you</p>
                </div>
              </div>

              {/* My College Students */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                      <FiUsers className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400">My College</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.myCollege}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">From your college</p>
                </div>
              </div>

              {/* Other Colleges Students */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                      <FiGlobe className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Other Colleges</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.otherColleges}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">From other colleges</p>
                </div>
              </div>

              {/* Active Chats */}
              <div 
                className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
                onClick={openMentorChat}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                      <FiMessageSquare className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Active Chats</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.activeChats}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Click to view chats</p>
                </div>
              </div>
            </>
          )}

        </div>

        {/* Statistics Graph for College Admin */}
        {user?.role === 'college_admin' && (
          <div className="mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                📊 Ideas Statistics Overview
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Bar Chart */}
                <div>
                  <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-4">Ideas by Status</h4>
                  <div className="space-y-3">
                    {[
                      { label: 'New Submissions', value: stats.newSubmissions, color: 'bg-orange-500', percentage: stats.totalIdeas > 0 ? Math.round((stats.newSubmissions / stats.totalIdeas) * 100) : 0 },
                      { label: 'Submitted', value: stats.submittedIdeas, color: 'bg-blue-500', percentage: stats.totalIdeas > 0 ? Math.round((stats.submittedIdeas / stats.totalIdeas) * 100) : 0 },
                      { label: 'Nurture', value: stats.nurtureIdeas, color: 'bg-yellow-500', percentage: stats.totalIdeas > 0 ? Math.round((stats.nurtureIdeas / stats.totalIdeas) * 100) : 0 },
                      { label: 'Pending Review', value: stats.pendingReviewIdeas, color: 'bg-purple-500', percentage: stats.totalIdeas > 0 ? Math.round((stats.pendingReviewIdeas / stats.totalIdeas) * 100) : 0 },
                      { label: 'Under Review', value: stats.underReviewIdeas, color: 'bg-cyan-500', percentage: stats.totalIdeas > 0 ? Math.round((stats.underReviewIdeas / stats.totalIdeas) * 100) : 0 },
                      { label: 'Endorsed', value: stats.endorsedIdeas, color: 'bg-green-500', percentage: stats.totalIdeas > 0 ? Math.round((stats.endorsedIdeas / stats.totalIdeas) * 100) : 0 },
                      { label: 'Forwarded', value: stats.forwardedIdeas, color: 'bg-indigo-500', percentage: stats.totalIdeas > 0 ? Math.round((stats.forwardedIdeas / stats.totalIdeas) * 100) : 0 },
                      { label: 'Incubated', value: stats.incubatedIdeas, color: 'bg-purple-500', percentage: stats.totalIdeas > 0 ? Math.round((stats.incubatedIdeas / stats.totalIdeas) * 100) : 0 },
                      { label: 'Rejected', value: stats.rejectedIdeas, color: 'bg-red-500', percentage: stats.totalIdeas > 0 ? Math.round((stats.rejectedIdeas / stats.totalIdeas) * 100) : 0 }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div className="w-20 text-sm text-gray-600 dark:text-gray-400">{item.label}</div>
                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-6 relative">
                          <div 
                            className={`${item.color} h-6 rounded-full transition-all duration-500 ease-out`}
                            style={{ width: `${item.percentage}%` }}
                          ></div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xs font-medium text-white">{item.value}</span>
                          </div>
                        </div>
                        <div className="w-12 text-sm text-gray-600 dark:text-gray-400 text-right">{item.percentage}%</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pie Chart Representation */}
                <div>
                  <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-4">Distribution Overview</h4>
                  <div className="flex items-center justify-center">
                    <div className="relative w-48 h-48">
                      {/* Pie Chart using CSS */}
                      <div className="absolute inset-0 rounded-full border-8 border-gray-200 dark:border-gray-700"></div>
                      {stats.totalIdeas > 0 && (
                        <>
                          {/* Endorsed slice */}
                          <div 
                            className="absolute inset-0 rounded-full border-8 border-green-500"
                            style={{ 
                              clipPath: `polygon(50% 50%, 50% 0%, ${50 + (stats.endorsedIdeas / stats.totalIdeas) * 50}% 0%)` 
                            }}
                          ></div>
                          {/* New Submissions slice */}
                          <div 
                            className="absolute inset-0 rounded-full border-8 border-orange-500"
                            style={{ 
                              clipPath: `polygon(50% 50%, ${50 + (stats.endorsedIdeas / stats.totalIdeas) * 50}% 0%, ${50 + ((stats.endorsedIdeas + stats.newSubmissions) / stats.totalIdeas) * 50}% 0%)` 
                            }}
                          ></div>
                        </>
                      )}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalIdeas}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Total Ideas</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Legend */}
                  <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-gray-600 dark:text-gray-400">Endorsed ({stats.endorsedIdeas})</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      <span className="text-gray-600 dark:text-gray-400">New ({stats.newSubmissions})</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-gray-600 dark:text-gray-400">Submitted ({stats.submittedIdeas})</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
                      <span className="text-gray-600 dark:text-gray-400">Review ({stats.underReviewIdeas})</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <span className="text-gray-600 dark:text-gray-400">Incubated ({stats.incubatedIdeas})</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sequential Workflow Visualization for College Admin */}
        {user?.role === 'college_admin' && (
          <div className="mb-8">
            <WorkflowDashboard user={user} />
          </div>
        )}

        {/* Pre-Incubatee Progress for Students */}
        {user?.role === 'student' && (
          <div className="mb-8">
            <StudentPreIncubateeProgress />
          </div>
        )}

        {/* Student Management for Mentors */}
        {user?.role === 'mentor' && (
          <div className="mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <FiUsers className="h-5 w-5 mr-2" />
                  My Students
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Students assigned to you for mentoring
                </p>
              </div>
              <div className="p-6">
                <div className="flex space-x-4 mb-6">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    My College
                  </button>
                  <button className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                    Other Colleges
                  </button>
                </div>
                
                {window.mentorStudents && window.mentorStudents.my_college && window.mentorStudents.my_college.length > 0 ? (
                  <div className="space-y-4">
                    <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Students from {user?.college?.name || 'Your College'} ({window.mentorStudents.my_college.length})
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {window.mentorStudents.my_college.map((student) => (
                        <div key={student.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                              <FiUsers className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <h5 className="font-medium text-gray-900 dark:text-white">{student.name}</h5>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{student.email}</p>
                            </div>
                          </div>
                          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                            {student.department && (
                              <p>📚 {student.department}</p>
                            )}
                            {student.year_of_study && (
                              <p>🎓 Year {student.year_of_study}</p>
                            )}
                            <p>💡 {student.ideas_count || 0} ideas</p>
                            {student.endorsed_ideas > 0 && (
                              <p>✅ {student.endorsed_ideas} endorsed</p>
                            )}
                          </div>
                          <div className="mt-4 flex space-x-2">
                            <button
                              onClick={openMentorChat}
                              className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 transition-colors"
                            >
                              Chat
                            </button>
                            <button className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-2 rounded text-sm hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                              View Ideas
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FiUsers className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      No students from your college yet
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      Students assigned to you will appear here
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* My Projects - Pre-Incubatee Ideas for Students */}
        {user?.role === 'student' && (
          <div className="mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                    <FiTarget className="mr-2 text-blue-600" />
                    My Projects - Pre-Incubatee Ideas
                  </h2>
                  <Link
                    to="/pre-incubatees"
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium flex items-center"
                  >
                    View All Projects
                    <FiChevronRight className="ml-1" size={16} />
                  </Link>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Track your endorsed ideas that are now in pre-incubation phase
                </p>
              </div>
              <div className="p-6">
                <MyPreIncubateeProjects />
              </div>
            </div>
          </div>
        )}

        {/* Events Section for Students */}
        {user?.role === 'student' && (
          <div className="mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6">
                <MyEvents />
              </div>
            </div>
          </div>
        )}

        {/* Documents Section for Students */}
        {user?.role === 'student' && (
          <div className="mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                    <FiFile className="mr-2 text-blue-600" />
                    Documents & Resources
                  </h2>
                  <Link
                    to="/documents"
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                  >
                    View All
                    <FiChevronRight className="ml-1" />
                  </Link>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Access important documents, guidelines, and resources
                </p>
              </div>
              <div className="p-6">
                {documentsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <FiRefreshCw className="animate-spin h-6 w-6 text-blue-600" />
                    <span className="ml-2 text-gray-600 dark:text-gray-400">Loading documents...</span>
                  </div>
                ) : documents.length > 0 ? (
                  <div className="space-y-4">
                    {documents.slice(0, 5).map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <FiFile className="h-8 w-8 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {doc.title}
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {doc.description || 'No description'}
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                doc.access_level === 'public' 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                              }`}>
                                {doc.access_level === 'public' ? 'Public' : 'Restricted'}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {doc.document_type}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              const downloadUrl = `http://localhost:3001/uploads/${doc.file_path}`;
                              const link = document.createElement('a');
                              link.href = downloadUrl;
                              link.download = doc.title;
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                            }}
                            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            title="Download document"
                          >
                            <FiEye className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {documents.length > 5 && (
                      <div className="text-center pt-2">
                        <Link
                          to="/documents"
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          View {documents.length - 5} more documents
                        </Link>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FiFile className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      No documents available
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      Documents will appear here when uploaded by your college
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Recent Ideas */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Pitch Panel - Latest Ideas
                  </h2>
          <Link
                    to="/ideas"
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
          >
            View All
          </Link>
        </div>
              </div>
              
        <div className="p-6">
          {recentIdeas.length === 0 ? (
            <div className="text-center py-8">
                    <FiTarget className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No ideas yet</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Get started by submitting your first idea.
              </p>
                    <div className="mt-6">
              <Link
                        to="/submit-idea"
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                        <FiPlus className="h-4 w-4 mr-2" />
                Submit Idea
              </Link>
                    </div>
            </div>
          ) : (
            <div className="space-y-4">
              {recentIdeas.map((idea) => (
                <div
                  key={idea.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                  <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-lg">{getStatusIcon(idea.status)}</span>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                          {idea.title}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(idea.status)}`}>
                          {idea.status === 'new_submission' ? 'NEW SUBMISSION' : 
                           idea.status === 'nurture' ? 'NURTURE' :
                           idea.status === 'under_review' ? 'UNDER REVIEW' :
                           idea.status === 'endorsed' ? 'ENDORSED' :
                           idea.status === 'forwarded' ? 'FORWARDED' :
                           idea.status === 'incubated' ? 'INCUBATED' :
                           idea.status === 'rejected' ? 'REJECTED' :
                           idea.status === 'nurtured' ? 'NURTURED' :
                           idea.status?.replace('_', ' ').toUpperCase()}
                      </span>
                      {/* Show update indicator for nurture ideas */}
                      {idea.status?.toLowerCase() === 'nurture' && idea.is_updated_in_nurture && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 ml-2">
                          <FiEdit3 className="w-3 h-3 mr-1" />
                          Updated ({idea.nurture_update_count || 0})
                        </span>
                      )}
                        {getEvaluationBadge(idea)}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        Submitted {new Date(idea.submittedAt).toLocaleDateString()}
                      </p>
                      <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center">
                          <FiEye className="h-4 w-4 mr-1" />
                        {idea.views} views
                      </span>
                        <span className="flex items-center">
                          <FiHeart className="h-4 w-4 mr-1" />
                          {idea.likes} likes
                        </span>
                        <span className="flex items-center">
                          <FiMessageSquare className="h-4 w-4 mr-1" />
                        {idea.comments} comments
                      </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex items-center justify-between">
                    <IdeaActionButtons
                      idea={idea}
                      userRole={user?.role}
                      onView={handleViewIdea}
                      onEdit={handleEditIdea}
                      onStatusUpdate={(updatedIdea) => {
                        console.log('🔄 Idea status updated in dashboard:', updatedIdea);
                        
                        // Update local state
                        setRecentIdeas(prev => prev.map(i => 
                          i.id === updatedIdea.id ? { ...i, ...updatedIdea } : i
                        ));
                        
                        // Update stats based on new status
                        setStats(prevStats => {
                          const newStats = { ...prevStats };
                          
                          // Decrease old status count
                          const oldStatus = idea.status?.toLowerCase();
                          if (oldStatus === 'submitted' || oldStatus === 'new_submission') {
                            newStats.newSubmissions = Math.max(0, newStats.newSubmissions - 1);
                          } else if (oldStatus === 'nurture' || oldStatus === 'needs_development') {
                            newStats.nurtureIdeas = Math.max(0, newStats.nurtureIdeas - 1);
                          } else if (oldStatus === 'under_review') {
                            newStats.underReviewIdeas = Math.max(0, newStats.underReviewIdeas - 1);
                          } else if (oldStatus === 'endorsed') {
                            newStats.endorsedIdeas = Math.max(0, newStats.endorsedIdeas - 1);
                          }
                          
                          // Increase new status count
                          const newStatus = updatedIdea.status?.toLowerCase();
                          if (newStatus === 'nurture' || newStatus === 'needs_development') {
                            newStats.nurtureIdeas = (newStats.nurtureIdeas || 0) + 1;
                          } else if (newStatus === 'under_review') {
                            newStats.underReviewIdeas = (newStats.underReviewIdeas || 0) + 1;
                          } else if (newStatus === 'endorsed') {
                            newStats.endorsedIdeas = (newStats.endorsedIdeas || 0) + 1;
                          } else if (newStatus === 'rejected') {
                            newStats.rejectedIdeas = (newStats.rejectedIdeas || 0) + 1;
                          }
                          
                          return newStats;
                        });
                        
                        // Show notification
                        const statusMessages = {
                          'under_review': {
                            title: 'Idea Under Review',
                            message: `"${idea.title}" is now under review. Student has been notified.`,
                            type: 'success'
                          },
                          'endorsed': {
                            title: 'Idea Endorsed',
                            message: `"${idea.title}" has been endorsed! Student has been notified.`,
                            type: 'success'
                          },
                          'rejected': {
                            title: 'Idea Rejected',
                            message: `"${idea.title}" has been rejected. Student has been notified.`,
                            type: 'error'
                          }
                        };
                        
                        const notification = statusMessages[updatedIdea.status?.toLowerCase()];
                        if (notification) {
                          setNotifications(prev => [...prev, notification]);
                          
                          // Auto-remove notification after 5 seconds
                          setTimeout(() => {
                            setNotifications(prev => prev.filter(n => n !== notification));
                          }, 5000);
                        }
                        
                        // Refresh dashboard data after a short delay
                        setTimeout(() => {
                          fetchDashboardData();
                        }, 1000);
                      }}
                    />
                    
                    
                    {/* Engagement Stats - Right Side */}
                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center">
                        <FiEye className="h-3 w-3 mr-1" />
                        {idea.views || 0} views
                      </span>
                      <span className="flex items-center">
                        <FiHeart className="h-3 w-3 mr-1" />
                        {idea.likes || 0} likes
                      </span>
                      <span className="flex items-center">
                        <FiMessageSquare className="h-3 w-3 mr-1" />
                        {idea.comments || 0} comments
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

          {/* Quick Actions & Notifications */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
      {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Quick Actions
                </h2>
              </div>
              <div className="p-6 space-y-4">
            <Link
                  to="/submit-idea"
                  className="flex items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
                  <FiPlus className="h-5 w-5 text-blue-600 mr-3" />
                  <span className="text-gray-900 dark:text-white">Submit New Idea</span>
            </Link>
                
            <Link
                  to="/ideas"
                  className="flex items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
                  <FiBookOpen className="h-5 w-5 text-green-600 mr-3" />
                  <span className="text-gray-900 dark:text-white">View My Ideas</span>
            </Link>
                
                <button
                  onClick={openMentorChat}
                  className="flex items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors w-full text-left"
                >
                  <FiMessageSquare className="h-5 w-5 text-purple-600 mr-3" />
                  <span className="text-gray-900 dark:text-white">Chat with Mentor</span>
                </button>
                
            <Link
                  to="/documents/student"
                  className="flex items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
                  <FiFile className="h-5 w-5 text-orange-600 mr-3" />
                  <span className="text-gray-900 dark:text-white">View Documents</span>
            </Link>
          </div>
        </div>

            {/* Live Activity Feed */}
            <ActivityFeed user={user} />

            {/* Recent Notifications */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Recent Notifications
                  </h2>
                  <div className="flex items-center space-x-3">
                    {recentNotifications.filter(n => !n.is_read).length > 0 && (
                      <button
                        onClick={markAllNotificationsAsRead}
                        className="text-sm text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 font-medium"
                      >
                        Mark All Read
                      </button>
                    )}
                    <Link
                      to="/notifications"
                      className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                    >
                      View All
                    </Link>
                  </div>
                </div>
              </div>
              <div className="p-6">
                {recentNotifications.length === 0 ? (
                  <div className="text-center py-4">
                    <FiBell className="mx-auto h-8 w-8 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      No notifications yet
                    </p>
                  </div>
                ) : (
          <div className="space-y-3">
                    {recentNotifications.map((notification) => (
                      <div
                        key={notification.id}
                        className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <div className="flex-shrink-0">
                          <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 dark:text-white">
                            {notification.message}
                  </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {new Date(notification.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
                  </div>
            )}
          </div>
        </div>
        </div>
        </div>
        </div>
        </div>
        </div>
      </div>
      
      {/* Mentor Chat Modal */}
      <MentorChatModal 
        isOpen={isMentorChatOpen} 
        onClose={closeMentorChat} 
        userRole="student"
      />
      
      {/* Idea Evaluation Modal */}
      <IdeaEvaluationModal
        isOpen={showIdeaEvaluation}
        onClose={() => {
          setShowIdeaEvaluation(false);
          setSelectedIdeaForEvaluation(null);
        }}
        idea={selectedIdeaForEvaluation}
        onEvaluationComplete={handleEvaluationComplete}
      />
    </>
  );
};

export default StudentDashboard;