import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { FiBell, FiCheckCircle, FiAlertCircle, FiInfo, FiClock, FiUser, FiSearch, FiFilter } from 'react-icons/fi';

const NotificationsList = () => {
  const { user } = useSelector(state => state.auth);
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [loading, setLoading] = useState(true);

  const notificationTypes = [
    { value: 'info', label: 'Information', icon: FiInfo, color: 'blue' },
    { value: 'success', label: 'Success', icon: FiCheckCircle, color: 'green' },
    { value: 'warning', label: 'Warning', icon: FiAlertCircle, color: 'yellow' },
    { value: 'error', label: 'Error', icon: FiAlertCircle, color: 'red' },
    { value: 'reminder', label: 'Reminder', icon: FiClock, color: 'purple' },
    { value: 'announcement', label: 'Announcement', icon: FiBell, color: 'indigo' }
  ];

  useEffect(() => {
    loadNotifications();
  }, []);

  useEffect(() => {
    filterNotifications();
  }, [notifications, searchTerm, selectedType]);

  const loadNotifications = () => {
    // Mock data - in real app, this would come from API
    const mockNotifications = [
      {
        id: 1,
        title: 'Ideathon 2024 Registration Open',
        message: 'Registration for SGBAU Ideathon 2024 is now open. Submit your innovative ideas and compete for exciting prizes!',
        type: 'announcement',
        priority: 'high',
        isRead: false,
        createdAt: '2024-01-25T10:00:00Z',
        sender: 'Dr. Rajesh Kumar',
        senderRole: 'college_admin'
      },
      {
        id: 2,
        title: 'System Maintenance Notice',
        message: 'The platform will undergo scheduled maintenance on Sunday, January 28th from 2:00 AM to 4:00 AM IST.',
        type: 'warning',
        priority: 'medium',
        isRead: true,
        createdAt: '2024-01-24T15:30:00Z',
        sender: 'System Administrator',
        senderRole: 'admin'
      },
      {
        id: 3,
        title: 'Mentor Meet Session',
        message: 'Join our monthly mentor meet session on February 5th at 3:00 PM. Get guidance from industry experts.',
        type: 'reminder',
        priority: 'medium',
        isRead: false,
        createdAt: '2024-01-23T11:15:00Z',
        sender: 'Ms. Priya Sharma',
        senderRole: 'incubator_manager'
      },
      {
        id: 4,
        title: 'Idea Evaluation Deadline',
        message: 'Reminder: Please complete evaluation of pending ideas by January 30th.',
        type: 'reminder',
        priority: 'high',
        isRead: true,
        createdAt: '2024-01-22T09:45:00Z',
        sender: 'Dr. Amit Patel',
        senderRole: 'college_admin'
      },
      {
        id: 5,
        title: 'New Feature Release',
        message: 'We have launched new features including enhanced idea evaluation system and mentor database.',
        type: 'success',
        priority: 'medium',
        isRead: false,
        createdAt: '2024-01-21T14:20:00Z',
        sender: 'Development Team',
        senderRole: 'admin'
      },
      {
        id: 6,
        title: 'Security Alert',
        message: 'Multiple failed login attempts detected from suspicious IP addresses.',
        type: 'error',
        priority: 'urgent',
        isRead: true,
        createdAt: '2024-01-20T16:30:00Z',
        sender: 'Security System',
        senderRole: 'admin'
      }
    ];
    setNotifications(mockNotifications);
    setLoading(false);
  };

  const filterNotifications = () => {
    let filtered = notifications;

    if (searchTerm) {
      filtered = filtered.filter(notification =>
        notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.sender.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedType) {
      filtered = filtered.filter(notification => notification.type === selectedType);
    }

    setFilteredNotifications(filtered);
  };

  const markAsRead = (notificationId) => {
    const updatedNotifications = notifications.map(notification =>
      notification.id === notificationId ? { ...notification, isRead: true } : notification
    );
    setNotifications(updatedNotifications);
  };

  const markAllAsRead = () => {
    const updatedNotifications = notifications.map(notification => ({
      ...notification,
      isRead: true
    }));
    setNotifications(updatedNotifications);
  };

  const getTypeIcon = (type) => {
    const typeConfig = notificationTypes.find(t => t.value === type);
    return typeConfig ? typeConfig.icon : FiInfo;
  };

  const getTypeColor = (type) => {
    const typeConfig = notificationTypes.find(t => t.value === type);
    return typeConfig ? typeConfig.color : 'gray';
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
    <div className="p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Notifications</h1>
            <p className="text-gray-600">Stay updated with latest announcements and updates</p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Mark All as Read
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            {notificationTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
          <div className="flex items-center text-sm text-gray-600">
            <FiBell className="mr-2" />
            <span>{unreadCount} unread notifications</span>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.map((notification) => {
          const TypeIcon = getTypeIcon(notification.type);
          return (
            <div
              key={notification.id}
              className={`bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer ${
                !notification.isRead ? 'border-l-4 border-l-blue-500' : ''
              }`}
              onClick={() => markAsRead(notification.id)}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg bg-${getTypeColor(notification.type)}-100`}>
                    <TypeIcon className={`h-5 w-5 text-${getTypeColor(notification.type)}-600`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{notification.title}</h3>
                    <p className="text-gray-600 mb-2">{notification.message}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <FiUser className="mr-1" />
                        {notification.sender}
                      </span>
                      <span className="flex items-center">
                        <FiClock className="mr-1" />
                        {formatDate(notification.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(notification.priority)}`}>
                    {notification.priority.toUpperCase()}
                  </span>
                  {!notification.isRead && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredNotifications.length === 0 && (
        <div className="text-center py-8">
          <FiBell className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No notifications found</h3>
          <p className="mt-1 text-sm text-gray-500">Try adjusting your search criteria</p>
        </div>
      )}
    </div>
  );
};

export default NotificationsList;
