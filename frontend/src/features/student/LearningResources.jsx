import React, { useState } from 'react';
import { FiBookOpen, FiDownload, FiPlay, FiFileText, FiVideo, FiExternalLink, FiSearch, FiFilter, FiClock, FiUser, FiStar } from 'react-icons/fi';

const LearningResources = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterLevel, setFilterLevel] = useState('all');

  const resources = [
    {
      id: 1,
      title: "Introduction to Entrepreneurship",
      type: "course",
      level: "beginner",
      duration: "4 weeks",
      rating: 4.8,
      students: 1250,
      instructor: "Dr. Rajesh Kumar",
      description: "Learn the fundamentals of entrepreneurship, from idea generation to business planning.",
      thumbnail: "/course1.jpg",
      link: "/courses/entrepreneurship-intro",
      price: "Free"
    },
    {
      id: 2,
      title: "Business Model Canvas Workshop",
      type: "workshop",
      level: "intermediate",
      duration: "2 days",
      rating: 4.9,
      students: 450,
      instructor: "Prof. Sunita Sharma",
      description: "Hands-on workshop to create and validate your business model using the BMC framework.",
      thumbnail: "/workshop1.jpg",
      link: "/workshops/business-model-canvas",
      price: "₹2,000"
    },
    {
      id: 3,
      title: "Startup Funding Guide",
      type: "ebook",
      level: "intermediate",
      duration: "2 hours",
      rating: 4.7,
      students: 890,
      instructor: "Amit Patel",
      description: "Comprehensive guide to understanding different funding options for startups.",
      thumbnail: "/ebook1.jpg",
      link: "/resources/funding-guide",
      price: "Free"
    },
    {
      id: 4,
      title: "Pitch Deck Masterclass",
      type: "video",
      level: "advanced",
      duration: "3 hours",
      rating: 4.9,
      students: 650,
      instructor: "Priya Singh",
      description: "Learn how to create compelling pitch decks that attract investors.",
      thumbnail: "/video1.jpg",
      link: "/videos/pitch-deck-masterclass",
      price: "₹1,500"
    },
    {
      id: 5,
      title: "Market Research Toolkit",
      type: "toolkit",
      level: "beginner",
      duration: "1 week",
      rating: 4.6,
      students: 320,
      instructor: "Dr. Vikram Kulkarni",
      description: "Complete toolkit with templates and guides for conducting market research.",
      thumbnail: "/toolkit1.jpg",
      link: "/toolkits/market-research",
      price: "₹500"
    },
    {
      id: 6,
      title: "Legal Aspects of Startups",
      type: "webinar",
      level: "intermediate",
      duration: "1.5 hours",
      rating: 4.8,
      students: 780,
      instructor: "Adv. Neha Desai",
      description: "Understanding legal requirements and compliance for startups in India.",
      thumbnail: "/webinar1.jpg",
      link: "/webinars/legal-aspects",
      price: "Free"
    }
  ];

  const filteredResources = resources.filter(resource => {
    const matchesSearch = searchTerm === '' ||
      resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.instructor.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === 'all' || resource.type === filterType;
    const matchesLevel = filterLevel === 'all' || resource.level === filterLevel;

    return matchesSearch && matchesType && matchesLevel;
  });

  const getTypeIcon = (type) => {
    switch (type) {
      case 'course': return <FiBookOpen className="text-blue-600" size={20} />;
      case 'workshop': return <FiUser className="text-green-600" size={20} />;
      case 'ebook': return <FiFileText className="text-purple-600" size={20} />;
      case 'video': return <FiVideo className="text-red-600" size={20} />;
      case 'toolkit': return <FiDownload className="text-orange-600" size={20} />;
      case 'webinar': return <FiPlay className="text-indigo-600" size={20} />;
      default: return <FiBookOpen className="text-gray-600" size={20} />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'course': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'workshop': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'ebook': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'video': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'toolkit': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'webinar': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'advanced': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-secondary-900 dark:text-white mb-4">
            Learning Resources
          </h1>
          <p className="text-xl text-secondary-600 dark:text-secondary-400">
            Enhance your entrepreneurial skills with our comprehensive learning materials
          </p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400" />
              <input
                type="text"
                placeholder="Search resources..."
                className="w-full pl-10 pr-4 py-3 border border-secondary-300 dark:border-secondary-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 bg-secondary-50 dark:bg-secondary-700 text-secondary-900 dark:text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div>
              <select
                className="w-full px-4 py-3 border border-secondary-300 dark:border-secondary-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 bg-secondary-50 dark:bg-secondary-700 text-secondary-900 dark:text-white"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="course">Courses</option>
                <option value="workshop">Workshops</option>
                <option value="ebook">E-books</option>
                <option value="video">Videos</option>
                <option value="toolkit">Toolkits</option>
                <option value="webinar">Webinars</option>
              </select>
            </div>

            <div>
              <select
                className="w-full px-4 py-3 border border-secondary-300 dark:border-secondary-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 bg-secondary-50 dark:bg-secondary-700 text-secondary-900 dark:text-white"
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
              >
                <option value="all">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>
        </div>

        {/* Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredResources.map((resource) => (
            <div key={resource.id} className="bg-white dark:bg-secondary-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="h-48 bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                <div className="text-center text-white">
                  {getTypeIcon(resource.type)}
                  <p className="mt-2 text-sm font-medium">{resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}</p>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(resource.type)}`}>
                      {resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(resource.level)}`}>
                      {resource.level.charAt(0).toUpperCase() + resource.level.slice(1)}
                    </span>
                  </div>
                  <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
                    {resource.price}
                  </span>
                </div>

                <h3 className="text-xl font-semibold text-secondary-900 dark:text-white mb-2">
                  {resource.title}
                </h3>

                <p className="text-secondary-600 dark:text-secondary-400 mb-4 line-clamp-2">
                  {resource.description}
                </p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-secondary-600 dark:text-secondary-400">
                    <FiUser className="mr-2" size={14} />
                    {resource.instructor}
                  </div>
                  <div className="flex items-center text-sm text-secondary-600 dark:text-secondary-400">
                    <FiClock className="mr-2" size={14} />
                    {resource.duration}
                  </div>
                  <div className="flex items-center text-sm text-secondary-600 dark:text-secondary-400">
                    <FiStar className="mr-2 text-yellow-400" size={14} />
                    {resource.rating} ({resource.students} students)
                  </div>
                </div>

                <div className="flex space-x-3">
                  <a
                    href={resource.link}
                    className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
                  >
                    <FiPlay className="mr-2" size={16} />
                    Access Resource
                  </a>
                  <button className="px-4 py-2 border border-secondary-300 dark:border-secondary-600 text-secondary-700 dark:text-secondary-300 rounded-lg hover:bg-secondary-50 dark:hover:bg-secondary-700 transition-colors duration-200">
                    <FiExternalLink size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredResources.length === 0 && (
          <div className="text-center py-12">
            <FiBookOpen className="mx-auto h-12 w-12 text-secondary-400 mb-4" />
            <h3 className="text-lg font-medium text-secondary-900 dark:text-white mb-2">
              No resources found
            </h3>
            <p className="text-secondary-600 dark:text-secondary-400">
              Try adjusting your search criteria to find more resources.
            </p>
          </div>
        )}

        {/* Additional Resources Section */}
        <div className="mt-16 bg-white dark:bg-secondary-800 rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-secondary-900 dark:text-white mb-6 text-center">
            Additional Learning Opportunities
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiBookOpen className="text-blue-600 dark:text-blue-400" size={24} />
              </div>
              <h3 className="font-semibold text-secondary-900 dark:text-white mb-2">Online Library</h3>
              <p className="text-sm text-secondary-600 dark:text-secondary-400">
                Access to 1000+ books and research papers
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiUser className="text-green-600 dark:text-green-400" size={24} />
              </div>
              <h3 className="font-semibold text-secondary-900 dark:text-white mb-2">Peer Learning</h3>
              <p className="text-sm text-secondary-600 dark:text-secondary-400">
                Connect with fellow entrepreneurs
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiVideo className="text-purple-600 dark:text-purple-400" size={24} />
              </div>
              <h3 className="font-semibold text-secondary-900 dark:text-white mb-2">Live Sessions</h3>
              <p className="text-sm text-secondary-600 dark:text-secondary-400">
                Weekly live Q&A with experts
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiDownload className="text-orange-600 dark:text-orange-400" size={24} />
              </div>
              <h3 className="font-semibold text-secondary-900 dark:text-white mb-2">Templates</h3>
              <p className="text-sm text-secondary-600 dark:text-secondary-400">
                Ready-to-use business templates
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningResources;
