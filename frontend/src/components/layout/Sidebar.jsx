import React, { useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  FiHome,
  FiZap,
  FiPlus,
  FiUsers,
  FiCheckCircle,
  FiEye,
  FiBarChart2,
  FiX,
  FiUser,
  FiSettings,
  FiMapPin,
  FiTarget,
  FiMessageSquare,
  FiCalendar,
  FiFileText,
  FiDownload,
  FiActivity,
  FiBell,
  FiEdit3,
  FiDatabase
} from 'react-icons/fi';
import { setUser } from '../../store/slices/authSlice';
import { authAPI } from '../../services/api';

const Sidebar = ({ isOpen, onClose, userRole, user }) => {
  const location = useLocation();
  const dispatch = useDispatch();

  // Fetch college data if missing
  useEffect(() => {
    const fetchCollegeData = async () => {
      if (user && user.college_id && !user.college) {
        console.log('🔍 Sidebar - Fetching college data for user:', user.id);
        try {
          const response = await authAPI.getCurrentUser();
          if (response.data?.data?.user?.college) {
            console.log('🔍 Sidebar - College data fetched:', response.data.data.user.college);
            dispatch(setUser(response.data.data.user));
          }
        } catch (error) {
          console.error('🔍 Sidebar - Failed to fetch college data:', error);
        }
      }
    };

    fetchCollegeData();
  }, [user, dispatch]);

  const getNavigationItems = () => {
    const commonItems = [
      { path: '/dashboard', icon: FiHome, label: 'Dashboard' },
    ];

    switch (userRole) {
      case 'student':
        return [
          ...commonItems,
          { path: '/ideas/submit', icon: FiPlus, label: 'Submit Idea' },
          { path: '/ideas/my', icon: FiZap, label: 'My Ideas' },
          { path: '/pre-incubatees', icon: FiActivity, label: 'My Projects' },
          { path: '/events/student', icon: FiCalendar, label: 'Events' },
          { path: '/documents/student', icon: FiFileText, label: 'Documents' },
          { path: '/mentor-chat', icon: FiUsers, label: 'Mentor Chat' },
          { path: '/notifications', icon: FiBell, label: 'Notifications' },
        ];
      
      case 'college_admin':
        return [
          { path: '/dashboard', icon: FiHome, label: 'Dashboard' },
          { path: '/students', icon: FiUsers, label: 'Manage Students' },
          { path: '/ideas/evaluate', icon: FiCheckCircle, label: 'Evaluate Ideas' },
          { path: '/mentors', icon: FiUsers, label: 'Mentors' },
          { path: '/events', icon: FiCalendar, label: 'Events' },
          { path: '/documents', icon: FiFileText, label: 'Documents' },
          { path: '/reports', icon: FiDownload, label: 'Reports' },
          { path: '/mentor-chat', icon: FiMessageSquare, label: 'Mentor Chat' },
        ];
      
      case 'incubator_manager':
        return [
          ...commonItems,
          { path: '/review', icon: FiEye, label: 'Review Ideas' },
          { path: '/pre-incubatees', icon: FiActivity, label: 'Pre-Incubatees' },
          { path: '/mentors', icon: FiUsers, label: 'Mentors' },
          { path: '/events', icon: FiCalendar, label: 'Events' },
          { path: '/documents', icon: FiFileText, label: 'Documents' },
          { path: '/reports', icon: FiDownload, label: 'Reports' },
          { path: '/analytics', icon: FiBarChart2, label: 'Analytics' },
          { path: '/mentor-chat', icon: FiMessageSquare, label: 'Mentor Chat' },
        ];

      case 'admin':
        return [
          { path: '/admin', icon: FiHome, label: 'Dashboard' },
          { path: '/admin/users', icon: FiUsers, label: 'User Management' },
          { path: '/admin/colleges', icon: FiMapPin, label: 'College Management' },
          { path: '/admin/incubators', icon: FiTarget, label: 'Incubator Management' },
          { path: '/admin/college-registration', icon: FiPlus, label: 'Register College' },
          { path: '/audit', icon: FiActivity, label: 'Audit Trail' },
          { path: '/notifications/manage', icon: FiBell, label: 'Notifications' },
          { path: '/admin/settings', icon: FiSettings, label: 'System Settings' },
          { path: '/admin/cms', icon: FiEdit3, label: 'CMS Editor' },
          { path: '/admin/circulars', icon: FiFileText, label: 'Circulars' },
          { path: '/admin/backup', icon: FiDatabase, label: 'Backup & Security' },
          { path: '/admin/analytics', icon: FiBarChart2, label: 'Global Analytics' },
        ];

      case 'mentor':
        return [
          ...commonItems,
          { path: '/mentor-chat', icon: FiMessageSquare, label: 'My Students' },
          { path: '/notifications', icon: FiBell, label: 'Notifications' },
        ];

      default:
        return commonItems;
    }
  };

  const navigationItems = getNavigationItems();

  return (
    <>
      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white dark:bg-secondary-800 border-r border-secondary-200 dark:border-secondary-700 transform transition-transform duration-300 ease-in-out flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-6 border-b border-secondary-200 dark:border-secondary-700">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <img 
                src="/sgbau_logo.png" 
                alt="SGBAU Logo" 
                className="h-14 w-14"
              />
              
            </div>
            <div>
              <span className="text-sm font-semibold text-secondary-900 dark:text-white">
                {user?.college?.name 
                  ? user.college.name
                  : user?.college_id 
                    ? `College ${user.college_id}`
                    : 'Pre-Incubation Centre'
                }
              </span>
              <div className="text-xs text-secondary-600 dark:text-secondary-400">
                Pre-Incubation Centre
              </div>
            </div>
          </div>
          
          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-lg text-secondary-500 hover:bg-secondary-100 dark:hover:bg-secondary-700"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-6 space-y-2 flex-1 overflow-y-auto">
          {/* Main Navigation */}
          <div className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={`
                    sidebar-link
                    ${isActive ? 'active' : ''}
                  `}
                >
                  <Icon size={20} className="mr-3" />
                  <span className="font-medium">{item.label}</span>
                </NavLink>
              );
            })}
          </div>

          {/* Divider */}
          <div className="border-t border-secondary-200 dark:border-secondary-700 my-4"></div>

          {/* Profile & Settings */}
          <div className="space-y-2">
            <NavLink
              to="/profile"
              onClick={onClose}
              className={`
                sidebar-link
                ${location.pathname === '/profile' ? 'active' : ''}
              `}
            >
              <FiUser size={20} className="mr-3" />
              <span className="font-medium">Profile</span>
            </NavLink>
            <NavLink
              to="/settings"
              onClick={onClose}
              className={`
                sidebar-link
                ${location.pathname === '/settings' ? 'active' : ''}
              `}
            >
              <FiSettings size={20} className="mr-3" />
              <span className="font-medium">Settings</span>
            </NavLink>
          </div>
        </nav>

        {/* Role Badge */}
        <div className="absolute bottom-6 left-6 right-6">
          <div className="bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-800 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
              <span className="text-sm font-medium text-primary-700 dark:text-primary-300 capitalize">
                {userRole} Account
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
