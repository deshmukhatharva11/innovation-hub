import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FiArrowLeft, FiBell, FiCheckCircle, FiAlertCircle, FiInfo, FiClock, FiUser, FiMapPin } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { notificationsAPI } from '../../services/api';

const NotificationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allNotifications, setAllNotifications] = useState([]);

  useEffect(() => {
    fetchNotification();
    fetchAllNotifications();
  }, [id]);

  const fetchNotification = async () => {
    try {
      setLoading(true);
      const response = await notificationsAPI.getById(id);
      
      if (response.data.success) {
        setNotification(response.data.data.notification);
        // Mark as read
        await notificationsAPI.markAsRead(id);
      } else {
        toast.error('Failed to fetch notification');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error fetching notification:', error);
      toast.error('Failed to load notification');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllNotifications = async () => {
    try {
      const response = await notificationsAPI.getAll();
      if (response.data.success) {
        setAllNotifications(response.data.data.notifications);
      }
    } catch (error) {
      console.error('Error fetching all notifications:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <FiCheckCircle className="text-green-500" size={24} />;
      case 'warning':
        return <FiAlertCircle className="text-yellow-500" size={24} />;
      case 'error':
        return <FiAlertCircle className="text-red-500" size={24} />;
      default:
        return <FiInfo className="text-blue-500" size={24} />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'success':
        return 'border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800';
      case 'error':
        return 'border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800';
      default:
        return 'border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Invalid Date';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleNavigateToIdea = (ideaId) => {
    if (ideaId) {
      navigate(`/ideas/${ideaId}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!notification) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">🔔</div>
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
              Notification not found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              The notification you're looking for doesn't exist or has been removed.
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-4"
          >
            <FiArrowLeft />
            Back to Dashboard
          </button>
          
          <div className="flex items-center gap-3">
            <FiBell className="text-2xl text-gray-600 dark:text-gray-400" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Notification Details
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Notification */}
          <div className="lg:col-span-2">
            <div className={`border rounded-lg p-6 ${getNotificationColor(notification.type)}`}>
              <div className="flex items-start gap-4">
                {getNotificationIcon(notification.type)}
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {notification.title}
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                    {notification.message}
                  </p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <div className="flex items-center gap-1">
                      <FiClock />
                      <span>{formatDate(notification.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FiUser />
                      <span>{notification.data?.reviewer_name || 'System'}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {notification.data?.idea_id && (
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleNavigateToIdea(notification.data.idea_id)}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        View Idea
                      </button>
                      {notification.data?.student_id && (
                        <button
                          onClick={() => navigate(`/users/${notification.data.student_id}`)}
                          className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          View Student Profile
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Additional Data */}
            {notification.data && Object.keys(notification.data).length > 0 && (
              <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Additional Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {notification.data.idea_id && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Idea ID
                      </label>
                      <p className="text-gray-900 dark:text-white">{notification.data.idea_id}</p>
                    </div>
                  )}
                  {notification.data.student_name && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Student
                      </label>
                      <p className="text-gray-900 dark:text-white">{notification.data.student_name}</p>
                    </div>
                  )}
                  {notification.data.category && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Category
                      </label>
                      <p className="text-gray-900 dark:text-white">{notification.data.category}</p>
                    </div>
                  )}
                  {notification.data.college_name && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        College
                      </label>
                      <p className="text-gray-900 dark:text-white">{notification.data.college_name}</p>
                    </div>
                  )}
                  {notification.data.incubator_name && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Incubator
                      </label>
                      <p className="text-gray-900 dark:text-white">{notification.data.incubator_name}</p>
                    </div>
                  )}
                  {notification.data.old_status && notification.data.new_status && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Status Change
                      </label>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-sm">
                          {notification.data.old_status}
                        </span>
                        <span className="text-gray-400">→</span>
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 rounded text-sm">
                          {notification.data.new_status}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Recent Notifications */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Recent Notifications
              </h3>
              
              <div className="space-y-3">
                {allNotifications.slice(0, 5).map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      notif.id === parseInt(id)
                        ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                    onClick={() => navigate(`/notifications/${notif.id}`)}
                  >
                    <div className="flex items-start gap-2">
                      {getNotificationIcon(notif.type)}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {notif.title}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {notif.message}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          {formatDate(notif.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {allNotifications.length > 5 && (
                <button
                  onClick={() => navigate('/notifications')}
                  className="w-full mt-4 px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                >
                  View All Notifications
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationDetail;
