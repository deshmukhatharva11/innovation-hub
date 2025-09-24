import React, { useState, useEffect } from 'react';
import { FiSearch, FiFilter, FiUser, FiMail, FiPhone, FiMapPin, FiAward, FiBookOpen, FiClock, FiStar, FiMessageCircle } from 'react-icons/fi';

const Mentorship = () => {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterExperience, setFilterExperience] = useState('all');

  useEffect(() => {
    // Simulate API call to fetch mentors
    const fetchMentors = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockMentors = [
        {
          id: 1,
          name: "Dr. Rajesh Kumar",
          title: "Technology Innovation Expert",
          company: "TechCorp Solutions",
          experience: "15+ years",
          category: "technology",
          rating: 4.9,
          students: 150,
          specialties: ["AI/ML", "Software Development", "Product Management"],
          bio: "Experienced technology leader with expertise in AI and machine learning applications.",
          email: "rajesh.kumar@techcorp.com",
          phone: "+91 98765 43210",
          location: "Mumbai, Maharashtra",
          availability: "Weekdays 6-8 PM",
          image: "/mentor1.jpg"
        },
        {
          id: 2,
          name: "Prof. Sunita Sharma",
          title: "Business Strategy Consultant",
          company: "Strategic Ventures",
          experience: "12+ years",
          category: "business",
          rating: 4.8,
          students: 120,
          specialties: ["Business Strategy", "Market Analysis", "Financial Planning"],
          bio: "Business strategist helping startups scale and grow sustainably.",
          email: "sunita.sharma@strategicventures.com",
          phone: "+91 98765 43211",
          location: "Pune, Maharashtra",
          availability: "Weekends 10 AM - 2 PM",
          image: "/mentor2.jpg"
        },
        {
          id: 3,
          name: "Dr. Amit Patel",
          title: "Healthcare Innovation Specialist",
          company: "MedTech Innovations",
          experience: "18+ years",
          category: "healthcare",
          rating: 4.9,
          students: 95,
          specialties: ["Medical Technology", "Healthcare IT", "Regulatory Affairs"],
          bio: "Healthcare technology expert with deep knowledge of medical device development.",
          email: "amit.patel@medtech.com",
          phone: "+91 98765 43212",
          location: "Nagpur, Maharashtra",
          availability: "Weekdays 7-9 PM",
          image: "/mentor3.jpg"
        },
        {
          id: 4,
          name: "Ms. Priya Singh",
          title: "Social Impact Entrepreneur",
          company: "Impact Ventures",
          experience: "10+ years",
          category: "social",
          rating: 4.7,
          students: 80,
          specialties: ["Social Entrepreneurship", "NGO Management", "Community Development"],
          bio: "Social entrepreneur passionate about creating positive impact in rural communities.",
          email: "priya.singh@impactventures.com",
          phone: "+91 98765 43213",
          location: "Amravati, Maharashtra",
          availability: "Flexible",
          image: "/mentor4.jpg"
        }
      ];
      
      setMentors(mockMentors);
      setLoading(false);
    };

    fetchMentors();
  }, []);

  const filteredMentors = mentors.filter(mentor => {
    const matchesSearch = searchTerm === '' ||
      mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mentor.specialties.some(specialty => 
        specialty.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesCategory = filterCategory === 'all' ||
      mentor.category === filterCategory;

    const matchesExperience = filterExperience === 'all' ||
      (filterExperience === 'junior' && parseInt(mentor.experience) < 10) ||
      (filterExperience === 'senior' && parseInt(mentor.experience) >= 10);

    return matchesSearch && matchesCategory && matchesExperience;
  });

  const getCategoryColor = (category) => {
    switch (category) {
      case 'technology': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'business': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'healthcare': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'social': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-50 dark:bg-secondary-900">
        <div className="text-primary-600 dark:text-primary-400 text-xl">Loading Mentors...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-secondary-900 dark:text-white mb-4">
            Find Your Perfect Mentor
          </h1>
          <p className="text-xl text-secondary-600 dark:text-secondary-400">
            Connect with experienced professionals who can guide your entrepreneurial journey
          </p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400" />
              <input
                type="text"
                placeholder="Search mentors or specialties..."
                className="w-full pl-10 pr-4 py-3 border border-secondary-300 dark:border-secondary-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 bg-secondary-50 dark:bg-secondary-700 text-secondary-900 dark:text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div>
              <select
                className="w-full px-4 py-3 border border-secondary-300 dark:border-secondary-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 bg-secondary-50 dark:bg-secondary-700 text-secondary-900 dark:text-white"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                <option value="technology">Technology</option>
                <option value="business">Business</option>
                <option value="healthcare">Healthcare</option>
                <option value="social">Social Impact</option>
              </select>
            </div>

            <div>
              <select
                className="w-full px-4 py-3 border border-secondary-300 dark:border-secondary-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 bg-secondary-50 dark:bg-secondary-700 text-secondary-900 dark:text-white"
                value={filterExperience}
                onChange={(e) => setFilterExperience(e.target.value)}
              >
                <option value="all">All Experience Levels</option>
                <option value="junior">Junior (5-10 years)</option>
                <option value="senior">Senior (10+ years)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Mentors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredMentors.map((mentor) => (
            <div key={mentor.id} className="bg-white dark:bg-secondary-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                    <FiUser size={24} className="text-primary-600 dark:text-primary-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-secondary-900 dark:text-white">
                      {mentor.name}
                    </h3>
                    <p className="text-secondary-600 dark:text-secondary-400">
                      {mentor.title}
                    </p>
                    <p className="text-sm text-secondary-500 dark:text-secondary-500">
                      {mentor.company}
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-secondary-600 dark:text-secondary-400">Rating</span>
                    <div className="flex items-center">
                      <FiStar className="text-yellow-400 mr-1" size={16} />
                      <span className="text-sm font-medium text-secondary-900 dark:text-white">
                        {mentor.rating}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-secondary-600 dark:text-secondary-400">Experience</span>
                    <span className="text-sm font-medium text-secondary-900 dark:text-white">
                      {mentor.experience}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-secondary-600 dark:text-secondary-400">Students Mentored</span>
                    <span className="text-sm font-medium text-secondary-900 dark:text-white">
                      {mentor.students}
                    </span>
                  </div>
                </div>

                <div className="mb-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(mentor.category)}`}>
                    {mentor.category.charAt(0).toUpperCase() + mentor.category.slice(1)}
                  </span>
                </div>

                <div className="mb-4">
                  <h4 className="text-sm font-medium text-secondary-900 dark:text-white mb-2">Specialties:</h4>
                  <div className="flex flex-wrap gap-2">
                    {mentor.specialties.map((specialty, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-secondary-100 dark:bg-secondary-700 text-secondary-700 dark:text-secondary-300 text-xs rounded-md"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>

                <p className="text-sm text-secondary-600 dark:text-secondary-400 mb-4">
                  {mentor.bio}
                </p>

                <div className="space-y-2 mb-6">
                  <div className="flex items-center text-sm text-secondary-600 dark:text-secondary-400">
                    <FiMail className="mr-2" size={14} />
                    {mentor.email}
                  </div>
                  <div className="flex items-center text-sm text-secondary-600 dark:text-secondary-400">
                    <FiMapPin className="mr-2" size={14} />
                    {mentor.location}
                  </div>
                  <div className="flex items-center text-sm text-secondary-600 dark:text-secondary-400">
                    <FiClock className="mr-2" size={14} />
                    {mentor.availability}
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center">
                    <FiMessageCircle className="mr-2" size={16} />
                    Connect
                  </button>
                  <button className="px-4 py-2 border border-secondary-300 dark:border-secondary-600 text-secondary-700 dark:text-secondary-300 rounded-lg hover:bg-secondary-50 dark:hover:bg-secondary-700 transition-colors duration-200">
                    <FiAward size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredMentors.length === 0 && (
          <div className="text-center py-12">
            <FiUser className="mx-auto h-12 w-12 text-secondary-400 mb-4" />
            <h3 className="text-lg font-medium text-secondary-900 dark:text-white mb-2">
              No mentors found
            </h3>
            <p className="text-secondary-600 dark:text-secondary-400">
              Try adjusting your search criteria to find more mentors.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Mentorship;
