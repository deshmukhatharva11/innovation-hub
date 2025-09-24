import React from 'react';
import { Link } from 'react-router-dom';
import {
  FiMail,
  FiPhone,
  FiMapPin,
  FiLinkedin,
  FiTwitter,
  FiInstagram,
  FiFacebook,
  FiGlobe,
  FiHeart,
  FiArrowUp
} from 'react-icons/fi';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-secondary-900 text-white">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* SGBAU Pre-Incubation Centre Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-6">
              <img src="/sgbau_logo.png" alt="SGBAU Logo" className="w-10 h-10" />
              <span className="text-xl font-bold">SGBAU Pre-Incubation Centre</span>
            </div>
            <p className="text-secondary-400 mb-6 leading-relaxed">
              Empowering innovation across Maharashtra's Amravati division. Connecting students, colleges, and incubation centres to transform ideas into successful ventures.
            </p>
            <div className="flex space-x-4">
              <a href="https://www.sgbau.ac.in" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-secondary-800 rounded-lg flex items-center justify-center hover:bg-primary-600 transition-colors duration-200">
                <FiGlobe size={20} />
              </a>
              <a href="https://in.linkedin.com/school/sant-gadge-baba-amravati-university---india/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-secondary-800 rounded-lg flex items-center justify-center hover:bg-primary-600 transition-colors duration-200">
                <FiLinkedin size={20} />
              </a>
              <a href= "https://x.com/sherekar_swati?t=NmTj1RqddW3cLH80ZdDzng&s=08" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-secondary-800 rounded-lg flex items-center justify-center hover:bg-primary-600 transition-colors duration-200">
                <FiTwitter size={20} />
              </a>
              <a href="https://www.facebook.com/santgadgebabaamravatiuniversity/l" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-secondary-800 rounded-lg flex items-center justify-center hover:bg-primary-600 transition-colors duration-200">
                <FiFacebook size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/about" className="text-secondary-400 hover:text-white transition-colors duration-200">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-secondary-400 hover:text-white transition-colors duration-200">
                  How It Works
                </Link>
              </li>
              
            </ul>
          </div>

          {/* For Students */}
          <div>
            <h3 className="text-lg font-semibold mb-6">For Students</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/submit-idea" className="text-secondary-400 hover:text-white transition-colors duration-200">
                  Submit Your Idea
                </Link>
              </li>
              <li>
                <Link to="/mentorship" className="text-secondary-400 hover:text-white transition-colors duration-200">
                  Find Mentors
                </Link>
              </li>
              <li>
                <Link to="/resources" className="text-secondary-400 hover:text-white transition-colors duration-200">
                  Learning Resources
                </Link>
              </li>
             
              <li>
                <Link to="/community" className="text-secondary-400 hover:text-white transition-colors duration-200">
                  Student Community
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Contact Us</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <FiMapPin className="text-primary-400 mt-1 flex-shrink-0" size={18} />
                <div className="text-secondary-400">
                  <p>Sant Gadge Baba Amravati University</p>
                  <p>Pre-Incubation Centre</p>
                  <p>Amravati - 444602</p>
                  <p>Maharashtra, India</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <FiPhone className="text-primary-400 flex-shrink-0" size={18} />
                <a href="tel:+917212662206" className="text-secondary-400 hover:text-white transition-colors duration-200">
                  +91 721 266 2206
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <FiMail className="text-primary-400 flex-shrink-0" size={18} />
                <a href="mailto:pic@sgbau.ac.in" className="text-secondary-400 hover:text-white transition-colors duration-200">
                  pic@sgbau.ac.in
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <FiGlobe className="text-primary-400 flex-shrink-0" size={18} />
                <a href="https://www.sgbau.ac.in" target="_blank" rel="noopener noreferrer" className="text-secondary-400 hover:text-white transition-colors duration-200">
                  www.sgbau.ac.in
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="border-t border-secondary-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0">
              <h3 className="text-lg font-semibold mb-2">Stay Updated</h3>
              <p className="text-secondary-400">Get the latest news and updates from SGBAU Pre-Incubation Centre</p>
            </div>
            <div className="flex w-full md:w-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 md:w-80 px-4 py-3 bg-secondary-800 border border-secondary-700 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white placeholder-secondary-400"
              />
              <button className="px-6 py-3 bg-primary-600 hover:bg-primary-700 rounded-r-lg transition-colors duration-200 font-medium">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-secondary-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="text-secondary-400 mb-4 md:mb-0">
              <div className="flex items-center space-x-1">
                <span>© 2025 SGBAU Pre-Incubation Centre. Made with</span>
                <FiHeart className="text-red-500" size={16} />
                <span>in Maharashtra</span>
              </div>
              <div className="mt-1">
                Developed by <a href="https://github.com/deshmukhatharva11" target="_blank" rel="noopener noreferrer" className="text-yellow-400 hover:text-yellow-300 transition-colors duration-300">Atharva Deshmukh</a>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <Link to="/privacy" className="text-secondary-400 hover:text-white transition-colors duration-200">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-secondary-400 hover:text-white transition-colors duration-200">
                Terms of Service
              </Link>
              <Link to="/cookies" className="text-secondary-400 hover:text-white transition-colors duration-200">
                Cookie Policy
              </Link>
              <button
                onClick={scrollToTop}
                className="w-10 h-10 bg-secondary-800 rounded-lg flex items-center justify-center hover:bg-primary-600 transition-colors duration-200"
                title="Back to top"
              >
                <FiArrowUp size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Government Footer */}
      <div className="bg-secondary-950 border-t border-secondary-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between text-sm text-secondary-500">
            <div className="flex items-center space-x-4 mb-2 md:mb-0">
              <span>Sant Gadge Baba Amravati University</span>
              <span>|</span>
              <span>Pre-Incubation Centre</span>
            </div>
            <div className="flex items-center space-x-4">
              <span>Last Updated: September 2025</span>
              <span>|</span>
              <span>Version 2.0</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
