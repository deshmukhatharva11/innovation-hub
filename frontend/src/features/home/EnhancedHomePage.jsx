import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  FiZap,
  FiUsers,
  FiTrendingUp,
  FiAward,
  FiTarget,
  FiArrowRight,
  FiCheckCircle,
  FiBarChart2,
  FiShield,
  FiDownload,
  FiMessageSquare,
  FiFileText,
  FiUserPlus,
  FiLogIn,
  FiPlay,
  FiPause,
  FiStar,
  FiChevronDown,
  FiExternalLink,
  FiLightbulb,
  FiBookOpen,
  FiCalendar,
  FiMapPin,
  FiPhone,
  FiMail,
  FiGlobe,
  FiHeart,
  FiRocket,
  FiEye,
  FiThumbsUp
} from 'react-icons/fi';
import NotificationMarquee from '../../components/common/NotificationMarquee';
import cmsService from '../../services/cmsService';
import { documentsAPI } from '../../services/api';

const EnhancedHomePage = () => {
  const { user } = useSelector((state) => state.auth);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [currentPhoto, setCurrentPhoto] = useState(0);
  const [isSlideshowPlaying, setIsSlideshowPlaying] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [documents, setDocuments] = useState([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [stats, setStats] = useState({
    totalIdeas: 0,
    totalStudents: 0,
    totalMentors: 0,
    successRate: 0
  });
  const slideshowRef = useRef(null);
  const heroRef = useRef(null);
  const statsRef = useRef(null);

  // Enhanced photos for slideshow
  const photos = [
    '/photo2.jpg',
    '/photo3.jpg',
    '/photo4.jpg',
    '/photo5.jpg',
    '/photo6.jpg',
    '/photo7.jpg',
    '/photo8.jpg',
    '/photo9.jpg',
    '/photo10.jpg',
    '/photo11.jpg',
    '/photo12.jpg',
    '/photo13.jpg',
    '/photo14.jpg',
    '/photo15.jpg',
    '/photo16.jpg',
    '/photo17.jpg',
    '/photo18.jpg',
    '/photo19.jpg',
    '/photo20.jpg',
    '/photo21.jpg',
    '/photo22.jpg',
    '/photo23.jpg',
    '/photo24.jpg',
    '/photo25.jpg',
    '/photo26.jpg',
    '/photo27.jpg',
    '/photo28.jpg',
    '/photo29.jpg',
    '/photo30.jpg',
    '/photo31.jpg',
    '/photo32.jpg',
    '/photo33.jpg',
    '/photo34.jpg',
    '/photo35.jpg',
    '/photo36.jpg',
    '/photo37.jpg',
    '/photo38.jpg',
    '/photo39.jpg',
    '/photo40.jpg',
    '/photo41.jpg',
    '/photo42.jpg',
    '/photo43.jpg',
    '/photo44.jpg',
    '/photo45.jpg',
    '/photo46.jpg',
    '/photo47.jpg',
    '/photo48.jpg',
    '/photo49.jpg',
    '/photo50.jpg',
    '/photo51.jpg',
    '/photo52.jpg',
    '/photo53.jpg',
    '/photo54.jpg',
    '/photo55.jpg',
    '/photo56.jpg',
    '/photo57.jpg',
    '/photo58.jpg',
    '/photo59.jpg',
    '/photo60.jpg',
    '/photo61.jpg',
    '/photo62.jpg',
    '/photo63.jpg',
    '/photo64.jpg',
    '/photo65.jpg',
    '/photo66.jpg',
    '/photo67.jpg',
    '/photo68.jpg',
    '/photo69.jpg',
    '/photo70.jpg',
    '/photo71.jpg',
    '/photo72.jpg',
    '/photo73.jpg',
    '/photo74.jpg',
    '/photo75.jpg',
    '/photo76.jpg',
    '/photo77.jpg',
    '/photo78.jpg',
    '/photo79.jpg',
    '/photo80.jpg',
    '/photo81.jpg',
    '/photo82.jpg',
    '/photo83.jpg',
    '/photo84.jpg',
    '/photo85.jpg',
    '/photo86.jpg',
    '/photo87.jpg',
    '/photo88.jpg',
    '/photo89.jpg',
    '/photo90.jpg',
    '/photo91.jpg',
    '/photo92.jpg',
    '/photo93.jpg',
    '/photo94.jpg',
    '/photo95.jpg',
    '/photo96.jpg',
    '/photo97.jpg',
    '/photo98.jpg',
    '/photo99.jpg',
    '/photo100.jpg'
  ];

  // Enhanced testimonials
  const testimonials = [
    {
      id: 1,
      name: "Dr. Priya Sharma",
      role: "Professor, Computer Science",
      college: "SGBAU",
      content: "The Innovation Hub has transformed how our students approach entrepreneurship. The mentorship program is exceptional, and we've seen remarkable growth in student-led startups.",
      rating: 5,
      image: "/testimonial1.jpg"
    },
    {
      id: 2,
      name: "Rajesh Kumar",
      role: "Student Entrepreneur",
      college: "SGBAU",
      content: "Through the Innovation Hub, I was able to develop my AI-based learning platform from concept to market. The support system here is incredible.",
      rating: 5,
      image: "/testimonial2.jpg"
    },
    {
      id: 3,
      name: "Dr. Meera Patel",
      role: "Incubator Manager",
      college: "SGBAU",
      content: "The platform provides comprehensive tools for idea validation, mentorship, and funding. It's a game-changer for student entrepreneurship in Maharashtra.",
      rating: 5,
      image: "/testimonial3.jpg"
    }
  ];

  // Enhanced features
  const features = [
    {
      icon: FiLightbulb,
      title: "Idea Submission & Validation",
      description: "Submit innovative ideas and get expert validation from industry professionals and academic mentors.",
      color: "yellow"
    },
    {
      icon: FiUsers,
      title: "Expert Mentorship",
      description: "Connect with experienced mentors from industry and academia for personalized guidance.",
      color: "blue"
    },
    {
      icon: FiTarget,
      title: "Incubation Support",
      description: "Get comprehensive support for idea development, prototyping, and market entry.",
      color: "green"
    },
    {
      icon: FiTrendingUp,
      title: "Growth Analytics",
      description: "Track your progress with detailed analytics and performance metrics.",
      color: "purple"
    },
    {
      icon: FiAward,
      title: "Recognition & Awards",
      description: "Participate in competitions and get recognized for your innovative contributions.",
      color: "orange"
    },
    {
      icon: FiBookOpen,
      title: "Learning Resources",
      description: "Access curated learning materials, workshops, and training programs.",
      color: "indigo"
    }
  ];

  // Enhanced stats
  const enhancedStats = [
    {
      icon: FiLightbulb,
      value: stats.totalIdeas,
      label: "Ideas Submitted",
      color: "text-yellow-600",
      bgColor: "bg-yellow-100"
    },
    {
      icon: FiUsers,
      value: stats.totalStudents,
      label: "Active Students",
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      icon: FiTarget,
      value: stats.totalMentors,
      label: "Expert Mentors",
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      icon: FiTrendingUp,
      value: `${stats.successRate}%`,
      label: "Success Rate",
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    }
  ];

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    const handleMouseMove = (e) => setMousePosition({ x: e.clientX, y: e.clientY });
    
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isSlideshowPlaying) {
      const interval = setInterval(() => {
        setCurrentPhoto((prev) => (prev + 1) % photos.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isSlideshowPlaying, photos.length]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    fetchPublicDocuments();
    fetchStats();
  }, []);

  const fetchPublicDocuments = async () => {
    try {
      setDocumentsLoading(true);
      const response = await documentsAPI.getPublic();
      setDocuments(response.data.data || []);
    } catch (error) {
      console.error('Error fetching public documents:', error);
    } finally {
      setDocumentsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Mock stats for now - replace with actual API call
      setStats({
        totalIdeas: 1250,
        totalStudents: 850,
        totalMentors: 45,
        successRate: 78
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-800">Loading Innovation Hub...</h2>
          <p className="text-gray-600">Preparing your experience</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Enhanced Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img 
                src="/sgbau_logo.png" 
                alt="SGBAU Logo" 
                className="h-10 w-auto mr-3"
              />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Innovation Hub</h1>
                <p className="text-xs text-gray-600">Sant Gadge Baba Amravati University</p>
              </div>
            </div>
            
            <nav className="hidden md:flex space-x-8">
              <button onClick={() => scrollToSection('about')} className="text-gray-700 hover:text-blue-600 transition-colors">About</button>
              <button onClick={() => scrollToSection('features')} className="text-gray-700 hover:text-blue-600 transition-colors">Features</button>
              <button onClick={() => scrollToSection('testimonials')} className="text-gray-700 hover:text-blue-600 transition-colors">Testimonials</button>
              <button onClick={() => scrollToSection('contact')} className="text-gray-700 hover:text-blue-600 transition-colors">Contact</button>
            </nav>

            <div className="flex items-center space-x-4">
              {user ? (
                <Link
                  to="/dashboard"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Dashboard
                </Link>
              ) : (
                <div className="flex space-x-3">
                  <Link
                    to="/login"
                    className="px-4 py-2 text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Enhanced Hero Section */}
      <section 
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        style={{
          background: `linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%), url(${photos[currentPhoto]})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Ignite Your
            <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Innovation
            </span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-200">
            Join Maharashtra's premier platform for student entrepreneurship and innovation
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="px-8 py-4 bg-blue-600 text-white rounded-lg text-lg font-semibold hover:bg-blue-700 transition-all transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <FiRocket className="w-5 h-5" />
              Start Your Journey
            </Link>
            <button
              onClick={() => scrollToSection('features')}
              className="px-8 py-4 border-2 border-white text-white rounded-lg text-lg font-semibold hover:bg-white hover:text-gray-900 transition-all flex items-center justify-center gap-2"
            >
              <FiEye className="w-5 h-5" />
              Explore Features
            </button>
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <FiChevronDown className="w-6 h-6 text-white" />
        </div>
      </section>

      {/* Enhanced Stats Section */}
      <section ref={statsRef} className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Our Impact</h2>
            <p className="text-xl text-blue-100">Transforming ideas into reality across Maharashtra</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {enhancedStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="text-center transform hover:scale-105 transition-all duration-300"
                >
                  <div className={`inline-flex p-4 rounded-full ${stat.bgColor} mb-4`}>
                    <Icon className={`w-8 h-8 ${stat.color}`} />
                  </div>
                  <div className={`text-4xl font-bold text-white mb-2 ${isVisible ? 'animate-count-up' : ''}`}>
                    {stat.value}
                  </div>
                  <div className="text-blue-100 text-lg">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Innovation Hub?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive tools and support to turn your innovative ideas into successful ventures
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
                >
                  <div className={`inline-flex p-3 rounded-lg bg-${feature.color}-100 mb-6`}>
                    <Icon className={`w-8 h-8 text-${feature.color}-600`} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Enhanced Testimonials Section */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">What Our Community Says</h2>
            <p className="text-xl text-gray-600">Hear from students, mentors, and industry experts</p>
          </div>
          
          <div className="relative">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 md:p-12">
              <div className="flex items-center justify-center mb-6">
                {[...Array(5)].map((_, i) => (
                  <FiStar key={i} className="w-6 h-6 text-yellow-400 fill-current" />
                ))}
              </div>
              <blockquote className="text-xl md:text-2xl text-gray-700 text-center mb-8 leading-relaxed">
                "{testimonials[currentTestimonial].content}"
              </blockquote>
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-4"></div>
                <h4 className="text-lg font-semibold text-gray-900">{testimonials[currentTestimonial].name}</h4>
                <p className="text-gray-600">{testimonials[currentTestimonial].role}</p>
                <p className="text-sm text-gray-500">{testimonials[currentTestimonial].college}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Start Your Innovation Journey?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of students who are already transforming their ideas into reality
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="px-8 py-4 bg-white text-blue-600 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <FiUserPlus className="w-5 h-5" />
              Get Started Today
            </Link>
            <Link
              to="/login"
              className="px-8 py-4 border-2 border-white text-white rounded-lg text-lg font-semibold hover:bg-white hover:text-blue-600 transition-all flex items-center justify-center gap-2"
            >
              <FiLogIn className="w-5 h-5" />
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer id="contact" className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <img src="/sgbau_logo.png" alt="SGBAU Logo" className="h-8 w-auto mr-3" />
                <div>
                  <h3 className="text-lg font-semibold">Innovation Hub</h3>
                  <p className="text-sm text-gray-400">SGBAU</p>
                </div>
              </div>
              <p className="text-gray-400 mb-4">
                Empowering student entrepreneurship and innovation across Maharashtra.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link to="/about" className="text-gray-400 hover:text-white transition-colors">About Us</Link></li>
                <li><Link to="/features" className="text-gray-400 hover:text-white transition-colors">Features</Link></li>
                <li><Link to="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link></li>
                <li><Link to="/help" className="text-gray-400 hover:text-white transition-colors">Help Center</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Resources</h4>
              <ul className="space-y-2">
                <li><Link to="/resources" className="text-gray-400 hover:text-white transition-colors">Learning Resources</Link></li>
                <li><Link to="/events" className="text-gray-400 hover:text-white transition-colors">Events</Link></li>
                <li><Link to="/mentors" className="text-gray-400 hover:text-white transition-colors">Mentors</Link></li>
                <li><Link to="/success-stories" className="text-gray-400 hover:text-white transition-colors">Success Stories</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
              <div className="space-y-2 text-gray-400">
                <div className="flex items-center gap-2">
                  <FiMapPin className="w-4 h-4" />
                  <span>Sant Gadge Baba Amravati University, Amravati</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiPhone className="w-4 h-4" />
                  <span>+91 721 266 2146</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiMail className="w-4 h-4" />
                  <span>innovation@sgbau.ac.in</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiGlobe className="w-4 h-4" />
                  <span>www.sgbau.ac.in</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p className="text-gray-400">
              © 2024 Sant Gadge Baba Amravati University - Innovation Hub. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default EnhancedHomePage;
