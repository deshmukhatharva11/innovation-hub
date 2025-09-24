import React, { useState } from 'react';
import { FiDollarSign, FiTrendingUp, FiTarget, FiUsers, FiClock, FiSearch, FiFilter, FiExternalLink, FiCheckCircle, FiAlertCircle, FiInfo } from 'react-icons/fi';

const FundingOpportunities = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterAmount, setFilterAmount] = useState('all');

  const fundingOpportunities = [
    {
      id: 1,
      title: "SGBAU Seed Fund",
      description: "Early-stage funding for innovative student projects. Get up to ₹5 lakhs to kickstart your entrepreneurial journey.",
      type: "grant",
      amount: "₹5,00,000",
      deadline: "2025-04-15",
      eligibility: "Current SGBAU students",
      requirements: ["Business Plan", "Prototype", "Team of 2-4 members"],
      status: "open",
      organization: "SGBAU Pre-Incubation Centre",
      category: "Seed Funding",
      equity: "No equity required",
      image: "/funding1.jpg",
      applicationLink: "/funding/sgbau-seed-fund"
    },
    {
      id: 2,
      title: "Maharashtra Startup Fund",
      description: "Government-backed funding program for innovative startups in Maharashtra. Scale your business with up to ₹50 lakhs.",
      type: "loan",
      amount: "₹50,00,000",
      deadline: "2025-03-30",
      eligibility: "Maharashtra-based startups",
      requirements: ["Registration Certificate", "Financial Projections", "Market Analysis"],
      status: "open",
      organization: "Maharashtra Innovation Society",
      category: "Government Funding",
      equity: "No equity required",
      image: "/funding2.jpg",
      applicationLink: "/funding/maharashtra-startup-fund"
    },
    {
      id: 3,
      title: "TechVenture Angel Fund",
      description: "Angel investment for technology startups. Get mentorship and funding from experienced entrepreneurs.",
      type: "equity",
      amount: "₹25,00,000",
      deadline: "2025-05-20",
      eligibility: "Tech startups with MVP",
      requirements: ["Working Prototype", "User Traction", "Scalable Business Model"],
      status: "upcoming",
      organization: "TechVenture Capital",
      category: "Angel Investment",
      equity: "5-15% equity",
      image: "/funding3.jpg",
      applicationLink: "/funding/techventure-angel"
    },
    {
      id: 4,
      title: "Social Impact Grant",
      description: "Funding for startups addressing social challenges. Make a positive impact while building your business.",
      type: "grant",
      amount: "₹10,00,000",
      deadline: "2025-04-30",
      eligibility: "Social impact startups",
      requirements: ["Impact Assessment", "Community Engagement", "Sustainability Plan"],
      status: "open",
      organization: "Social Innovation Foundation",
      category: "Social Impact",
      equity: "No equity required",
      image: "/funding4.jpg",
      applicationLink: "/funding/social-impact-grant"
    },
    {
      id: 5,
      title: "Women Entrepreneurship Fund",
      description: "Special funding program for women-led startups. Empowering female entrepreneurs across Maharashtra.",
      type: "grant",
      amount: "₹15,00,000",
      deadline: "2025-06-15",
      eligibility: "Women-led startups (51%+ women ownership)",
      requirements: ["Women Leadership Proof", "Business Plan", "Financial Projections"],
      status: "upcoming",
      organization: "Women Entrepreneurship Council",
      category: "Women Empowerment",
      equity: "No equity required",
      image: "/funding5.jpg",
      applicationLink: "/funding/women-entrepreneurship"
    },
    {
      id: 6,
      title: "Rural Innovation Fund",
      description: "Funding for innovations that benefit rural communities. Bridge the urban-rural divide with technology.",
      type: "grant",
      amount: "₹8,00,000",
      deadline: "2025-03-15",
      eligibility: "Rural-focused innovations",
      requirements: ["Rural Impact Study", "Local Partnership", "Scalability Plan"],
      status: "open",
      organization: "Rural Development Ministry",
      category: "Rural Development",
      equity: "No equity required",
      image: "/funding6.jpg",
      applicationLink: "/funding/rural-innovation"
    }
  ];

  const filteredOpportunities = fundingOpportunities.filter(opportunity => {
    const matchesSearch = searchTerm === '' ||
      opportunity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opportunity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opportunity.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === 'all' || opportunity.type === filterType;
    const matchesAmount = filterAmount === 'all' ||
      (filterAmount === 'high' && parseInt(opportunity.amount.replace(/[₹,]/g, '')) >= 2000000) ||
      (filterAmount === 'medium' && parseInt(opportunity.amount.replace(/[₹,]/g, '')) >= 500000 && parseInt(opportunity.amount.replace(/[₹,]/g, '')) < 2000000) ||
      (filterAmount === 'low' && parseInt(opportunity.amount.replace(/[₹,]/g, '')) < 500000);

    return matchesSearch && matchesType && matchesAmount;
  });

  const getTypeColor = (type) => {
    switch (type) {
      case 'grant': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'loan': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'equity': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

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
      case 'Seed Funding': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'Government Funding': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400';
      case 'Angel Investment': return 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400';
      case 'Social Impact': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'Women Empowerment': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'Rural Development': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400';
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
            Funding Opportunities
          </h1>
          <p className="text-xl text-secondary-600 dark:text-secondary-400">
            Discover funding options to fuel your entrepreneurial journey
          </p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400" />
              <input
                type="text"
                placeholder="Search funding opportunities..."
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
                <option value="grant">Grants</option>
                <option value="loan">Loans</option>
                <option value="equity">Equity Investment</option>
              </select>
            </div>

            <div>
              <select
                className="w-full px-4 py-3 border border-secondary-300 dark:border-secondary-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 bg-secondary-50 dark:bg-secondary-700 text-secondary-900 dark:text-white"
                value={filterAmount}
                onChange={(e) => setFilterAmount(e.target.value)}
              >
                <option value="all">All Amounts</option>
                <option value="high">High (₹20L+)</option>
                <option value="medium">Medium (₹5L-20L)</option>
                <option value="low">Low (Under ₹5L)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Funding Opportunities Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {filteredOpportunities.map((opportunity) => (
            <div key={opportunity.id} className="bg-white dark:bg-secondary-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="h-48 bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center relative">
                <div className="text-center text-white">
                  <FiDollarSign size={48} />
                  <p className="mt-2 text-lg font-semibold">{opportunity.title}</p>
                </div>
                {isDeadlineNear(opportunity.deadline) && (
                  <div className="absolute top-4 right-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    <FiClock className="inline mr-1" size={14} />
                    Deadline Soon
                  </div>
                )}
              </div>
              
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex space-x-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(opportunity.type)}`}>
                      {opportunity.type.charAt(0).toUpperCase() + opportunity.type.slice(1)}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(opportunity.status)}`}>
                      {opportunity.status.charAt(0).toUpperCase() + opportunity.status.slice(1)}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                      {opportunity.amount}
                    </div>
                    <div className="text-sm text-secondary-500 dark:text-secondary-500">
                      Funding Amount
                    </div>
                  </div>
                </div>

                <h3 className="text-xl font-semibold text-secondary-900 dark:text-white mb-3">
                  {opportunity.title}
                </h3>

                <p className="text-secondary-600 dark:text-secondary-400 mb-4 line-clamp-3">
                  {opportunity.description}
                </p>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-sm text-secondary-600 dark:text-secondary-400">
                    <FiTarget className="mr-3" size={16} />
                    <span className="font-medium">Eligibility:</span>
                    <span className="ml-2">{opportunity.eligibility}</span>
                  </div>
                  <div className="flex items-center text-sm text-secondary-600 dark:text-secondary-400">
                    <FiClock className="mr-3" size={16} />
                    <span className="font-medium">Deadline:</span>
                    <span className="ml-2">{formatDate(opportunity.deadline)}</span>
                  </div>
                  <div className="flex items-center text-sm text-secondary-600 dark:text-secondary-400">
                    <FiUsers className="mr-3" size={16} />
                    <span className="font-medium">Organization:</span>
                    <span className="ml-2">{opportunity.organization}</span>
                  </div>
                  <div className="flex items-center text-sm text-secondary-600 dark:text-secondary-400">
                    <FiTrendingUp className="mr-3" size={16} />
                    <span className="font-medium">Equity:</span>
                    <span className="ml-2">{opportunity.equity}</span>
                  </div>
                </div>

                <div className="mb-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(opportunity.category)}`}>
                    {opportunity.category}
                  </span>
                </div>

                <div className="mb-6">
                  <h4 className="text-sm font-medium text-secondary-900 dark:text-white mb-2">Requirements:</h4>
                  <ul className="text-sm text-secondary-600 dark:text-secondary-400 space-y-1">
                    {opportunity.requirements.map((req, index) => (
                      <li key={index} className="flex items-center">
                        <FiCheckCircle className="mr-2 text-green-500" size={12} />
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex space-x-3">
                  <a
                    href={opportunity.applicationLink}
                    className={`flex-1 py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center ${
                      opportunity.status === 'open'
                        ? 'bg-primary-600 hover:bg-primary-700 text-white'
                        : 'bg-secondary-300 dark:bg-secondary-700 text-secondary-500 dark:text-secondary-400 cursor-not-allowed'
                    }`}
                    onClick={(e) => {
                      if (opportunity.status !== 'open') {
                        e.preventDefault();
                      }
                    }}
                  >
                    <FiExternalLink className="mr-2" size={16} />
                    {opportunity.status === 'open' ? 'Apply Now' : 
                     opportunity.status === 'upcoming' ? 'Coming Soon' : 'Applications Closed'}
                  </a>
                  <button className="px-4 py-3 border border-secondary-300 dark:border-secondary-600 text-secondary-700 dark:text-secondary-300 rounded-lg hover:bg-secondary-50 dark:hover:bg-secondary-700 transition-colors duration-200">
                    <FiInfo size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredOpportunities.length === 0 && (
          <div className="text-center py-12">
            <FiDollarSign className="mx-auto h-12 w-12 text-secondary-400 mb-4" />
            <h3 className="text-lg font-medium text-secondary-900 dark:text-white mb-2">
              No funding opportunities found
            </h3>
            <p className="text-secondary-600 dark:text-secondary-400">
              Try adjusting your search criteria to find more opportunities.
            </p>
          </div>
        )}

        {/* Funding Tips */}
        <div className="mt-16 bg-white dark:bg-secondary-800 rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-secondary-900 dark:text-white mb-6 text-center">
            Funding Application Tips
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiTarget className="text-blue-600 dark:text-blue-400" size={24} />
              </div>
              <h3 className="font-semibold text-secondary-900 dark:text-white mb-2">Clear Value Proposition</h3>
              <p className="text-sm text-secondary-600 dark:text-secondary-400">
                Clearly articulate your unique value and market opportunity
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiTrendingUp className="text-green-600 dark:text-green-400" size={24} />
              </div>
              <h3 className="font-semibold text-secondary-900 dark:text-white mb-2">Financial Projections</h3>
              <p className="text-sm text-secondary-600 dark:text-secondary-400">
                Provide realistic and well-researched financial forecasts
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiUsers className="text-purple-600 dark:text-purple-400" size={24} />
              </div>
              <h3 className="font-semibold text-secondary-900 dark:text-white mb-2">Strong Team</h3>
              <p className="text-sm text-secondary-600 dark:text-secondary-400">
                Highlight your team's expertise and relevant experience
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiCheckCircle className="text-orange-600 dark:text-orange-400" size={24} />
              </div>
              <h3 className="font-semibold text-secondary-900 dark:text-white mb-2">Complete Application</h3>
              <p className="text-sm text-secondary-600 dark:text-secondary-400">
                Ensure all required documents and information are provided
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FundingOpportunities;
