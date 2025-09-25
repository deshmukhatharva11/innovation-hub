import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getFullApiUrl, API_ENDPOINTS } from '../../config/api';
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
  FiExternalLink
} from 'react-icons/fi';
//import GovernmentHeader from '../../components/common/GovernmentHeader';
import NotificationMarquee from '../../components/common/NotificationMarquee';
import cmsService from '../../services/cmsService';
import { documentsAPI } from '../../services/api';

const HomePage = () => {
  const { user } = useSelector((state) => state.auth);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [currentPhoto, setCurrentPhoto] = useState(0);
  const [isSlideshowPlaying, setIsSlideshowPlaying] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [documents, setDocuments] = useState([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const slideshowRef = useRef(null);
  const heroRef = useRef(null);
  const statsRef = useRef(null);
  
  // Photos for slideshow (removed first photo)
  const photos = [
    '/photo2.jpg',
    '/photo3.jpg',
    '/photo4.jpg',
    '/photo5.jpg',
    '/photo6.jpg',
    '/photo7.jpg'
  ];
  
  const [stats, setStats] = useState({
    totalIdeas: 0,
    preIncubateesForwarded: 0,
    ideasIncubated: 0,
    collegesOnboarded: 0,
    activeUsers: 0,
    mentorsRegistered: 0,
    successfulStartups: 0
  });
  
  // eslint-disable-next-line no-unused-vars
  const [pageContent, setPageContent] = useState({
    title: '',
    content: '',
    meta_title: '',
    meta_description: ''
  });
  
  const [collegesByDistrict, setCollegesByDistrict] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [circulars, setCirculars] = useState([]);
  const [animationCompleted, setAnimationCompleted] = useState(false);

  // Mouse tracking for parallax effects
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Scroll tracking for parallax effects
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Intersection Observer for animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Animate stats counter with enhanced effects
  useEffect(() => {
    if (!isVisible || animationCompleted) return;

    const animateStats = () => {
      // Use the stats from CMS or fallback to defaults
      const finalStats = {
        totalIdeas: stats.totalIdeas || 1247,
        preIncubateesForwarded: stats.preIncubateesForwarded || 342,
        ideasIncubated: stats.ideasIncubated || 89,
        collegesOnboarded: stats.collegesOnboarded || 127,
        activeUsers: stats.activeUsers || 3850,
        mentorsRegistered: stats.mentorsRegistered || 215,
        successfulStartups: stats.successfulStartups || 32
      };

      const duration = 3000;
      const steps = 100;
      const stepDuration = duration / steps;

      let step = 0;
      const timer = setInterval(() => {
        step++;
        const progress = Math.min(step / steps, 1);
        const easeOutCubic = 1 - Math.pow(1 - progress, 3);
        
        setStats(prevStats => ({
          ...prevStats,
          totalIdeas: Math.floor(finalStats.totalIdeas * easeOutCubic),
          preIncubateesForwarded: Math.floor(finalStats.preIncubateesForwarded * easeOutCubic),
          ideasIncubated: Math.floor(finalStats.ideasIncubated * easeOutCubic),
          collegesOnboarded: Math.floor(finalStats.collegesOnboarded * easeOutCubic),
          activeUsers: Math.floor(finalStats.activeUsers * easeOutCubic),
          mentorsRegistered: Math.floor(finalStats.mentorsRegistered * easeOutCubic),
          successfulStartups: Math.floor(finalStats.successfulStartups * easeOutCubic)
        }));

        if (step >= steps) {
          clearInterval(timer);
          // Ensure we set the exact final values
          setStats(prevStats => ({
            ...prevStats,
            totalIdeas: finalStats.totalIdeas,
            preIncubateesForwarded: finalStats.preIncubateesForwarded,
            ideasIncubated: finalStats.ideasIncubated,
            collegesOnboarded: finalStats.collegesOnboarded,
            activeUsers: finalStats.activeUsers,
            mentorsRegistered: finalStats.mentorsRegistered,
            successfulStartups: finalStats.successfulStartups
          }));
          setAnimationCompleted(true);
        }
      }, stepDuration);
    };

    const delayTimer = setTimeout(animateStats, 500);
    return () => clearTimeout(delayTimer);
  }, [isVisible, animationCompleted]); // Added animationCompleted to dependencies

  // Slideshow controls
  const toggleSlideshow = () => {
    setIsSlideshowPlaying(!isSlideshowPlaying);
  };

  const goToNextPhoto = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentPhoto((prev) => (prev + 1) % photos.length);
      setTimeout(() => setIsTransitioning(false), 300);
    }, 300);
  };

  const goToPrevPhoto = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentPhoto((prev) => (prev - 1 + photos.length) % photos.length);
      setTimeout(() => setIsTransitioning(false), 300);
    }, 300);
  };

  // Slideshow auto-advance effect
  useEffect(() => {
    if (!isSlideshowPlaying) return;

    const interval = setInterval(() => {
      goToNextPhoto();
    }, 8000); // Change photo every 8 seconds (slower)

    return () => clearInterval(interval);
  }, [isSlideshowPlaying, photos.length]);

  // Loading screen effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);
  
  // Fetch CMS content
  useEffect(() => {
    const fetchCMSContent = async () => {
      try {
        // Fetch homepage content
        const pageResponse = await cmsService.getPageContent('home');
        if (pageResponse.success) {
          setPageContent(pageResponse.data.page);
        }
        
        // Fetch portal statistics
        const statsResponse = await cmsService.getPortalStatistics();
        if (statsResponse.success) {
          console.log('📊 Fetched real statistics from database:', statsResponse.data.statistics);
          setStats(statsResponse.data.statistics);
        }
        
        // Fetch colleges by district
        const collegesResponse = await cmsService.getParticipatingColleges();
        if (collegesResponse.success) {
          setCollegesByDistrict(collegesResponse.data.colleges);
        }
        
        // Fetch latest circulars
        const circularsResponse = await cmsService.getLatestCirculars(3);
        if (circularsResponse.success) {
          setCirculars(circularsResponse.data.circulars);
        }
        
        // Fetch public documents
        try {
          setDocumentsLoading(true);
          const documentsResponse = await documentsAPI.getPublic();
          if (documentsResponse.data?.success) {
            setDocuments(documentsResponse.data.data?.documents || []);
          }
        } catch (docsError) {
          console.error('Error loading documents:', docsError);
        } finally {
          setDocumentsLoading(false);
        }
      } catch (error) {
        console.error('Error fetching CMS content:', error);
      }
    };
    
    fetchCMSContent();
    
    // Set up periodic refresh of statistics every 30 seconds
    const statsInterval = setInterval(() => {
      cmsService.getPortalStatistics().then(response => {
        if (response.success) {
          console.log('🔄 Refreshing statistics:', response.data.statistics);
          setStats(response.data.statistics);
          // Reset animation for new data
          setAnimationCompleted(false);
        }
      }).catch(error => {
        console.error('Error refreshing statistics:', error);
      });
    }, 30000);
    
    return () => clearInterval(statsInterval);
  }, []);

  // Photo loading effect
  const handlePhotoLoad = () => {
    // Photo loaded successfully
  };

  const testimonials = [
    {
      name: "Priya Deshmukh",
      role: "Student, Government College of Engineering, Amravati",
      content: "SGBAU Pre-Incubation Centre transformed my agricultural innovation idea into a successful venture. The mentorship and structured evaluation process were exceptional!",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150",
      company: "AgriTech Solutions Pvt Ltd"
    },
    {
      name: "Dr. Rajesh Patil",
      role: "PIC Coordinator, Government College of Engineering, Amravati",
      content: "This platform has revolutionized how we nurture student innovation across Maharashtra. Our college's success rate in forwarding ideas has increased by 300%!",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
      company: "Government College of Engineering, Amravati"
    },
    {
      name: "Prof. Sunita Sharma",
      role: "Incubation Manager, SGBAU Research & Incubation Foundation",
      content: "The streamlined process from idea submission to incubation has made our work incredibly efficient. We can now focus on what matters most - nurturing innovation across Maharashtra.",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
      company: "SGBAU Research & Incubation Foundation"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  const features = [
    {
      icon: FiZap,
      title: "Pre-Incubation Support",
      description: "Structured environment to transform innovative ideas into Minimum Viable Products (MVPs) through mentoring and technical support."
    },
    {
      icon: FiUsers,
      title: "College Network",
      description: "Connect with affiliated colleges across 5 Amravati division districts for comprehensive support."
    },
    {
      icon: FiTrendingUp,
      title: "Evaluation Pipeline",
      description: "Multi-level evaluation process from college coordinators to incubation centre experts."
    },
    {
      icon: FiTarget,
      title: "Mentor Database",
      description: "Access to experienced mentors and industry experts for guidance and support."
    },
    {
      icon: FiBarChart2,
      title: "Progress Tracking",
      description: "Real-time tracking of idea development from submission to incubation approval."
    },
    {
      icon: FiShield,
      title: "University Backing",
      description: "Official support from Sant Gadge Baba Amravati University and Research & Incubation Foundation."
    }
  ];

  const [successStories, setSuccessStories] = useState([]);

  // Fetch success stories from database
  useEffect(() => {
    const fetchSuccessStories = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://web-production-33931.up.railway.app'}/api/ideas?status=incubated&limit=3`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data.ideas) {
            const stories = data.data.ideas.slice(0, 3).map(idea => ({
              company: idea.title || 'Innovation Project',
              founder: idea.student_name || 'Student',
              description: idea.description || 'Innovative solution',
              valuation: '₹' + (Math.floor(Math.random() * 50) + 10) + ' Cr',
              category: idea.category || 'Technology',
              college: idea.college_name || 'SGBAU Affiliated College',
              image: idea.image_url || 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400'
            }));
            setSuccessStories(stories);
          }
        }
      } catch (error) {
        console.error('Error fetching success stories:', error);
        // Fallback to mock data
        setSuccessStories([
    {
      company: "AgriTech Solutions",
      founder: "Sneha Joshi",
      description: "Smart irrigation system helping farmers increase crop yield by 40%",
      valuation: "₹50 Cr",
      category: "Agriculture",
            college: "Government College of Engineering, Amravati",
      image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400"
    },
    {
      company: "HealthCare AI",
      founder: "Vikram Kulkarni",
      description: "AI-powered diagnostic tool for early disease detection",
      valuation: "₹75 Cr",
      category: "Healthcare",
            college: "Jotiba Fule College, Amravati",
      image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400"
    },
    {
      company: "EduTech Pro",
      founder: "Anita Desai",
      description: "Personalized learning platform for rural students",
      valuation: "₹30 Cr",
      category: "Education",
            college: "Shri Shivaji College, Akola",
      image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400"
    }
        ]);
      }
    };

    fetchSuccessStories();
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-secondary-900">
      {/* Loading Screen */}
      {isLoading && (
        <div className="fixed inset-0 z-50 bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center">
          <div className="text-center">
            <div className="relative mb-8">
              <img 
                src="/sant_gadgebaba.png" 
                alt="Sant Gadge Baba" 
                className="h-24 w-24 mx-auto animate-pulse rounded-full border-4 border-yellow-400"
              />
              <div className="absolute inset-0 bg-yellow-400/20 rounded-full blur-xl animate-pulse"></div>
        </div>
            <h2 className="text-4xl font-bold text-white mb-4 animate-fade-in-up">
              SGBAU Pre-Incubation Centre
            </h2>
            <div className="w-50 h-1 bg-gray-400 rounded-full mx-auto overflow-hidden">
              <div className="h-full bg-gradient-to-r from-yellow-400 to-purple-500 rounded-full animate-shimmer"></div>
            </div>
            <p className="text-gray-300 mt-4 animate-fade-in-up animation-delay-200">
              Loading Innovation Portal...
            </p>
          </div>
        </div>
      )}
      
      {/* Notification Marquee */}
      <NotificationMarquee />

      {/* Hero Section with Enhanced Modern Theme */}
      <section ref={heroRef} className="relative text-white overflow-hidden min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700">
        {/* Photo Slideshow Background */}
        <div className="absolute inset-0 z-0">
          {/* Current Photo */}
          <div className="relative w-full h-full">
            <img
              key={currentPhoto}
              src={photos[currentPhoto]}
              alt={`SGBAU Campus Photo ${currentPhoto + 1}`}
              className={`w-full h-full object-cover transition-opacity duration-500 ${
                isTransitioning ? 'opacity-0' : 'opacity-100'
              }`}
              onLoad={handlePhotoLoad}
            />
            
            {/* Photo Overlay with Black Opacity */}
            <div className="absolute inset-0 bg-black/60"></div>
          </div>
          
          {/* Photo Indicators */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
            {photos.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPhoto(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentPhoto 
                    ? 'bg-white scale-125' 
                    : 'bg-white/50 hover:bg-white/75'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Animated Background Elements */}
        <div className="absolute inset-0 z-10">
          {/* Floating Particles */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(100)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full animate-float"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 5}s`,
                  animationDuration: `${3 + Math.random() * 4}s`,
                  width: `${2 + Math.random() * 4}px`,
                  height: `${2 + Math.random() * 4}px`,
                  backgroundColor: `rgba(255, 255, 255, ${0.1 + Math.random() * 0.3})`,
                  boxShadow: `0 0 ${10 + Math.random() * 20}px rgba(255, 255, 255, 0.3)`
                }}
              />
            ))}
          </div>

          {/* Ambient Light Orbs */}
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-yellow-400/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-3/4 right-1/4 w-48 h-48 bg-purple-400/10 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/2 w-24 h-24 bg-blue-400/10 rounded-full blur-2xl animate-pulse animation-delay-4000"></div>

          {/* Parallax Elements */}
          <div 
            className="absolute top-20 left-20 w-96 h-96 bg-yellow-400/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"
            style={{
              transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`
            }}
          />
          <div 
            className="absolute top-40 right-20 w-96 h-96 bg-purple-400/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"
            style={{
              transform: `translate(${mousePosition.x * -0.02}px, ${mousePosition.y * 0.02}px)`,
              animationDelay: '2s'
            }}
          />
          <div 
            className="absolute bottom-20 left-40 w-96 h-96 bg-blue-400/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"
            style={{
              transform: `translate(${mousePosition.x * 0.01}px, ${mousePosition.y * -0.01}px)`,
              animationDelay: '4s'
            }}
          />
        </div>
        
        {/* Slideshow Controls */}
        <div className="absolute top-4 right-4 z-50 flex space-x-2">
          <button
            onClick={goToPrevPhoto}
            disabled={isTransitioning}
            className="p-3 bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-black/70 transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Previous Photo"
          >
            <FiArrowRight size={20} className="rotate-180" />
          </button>
          <button
            onClick={toggleSlideshow}
            className="p-3 bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-black/70 transition-all duration-300 hover:scale-110"
            title={isSlideshowPlaying ? "Pause Slideshow" : "Play Slideshow"}
          >
            {isSlideshowPlaying ? <FiPause size={20} /> : <FiPlay size={20} />}
          </button>
          <button
            onClick={goToNextPhoto}
            disabled={isTransitioning}
            className="p-3 bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-black/70 transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Next Photo"
          >
            <FiArrowRight size={20} />
          </button>
        </div>

        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center min-h-[600px]">
            <div className="space-y-8">
              {/* Pre-Incubation Centre Branding with Animations */}
              <div className="space-y-6">
                <div className="flex items-center space-x-6 animate-fade-in-up">
                  <div className="relative group">
                    <img 
                      src="/sgbau_logo.png" 
                      alt="Sant Gadge Baba" 
                      className="h-24 w-24 rounded-full border-4 border-yellow-400 shadow-2xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12"
                    />
                    <div className="absolute inset-0 bg-yellow-400/30 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                  </div>
                  <div className="relative group">
                    <img 
                      src="/sant_gadgebaba.png" 
                      alt="SGBAU Logo" 
                      className="h-24 w-24 rounded-full border-4 border-yellow-400 shadow-2xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12"
                    />
                    <div className="absolute inset-0 bg-yellow-400/30 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                  </div>
                </div>
                
                <div className="space-y-4 animate-fade-in-up animation-delay-200">
                  <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                    <span className="inline-block animate-slide-in-left">SGBAU Pre-Incubation</span>
                    <br />
                    <span className="inline-block animate-slide-in-right text-accent-400 bg-gradient-to-r from-accent-400 via-accent-300 to-accent-500 bg-clip-text text-transparent">
                      Centre
                    </span>
              </h1>
                  
                  <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-8 border border-gray-700 animate-fade-in-up animation-delay-400 hover:bg-gray-800/80 transition-all duration-500 group">
                    <h2 className="text-2xl font-bold text-primary-300 mb-3 group-hover:text-primary-200 transition-colors duration-300">
                      Sant Gadge Baba Amravati University
                    </h2>
                    <p className="text-base text-gray-300 mb-2 group-hover:text-gray-200 transition-colors duration-300">
                      Re-Accredited with "B++" CGPA(2.96) Grade by NAAC
                    </p>
                    <p className="text-sm text-gray-400 italic mb-4 group-hover:text-gray-300 transition-colors duration-300">
                      (Formerly known as Amravati University)
                    </p>
                    <p className="text-xl text-yellow-300 italic font-medium group-hover:text-yellow-200 transition-colors duration-300">
                      "सा विद्या या विमुक्तये" - That is knowledge which liberates
                    </p>
                  </div>
                </div>
              </div>
              
              <p className="text-lg lg:text-xl mb-8 text-gray-200 leading-relaxed animate-fade-in-up animation-delay-600">
                Pre-Incubation Centres (PICs) are innovation hubs established across SGBAU's network to identify, nurture, and transform student ideas into successful ventures through mentoring, workshops, and technical support.
              </p>
              
              {/* Website Features with Enhanced Animations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 animate-fade-in-up animation-delay-800">
                {[
                  { title: "For Students", desc: "Submit ideas, get mentorship, access resources", icon: FiZap, color: "from-blue-500 to-cyan-500" },
                  { title: "For Colleges", desc: "Manage students, evaluate ideas, track progress", icon: FiUsers, color: "from-green-500 to-emerald-500" },
                  { title: "For Incubators", desc: "Review forwarded ideas, provide mentorship", icon: FiTarget, color: "from-purple-500 to-pink-500" },
                  { title: "For Admins", desc: "System management, analytics, reports", icon: FiBarChart2, color: "from-orange-500 to-red-500" }
                ].map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <div 
                      key={index}
                      className="group bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700 hover:bg-gray-800/80 transition-all duration-500 hover:scale-105 hover:shadow-2xl cursor-pointer"
                      style={{ animationDelay: `${800 + index * 100}ms` }}
                    >
                      <div className="flex items-center space-x-3 mb-2">
                        <div className={`w-8 h-8 bg-gradient-to-r ${feature.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                          <Icon className="text-white" size={16} />
                        </div>
                        <h3 className="text-lg font-semibold text-yellow-400 group-hover:text-yellow-300 transition-colors duration-300">
                          {feature.title}
                        </h3>
                      </div>
                      <p className="text-sm text-gray-300 group-hover:text-gray-200 transition-colors duration-300">
                        {feature.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up animation-delay-1000">
                {!user ? (
                  <>
                    <Link to="/register" className="group inline-flex items-center justify-center bg-gradient-to-r from-accent-500 to-accent-400 text-gray-900 hover:from-accent-400 hover:to-accent-300 px-8 py-4 text-lg font-bold rounded-lg shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-accent-500/25 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-accent-400 to-accent-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <FiZap className="mr-2 relative z-10 group-hover:animate-spin" size={20} />
                      <span className="relative z-10">Start Your Journey</span>
                    </Link>
                    <Link to="/login" className="group inline-flex items-center justify-center border-2 border-white text-white hover:bg-white hover:text-gray-900 px-8 py-4 text-lg font-bold rounded-lg transition-all duration-300 hover:scale-105 backdrop-blur-sm">
                      <FiLogIn className="mr-2 group-hover:translate-x-1 transition-transform duration-300" size={20} />
                      Login
                    </Link>
                  </>
                ) : (
                  <Link to="/dashboard" className="group inline-flex items-center justify-center bg-gradient-to-r from-accent-500 to-accent-400 text-gray-900 hover:from-accent-400 hover:to-accent-300 px-8 py-4 text-lg font-bold rounded-lg shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-accent-500/25 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-accent-400 to-accent-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <FiArrowRight className="mr-2 relative z-10 group-hover:translate-x-1 transition-transform duration-300" size={20} />
                    <span className="relative z-10">Go to Dashboard</span>
                  </Link>
                )}
              </div>

              {/* Scroll Indicator */}
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
                <FiChevronDown size={24} className="text-white/70" />
            </div>
            </div>
            
            <div className="relative flex justify-center lg:justify-end">
              <div className="relative z-10 max-w-lg">
                <img
                  src="/photo2.jpg"
                  alt="Innovation Team"
                  className="w-full h-auto rounded-3xl shadow-2xl border-4 border-yellow-400/30"
                />
                <div className="absolute -top-6 -right-6 w-full h-full bg-gradient-to-br from-yellow-400 to-purple-500 rounded-3xl opacity-20 -z-10"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Modern Stats Section */}
      <section ref={statsRef} className="py-20 bg-gradient-to-br from-white via-gray-50 to-white dark:from-secondary-800 dark:via-secondary-900 dark:to-secondary-800 relative overflow-hidden">
        {/* Modern Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-primary-500/5 via-accent-500/5 to-primary-500/5"></div>
              </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-secondary-900 dark:text-white mb-4 animate-fade-in-up">
              Portal Statistics
            </h2>
            <p className="text-xl text-secondary-600 dark:text-secondary-400 animate-fade-in-up animation-delay-200">
              Live counter showcasing our impact across Maharashtra
            </p>
            </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { 
                value: stats.totalIdeas, 
                label: "Total Ideas Submitted", 
                color: "from-blue-500 to-cyan-500", 
                icon: FiZap,
                link: "/success-stories"
              },
              { 
                value: stats.preIncubateesForwarded, 
                label: "Pre-Incubatees Forwarded", 
                color: "from-green-500 to-emerald-500", 
                icon: FiTarget,
                link: "/success-stories"
              },
              { 
                value: stats.ideasIncubated, 
                label: "Ideas Incubated", 
                color: "from-purple-500 to-pink-500", 
                icon: FiAward,
                link: "/about"
              },
              { 
                value: stats.collegesOnboarded, 
                label: "Colleges Onboarded", 
                color: "from-orange-500 to-red-500", 
                icon: FiUsers,
                link: "/about"
              },
              { 
                value: stats.activeUsers, 
                label: "Active Users", 
                color: "from-teal-500 to-cyan-500", 
                icon: FiUserPlus,
                link: "/about"
              },
              { 
                value: stats.mentorsRegistered, 
                label: "Registered Mentors", 
                color: "from-indigo-500 to-blue-500", 
                icon: FiTarget,
                link: "/about"
              },
              { 
                value: stats.successfulStartups, 
                label: "Successful Startups", 
                color: "from-accent-500 to-accent-600", 
                icon: FiZap,
                link: "/success-stories"
              },
              { 
                value: "24/7", 
                label: "Support & Resources", 
                color: "from-red-500 to-rose-500", 
                icon: FiMessageSquare,
                link: "/resources",
                isText: true
              }
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Link 
                  key={index}
                  to={stat.link} 
                  className="group text-center hover:scale-110 transition-all duration-500 hover:z-10 relative"
                  style={{ animationDelay: `${index * 200}ms` }}
                >
                  <div className="relative bg-white dark:bg-secondary-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-200 dark:border-gray-700 group-hover:border-transparent overflow-hidden">
                    {/* Background Gradient */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
                    
                    {/* Icon */}
                    <div className={`w-16 h-16 bg-gradient-to-r ${stat.color} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="text-white" size={32} />
              </div>
                    
                    {/* Animated Counter */}
                    <div className={`text-5xl lg:text-6xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      {stat.isText ? stat.value : `${(stat.value || 0).toLocaleString()}+`}
            </div>
                    
                    <div className="text-lg text-secondary-600 dark:text-secondary-400 font-semibold group-hover:text-secondary-900 dark:group-hover:text-white transition-colors duration-300">
                      {stat.label}
              </div>
                    
                    {/* Hover Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Enhanced Modern Features Section */}
      <section className="py-20 bg-gradient-to-br from-white via-gray-50 to-white dark:from-secondary-900 dark:via-secondary-800 dark:to-secondary-900 relative overflow-hidden">
        {/* Modern Background Elements */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-32 h-32 bg-primary-500/10 rounded-full"></div>
          <div className="absolute bottom-10 right-10 w-24 h-24 bg-accent-500/10 rounded-full"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-secondary-900 dark:text-white mb-6 animate-fade-in-up">
              About Pre-Incubation Centres (PICs)
            </h2>
            <p className="text-xl text-secondary-600 dark:text-secondary-400 max-w-3xl mx-auto animate-fade-in-up animation-delay-200">
              Pre-Incubation Centres (PICs) are innovation-focused centers established across Sant Gadge Baba Amravati University's affiliated colleges and recognized institutions. Aligned with our motto "सा विद्या या विमुक्तये" (That is knowledge which liberates), these centers identify, nurture, and support innovative ideas from students and researchers, transforming them into impactful solutions for society.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Link 
                  key={index} 
                  to="/how-it-works" 
                  className="group p-8 rounded-2xl bg-white dark:bg-secondary-800 hover:bg-gradient-to-br hover:from-primary-50 hover:to-purple-50 dark:hover:from-primary-900/20 dark:hover:to-purple-900/20 transition-all duration-500 hover:shadow-2xl hover:-translate-y-3 cursor-pointer border border-gray-200 dark:border-gray-700 hover:border-transparent relative overflow-hidden"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Background Gradient on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  {/* Icon with Enhanced Animation */}
                  <div className="relative w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 group-hover:shadow-lg">
                    <Icon className="text-primary-600 dark:text-primary-400 group-hover:text-primary-700 dark:group-hover:text-primary-300 transition-colors duration-300" size={32} />
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-purple-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-secondary-900 dark:text-white mb-4 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-secondary-600 dark:text-secondary-400 group-hover:text-secondary-700 dark:group-hover:text-secondary-300 transition-colors duration-300">
                    {feature.description}
                  </p>
                  
                  {/* Hover Shimmer Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* District-wise College Listings */}
      <section className="py-20 bg-white dark:bg-secondary-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-secondary-900 dark:text-white mb-6">
              Participating Colleges by District
            </h2>
            <p className="text-xl text-secondary-600 dark:text-secondary-400 max-w-3xl mx-auto">
              SGBAU's Pre-Incubation Centres span across 5 districts of Maharashtra's Amravati division, creating a comprehensive innovation ecosystem
            </p>
          </div>
          
          {/* District Filter */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex bg-secondary-100 dark:bg-secondary-800 rounded-lg p-1">
              <button
                onClick={() => setSelectedDistrict('all')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedDistrict === 'all'
                    ? 'bg-white dark:bg-secondary-700 shadow text-primary-700 dark:text-primary-400'
                    : 'text-secondary-700 dark:text-secondary-300 hover:text-primary-700 dark:hover:text-primary-400'
                }`}
              >
                All Districts
              </button>
              
              {collegesByDistrict.map((district) => (
                <button
                  key={district.district}
                  onClick={() => setSelectedDistrict(district.district)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    selectedDistrict === district.district
                      ? 'bg-white dark:bg-secondary-700 shadow text-primary-700 dark:text-primary-400'
                      : 'text-secondary-700 dark:text-secondary-300 hover:text-primary-700 dark:hover:text-primary-400'
                  }`}
                >
                  {district.district}
                </button>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {collegesByDistrict
              .filter(district => selectedDistrict === 'all' || district.district === selectedDistrict)
              .map((district, index) => (
                <div key={index} className="bg-secondary-50 dark:bg-secondary-800 rounded-2xl p-6 hover:shadow-lg transition-shadow duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-secondary-900 dark:text-white">
                      {district.district} District
                    </h3>
                    <div className="bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 text-xs font-semibold px-2 py-1 rounded-full">
                      {district.activePICs}/{district.totalColleges} PICs
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                    {district.colleges.map((college, idx) => (
                      <div 
                        key={idx} 
                        className={`flex items-start p-3 rounded-lg border transition-all duration-200 hover:shadow-md ${
                          college.hasPIC 
                            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                            : 'bg-secondary-50 dark:bg-secondary-700 border-secondary-200 dark:border-secondary-600'
                        }`}
                      >
                        {/* College Logo */}
                        <div className="flex-shrink-0 mr-3">
                          {college.logo_url ? (
                            <img 
                              src={college.logo_url} 
                              alt={`${college.name} logo`}
                              className="w-10 h-10 rounded-lg object-cover border border-secondary-200 dark:border-secondary-600"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div 
                            className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm ${
                              college.hasPIC ? 'bg-green-500' : 'bg-secondary-500'
                            }`}
                            style={{ display: college.logo_url ? 'none' : 'flex' }}
                          >
                            {college.name.charAt(0)}
                          </div>
                        </div>
                        
                        {/* College Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className={`font-semibold text-sm truncate ${
                              college.hasPIC 
                                ? 'text-secondary-900 dark:text-white' 
                                : 'text-secondary-600 dark:text-secondary-400'
                            }`}>
                              {college.name}
                            </h4>
                            {college.hasPIC && (
                              <span className="ml-2 text-xs text-green-600 dark:text-green-400 font-medium bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">
                                Active PIC
                              </span>
                            )}
                          </div>
                          
                          {/* College Details */}
                          <div className="mt-1 space-y-1">
                            {college.address && (
                              <p className="text-xs text-secondary-500 dark:text-secondary-400 truncate">
                                📍 {college.address}
                              </p>
                            )}
                            
                            {/* Contact Info */}
                            <div className="flex items-center space-x-3">
                              {college.website && (
                                <a 
                                  href={college.website} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 transition-colors duration-200 flex items-center"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  🌐 Website
                                </a>
                              )}
                              
                              {college.contact_email && (
                                <a 
                                  href={`mailto:${college.contact_email}`}
                                  className="text-xs text-secondary-500 dark:text-secondary-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200 flex items-center"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  ✉️ Email
                                </a>
                              )}
                              
                              {college.contact_phone && (
                                <a 
                                  href={`tel:${college.contact_phone}`}
                                  className="text-xs text-secondary-500 dark:text-secondary-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200 flex items-center"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  📞 Call
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex justify-between text-sm pt-4 border-t border-secondary-200 dark:border-secondary-700">
                    <span className="text-primary-600 dark:text-primary-400 font-medium">
                      {district.totalColleges} Colleges
                    </span>
                    <span className="text-green-600 dark:text-green-400 font-medium">
                      {district.activePICs} Active PICs
                    </span>
                  </div>
                </div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-20 bg-secondary-50 dark:bg-secondary-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-secondary-900 dark:text-white mb-6">
              Colleges with Active Pre-Incubation Centres
            </h2>
            <p className="text-xl text-secondary-600 dark:text-secondary-400 max-w-3xl mx-auto">
              Success stories from our affiliated colleges across Amravati division districts
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {successStories.map((story, index) => (
              <Link 
                key={index} 
                to="/success-stories" 
                className="group bg-white dark:bg-secondary-900 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={story.image}
                    alt={story.company}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 bg-primary-600 text-white text-sm font-medium rounded-full">
                      {story.category}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-secondary-900 dark:text-white mb-2">
                    {story.company}
                  </h3>
                  <p className="text-primary-600 dark:text-primary-400 font-medium mb-3">
                    Founded by {story.founder}
                  </p>
                  <p className="text-secondary-500 dark:text-secondary-500 text-sm mb-2">
                    {story.college}
                  </p>
                  <p className="text-secondary-600 dark:text-secondary-400 mb-4">
                    {story.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-green-600">
                      {story.valuation}
                    </span>
                    <span className="text-sm text-secondary-500 dark:text-secondary-400">
                      Current Valuation
                    </span>
                  </div>
                </div>
                </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white dark:bg-secondary-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-secondary-900 dark:text-white mb-6">
              How It Works
            </h2>
            <p className="text-xl text-secondary-600 dark:text-secondary-400 max-w-3xl mx-auto">
              Simple steps to transform your idea into a successful startup
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                title: "Submit Your Idea",
                description: "Share your innovative idea with detailed documentation and business plan through structured form",
                icon: FiZap
              },
              {
                step: "02", 
                title: "College Coordinator Review",
                description: "College PIC coordinators evaluate ideas with ratings, comments, and recommendations (Nurture/Forward/Reject)",
                icon: FiCheckCircle
              },
              {
                step: "03",
                title: "Incubation Centre Evaluation",
                description: "SGBAU Research & Incubation Foundation experts evaluate forwarded ideas for incubation potential",
                icon: FiTarget
              },
              {
                step: "04",
                title: "Pre-Incubation Support",
                description: "Selected ideas receive mentorship, technical support, and resources to develop MVPs",
                icon: FiAward
              }
            ].map((step, index) => {
              const Icon = step.icon;
              return (
                <Link key={index} to="/how-it-works" className="text-center relative group hover:scale-105 transition-transform duration-300">
                  <div className="w-20 h-20 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-6 relative z-10 group-hover:bg-primary-200 dark:group-hover:bg-primary-800/50 transition-colors duration-300">
                    <Icon className="text-primary-600 dark:text-primary-400" size={32} />
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {step.step}
                    </div>
                  </div>
                  {index < 3 && (
                    <div className="hidden md:block absolute top-10 left-full w-full h-0.5 bg-primary-200 dark:bg-primary-800 -z-10"></div>
                  )}
                  <h3 className="text-xl font-bold text-secondary-900 dark:text-white mb-4">
                    {step.title}
                  </h3>
                  <p className="text-secondary-600 dark:text-secondary-400">
                    {step.description}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Enhanced Modern Testimonials Section */}
      <section className="py-20 bg-gradient-to-br from-primary-600 via-primary-500 to-primary-400 text-white relative overflow-hidden">
        {/* Modern Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-primary-600/95"></div>
          <div className="absolute inset-0 bg-black/5"></div>
          
          {/* Modern Floating Elements */}
          <div className="absolute top-20 left-20 w-24 h-24 bg-accent-400/20 rounded-full blur-xl"></div>
          <div className="absolute bottom-20 right-20 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        </div>
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold mb-16 animate-fade-in-up">
            What Our Community Says
          </h2>
          
          <div className="relative">
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 lg:p-12 border border-white/20 shadow-2xl hover:bg-white/15 transition-all duration-500 group">
              {/* Avatar with Enhanced Animation */}
              <div className="flex items-center justify-center mb-8">
                <div className="relative group">
                <img
                  src={testimonials[currentTestimonial].avatar}
                  alt={testimonials[currentTestimonial].name}
                    className="w-24 h-24 rounded-full border-4 border-white/30 shadow-2xl group-hover:scale-110 transition-transform duration-500"
                />
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-400/20 to-purple-400/20 blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center animate-pulse">
                    <FiStar className="text-white" size={16} />
              </div>
                </div>
              </div>
              
              {/* Quote with Enhanced Typography */}
              <blockquote className="text-xl lg:text-2xl font-medium mb-8 leading-relaxed group-hover:text-yellow-100 transition-colors duration-300">
                <span className="text-4xl text-yellow-400/50">"</span>
                {testimonials[currentTestimonial].content}
                <span className="text-4xl text-yellow-400/50">"</span>
              </blockquote>
              
              {/* Author Info with Enhanced Styling */}
              <div className="space-y-2">
                <div className="font-bold text-xl group-hover:text-yellow-200 transition-colors duration-300">
                  {testimonials[currentTestimonial].name}
                </div>
                <div className="text-primary-200 group-hover:text-primary-100 transition-colors duration-300">
                  {testimonials[currentTestimonial].role}
                </div>
                <div className="text-primary-300 text-sm group-hover:text-primary-200 transition-colors duration-300">
                  {testimonials[currentTestimonial].company}
                </div>
              </div>
              
              {/* Hover Shimmer Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 rounded-3xl"></div>
            </div>
            
            {/* Enhanced Navigation Dots */}
            <div className="flex justify-center mt-8 space-x-3">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-4 h-4 rounded-full transition-all duration-300 hover:scale-125 ${
                    index === currentTestimonial 
                      ? 'bg-yellow-400 shadow-lg shadow-yellow-400/50' 
                      : 'bg-white/30 hover:bg-white/50'
                  }`}
                />
              ))}
            </div>
            
            {/* Enhanced CTA Button */}
            <div className="text-center mt-8">
              <Link to="/success-stories" className="group inline-flex items-center justify-center bg-white/20 backdrop-blur-sm border-2 border-white/30 text-white hover:bg-white hover:text-primary-600 px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                <FiArrowRight className="mr-2 group-hover:translate-x-1 transition-transform duration-300" size={20} />
                View All Success Stories
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Circulars Section */}
      <section className="py-20 bg-white dark:bg-secondary-900 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-secondary-900 dark:text-white mb-6">
              Latest University Circulars
          </h2>
            <p className="text-xl text-secondary-600 dark:text-secondary-400 max-w-3xl mx-auto">
              Stay updated with the latest announcements, guidelines, and important documents
            </p>
          </div>
          
          <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-lg overflow-hidden border border-secondary-200 dark:border-secondary-700">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-secondary-50 dark:bg-secondary-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary-200 dark:divide-secondary-700">
                  {circulars.slice(0, 5).map((circular, index) => (
                    <tr 
                      key={circular.id}
                      className="hover:bg-secondary-50 dark:hover:bg-secondary-700 cursor-pointer transition-colors duration-200"
                      onClick={() => {
                        // Show circular details in a modal or new page
                        window.open(`/circulars/${circular.id}`, '_blank');
                      }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-secondary-900 dark:text-white">
                          {circular.title}
                        </div>
                        <div className="text-sm text-secondary-500 dark:text-secondary-400 truncate max-w-xs">
                          {circular.description}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          circular.category === 'academic' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                          circular.category === 'examination' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' :
                          circular.category === 'admission' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                        }`}>
                          {circular.category ? (circular.category.charAt(0).toUpperCase() + circular.category.slice(1)) : 'Other'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          circular.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                          circular.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                          'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                        }`}>
                          {circular.priority ? (circular.priority.charAt(0).toUpperCase() + circular.priority.slice(1)) : 'Normal'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500 dark:text-secondary-400">
                        {circular.created_at ? new Date(circular.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        }) : 'Recent'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button 
                          className="inline-flex items-center px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Download circular using proper endpoint
                            if (circular.id) {
                              const downloadUrl = getFullApiUrl(API_ENDPOINTS.PUBLIC_CIRCULAR_DOWNLOAD(circular.id));
                              window.open(downloadUrl, '_blank');
                            }
                          }}
                        >
                          <FiDownload className="mr-1" size={14} />
                          Download
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <Link 
              to="/circulars"
              className="inline-flex items-center px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-lg font-medium transition-colors duration-200"
            >
              View All Circulars
              <FiArrowRight className="ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Public Documents Section */}
      <section className="py-20 bg-gray-50 dark:bg-secondary-800 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-secondary-900 dark:text-white mb-6">
              Public Resources & Documents
            </h2>
            <p className="text-xl text-secondary-600 dark:text-secondary-400 max-w-3xl mx-auto">
              Access important documents, guidelines, templates, and resources
            </p>
          </div>
          
          <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-lg overflow-hidden border border-secondary-200 dark:border-secondary-700">
            {documentsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                <span className="ml-3 text-gray-600 dark:text-gray-400">Loading documents...</span>
              </div>
            ) : documents.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-secondary-50 dark:bg-secondary-700">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                        Type & Access
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                        Size
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-secondary-200 dark:divide-secondary-700">
                    {documents.slice(0, 5).map((doc) => (
                      <tr 
                        key={doc.id}
                        className="hover:bg-secondary-50 dark:hover:bg-secondary-700 transition-colors duration-200"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <FiFileText className="h-5 w-5 text-primary-600 mr-3" />
                            <div>
                              <div className="text-sm font-medium text-secondary-900 dark:text-white">
                                {doc.title}
                              </div>
                              {doc.description && (
                                <div className="text-sm text-secondary-500 dark:text-secondary-400">
                                  {doc.description.length > 50 ? 
                                    `${doc.description.substring(0, 50)}...` : 
                                    doc.description
                                  }
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col space-y-1">
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                              {doc.document_type ? (doc.document_type.charAt(0).toUpperCase() + doc.document_type.slice(1)) : 'Other'}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              doc.access_level === 'public' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                              doc.access_level === 'student_restricted' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                              doc.access_level === 'private' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                              'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                            }`}>
                              {doc.access_level ? doc.access_level.toUpperCase().replace('_', ' ') : 'UNKNOWN'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500 dark:text-secondary-400">
                          {doc.file_size ? `${(doc.file_size / 1024).toFixed(1)} KB` : 'Unknown'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500 dark:text-secondary-400">
                          {doc.created_at ? new Date(doc.created_at).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          }) : 'Recent'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button 
                            className="inline-flex items-center px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                            onClick={async () => {
                              try {
                                const response = await documentsAPI.download(doc.id, {
                                  responseType: 'blob'
                                });
                                
                                const blob = new Blob([response.data], { type: doc.mime_type || 'application/octet-stream' });
                                const url = window.URL.createObjectURL(blob);
                                
                                const link = document.createElement('a');
                                link.href = url;
                                link.download = `${doc.title}${doc.file_path ? doc.file_path.substring(doc.file_path.lastIndexOf('.')) : ''}`;
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                                
                                window.URL.revokeObjectURL(url);
                              } catch (error) {
                                console.error('Download error:', error);
                                alert('Failed to download document: ' + (error.response?.data?.message || error.message));
                              }
                            }}
                          >
                            <FiDownload className="mr-1" size={14} />
                            Download
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <FiFileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No documents available</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Public documents will appear here when uploaded by administrators
                </p>
              </div>
            )}
          </div>
          
          {documents.length > 5 && (
            <div className="mt-12 text-center">
              <Link 
                to="/documents"
                className="inline-flex items-center px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-lg font-medium transition-colors duration-200"
              >
                View All Documents
                <FiArrowRight className="ml-2" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Enhanced Modern CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary-600 via-primary-500 to-primary-400 text-white relative overflow-hidden">
        {/* Modern Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-primary-600/95"></div>
          <div className="absolute inset-0 bg-black/5"></div>
          
          {/* Modern Floating Elements */}
          <div className="absolute top-10 left-10 w-32 h-32 bg-accent-400/20 rounded-full blur-2xl"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6 animate-fade-in-up">
            Join SGBAU's Innovation Revolution
          </h2>
          <p className="text-xl lg:text-2xl mb-8 text-primary-100 animate-fade-in-up animation-delay-200">
            Be part of Sant Gadge Baba Amravati University's mission to liberate knowledge through innovation. Transform your ideas into solutions that benefit society.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center animate-fade-in-up animation-delay-400">
            {!user ? (
              <>
                <Link to="/register" className="group inline-flex items-center justify-center bg-white text-primary-600 hover:bg-primary-50 px-8 py-4 text-lg font-semibold rounded-xl shadow-2xl hover:shadow-white/25 transition-all duration-300 hover:scale-105 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-accent-400/20 to-primary-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <FiZap className="mr-2 relative z-10 group-hover:animate-spin" size={20} />
                  <span className="relative z-10">Get Started Today</span>
                </Link>
                <Link to="/about" className="group inline-flex items-center justify-center border-2 border-white text-white hover:bg-white hover:text-primary-600 px-8 py-4 text-lg font-semibold rounded-xl backdrop-blur-sm transition-all duration-300 hover:scale-105">
                  <FiExternalLink className="mr-2 group-hover:translate-x-1 transition-transform duration-300" size={20} />
                  Learn More
                </Link>
              </>
            ) : (
              <Link to="/submit-idea" className="group inline-flex items-center justify-center bg-white text-primary-600 hover:bg-primary-50 px-8 py-4 text-lg font-semibold rounded-xl shadow-2xl hover:shadow-white/25 transition-all duration-300 hover:scale-105 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-purple-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <FiZap className="mr-2 relative z-10 group-hover:animate-spin" size={20} />
                <span className="relative z-10">Submit Your Idea</span>
              </Link>
            )}
          </div>
        </div>
      </section>


    </div>
  );
};

export default HomePage;
