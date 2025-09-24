import React, { useState } from 'react';
import { FiAward, FiCalendar, FiMapPin, FiUsers, FiDollarSign, FiClock, FiSearch, FiFilter, FiExternalLink, FiStar } from 'react-icons/fi';

const Competitions = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPrize, setFilterPrize] = useState('all');

  const competitions = [
    {
      id: 1,
      title: "SGBAU Innovation Challenge 2025",
      description: "Annual innovation competition for students across Maharashtra. Submit your innovative ideas and compete for exciting prizes.",
      status: "open",
      deadline: "2025-03-15",
      location: "Amravati, Maharashtra",
      participants: 250,
      prize: "₹5,00,000",
      category: "General Innovation",
      organizer: "SGBAU Pre-Incubation Centre",
      requirements: ["Student ID", "Innovation Proposal", "Team of 2-4 members"],
      image: "/competition1.jpg",
      registrationLink: "/competitions/sgbau-innovation-2025"
    },
    {
      id: 2,
      title: "TechStart Maharashtra",
      description: "Technology-focused startup competition for tech enthusiasts. Build and present your tech solutions to industry experts.",
      status: "open",
      deadline: "2025-02-28",
      location: "Pune, Maharashtra",
      participants: 180,
      prize: "₹3,00,000",
      category: "Technology",
      organizer: "Maharashtra Innovation Society",
      requirements: ["Tech Prototype", "Business Plan", "Demo Video"],
      image: "/competition2.jpg",
      registrationLink: "/competitions/techstart-maharashtra"
    },
    {
      id: 3,
      title: "AgriTech Innovation Awards",
      description: "Focus on agricultural technology innovations. Solve real farming problems with innovative solutions.",
      status: "upcoming",
      deadline: "2025-04-10",
      location: "Nagpur, Maharashtra",
      participants: 120,
      prize: "₹2,50,000",
      category: "Agriculture",
      organizer: "Maharashtra Agriculture Department",
      requirements: ["Field Testing Report", "Impact Assessment", "Scalability Plan"],
      image: "/competition3.jpg",
      registrationLink: "/competitions/agritech-innovation"
    },
    {
      id: 4,
      title: "Social Impact Challenge",
      description: "Create solutions that address social issues in rural and urban areas. Make a positive impact on society.",
      status: "open",
      deadline: "2025-03-30",
      location: "Mumbai, Maharashtra",
      participants: 200,
      prize: "₹4,00,000",
      category: "Social Impact",
      organizer: "Social Innovation Foundation",
      requirements: ["Social Impact Report", "Community Engagement", "Sustainability Plan"],
      image: "/competition4.jpg",
      registrationLink: "/competitions/social-impact-challenge"
    },
    {
      id: 5,
      title: "Healthcare Innovation Summit",
      description: "Medical technology and healthcare solutions competition. Improve healthcare accessibility and quality.",
      status: "closed",
      deadline: "2025-01-15",
      location: "Mumbai, Maharashtra",
      participants: 150,
      prize: "₹3,50,000",
      category: "Healthcare",
      organizer: "Healthcare Innovation Council",
      requirements: ["Medical Validation", "Clinical Trial Data", "Regulatory Compliance"],
      image: "/competition5.jpg",
      registrationLink: "/competitions/healthcare-innovation"
    },
    {
      id: 6,
      title: "GreenTech Sustainability Awards",
      description: "Environmental sustainability and green technology solutions. Contribute to a cleaner, greener future.",
      status: "upcoming",
      deadline: "2025-05-20",
      location: "Kolhapur, Maharashtra",
      participants: 90,
      prize: "₹2,00,000",
      category: "Environment",
      organizer: "Green Technology Foundation",
      requirements: ["Environmental Impact Study", "Carbon Footprint Analysis", "Long-term Sustainability"],
      image: "/competition6.jpg",
      registrationLink: "/competitions/greentech-sustainability"
    }
  ];

  const filteredCompetitions = competitions.filter(competition => {
    const matchesSearch = searchTerm === '' ||
      competition.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      competition.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      competition.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || competition.status === filterStatus;
    const matchesPrize = filterPrize === 'all' ||
      (filterPrize === 'high' && parseInt(competition.prize.replace(/[₹,]/g, '')) >= 300000) ||
      (filterPrize === 'medium' && parseInt(competition.prize.replace(/[₹,]/g, '')) >= 200000 && parseInt(competition.prize.replace(/[₹,]/g, '')) < 300000) ||
      (filterPrize === 'low' && parseInt(competition.prize.replace(/[₹,]/g, '')) < 200000);

    return matchesSearch && matchesStatus && matchesPrize;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'upcoming': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'closed': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'General Innovation': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'Technology': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'Agriculture': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'Social Impact': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'Healthcare': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'Environment': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const isDeadlineNear = (deadline) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays > 0;
  };

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-secondary-900 dark:text-white mb-4">
            Innovation Competitions
          </h1>
          <p className="text-xl text-secondary-600 dark:text-secondary-400">
            Participate in exciting competitions and showcase your innovative ideas
          </p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400" />
              <input
                type="text"
                placeholder="Search competitions..."
                className="w-full pl-10 pr-4 py-3 border border-secondary-300 dark:border-secondary-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 bg-secondary-50 dark:bg-secondary-700 text-secondary-900 dark:text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div>
              <select
                className="w-full px-4 py-3 border border-secondary-300 dark:border-secondary-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 bg-secondary-50 dark:bg-secondary-700 text-secondary-900 dark:text-white"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="upcoming">Upcoming</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div>
              <select
                className="w-full px-4 py-3 border border-secondary-300 dark:border-secondary-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 bg-secondary-50 dark:bg-secondary-700 text-secondary-900 dark:text-white"
                value={filterPrize}
                onChange={(e) => setFilterPrize(e.target.value)}
              >
                <option value="all">All Prize Ranges</option>
                <option value="high">High (₹3L+)</option>
                <option value="medium">Medium (₹2L-3L)</option>
                <option value="low">Low (Under ₹2L)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Competitions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {filteredCompetitions.map((competition) => (
            <div key={competition.id} className="bg-white dark:bg-secondary-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="h-48 bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center relative">
                <div className="text-center text-white">
                  <FiAward size={48} />
                  <p className="mt-2 text-lg font-semibold">{competition.title}</p>
                </div>
                {isDeadlineNear(competition.deadline) && (
                  <div className="absolute top-4 right-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    <FiClock className="inline mr-1" size={14} />
                    Deadline Soon
                  </div>
                )}
              </div>
              
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex space-x-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(competition.status)}`}>
                      {competition.status.charAt(0).toUpperCase() + competition.status.slice(1)}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(competition.category)}`}>
                      {competition.category}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                      {competition.prize}
                    </div>
                    <div className="text-sm text-secondary-500 dark:text-secondary-500">
                      Total Prize
                    </div>
                  </div>
                </div>

                <h3 className="text-xl font-semibold text-secondary-900 dark:text-white mb-3">
                  {competition.title}
                </h3>

                <p className="text-secondary-600 dark:text-secondary-400 mb-4 line-clamp-3">
                  {competition.description}
                </p>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-sm text-secondary-600 dark:text-secondary-400">
                    <FiCalendar className="mr-3" size={16} />
                    <span className="font-medium">Deadline:</span>
                    <span className="ml-2">{formatDate(competition.deadline)}</span>
                  </div>
                  <div className="flex items-center text-sm text-secondary-600 dark:text-secondary-400">
                    <FiMapPin className="mr-3" size={16} />
                    <span className="font-medium">Location:</span>
                    <span className="ml-2">{competition.location}</span>
                  </div>
                  <div className="flex items-center text-sm text-secondary-600 dark:text-secondary-400">
                    <FiUsers className="mr-3" size={16} />
                    <span className="font-medium">Participants:</span>
                    <span className="ml-2">{competition.participants}</span>
                  </div>
                  <div className="flex items-center text-sm text-secondary-600 dark:text-secondary-400">
                    <FiAward className="mr-3" size={16} />
                    <span className="font-medium">Organizer:</span>
                    <span className="ml-2">{competition.organizer}</span>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="text-sm font-medium text-secondary-900 dark:text-white mb-2">Requirements:</h4>
                  <ul className="text-sm text-secondary-600 dark:text-secondary-400 space-y-1">
                    {competition.requirements.map((req, index) => (
                      <li key={index} className="flex items-center">
                        <FiStar className="mr-2 text-primary-500" size={12} />
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex space-x-3">
                  <a
                    href={competition.registrationLink}
                    className={`flex-1 py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center ${
                      competition.status === 'open'
                        ? 'bg-primary-600 hover:bg-primary-700 text-white'
                        : 'bg-secondary-300 dark:bg-secondary-700 text-secondary-500 dark:text-secondary-400 cursor-not-allowed'
                    }`}
                    onClick={(e) => {
                      if (competition.status !== 'open') {
                        e.preventDefault();
                      }
                    }}
                  >
                    <FiExternalLink className="mr-2" size={16} />
                    {competition.status === 'open' ? 'Register Now' : 
                     competition.status === 'upcoming' ? 'Coming Soon' : 'Registration Closed'}
                  </a>
                  <button className="px-4 py-3 border border-secondary-300 dark:border-secondary-600 text-secondary-700 dark:text-secondary-300 rounded-lg hover:bg-secondary-50 dark:hover:bg-secondary-700 transition-colors duration-200">
                    <FiDollarSign size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredCompetitions.length === 0 && (
          <div className="text-center py-12">
            <FiAward className="mx-auto h-12 w-12 text-secondary-400 mb-4" />
            <h3 className="text-lg font-medium text-secondary-900 dark:text-white mb-2">
              No competitions found
            </h3>
            <p className="text-secondary-600 dark:text-secondary-400">
              Try adjusting your search criteria to find more competitions.
            </p>
          </div>
        )}

        {/* Competition Tips */}
        <div className="mt-16 bg-white dark:bg-secondary-800 rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-secondary-900 dark:text-white mb-6 text-center">
            Competition Tips & Guidelines
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiCalendar className="text-blue-600 dark:text-blue-400" size={24} />
              </div>
              <h3 className="font-semibold text-secondary-900 dark:text-white mb-2">Plan Ahead</h3>
              <p className="text-sm text-secondary-600 dark:text-secondary-400">
                Start preparing early and meet all deadlines
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiUsers className="text-green-600 dark:text-green-400" size={24} />
              </div>
              <h3 className="font-semibold text-secondary-900 dark:text-white mb-2">Build a Team</h3>
              <p className="text-sm text-secondary-600 dark:text-secondary-400">
                Collaborate with diverse skills and perspectives
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiAward className="text-purple-600 dark:text-purple-400" size={24} />
              </div>
              <h3 className="font-semibold text-secondary-900 dark:text-white mb-2">Focus on Impact</h3>
              <p className="text-sm text-secondary-600 dark:text-secondary-400">
                Emphasize real-world impact and scalability
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Competitions;
