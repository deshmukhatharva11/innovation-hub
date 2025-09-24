import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiZap,
  FiTrendingUp,
  FiUsers,
  FiAward,
  FiTarget,
  FiArrowRight,
  FiExternalLink,
  FiMapPin,
  FiCalendar,
  FiDollarSign,
  FiBarChart2,
  FiDownload
} from 'react-icons/fi';

const SuccessStories = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStory, setSelectedStory] = useState(null);

  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'agriculture', name: 'Agriculture' },
    { id: 'healthcare', name: 'Healthcare' },
    { id: 'education', name: 'Education' },
    { id: 'technology', name: 'Technology' },
    { id: 'finance', name: 'Finance' }
  ];

  const successStories = [
    {
      id: 1,
      company: "AgriTech Solutions",
      founder: "Sneha Joshi",
      description: "Smart irrigation system helping farmers increase crop yield by 40%",
      valuation: "₹50 Cr",
      category: "agriculture",
      image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400",
      location: "Pune, Maharashtra",
      founded: "2022",
      teamSize: "25",
      funding: "₹8 Cr",
      story: "Sneha Joshi, a final-year engineering student from Pune University, developed a smart irrigation system that uses IoT sensors and AI to optimize water usage. Her startup has helped over 500 farmers increase their crop yield by 40% while reducing water consumption by 60%.",
      challenges: ["Initial funding", "Farmer adoption", "Technical complexity"],
      solutions: ["Incubator support", "Pilot programs", "Expert mentorship"],
      achievements: ["500+ farmers served", "40% yield increase", "60% water savings"],
      website: "https://agritechsolutions.com",
      linkedin: "https://linkedin.com/company/agritechsolutions"
    },
    {
      id: 2,
      company: "HealthCare AI",
      founder: "Vikram Kulkarni",
      description: "AI-powered diagnostic tool for early disease detection",
      valuation: "₹75 Cr",
      category: "healthcare",
      image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400",
      location: "Mumbai, Maharashtra",
      founded: "2021",
      teamSize: "45",
      funding: "₹12 Cr",
      story: "Vikram Kulkarni, a medical student from Mumbai, created an AI-powered diagnostic tool that can detect early signs of diseases from medical images. The platform has been adopted by 50+ hospitals and has helped diagnose over 10,000 patients.",
      challenges: ["Medical validation", "Regulatory compliance", "Hospital partnerships"],
      solutions: ["Expert medical panel", "Compliance guidance", "Strategic partnerships"],
      achievements: ["50+ hospitals", "10,000+ patients", "95% accuracy"],
      website: "https://healthcareai.com",
      linkedin: "https://linkedin.com/company/healthcareai"
    },
    {
      id: 3,
      company: "EduTech Pro",
      founder: "Anita Desai",
      description: "Personalized learning platform for rural students",
      valuation: "₹30 Cr",
      category: "education",
      image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400",
      location: "Nagpur, Maharashtra",
      founded: "2023",
      teamSize: "18",
      funding: "₹5 Cr",
      story: "Anita Desai developed a personalized learning platform specifically designed for rural students with limited internet connectivity. The platform works offline and has helped 2,000+ students improve their academic performance.",
      challenges: ["Internet connectivity", "Content localization", "Student engagement"],
      solutions: ["Offline-first approach", "Local language support", "Gamification"],
      achievements: ["2,000+ students", "80% improvement", "15 languages"],
      website: "https://edutechpro.com",
      linkedin: "https://linkedin.com/company/edutechpro"
    },
    {
      id: 4,
      company: "FinTech Solutions",
      founder: "Rahul Sharma",
      description: "Digital payment platform for small businesses",
      valuation: "₹100 Cr",
      category: "finance",
      image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400",
      location: "Thane, Maharashtra",
      founded: "2020",
      teamSize: "60",
      funding: "₹20 Cr",
      story: "Rahul Sharma created a digital payment platform that helps small businesses accept digital payments easily. The platform has onboarded 10,000+ merchants and processes ₹50 Cr in monthly transactions.",
      challenges: ["Merchant onboarding", "Payment security", "Regulatory compliance"],
      solutions: ["Simplified onboarding", "Bank-grade security", "Compliance framework"],
      achievements: ["10,000+ merchants", "₹50 Cr monthly", "99.9% uptime"],
      website: "https://fintechsolutions.com",
      linkedin: "https://linkedin.com/company/fintechsolutions"
    },
    {
      id: 5,
      company: "TechInnovate",
      founder: "Priya Patel",
      description: "AI-powered customer service automation",
      valuation: "₹45 Cr",
      category: "technology",
      image: "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=400",
      location: "Aurangabad, Maharashtra",
      founded: "2022",
      teamSize: "30",
      funding: "₹7 Cr",
      story: "Priya Patel developed an AI-powered customer service automation platform that helps businesses handle customer queries efficiently. The platform has reduced customer service costs by 70% for 100+ companies.",
      challenges: ["AI accuracy", "Integration complexity", "Customer adoption"],
      solutions: ["Continuous learning", "Easy integration", "ROI demonstration"],
      achievements: ["100+ companies", "70% cost reduction", "90% satisfaction"],
      website: "https://techinnovate.com",
      linkedin: "https://linkedin.com/company/techinnovate"
    },
    {
      id: 6,
      company: "GreenEnergy Solutions",
      founder: "Arjun Deshmukh",
      description: "Solar energy solutions for rural areas",
      valuation: "₹60 Cr",
      category: "technology",
      image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400",
      location: "Kolhapur, Maharashtra",
      founded: "2021",
      teamSize: "35",
      funding: "₹10 Cr",
      story: "Arjun Deshmukh created affordable solar energy solutions for rural areas. The company has installed solar panels in 200+ villages, providing clean energy to 50,000+ households.",
      challenges: ["High initial costs", "Rural infrastructure", "Maintenance"],
      solutions: ["Subsidized pricing", "Local partnerships", "Training programs"],
      achievements: ["200+ villages", "50,000+ households", "80% cost savings"],
      website: "https://greenenergy.com",
      linkedin: "https://linkedin.com/company/greenenergy"
    }
  ];

  const filteredStories = selectedCategory === 'all' 
    ? successStories 
    : successStories.filter(story => story.category === selectedCategory);

  return (
    <div className="min-h-screen bg-white dark:bg-secondary-900">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white py-20">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl lg:text-6xl font-bold mb-6">
              Success Stories
            </h1>
            <p className="text-xl lg:text-2xl mb-8 text-primary-100 max-w-4xl mx-auto">
              Meet the unicorns that started their journey with Innovation Hub and transformed their ideas into successful businesses
            </p>
                          <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/register" className="btn-primary bg-white text-primary-600 hover:bg-primary-50 px-8 py-4 text-lg font-semibold">
                  <FiZap className="mr-2" size={20} />
                  Start Your Journey
                </Link>
                <Link to="/resources" className="btn-outline border-white text-white hover:bg-white hover:text-primary-600 px-8 py-4 text-lg font-semibold">
                  <FiDownload className="mr-2" size={20} />
                  Get Resources
                </Link>
              </div>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-12 bg-secondary-50 dark:bg-secondary-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                  selectedCategory === category.id
                    ? 'bg-primary-600 text-white shadow-lg'
                    : 'bg-white dark:bg-secondary-900 text-secondary-600 dark:text-secondary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories Grid */}
      <section className="py-20 bg-white dark:bg-secondary-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredStories.map((story) => (
              <div 
                key={story.id} 
                className="group bg-white dark:bg-secondary-900 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer"
                onClick={() => setSelectedStory(story)}
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={story.image}
                    alt={story.company}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 bg-primary-600 text-white text-sm font-medium rounded-full">
                      {story.category.charAt(0).toUpperCase() + story.category.slice(1)}
                    </span>
                  </div>
                  <div className="absolute bottom-4 left-4">
                    <div className="text-white text-sm font-medium">
                      <FiMapPin className="inline mr-1" size={14} />
                      {story.location}
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-secondary-900 dark:text-white mb-2">
                    {story.company}
                  </h3>
                  <p className="text-primary-600 dark:text-primary-400 font-medium mb-3">
                    Founded by {story.founder}
                  </p>
                  <p className="text-secondary-600 dark:text-secondary-400 mb-4">
                    {story.description}
                  </p>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold text-green-600">
                      {story.valuation}
                    </span>
                    <span className="text-sm text-secondary-500 dark:text-secondary-400">
                      Current Valuation
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-secondary-500 dark:text-secondary-400 mb-4">
                    <div className="flex items-center">
                      <FiUsers className="mr-1" size={14} />
                      {story.teamSize} employees
                    </div>
                    <div className="flex items-center">
                      <FiCalendar className="mr-1" size={14} />
                      Founded {story.founded}
                    </div>
                  </div>
                  <button className="btn-outline w-full">
                    <FiArrowRight className="mr-2" size={16} />
                    Read Full Story
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Detail Modal */}
      {selectedStory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-secondary-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="relative">
              <img
                src={selectedStory.image}
                alt={selectedStory.company}
                className="w-full h-64 object-cover rounded-t-2xl"
              />
              <button
                onClick={() => setSelectedStory(null)}
                className="absolute top-4 right-4 w-10 h-10 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center hover:bg-opacity-70"
              >
                ×
              </button>
            </div>
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-secondary-900 dark:text-white">
                  {selectedStory.company}
                </h2>
                <span className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-full">
                  {selectedStory.category.charAt(0).toUpperCase() + selectedStory.category.slice(1)}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-4 bg-secondary-50 dark:bg-secondary-800 rounded-xl">
                  <div className="text-2xl font-bold text-green-600 mb-2">{selectedStory.valuation}</div>
                  <div className="text-sm text-secondary-600 dark:text-secondary-400">Current Valuation</div>
                </div>
                <div className="text-center p-4 bg-secondary-50 dark:bg-secondary-800 rounded-xl">
                  <div className="text-2xl font-bold text-primary-600 mb-2">{selectedStory.funding}</div>
                  <div className="text-sm text-secondary-600 dark:text-secondary-400">Total Funding</div>
                </div>
                <div className="text-center p-4 bg-secondary-50 dark:bg-secondary-800 rounded-xl">
                  <div className="text-2xl font-bold text-purple-600 mb-2">{selectedStory.teamSize}</div>
                  <div className="text-sm text-secondary-600 dark:text-secondary-400">Team Size</div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-secondary-900 dark:text-white mb-3">The Story</h3>
                  <p className="text-secondary-600 dark:text-secondary-400 leading-relaxed">
                    {selectedStory.story}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-lg font-semibold text-secondary-900 dark:text-white mb-3">Challenges Faced</h4>
                    <ul className="space-y-2">
                      {selectedStory.challenges.map((challenge, idx) => (
                        <li key={idx} className="flex items-start">
                          <FiTarget className="text-red-500 mt-1 mr-3 flex-shrink-0" size={16} />
                          <span className="text-secondary-600 dark:text-secondary-400">{challenge}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-secondary-900 dark:text-white mb-3">Solutions Implemented</h4>
                    <ul className="space-y-2">
                      {selectedStory.solutions.map((solution, idx) => (
                        <li key={idx} className="flex items-start">
                          <FiAward className="text-green-500 mt-1 mr-3 flex-shrink-0" size={16} />
                          <span className="text-secondary-600 dark:text-secondary-400">{solution}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-secondary-900 dark:text-white mb-3">Key Achievements</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {selectedStory.achievements.map((achievement, idx) => (
                      <div key={idx} className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl text-center">
                        <div className="text-green-600 dark:text-green-400 font-semibold">{achievement}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <a
                    href={selectedStory.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary flex items-center justify-center"
                  >
                    <FiExternalLink className="mr-2" size={16} />
                    Visit Website
                  </a>
                  <a
                    href={selectedStory.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-outline flex items-center justify-center"
                  >
                    <FiExternalLink className="mr-2" size={16} />
                    LinkedIn Profile
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Ready to Write Your Success Story?
          </h2>
          <p className="text-xl lg:text-2xl mb-8 text-primary-100">
            Join thousands of students who are already transforming their ideas into successful startups
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="btn-primary bg-white text-primary-600 hover:bg-primary-50 px-8 py-4 text-lg font-semibold">
              <FiZap className="mr-2" size={20} />
              Start Your Journey
            </Link>
            <Link to="/ideas/submit" className="btn-outline border-white text-white hover:bg-white hover:text-primary-600 px-8 py-4 text-lg font-semibold">
              <FiArrowRight className="mr-2" size={20} />
              Submit Your Idea
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SuccessStories;
