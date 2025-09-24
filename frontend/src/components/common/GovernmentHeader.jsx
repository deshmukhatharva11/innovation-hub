import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FiMenu, FiX, FiUser, FiLogIn, FiSearch } from 'react-icons/fi';

/**
 * GovernmentHeader component for displaying a government portal style header
 * @returns {JSX.Element} The GovernmentHeader component
 */
const GovernmentHeader = () => {
  const { user } = useSelector((state) => state.auth);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();
  
  // Track scroll position for sticky header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);
  
  // Navigation links
  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Pre-Incubation Centres', path: '/pre-incubation-centres' },
    { name: 'Success Stories', path: '/success-stories' },
    { name: 'Resources', path: '/resources' },
    { name: 'Contact', path: '/contact' },
  ];
  
  return (
    <>
      {/* Main Header */}
      <header 
        className={`bg-white dark:bg-secondary-900 py-3 shadow-md transition-all duration-300 ${
          isScrolled ? 'sticky top-0 z-50 py-2' : ''
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo and Title */}
            <div className="flex items-center space-x-4">
              <Link to="/" className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <img 
                    src="/sgbau_logo.png" 
                    alt="SGBAU Logo" 
                    className={`transition-all duration-300 ${
                      isScrolled ? 'h-10 w-10' : 'h-14 w-14'
                    }`}
                  />
                </div>
                
                <div>
                  <div className={`transition-all duration-300 ${
                    isScrolled ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl'
                  } font-bold text-primary-700 dark:text-primary-400 leading-tight`}>
                    SGBAU Pre-Incubation Centre
                  </div>
                  <div className="text-xs sm:text-sm text-secondary-600 dark:text-secondary-400">
                    Sant Gadge Baba Amravati University
                  </div>
                </div>
              </Link>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    location.pathname === link.path
                      ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                      : 'text-secondary-700 dark:text-secondary-300 hover:bg-secondary-50 dark:hover:bg-secondary-800 hover:text-primary-700 dark:hover:text-primary-400'
                  } transition-colors duration-200`}
                >
                  {link.name}
                </Link>
              ))}
            </nav>
            
            {/* Right side buttons */}
            <div className="flex items-center space-x-2">
              {/* Search button */}
              <button 
                className="p-2 rounded-full text-secondary-600 dark:text-secondary-400 hover:bg-secondary-100 dark:hover:bg-secondary-800"
                onClick={() => setSearchOpen(!searchOpen)}
                aria-label="Search"
              >
                <FiSearch size={20} />
              </button>
              
              {/* Auth buttons */}
              {user ? (
                <Link 
                  to="/dashboard" 
                  className="hidden sm:flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  <FiUser size={16} />
                  <span>Dashboard</span>
                </Link>
              ) : (
                <Link 
                  to="/login" 
                  className="hidden sm:flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  <FiLogIn size={16} />
                  <span>Login</span>
                </Link>
              )}
              
              {/* Mobile menu button */}
              <button
                className="lg:hidden p-2 rounded-md text-secondary-600 dark:text-secondary-400 hover:bg-secondary-100 dark:hover:bg-secondary-800 focus:outline-none"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Menu"
              >
                {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Search overlay */}
      {searchOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-24">
          <div className="bg-white dark:bg-secondary-800 w-full max-w-2xl mx-4 rounded-lg shadow-2xl overflow-hidden">
            <div className="p-4">
              <div className="flex items-center border-b border-secondary-200 dark:border-secondary-700 pb-2">
                <FiSearch className="text-secondary-500 mr-3" size={20} />
                <input 
                  type="text" 
                  placeholder="Search the portal..." 
                  className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 text-secondary-900 dark:text-white text-lg"
                  autoFocus
                />
                <button 
                  onClick={() => setSearchOpen(false)}
                  className="text-secondary-500 hover:text-secondary-700 dark:hover:text-secondary-300"
                >
                  <FiX size={24} />
                </button>
              </div>
              
              <div className="py-4">
                <p className="text-secondary-500 dark:text-secondary-400 text-sm">
                  Type to search for pages, resources, or content...
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white dark:bg-secondary-900 shadow-lg border-t border-secondary-200 dark:border-secondary-800">
          <div className="max-w-7xl mx-auto px-2 pt-2 pb-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  location.pathname === link.path
                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                    : 'text-secondary-700 dark:text-secondary-300 hover:bg-secondary-50 dark:hover:bg-secondary-800 hover:text-primary-700 dark:hover:text-primary-400'
                } transition-colors duration-200`}
              >
                {link.name}
              </Link>
            ))}
            
            {/* Mobile auth button */}
            {user ? (
              <Link 
                to="/dashboard" 
                className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
              >
                <FiUser size={16} />
                <span>Dashboard</span>
              </Link>
            ) : (
              <Link 
                to="/login" 
                className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
              >
                <FiLogIn size={16} />
                <span>Login</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default GovernmentHeader;
