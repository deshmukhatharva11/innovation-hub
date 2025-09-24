import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  FiBell,
  FiCheck,
  FiX,
  FiTrash2,
  FiSearch,
  FiFilter,
  FiClock,
  FiAlertCircle,
  FiInfo,
  FiCheckCircle,
  FiStar,
  FiCalendar
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const NotificationSystem = () => {
  const { user } = useSelector((state) => state.auth);
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      
      // Simulate API call - in real app, this would fetch from backend
      const mockNotifications = [
        {
          id: 1,
          title: 'Ideathon 2024 Registration Open',
          message: 'Registration is now open for SGBAU Ideathon 2024. Submit your innovative ideas and compete for exciting prizes!',
          type: 'event',
          priority: 'high',
          sender: 'Dr. Rajesh Kumar',
          senderRole: 'PIC Coordinator',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          isRead: false,
          actionUrl: '/events/ideathon-2024'
        },
        {
          id: 2,
          title: 'System Maintenance Notice',
          message: 'Scheduled platform maintenance on Sunday, January 28th from 2:00 AM to 4:00 AM IST. The system will be temporarily unavailable.',
          type: 'system',
          priority: 'medium',
          sender: 'System Administrator',
          senderRole: 'Admin',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          isRead: true,
          actionUrl: null
        },
        {
          id: 3,
          title: 'Mentor Meet Session',
          message: 'Monthly mentor meet session scheduled for February 5th at 3:00 PM. Get guidance from industry experts.',
          type: 'event',
          priority: 'medium',
          sender: 'Ms. Priya Sharma',
          senderRole: 'Mentor Coordinator',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          isRead: false,
          actionUrl: '/events/mentor-meet'
        },
        {
          id: 4,
          title: 'Idea Evaluation Deadline',
          message: 'Reminder: Complete the evaluation of pending ideas by January 30th. Your feedback is crucial for the selection process.',
          type: 'deadline',
          priority: 'high',
          sender: 'Dr. Amit Patel',
          senderRole: 'Evaluation Committee',
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          isRead: false,
          actionUrl: '/ideas/evaluation'
        },
        {
          id: 5,
          title: 'New Feature Release',
          message: 'We\'ve launched new features including enhanced idea evaluation system and mentor database. Explore the updates!',
          type: 'update',
          priority: 'medium',
          sender: 'Development Team',
          senderRole: 'Technical Team',
          timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
          isRead: true,
          actionUrl: '/updates'
        }
      ];
      
      setNotifications(mockNotifications);
      setFilteredNotifications(mockNotifications);
      
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    filterNotifications();
  }, [notifications, searchTerm, filterType, filterPriority]);

  const filterNotifications = () => {
    let filtered = notifications;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(notification =>
        notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.sender.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(notification => notification.type === filterType);
    }

    // Priority filter
    if (filterPriority !== 'all') {
      filtered = filtered.filter(notification => notification.priority === filterPriority);
    }

    setFilteredNotifications(filtered);
  };

  const markAsRead = async (notificationId) => {
    try {
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      );
      
      toast.success('Marked as read');
    } catch (error) {
      console.error('Error marking as read:', error);
      toast.error('Failed to mark as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, isRead: true }))
      );
      
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('Failed to mark all as read');
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      setNotifications(prev => prev.filter(notification => notification.id !== notificationId));
      toast.success('Notification deleted');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  const deleteAllRead = async () => {
    try {
      setNotifications(prev => prev.filter(notification => !notification.isRead));
      toast.success('All read notifications deleted');
    } catch (error) {
      console.error('Error deleting read notifications:', error);
      toast.error('Failed to delete read notifications');
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high':
        return <FiAlertCircle className="text-red-500" size={16} />;
      case 'medium':
        return <FiInfo className="text-yellow-500" size={16} />;
      case 'low':
        return <FiCheckCircle className="text-green-500" size={16} />;
      default:
        return <FiBell className="text-gray-500" size={16} />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500 bg-red-50 dark:bg-red-900/10';
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/10';
      case 'low':
        return 'border-l-green-500 bg-green-50 dark:bg-green-900/10';
      default:
        return 'border-l-gray-500 bg-gray-50 dark:bg-gray-900/10';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'event':
        return <FiCalendar className="text-blue-500" size={16} />;
      case 'deadline':
        return <FiClock className="text-orange-500" size={16} />;
      case 'system':
        return <FiAlertCircle className="text-purple-500" size={16} />;
      case 'update':
        return <FiStar className="text-green-500" size={16} />;
      default:
        return <FiBell className="text-gray-500" size={16} />;
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Stay updated with important announcements and updates
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-sm px-3 py-1 rounded-full">
              {unreadCount} unread
            </span>
          )}
          <button
            onClick={markAllAsRead}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200"
          >
            Mark All Read
          </button>
          <button
            onClick={deleteAllRead}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
          >
            Delete Read
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Types</option>
              <option value="event">Events</option>
              <option value="deadline">Deadlines</option>
              <option value="system">System</option>
              <option value="update">Updates</option>
            </select>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <div className="card p-8 text-center">
            <FiBell className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No notifications found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm || filterType !== 'all' || filterPriority !== 'all'
                ? 'Try adjusting your search or filters'
                : 'You\'re all caught up! New notifications will appear here.'}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`card p-6 border-l-4 ${getPriorityColor(notification.priority)} ${
                !notification.isRead ? 'ring-2 ring-primary-200 dark:ring-primary-800' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    {getPriorityIcon(notification.priority)}
                    {getTypeIcon(notification.type)}
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {notification.title}
                    </h3>
                    {!notification.isRead && (
                      <span className="w-2 h-2 bg-primary-600 rounded-full"></span>
                    )}
                  </div>
                  
                  <p className="text-gray-700 dark:text-gray-300 mb-3">
                    {notification.message}
                  </p>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                    <span>From: {notification.sender}</span>
                    <span>•</span>
                    <span>{notification.senderRole}</span>
                    <span>•</span>
                    <span>{formatTime(notification.timestamp)}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  {!notification.isRead && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="p-2 text-gray-400 hover:text-green-500 transition-colors duration-200"
                      title="Mark as read"
                    >
                      <FiCheck size={16} />
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(notification.id)}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors duration-200"
                    title="Delete notification"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationSystem;