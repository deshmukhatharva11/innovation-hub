import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FiSun, FiMoon } from 'react-icons/fi';
import { toggleTheme } from '../../store/slices/themeSlice';

const AuthLayout = ({ children }) => {
  const dispatch = useDispatch();
  const { mode } = useSelector((state) => state.theme);

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 to-primary-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Innovation Hub</h1>
            <p className="text-xl mb-8 opacity-90">
              Connecting brilliant minds with opportunities
            </p>
            <div className="space-y-4 text-left">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span>Submit innovative ideas</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span>Get college endorsements</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span>Connect with incubators</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span>Turn ideas into reality</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-white opacity-10 rounded-full"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-white opacity-10 rounded-full"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white opacity-10 rounded-full"></div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 bg-white dark:bg-secondary-900">
        {/* Theme Toggle */}
        <div className="absolute top-6 right-6">
          <button
            onClick={() => dispatch(toggleTheme())}
            className="p-2 rounded-lg bg-secondary-100 dark:bg-secondary-800 text-secondary-600 dark:text-secondary-400 hover:bg-secondary-200 dark:hover:bg-secondary-700 transition-colors duration-200"
          >
            {mode === 'light' ? <FiMoon size={20} /> : <FiSun size={20} />}
          </button>
        </div>

        {/* Logo for mobile */}
        <div className="lg:hidden mb-8 text-center">
          <h1 className="text-3xl font-bold text-primary-600 dark:text-primary-400">
            Innovation Hub
          </h1>
          <p className="text-secondary-600 dark:text-secondary-400 mt-2">
            Connecting brilliant minds with opportunities
          </p>
        </div>

        {/* Auth Form Container */}
        <div className="w-full max-w-md">
          {children}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-secondary-500 dark:text-secondary-400">
          <p>&copy; 2024 Innovation Hub. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
