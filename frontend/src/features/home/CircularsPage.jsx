import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft, FiDownload, FiCalendar, FiFileText, FiSearch, FiFilter } from 'react-icons/fi';
import cmsService from '../../services/cmsService';
import { getFullApiUrl, API_ENDPOINTS } from '../../config/api';

const CircularsPage = () => {
  const [circulars, setCirculars] = useState([]);
  const [filteredCirculars, setFilteredCirculars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');

  useEffect(() => {
    fetchCirculars();
  }, []);

  useEffect(() => {
    filterCirculars();
  }, [circulars, searchTerm, filterCategory, filterPriority]);

  const fetchCirculars = async () => {
    try {
      setLoading(true);
      const response = await cmsService.getLatestCirculars(50); // Get more circulars
      if (response.success) {
        setCirculars(response.data.circulars);
      }
    } catch (error) {
      console.error('Error fetching circulars:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterCirculars = () => {
    let filtered = circulars;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(circular =>
        circular.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        circular.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(circular => circular.category === filterCategory);
    }

    // Priority filter
    if (filterPriority !== 'all') {
      filtered = filtered.filter(circular => circular.priority === filterPriority);
    }

    setFilteredCirculars(filtered);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'academic': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'examination': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'admission': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Recent';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-secondary-600 dark:text-secondary-400">Loading circulars...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900">
      {/* Header */}
      <div className="bg-white dark:bg-secondary-800 shadow-sm border-b border-secondary-200 dark:border-secondary-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                to="/"
                className="inline-flex items-center text-secondary-600 dark:text-secondary-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200"
              >
                <FiArrowLeft className="mr-2" size={20} />
                Back to Home
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-secondary-900 dark:text-white">
                  University Circulars
                </h1>
                <p className="text-secondary-600 dark:text-secondary-400 mt-1">
                  Stay updated with the latest announcements and guidelines
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-sm border border-secondary-200 dark:border-secondary-700 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400" size={20} />
              <input
                type="text"
                placeholder="Search circulars..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-secondary-700 text-secondary-900 dark:text-white"
              />
            </div>

            {/* Category Filter */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-secondary-700 text-secondary-900 dark:text-white"
            >
              <option value="all">All Categories</option>
              <option value="academic">Academic</option>
              <option value="examination">Examination</option>
              <option value="admission">Admission</option>
              <option value="other">Other</option>
            </select>

            {/* Priority Filter */}
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-4 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-secondary-700 text-secondary-900 dark:text-white"
            >
              <option value="all">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>
        </div>

        {/* Circulars List */}
        <div className="space-y-6">
          {filteredCirculars.length > 0 ? (
            filteredCirculars.map((circular) => (
              <div
                key={circular.id}
                className="bg-white dark:bg-secondary-800 rounded-lg shadow-sm border border-secondary-200 dark:border-secondary-700 hover:shadow-md transition-shadow duration-200"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-semibold text-secondary-900 dark:text-white">
                          {circular.title}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(circular.priority)}`}>
                          {circular.priority ? circular.priority.toUpperCase() : 'NORMAL'}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(circular.category)}`}>
                          {circular.category ? circular.category.toUpperCase() : 'OTHER'}
                        </span>
                      </div>
                      
                      <p className="text-secondary-600 dark:text-secondary-400 mb-4">
                        {circular.description}
                      </p>
                      
                      <div className="flex items-center text-sm text-secondary-500 dark:text-secondary-400 space-x-4">
                        <div className="flex items-center">
                          <FiCalendar className="mr-1" size={16} />
                          <span>{formatDate(circular.created_at)}</span>
                        </div>
                        <div className="flex items-center">
                          <FiFileText className="mr-1" size={16} />
                          <span>{circular.file_name ? circular.file_name.split('.').pop().toUpperCase() : 'PDF'}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="ml-4">
                      <button
                        onClick={() => {
                          if (circular.id) {
                            // Use the proper download endpoint
                            const downloadUrl = getFullApiUrl(API_ENDPOINTS.PUBLIC_CIRCULAR_DOWNLOAD(circular.id));
                            window.open(downloadUrl, '_blank');
                          }
                        }}
                        className="inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors duration-200"
                      >
                        <FiDownload className="mr-2" size={16} />
                        Download
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <FiFileText className="mx-auto text-secondary-400 mb-4" size={48} />
              <h3 className="text-lg font-medium text-secondary-900 dark:text-white mb-2">
                No circulars found
              </h3>
              <p className="text-secondary-600 dark:text-secondary-400">
                {searchTerm || filterCategory !== 'all' || filterPriority !== 'all'
                  ? 'Try adjusting your search or filter criteria.'
                  : 'No circulars are available at the moment.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CircularsPage;
