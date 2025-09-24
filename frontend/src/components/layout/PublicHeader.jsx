import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setTheme } from '../../store/slices/themeSlice';
import {
  FiMenu,
  FiX,
  FiSun,
  FiMoon,
  FiMonitor,
  FiChevronDown,
  FiUser,
  FiLogIn,
  FiUserPlus,
  FiZap,
  FiUsers,
  FiTrendingUp,
  FiAward,
  FiBookOpen,
  FiHelpCircle,
  FiGlobe
} from 'react-icons/fi';

const PublicHeader = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const { mode } = useSelector((state) => state.theme);
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleThemeChange = (newTheme) => {
    dispatch(setTheme(newTheme));
  };

  const navigation = [
    {
      name: 'Home',
      href: '/',
      current: location.pathname === '/'
    },
    {
      name: 'How It Works',
      href: '/how-it-works',
      current: location.pathname === '/how-it-works'
    },
    {
      name: 'Success Stories',
      href: '/success-stories',
      current: location.pathname === '/success-stories'
    },
    {
      name: 'Resources',
      href: '#',
      dropdown: [
        { name: 'Learning Center', href: '/resources', icon: FiBookOpen },
        { name: 'Mentorship', href: '/mentorship', icon: FiUsers },
        { name: 'Funding Guide', href: '/funding', icon: FiTrendingUp },
        { name: 'Success Tips', href: '/tips', icon: FiAward }
      ]
    },
    {
      name: 'About',
      href: '/about',
      current: location.pathname === '/about'
    },
    {
      name: 'Contact',
      href: '/contact',
      current: location.pathname === '/contact'
    }
  ];

  const themeOptions = [
    { value: 'light', label: 'Light', icon: FiSun },
    { value: 'dark', label: 'Dark', icon: FiMoon },
    { value: 'system', label: 'System', icon: FiMonitor }
  ];

  return (
    <header className="bg-gray-800 text-white">
      {/* Main Header Section */}
      <div className="bg-gray-900 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Left Side - University Logo */}
            <div className="flex items-center space-x-4">
              <img 
                src="/sgbau_logo.png" 
                alt="SGBAU Logo" 
                className="h-20 w-20"
              />
            </div>
            
            {/* Center - University Name and Details */}
            <div className="text-center flex-1 mx-12">
              <h1 className="text-4xl lg:text-5xl font-bold text-purple-300 mb-3">
                Sant Gadge Baba Amravati University
              </h1>
              <div className="text-lg text-gray-300 mb-2">
                Re-Accredited with "B++" CGPA(2.96) Grade by NAAC
              </div>
              <div className="text-sm text-gray-400 italic">
                (Formerly known as Amravati University)
              </div>
            </div>
            
            {/* Right Side - Sant Gadge Baba Portrait */}
            <div className="flex items-center space-x-4">
              <img 
                src="/sant_gadgebaba.png" 
                alt="Sant Gadge Baba" 
                className="h-20 w-20 rounded-full border-4 border-yellow-400 shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Pre-Incubation Centre Branding */}
      <div className="bg-gray-800 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Left Side - Empty for spacing */}
            <div className="flex-1"></div>

            {/* Center - Pre-Incubation Centre Branding */}
            <div className="text-center">
              <Link to="/" className="group">
                <span className="text-2xl font-bold text-white group-hover:text-yellow-300 transition-colors">
                  Pre-Incubation Centre
                </span>
                <div className="text-sm text-gray-300 group-hover:text-gray-200 transition-colors">
                  SGBAU Innovation Hub
              </div>
            </Link>
          </div>

            {/* Right Side - User Actions */}
            <div className="flex items-center space-x-4 flex-1 justify-end">
              <a
                href="https://www.sgbau.ac.in"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 px-4 py-2 text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <FiGlobe size={16} />
                <span className="hidden sm:inline">SGBAU Official</span>
              </a>
            {user ? (
              <Link
                to="/dashboard"
                  className="flex items-center space-x-2 px-4 py-2 text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <FiUser size={16} />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                    className="flex items-center space-x-2 px-4 py-2 text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  <FiLogIn size={16} />
                  <span className="hidden sm:inline">Login</span>
                </Link>
                <Link
                  to="/register"
                    className="flex items-center space-x-2 px-4 py-2 bg-yellow-500 text-gray-900 hover:bg-yellow-400 rounded-lg transition-colors font-semibold"
                >
                  <FiUserPlus size={16} />
                  <span className="hidden sm:inline">Sign Up</span>
                </Link>
              </div>
            )}
            </div>
          </div>
        </div>
      </div>

      {/* Our Platform Navigation */}
      <div className="bg-gray-700 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center justify-center space-x-8">
            <Link to="/" className="text-white hover:text-yellow-300 font-semibold transition-colors">
              Home
            </Link>
            <Link to="/how-it-works" className="text-white hover:text-yellow-300 font-semibold transition-colors">
              How It Works
            </Link>
            <Link to="/about" className="text-white hover:text-yellow-300 font-semibold transition-colors">
              About
            </Link>
            <Link to="/careers" className="text-white hover:text-yellow-300 font-semibold transition-colors">
              Careers
            </Link>
            <Link to="/contact" className="text-white hover:text-yellow-300 font-semibold transition-colors">
              Contact Us
            </Link>
            <Link to="/resources" className="text-white hover:text-yellow-300 font-semibold transition-colors">
              Resources
            </Link>
            <Link to="/success-stories" className="text-white hover:text-yellow-300 font-semibold transition-colors">
              Success Stories
            </Link>
          </nav>
        </div>
      </div>


      {/* Mobile Menu */}
      <div className="lg:hidden bg-gray-800 border-t border-gray-700">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center space-x-2 text-white hover:text-yellow-300"
            >
              <FiMenu size={20} />
              <span>Menu</span>
            </button>
            
            {user ? (
                            <Link
                to="/dashboard"
                className="flex items-center space-x-2 px-3 py-2 text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <FiUser size={16} />
                <span>Dashboard</span>
                            </Link>
            ) : (
              <div className="flex items-center space-x-2">
                  <Link
                    to="/login"
                  className="px-3 py-2 text-white hover:bg-white/10 rounded-lg transition-colors"
                  >
                  Login
                  </Link>
                  <Link
                    to="/register"
                  className="px-3 py-2 bg-yellow-500 text-gray-900 hover:bg-yellow-400 rounded-lg transition-colors font-semibold"
                  >
                  Sign Up
                  </Link>
                </div>
              )}
            </div>
          
          {isMenuOpen && (
            <div className="mt-4 space-y-2">
              <div className="text-sm font-medium text-gray-400 mb-2">Our Platform</div>
              <Link to="/" className="block px-4 py-3 text-white hover:text-yellow-300 font-semibold">
                Home
              </Link>
              <Link to="/how-it-works" className="block px-4 py-3 text-white hover:text-yellow-300 font-semibold">
                How It Works
              </Link>
              <Link to="/about" className="block px-4 py-3 text-white hover:text-yellow-300 font-semibold">
                About
              </Link>
              <Link to="/careers" className="block px-4 py-3 text-white hover:text-yellow-300 font-semibold">
                Careers
              </Link>
              <Link to="/contact" className="block px-4 py-3 text-white hover:text-yellow-300 font-semibold">
                Contact Us
              </Link>
              <Link to="/resources" className="block px-4 py-3 text-white hover:text-yellow-300 font-semibold">
                Resources
              </Link>
              <Link to="/success-stories" className="block px-4 py-3 text-white hover:text-yellow-300 font-semibold">
                Success Stories
              </Link>
          </div>
        )}
        </div>
      </div>
    </header>
  );
};

export default PublicHeader;
