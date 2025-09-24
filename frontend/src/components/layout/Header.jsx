import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  FiMenu, 
  FiBell, 
  FiSun, 
  FiMoon, 
  FiUser, 
  FiSettings, 
  FiLogOut,
  FiChevronDown
} from 'react-icons/fi';
import { toggleTheme } from '../../store/slices/themeSlice';
import { logout, setUser } from '../../store/slices/authSlice';
import { authAPI } from '../../services/api';
import NotificationDropdown from '../common/NotificationDropdown';

const Header = ({ onMenuClick, user }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { mode } = useSelector((state) => state.theme);
  const { unreadCount } = useSelector((state) => state.notifications);
  
  // Debug logging
  console.log('🔍 Header - User object:', user);
  console.log('🔍 Header - College data:', user?.college);
  console.log('🔍 Header - College name:', user?.college?.name);
  console.log('🔍 Header - College ID:', user?.college_id);
  console.log('🔍 Header - Full user keys:', user ? Object.keys(user) : 'No user');
  
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const profileMenuRef = useRef(null);
  const notificationRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch college data if missing
  useEffect(() => {
    const fetchCollegeData = async () => {
      if (user && user.college_id && !user.college) {
        console.log('🔍 Header - Fetching college data for user:', user.id);
        try {
          const response = await authAPI.getCurrentUser();
          if (response.data?.data?.user?.college) {
            console.log('🔍 Header - College data fetched:', response.data.data.user.college);
            dispatch(setUser(response.data.data.user));
          }
        } catch (error) {
          console.error('🔍 Header - Failed to fetch college data:', error);
        }
      }
    };

    fetchCollegeData();
  }, [user, dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'student': return 'Student';
      case 'college': return 'PIC Coordinator';
      case 'incubator': return 'Incubation Centre Staff';
      case 'admin': return 'Super Administrator';
      default: return 'User';
    }
  };

  return (
    <header className="bg-white dark:bg-secondary-800 shadow-sm border-b border-secondary-200 dark:border-secondary-700 relative z-[100] overflow-visible">
      <div className="flex items-center justify-between px-4 sm:px-6 py-4 gap-4 overflow-visible">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          {/* Mobile menu button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg text-secondary-600 dark:text-secondary-400 hover:bg-secondary-100 dark:hover:bg-secondary-700 transition-colors duration-200"
          >
            <FiMenu size={20} />
          </button>

          {/* Logo */}
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-xs">
                {user?.college?.name 
                  ? user.college.name.substring(0, 3).toUpperCase() 
                  : user?.college_id 
                    ? `C${user.college_id}`
                    : 'GOV'
                }
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <span className="hidden sm:block text-sm font-medium text-secondary-700 dark:text-secondary-300 truncate">
                {user?.college?.name 
                  ? user.college.name
                  : user?.college_id 
                    ? `College ${user.college_id}`
                    : 'Pre-Incubation Centre'
                }
              </span>
              <span className="sm:hidden text-xs font-medium text-secondary-700 dark:text-secondary-300 truncate">
                {user?.college?.name 
                  ? user.college.name.substring(0, 15) + (user.college.name.length > 15 ? '...' : '')
                  : user?.college_id 
                    ? `College ${user.college_id}`
                    : 'Pre-Incubation'
                }
              </span>
            </div>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
          {/* Theme toggle */}
          <button
            onClick={() => dispatch(toggleTheme())}
            className="p-2 rounded-lg text-secondary-600 dark:text-secondary-400 hover:bg-secondary-100 dark:hover:bg-secondary-700 transition-colors duration-200"
          >
            {mode === 'light' ? <FiMoon size={20} /> : <FiSun size={20} />}
          </button>

          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg text-secondary-600 dark:text-secondary-400 hover:bg-secondary-100 dark:hover:bg-secondary-700 transition-colors duration-200"
            >
              <FiBell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <NotificationDropdown onClose={() => setShowNotifications(false)} />
            )}
          </div>

          {/* Profile dropdown */}
          <div className="relative z-[200]" ref={profileMenuRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center space-x-1 p-1 rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-700 transition-colors duration-200"
            >
              <div className="flex items-center space-x-1">
                <div className="w-7 h-7 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                  {user?.name ? user.name.substring(0, 2).toUpperCase() : 'CA'}
                </div>
                <div className="hidden lg:block text-left min-w-0">
                  <p className="text-xs font-medium text-secondary-900 dark:text-white truncate max-w-20">
                    {user?.name || 'User'}
                  </p>
                  <p className="text-xs text-secondary-500 dark:text-secondary-400 truncate">
                    {getRoleDisplayName(user?.role)}
                  </p>
                </div>
                <FiChevronDown size={12} className="text-secondary-400 flex-shrink-0" />
              </div>
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-secondary-800 rounded-lg shadow-xl border border-secondary-200 dark:border-secondary-700 py-1 z-[9999] transform translate-y-0" style={{ zIndex: 9999 }}>
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    navigate('/profile');
                  }}
                  className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-secondary-700 dark:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-700"
                >
                  <FiUser size={16} />
                  <span>Profile</span>
                </button>
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    navigate('/settings');
                  }}
                  className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-secondary-700 dark:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-700"
                >
                  <FiSettings size={16} />
                  <span>Settings</span>
                </button>
                <hr className="my-1 border-secondary-200 dark:border-secondary-700" />
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <FiLogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
