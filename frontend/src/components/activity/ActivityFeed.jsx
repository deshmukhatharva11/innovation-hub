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
  FiBell,
  FiX
} from 'react-icons/fi';
import { notificationsAPI } from '../../services/api';

const ActivityFeed = ({ user }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  
  // Calculate unread count
  const unreadCount = activities.filter(activity => !activity.is_read).length;

  useEffect(() => {
    // Load initial activities
    loadActivities();

    // Set up polling for new activities every 30 seconds
    const interval = setInterval(loadActivities, 30000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const loadActivities = async () => {
    try {
      setLoading(true);
      const response = await notificationsAPI.getAll({ limit: 10 });
      if (response.data?.success) {
        setActivities(response.data.data.notifications || []);
      }
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      // Call the API to mark all notifications as read
      await notificationsAPI.markAllAsRead();
      
      // Update local state
      setActivities(prev => 
        prev.map(activity => ({ ...activity, is_read: true }))
      );
      
      console.log('✅ All activities marked as read');
    } catch (error) {
      console.error('❌ Error marking all as read:', error);
    }
  };

  const getActivityIcon = (notification) => {
    const activityType = notification.data?.activity_type || notification.type;
    const iconMap = {
      'idea_submission': FiSend,
      'idea_review': FiClock,
      'idea_development': FiEdit3,
      'idea_endorsed': FiCheckCircle,
      'idea_forwarded': FiArrowRight,
      'idea_incubated': FiTrendingUp,
      'idea_rejected': FiAlertCircle,
      'mentor_assignment': FiUsers,
      'mentor_assigned': FiUsers,
      'status_update': FiCheckCircle,
      'workflow_progress': FiTrendingUp,
      'system_alert': FiAlertCircle,
      'info': FiBell,
      'success': FiCheckCircle,
      'warning': FiAlertCircle,
      'error': FiAlertCircle,
      'default': FiBell
    };
    const Icon = iconMap[activityType] || iconMap.default;
    return <Icon className="w-4 h-4" />;
  };

  const getActivityColor = (notification) => {
    const activityType = notification.data?.activity_type || notification.type;
    const colorMap = {
      'idea_submission': 'text-orange-500 bg-orange-100',
      'idea_review': 'text-blue-500 bg-blue-100',
      'idea_development': 'text-yellow-500 bg-yellow-100',
      'idea_endorsed': 'text-green-500 bg-green-100',
      'idea_forwarded': 'text-indigo-500 bg-indigo-100',
      'idea_incubated': 'text-purple-500 bg-purple-100',
      'idea_rejected': 'text-red-500 bg-red-100',
      'mentor_assignment': 'text-cyan-500 bg-cyan-100',
      'mentor_assigned': 'text-cyan-500 bg-cyan-100',
      'status_update': 'text-green-500 bg-green-100',
      'workflow_progress': 'text-indigo-500 bg-indigo-100',
      'system_alert': 'text-blue-500 bg-blue-100',
      'info': 'text-blue-500 bg-blue-100',
      'success': 'text-green-500 bg-green-100',
      'warning': 'text-yellow-500 bg-yellow-100',
      'error': 'text-red-500 bg-red-100',
      'default': 'text-gray-500 bg-gray-100'
    };
    return colorMap[activityType] || colorMap.default;
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now - time) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const displayedActivities = showAll ? activities : activities.slice(0, 10);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-1"></div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FiBell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Live Activity Feed
            </h3>
            {activities.length > 0 && (
              <span className="px-2 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded-full">
                {activities.length}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-3">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 font-medium"
              >
                Mark All Read
              </button>
            )}
            <button
              onClick={() => setShowAll(!showAll)}
              className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              {showAll ? 'Show Less' : 'Show All'}
            </button>
          </div>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Real-time updates on idea workflow progress
        </p>
      </div>

      <div className="p-6">
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 dark:text-gray-500 mb-2">
              <FiBell className="w-12 h-12 mx-auto" />
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              No recent activity
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
              Activity will appear here as ideas progress through the workflow
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {displayedActivities.map((activity, index) => (
                <motion.div
                  key={activity.id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-start space-x-3 p-3 rounded-lg border ${
                    activity.is_read 
                      ? 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600' 
                      : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                  }`}
                >
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${getActivityColor(activity)}`}>
                    {getActivityIcon(activity)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {activity.title}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {activity.message}
                        </p>
                        
                        {activity.data && (
                          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                            {activity.data.idea_title && (
                              <span className="inline-block bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded mr-2">
                                {activity.data.idea_title}
                              </span>
                            )}
                            {activity.data.student_name && (
                              <span className="inline-block bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                {activity.data.student_name}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatTimeAgo(activity.timestamp)}
                        </span>
                        {!activity.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {activities.length > 10 && !showAll && (
          <div className="mt-4 text-center">
            <button
              onClick={() => setShowAll(true)}
              className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              View {activities.length - 10} more activities
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityFeed;