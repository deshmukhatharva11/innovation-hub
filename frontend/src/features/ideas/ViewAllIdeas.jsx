import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FiSearch, FiFilter, FiEye, FiHeart, FiMessageCircle, FiCalendar, FiUser, FiMapPin, FiPaperclip } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { ideasAPI, usersAPI } from '../../services/api';

const ViewAllIdeas = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalIdeas, setTotalIdeas] = useState(0);
  const [filterLoading, setFilterLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');
  const [collegeFilter, setCollegeFilter] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [colleges, setColleges] = useState([]);
  const [districts, setDistricts] = useState([]);

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'submitted', label: 'Submitted' },
    { value: 'under_review', label: 'Under Review' },
    { value: 'endorsed', label: 'Endorsed' },
    { value: 'incubated', label: 'Incubated' },
    { value: 'rejected', label: 'Rejected' }
  ];

  const categoryOptions = [
    { value: '', label: 'All Categories' },
    { value: 'Technology', label: 'Technology' },
    { value: 'Healthcare', label: 'Healthcare' },
    { value: 'Education', label: 'Education' },
    { value: 'Finance', label: 'Finance' },
    { value: 'Environment', label: 'Environment' },
    { value: 'Agriculture', label: 'Agriculture' },
    { value: 'Transportation', label: 'Transportation' },
    { value: 'Entertainment', label: 'Entertainment' },
    { value: 'Social Impact', label: 'Social Impact' },
    { value: 'Other', label: 'Other' }
  ];

  const sortOptions = [
    { value: 'created_at', label: 'Date Created' },
    { value: 'title', label: 'Title' },
    { value: 'likes_count', label: 'Likes' },
    { value: 'views_count', label: 'Views' }
  ];

  const fetchIdeas = async (isFilterChange = false) => {
    try {
      if (isFilterChange) {
        setFilterLoading(true);
      } else {
        setLoading(true);
      }
      
      const params = {
        page: currentPage,
        limit: 12,
        search: searchTerm,
        sort_by: sortBy,
        sort_order: sortOrder
      };

      // For students, only show their own ideas
      if (user?.role === 'student') {
        params.student_id = user.id;
      }

      // Only add filters if they have values
      if (statusFilter) params.status = statusFilter;
      if (categoryFilter) params.category = categoryFilter;
      if (districtFilter) params.district = districtFilter;
      if (collegeFilter) params.college_id = collegeFilter;

      console.log('Fetching ideas with params:', params);
      const response = await ideasAPI.getAll(params);
      
      if (response.data.success) {
        const ideasData = response.data.data.ideas;
        const paginationData = response.data.data.pagination || {};
        console.log(`Fetched ${ideasData.length} ideas`);
        console.log('Pagination data:', paginationData);
        setIdeas(ideasData);
        setTotalPages(paginationData.total_pages || 1);
        setTotalIdeas(paginationData.total_items || ideasData.length);
      } else {
        console.error('API response error:', response.data);
        toast.error('Failed to fetch ideas');
      }
    } catch (error) {
      console.error('Error fetching ideas:', error);
      toast.error('Failed to load ideas');
    } finally {
      setLoading(false);
      setFilterLoading(false);
    }
  };

  useEffect(() => {
    fetchIdeas();
  }, [currentPage, searchTerm, statusFilter, categoryFilter, districtFilter, collegeFilter, sortBy, sortOrder]);

  useEffect(() => {
    fetchCollegesAndDistricts();
  }, []);

  const fetchCollegesAndDistricts = async () => {
    try {
      // Use the appropriate API based on user role
      const response = user?.role === 'incubator_manager' 
        ? await usersAPI.getIncubatorColleges()
        : await usersAPI.getColleges();
      
      if (response.data?.success && response.data?.data?.colleges) {
        const collegesData = response.data.data.colleges;
        setColleges(collegesData);
        
        // Extract unique districts and filter out null/undefined values
        const uniqueDistricts = [...new Set(collegesData
          .map(college => college.district)
          .filter(district => district && district.trim() !== '')
        )].sort();
        
        console.log('Available districts:', uniqueDistricts);
        setDistricts(uniqueDistricts);
      } else {
        console.error('Failed to fetch colleges:', response.data);
        toast.error('Failed to load districts and colleges');
      }
    } catch (error) {
      console.error('Error fetching colleges:', error);
      toast.error('Failed to load districts and colleges');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchIdeas();
  };

  const handleFilterChange = () => {
    setCurrentPage(1);
    fetchIdeas(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'under_review': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'endorsed': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'incubated': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Invalid Date';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const truncateText = (text, maxLength = 100) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const truncateDescription = (text, maxLength = 200) => {
    if (!text) return 'No description available';
    // For very long strings without spaces, force truncation
    if (text.length > maxLength) {
      return text.substring(0, maxLength) + '...';
    }
    return text;
  };

  // Force text truncation for very long strings
  useEffect(() => {
    const descriptionElements = document.querySelectorAll('.idea-description');
    descriptionElements.forEach(element => {
      const text = element.textContent;
      if (text && text.length > 200) {
        element.textContent = text.substring(0, 200) + '...';
      }
    });

    // Ensure titles are visible and not completely truncated
    const titleElements = document.querySelectorAll('.idea-title');
    titleElements.forEach(element => {
      const text = element.textContent;
      if (text && text.trim() === '') {
        // If title is empty or only contains ellipsis, try to restore from data
        const ideaId = element.closest('.idea-card')?.getAttribute('data-idea-id');
        if (ideaId) {
          const idea = ideas.find(i => i.id.toString() === ideaId);
          if (idea && idea.title) {
            element.textContent = idea.title;
          }
        }
      }
    });
  }, [ideas]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {user?.role === 'student' ? 'My Ideas' : 'All Ideas'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {user?.role === 'student' 
              ? 'View and manage your submitted ideas' 
              : 'Explore innovative ideas from students across colleges'
            }
          </p>
        </div>



        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <form onSubmit={handleSearch} className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search ideas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </form>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <FiFilter />
              Filters
            </button>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      handleFilterChange();
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    value={categoryFilter}
                    onChange={(e) => {
                      setCategoryFilter(e.target.value);
                      handleFilterChange();
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    {categoryOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    District
                  </label>
                  <select
                    value={districtFilter}
                    onChange={(e) => {
                      setDistrictFilter(e.target.value);
                      setCollegeFilter(''); // Reset college filter when district changes
                      handleFilterChange();
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">All Districts</option>
                    {districts.map(district => (
                      <option key={district} value={district}>
                        {district}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    College
                  </label>
                  <select
                    value={collegeFilter}
                    onChange={(e) => {
                      setCollegeFilter(e.target.value);
                      handleFilterChange();
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">All Colleges</option>
                    {colleges
                      .filter(college => !districtFilter || college.district === districtFilter)
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map(college => (
                        <option key={college.id} value={college.id}>
                          {college.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Sort By
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => {
                      setSortBy(e.target.value);
                      handleFilterChange();
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    {sortOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Order
                  </label>
                  <select
                    value={sortOrder}
                    onChange={(e) => {
                      setSortOrder(e.target.value);
                      handleFilterChange();
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="desc">Newest First</option>
                    <option value="asc">Oldest First</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Summary */}
        {!loading && !filterLoading && (
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium">
                {totalIdeas > 0 ? `${totalIdeas.toLocaleString()} ideas found` : 'No ideas found'}
              </span>
              {(statusFilter || categoryFilter || districtFilter || collegeFilter || searchTerm) && (
                <>
                  <span>•</span>
                  <span>Filtered by:</span>
                  {statusFilter && (
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 rounded">
                      Status: {statusOptions.find(opt => opt.value === statusFilter)?.label}
                    </span>
                  )}
                  {categoryFilter && (
                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 rounded">
                      Category: {categoryOptions.find(opt => opt.value === categoryFilter)?.label}
                    </span>
                  )}
                  {districtFilter && (
                    <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-400 rounded">
                      District: {districtFilter}
                    </span>
                  )}
                  {collegeFilter && (
                    <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-400 rounded">
                      College: {colleges.find(c => c.id == collegeFilter)?.name}
                    </span>
                  )}
                  {searchTerm && (
                    <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400 rounded">
                      Search: "{searchTerm}"
                    </span>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Ideas Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : filterLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
              <span>Applying filters...</span>
            </div>
          </div>
        ) : ideas.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">💡</div>
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
              No ideas found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your search criteria or filters
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ideas.map((idea) => (
              <div
                key={idea.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer overflow-hidden h-80 idea-card"
                data-idea-id={idea.id}
                onClick={() => navigate(`/ideas/${idea.id}`)}
              >
                <div className="p-6 h-full flex flex-col">
                  {/* Status Badge */}
                  <div className="flex justify-between items-start mb-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(idea.status)}`}>
                      {idea.status.replace('_', ' ').toUpperCase()}
                    </span>
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <FiEye />
                      <span>{idea.views_count || 0}</span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 idea-title">
                    {idea.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 idea-description">
                    {truncateDescription(idea.description, 200)}
                  </p>

                  {/* Meta Information */}
                  <div className="space-y-2 mb-4 flex-shrink-0">
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <FiUser className="flex-shrink-0" />
                      <span className="truncate" title={idea.student?.name || 'Unknown'}>
                        {idea.student?.name || 'Unknown'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <FiMapPin className="flex-shrink-0" />
                      <span className="truncate" title={idea.college?.name || 'Unknown College'}>
                        {idea.college?.name || 'Unknown College'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <FiCalendar className="flex-shrink-0" />
                      <span className="truncate">{formatDate(idea.created_at)}</span>
                    </div>
                  </div>

                  {/* Category */}
                  <div className="mb-4 flex-shrink-0">
                    <span className="inline-block px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 text-xs rounded">
                      {idea.category}
                    </span>
                  </div>

                  {/* Engagement Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mt-auto pt-4 flex-shrink-0">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <FiHeart />
                        <span>{idea.likes_count || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FiMessageCircle />
                        <span>{idea.comments_count || 0}</span>
                      </div>
                      {idea.files && idea.files.length > 0 && (
                        <div className="flex items-center gap-1">
                          <FiPaperclip />
                          <span>{idea.files.length}</span>
                        </div>
                      )}
                    </div>
                    <div className="text-xs">
                      {idea.funding_required ? `₹${idea.funding_required.toLocaleString()}` : 'No funding'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {(totalPages > 1 || totalIdeas > 0) && (
          <div className="mt-8 flex flex-col items-center gap-4">
            {/* Page Info */}
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {totalIdeas > 0 ? (
                <>
                  Page {currentPage} of {totalPages} • Showing {ideas.length} of {totalIdeas.toLocaleString()} ideas
                </>
              ) : (
                <>
                  Page {currentPage} of {totalPages} • No ideas found
                </>
              )}
            </div>
            
            {/* Pagination Controls */}
            <nav className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                First
              </button>
              
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              {/* Page Numbers */}
              {(() => {
                const pages = [];
                const maxVisiblePages = 5;
                let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
                let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
                
                // Adjust start page if we're near the end
                if (endPage - startPage + 1 < maxVisiblePages) {
                  startPage = Math.max(1, endPage - maxVisiblePages + 1);
                }
                
                // Add first page and ellipsis if needed
                if (startPage > 1) {
                  pages.push(
                    <button
                      key={1}
                      onClick={() => setCurrentPage(1)}
                      className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      1
                    </button>
                  );
                  if (startPage > 2) {
                    pages.push(
                      <span key="ellipsis1" className="px-2 text-gray-500">
                        ...
                      </span>
                    );
                  }
                }
                
                // Add visible page numbers
                for (let i = startPage; i <= endPage; i++) {
                  pages.push(
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i)}
                      className={`px-3 py-2 text-sm rounded-lg ${
                        currentPage === i
                          ? 'bg-blue-500 text-white'
                          : 'border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      {i}
                    </button>
                  );
                }
                
                // Add ellipsis and last page if needed
                if (endPage < totalPages) {
                  if (endPage < totalPages - 1) {
                    pages.push(
                      <span key="ellipsis2" className="px-2 text-gray-500">
                        ...
                      </span>
                    );
                  }
                  pages.push(
                    <button
                      key={totalPages}
                      onClick={() => setCurrentPage(totalPages)}
                      className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      {totalPages}
                    </button>
                  );
                }
                
                return pages;
              })()}
              
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
              
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Last
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewAllIdeas;
