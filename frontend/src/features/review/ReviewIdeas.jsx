import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import {
  FiSearch,
  FiFilter,
  FiEye,
  FiCheckCircle,
  FiX,
  FiClock,
  FiUser,
  FiCalendar,
  FiTag,
  FiMapPin,
  FiMessageSquare,
  FiThumbsUp,
  FiThumbsDown,
  FiRefreshCw,
  FiDownload,
  FiSend,
  FiEdit3,
  FiAlertCircle,
  FiStar,
  FiTrendingUp,
  FiUsers,
  FiFileText,
  FiChevronDown,
  FiChevronUp,
  FiTarget
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { ideasAPI } from '../../services/api';

const ReviewIdeas = () => {
  const { user } = useSelector((state) => state.auth);
  
  // State management
  const [ideas, setIdeas] = useState([]);
  const [filteredIdeas, setFilteredIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedCollege, setSelectedCollege] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedIdeas, setSelectedIdeas] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [reviewingId, setReviewingId] = useState(null);
  const [bulkAction, setBulkAction] = useState('');
  const [expandedIdea, setExpandedIdea] = useState(null);
  
  // Modal states
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [modalIdea, setModalIdea] = useState(null);
  const [reviewAction, setReviewAction] = useState('');
  const [reviewFeedback, setReviewFeedback] = useState('');
  
  // Stats
  const [stats, setStats] = useState({
    total: 0,
    submitted: 0,
    endorsed: 0,
    rejected: 0,
    under_review: 0,
    incubated: 0
  });

  // Role-based configuration
  const isCollegeAdmin = user?.role === 'college_admin';
  const isIncubatorManager = user?.role === 'incubator_manager';

  const getAvailableStatuses = () => {
    if (isCollegeAdmin) {
      return [
        { value: 'all', label: 'All Ideas' },
        { value: 'submitted', label: 'Submitted (New)' },
        { value: 'under_review', label: 'Under Review' },
        { value: 'endorsed', label: 'Endorsed' },
        { value: 'rejected', label: 'Rejected' }
      ];
    } else if (isIncubatorManager) {
      return [
        { value: 'all', label: 'All Ideas' },
        { value: 'endorsed', label: 'Ready for Review' },
        { value: 'incubated', label: 'Incubated' },
        { value: 'rejected', label: 'Rejected' }
      ];
    }
    return [];
  };

  const getReviewActions = () => {
    if (isCollegeAdmin) {
      return [
        { value: 'under_review', label: 'Mark Under Review', icon: FiClock, color: 'yellow' },
        { value: 'endorsed', label: 'Endorse Idea', icon: FiCheckCircle, color: 'green' },
        { value: 'forward_to_incubation', label: 'Forward to Incubation Centre', icon: FiSend, color: 'blue' },
        { value: 'rejected', label: 'Reject Idea', icon: FiX, color: 'red' }
      ];
    } else if (isIncubatorManager) {
      return [
        { value: 'incubated', label: 'Select for Incubation', icon: FiStar, color: 'purple' },
        { value: 'rejected', label: 'Reject for Incubation', icon: FiX, color: 'red' }
      ];
    }
    return [];
  };

  // Fetch ideas based on role
  const fetchIdeas = useCallback(async () => {
    try {
      setLoading(true);
      
      let response;
      if (isCollegeAdmin) {
        // College admin sees all reviewable ideas by default (submitted and under_review)
        response = await ideasAPI.getForReview({
          status: selectedStatus === 'all' ? undefined : selectedStatus,
          limit: 100,
          page: 1
        });
      } else if (isIncubatorManager) {
        // Incubator manager sees endorsed ideas by default
        response = await ideasAPI.getForReview({
          status: selectedStatus === 'all' ? 'endorsed' : selectedStatus,
          limit: 100,
          page: 1
        });
      } else {
        // Fallback for other roles
        response = await ideasAPI.getAll({
          limit: 100,
          sort_by: sortBy,
          sort_order: sortOrder
        });
      }

      if (response.data?.data?.ideas) {
        const fetchedIdeas = response.data.data.ideas.map(idea => ({
          id: idea.id,
          title: idea.title,
          description: idea.description,
          category: idea.category,
          status: idea.status,
          submittedAt: idea.created_at,
          updatedAt: idea.updated_at,
          reviewedAt: idea.reviewed_at,
          student: {
            id: idea.student?.id,
            name: idea.student?.name || 'Unknown',
            email: idea.student?.email || '',
            department: idea.student?.department || 'Unknown',
            year: idea.student?.year_of_study || 'N/A'
          },
          college: {
            id: idea.college?.id,
            name: idea.college?.name || 'Unknown'
          },
          incubator: {
            id: idea.incubator?.id,
            name: idea.incubator?.name || 'Not Assigned'
          },
          reviewer: idea.reviewer ? {
            id: idea.reviewer.id,
            name: idea.reviewer.name,
            role: idea.reviewer.role,
            organization: idea.reviewer.college?.name || idea.reviewer.incubator?.name
          } : null,
          feedback: idea.feedback || '',
          problemStatement: idea.problem_statement || '',
          solutionApproach: idea.solution_approach || '',
          marketPotential: idea.market_potential || '',
          fundingRequired: idea.funding_required || 0,
          teamSize: idea.team_size || 1,
          tags: idea.tags || [],
          isPublic: idea.is_public,
          viewsCount: idea.views_count || 0,
          likesCount: idea.likes_count || 0,
          commentsCount: idea.comments?.length || 0,
          teamMembers: idea.teamMembers || [],
          files: idea.files || []
        }));
        
        setIdeas(fetchedIdeas);
        setFilteredIdeas(fetchedIdeas);
        
        // Calculate stats
        const statusCounts = fetchedIdeas.reduce((acc, idea) => {
          acc[idea.status] = (acc[idea.status] || 0) + 1;
          return acc;
        }, {});
        
        setStats({
          total: fetchedIdeas.length,
          submitted: statusCounts.submitted || 0,
          endorsed: statusCounts.endorsed || 0,
          rejected: statusCounts.rejected || 0,
          under_review: statusCounts.under_review || 0,
          incubated: statusCounts.incubated || 0
        });
      }
    } catch (error) {
      console.error('Error fetching ideas:', error);
      toast.error('Failed to load ideas for review');
      setIdeas([]);
      setFilteredIdeas([]);
    } finally {
      setLoading(false);
    }
  }, [selectedStatus, sortBy, sortOrder, isCollegeAdmin, isIncubatorManager]);

  // Initial load and refresh on dependencies
  useEffect(() => {
    if (user?.id) {
      fetchIdeas();
    }
  }, [fetchIdeas, user?.id]);

  // Filter and search logic
  useEffect(() => {
    let filtered = ideas;

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(idea => 
        idea.title.toLowerCase().includes(searchLower) ||
        idea.description.toLowerCase().includes(searchLower) ||
        idea.student.name.toLowerCase().includes(searchLower) ||
        idea.college.name.toLowerCase().includes(searchLower) ||
        idea.category.toLowerCase().includes(searchLower) ||
        idea.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(idea => idea.category === selectedCategory);
    }

    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(idea => idea.status === selectedStatus);
    }

    // College filter (for incubator managers)
    if (selectedCollege !== 'all' && isIncubatorManager) {
      filtered = filtered.filter(idea => idea.college.name === selectedCollege);
    }

    // Sorting
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'submittedAt' || sortBy === 'updatedAt' || sortBy === 'reviewedAt') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredIdeas(filtered);
  }, [ideas, searchTerm, selectedCategory, selectedStatus, selectedCollege, sortBy, sortOrder, isIncubatorManager]);

  // Handle idea review action
  const handleReviewAction = async (ideaId, action, feedback) => {
    try {
      setReviewingId(ideaId);
      
      // Handle pitch now action
      if (action === 'pitch_now') {
        // For pitch now, we'll just show a success message and maybe open a pitch modal
        toast.success('Pitch session initiated! Student will be notified.');
        setShowReviewModal(false);
        setModalIdea(null);
        setReviewAction('');
        setReviewFeedback('');
        return;
      }
      
      const response = await ideasAPI.updateStatus(ideaId, {
        status: action,
        feedback: feedback
      });

      if (response.data.success) {
        toast.success(`Idea ${action} successfully!`);
        
        // Refresh ideas list
        await fetchIdeas();
        
        // Close modal
        setShowReviewModal(false);
        setModalIdea(null);
        setReviewAction('');
        setReviewFeedback('');
        
        // Send notification toast about student notification
        const actionMessages = {
          endorsed: 'Student has been notified of endorsement',
          rejected: 'Student has been notified of rejection',
          under_review: 'Student has been notified that idea is under review',
          incubated: 'Student has been notified of incubation selection',
          forward_to_incubation: 'Idea forwarded to incubation centre'
        };
        
        if (actionMessages[action]) {
          setTimeout(() => {
            toast.success(actionMessages[action], { icon: '📧' });
          }, 1000);
        }
      } else {
        toast.error('Failed to update idea status');
      }
    } catch (error) {
      console.error('Error updating idea status:', error);
      toast.error(error.response?.data?.message || 'Failed to update idea status');
    } finally {
      setReviewingId(null);
    }
  };

  // Handle bulk actions
  const handleBulkAction = async () => {
    if (!bulkAction || selectedIdeas.length === 0) {
      toast.error('Please select ideas and an action');
      return;
    }

    try {
      setLoading(true);
      
      const promises = selectedIdeas.map(ideaId => 
        ideasAPI.updateStatus(ideaId, {
          status: bulkAction,
          feedback: `Bulk action: ${bulkAction}`
        })
      );

      await Promise.all(promises);
      
      toast.success(`${selectedIdeas.length} ideas updated successfully!`);
      
      // Refresh list
      await fetchIdeas();
      
      // Clear selections
      setSelectedIdeas([]);
      setBulkAction('');
      
    } catch (error) {
      console.error('Bulk action error:', error);
      toast.error('Some bulk actions failed');
    } finally {
      setLoading(false);
    }
  };

  // Export ideas data
  const exportIdeas = () => {
    try {
      const csvHeaders = ['Title', 'Status', 'Student', 'College', 'Category', 'Submitted Date', 'Feedback'].join(',');
      const csvData = filteredIdeas.map(idea => [
        `"${idea.title}"`,
        idea.status,
        `"${idea.student.name}"`,
        `"${idea.college.name}"`,
        idea.category,
        new Date(idea.submittedAt).toLocaleDateString(),
        `"${idea.feedback}"`
      ].join(',')).join('\n');
      
      const csvContent = `${csvHeaders}\n${csvData}`;
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `ideas_review_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Ideas data exported successfully');
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export ideas data');
    }
  };

  // Get status badge styling
  const getStatusBadge = (status) => {
    const badges = {
      submitted: { bg: 'bg-blue-100 text-blue-800', text: 'New Submission' },
      under_review: { bg: 'bg-yellow-100 text-yellow-800', text: 'Under Review' },
      endorsed: { bg: 'bg-green-100 text-green-800', text: 'Endorsed' },
      incubated: { bg: 'bg-purple-100 text-purple-800', text: 'Incubated' },
      rejected: { bg: 'bg-red-100 text-red-800', text: 'Rejected' },
      draft: { bg: 'bg-gray-100 text-gray-800', text: 'Draft' }
    };
    
    const badge = badges[status] || badges.draft;
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${badge.bg}`}>
        {badge.text}
      </span>
    );
  };

  // Get priority badge
  const getPriorityBadge = (idea) => {
    if (!idea.submittedAt) return null;
    
    const submissionDate = new Date(idea.submittedAt);
    if (isNaN(submissionDate.getTime())) return null;
    
    const daysSinceSubmission = Math.floor((new Date() - submissionDate) / (1000 * 60 * 60 * 24));
    
    if (daysSinceSubmission > 7 && idea.status === 'submitted') {
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Urgent</span>;
    } else if (daysSinceSubmission > 3 && idea.status === 'submitted') {
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800">High</span>;
    }
    return null;
  };

  const categories = [...new Set(ideas.map(idea => idea.category))];
  const colleges = [...new Set(ideas.map(idea => idea.college.name))];

  if (loading && ideas.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <FiRefreshCw className="animate-spin text-4xl text-primary-600" />
          <p className="text-gray-600">Loading ideas for review...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-full">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {isCollegeAdmin ? 'Review Student Ideas' : 'Incubation Review'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {isCollegeAdmin 
                ? 'Review and endorse ideas submitted by students from your college' 
                : 'Review endorsed ideas for potential incubation opportunities'
              }
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-4 lg:mt-0">
            <button
              onClick={fetchIdeas}
              disabled={loading}
              className="btn btn-secondary flex items-center space-x-2"
            >
              <FiRefreshCw className={loading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
            
            <button
              onClick={exportIdeas}
              className="btn btn-primary flex items-center space-x-2"
            >
              <FiDownload />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
          <div className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
              </div>
              <FiFileText className="text-2xl text-gray-400" />
            </div>
          </div>
          
          {isCollegeAdmin && (
            <>
              <div className="card p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600">New</p>
                    <p className="text-2xl font-bold text-blue-900">{stats.submitted}</p>
                  </div>
                  <FiSend className="text-2xl text-blue-400" />
                </div>
              </div>
              
              <div className="card p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-yellow-600">Reviewing</p>
                    <p className="text-2xl font-bold text-yellow-900">{stats.under_review}</p>
                  </div>
                  <FiClock className="text-2xl text-yellow-400" />
                </div>
              </div>
              
              <div className="card p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600">Endorsed</p>
                    <p className="text-2xl font-bold text-green-900">{stats.endorsed}</p>
                  </div>
                  <FiCheckCircle className="text-2xl text-green-400" />
                </div>
              </div>
            </>
          )}
          
          {isIncubatorManager && (
            <>
              <div className="card p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600">Endorsed</p>
                    <p className="text-2xl font-bold text-green-900">{stats.endorsed}</p>
                  </div>
                  <FiCheckCircle className="text-2xl text-green-400" />
                </div>
              </div>
              
              <div className="card p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-600">Incubated</p>
                    <p className="text-2xl font-bold text-purple-900">{stats.incubated}</p>
                  </div>
                  <FiStar className="text-2xl text-purple-400" />
                </div>
              </div>
            </>
          )}
          
          <div className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600">Rejected</p>
                <p className="text-2xl font-bold text-red-900">{stats.rejected}</p>
              </div>
              <FiX className="text-2xl text-red-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="card p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
          <div className="flex items-center space-x-4 mb-4 lg:mb-0">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn btn-secondary flex items-center space-x-2"
            >
              <FiFilter />
              <span>Filters</span>
              {showFilters ? <FiChevronUp /> : <FiChevronDown />}
            </button>
            
            {selectedIdeas.length > 0 && (
              <div className="flex items-center space-x-2">
                <select
                  value={bulkAction}
                  onChange={(e) => setBulkAction(e.target.value)}
                  className="input-field text-sm"
                >
                  <option value="">Bulk Action</option>
                  {getReviewActions().map(action => (
                    <option key={action.value} value={action.value}>
                      {action.label}
                    </option>
                  ))}
                </select>
                
                <button
                  onClick={handleBulkAction}
                  disabled={!bulkAction}
                  className="btn btn-primary text-sm"
                >
                  Apply ({selectedIdeas.length})
                </button>
              </div>
            )}
          </div>

          {/* Search */}
          <div className="relative lg:w-96">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search ideas, students, colleges..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10 w-full"
            />
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="input-field w-full"
              >
                {getAvailableStatuses().map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="input-field w-full"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {isIncubatorManager && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  College
                </label>
                <select
                  value={selectedCollege}
                  onChange={(e) => setSelectedCollege(e.target.value)}
                  className="input-field w-full"
                >
                  <option value="all">All Colleges</option>
                  {colleges.map(college => (
                    <option key={college} value={college}>
                      {college}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sort By
              </label>
              <div className="flex space-x-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="input-field flex-1"
                >
                  <option value="submittedAt">Submission Date</option>
                  <option value="title">Title</option>
                  <option value="status">Status</option>
                  <option value="updatedAt">Last Updated</option>
                </select>
                
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="btn btn-secondary px-3"
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Ideas List */}
      <div className="space-y-4">
        {filteredIdeas.length === 0 ? (
          <div className="card p-12 text-center">
            <FiFileText className="mx-auto text-6xl text-gray-300 mb-4" />
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
              No ideas found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm || selectedCategory !== 'all' || selectedStatus !== 'all'
                ? 'Try adjusting your filters or search terms'
                : 'No ideas are currently available for review'
              }
            </p>
          </div>
        ) : (
          filteredIdeas.map((idea) => (
            <div key={idea.id} className="card p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-4 flex-1">
                  <input
                    type="checkbox"
                    checked={selectedIdeas.includes(idea.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedIdeas([...selectedIdeas, idea.id]);
                      } else {
                        setSelectedIdeas(selectedIdeas.filter(id => id !== idea.id));
                      }
                    }}
                    className="mt-1 h-4 w-4 text-primary-600 rounded border-gray-300"
                  />
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {idea.title}
                      </h3>
                      {getStatusBadge(idea.status)}
                      {getPriorityBadge(idea)}
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                      {idea.description}
                    </p>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center space-x-1">
                        <FiUser />
                        <span>{idea.student.name}</span>
                        <span className="text-gray-300">•</span>
                        <span>{idea.student.department}</span>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <FiMapPin />
                        <span>{idea.college.name}</span>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <FiTag />
                        <span>{idea.category}</span>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <FiCalendar />
                        <span>{idea.submittedAt ? new Date(idea.submittedAt).toLocaleDateString() : 'Date not available'}</span>
                      </div>
                      
                      {idea.reviewer && (
                        <div className="flex items-center space-x-1">
                          <FiCheckCircle />
                          <span>Reviewed by {idea.reviewer.name}</span>
                        </div>
                      )}
                    </div>
                    
                    {idea.feedback && (
                      <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          <strong>Feedback:</strong> {idea.feedback}
                        </p>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center space-x-1">
                          <FiEye />
                          <span>{idea.viewsCount} views</span>
                        </span>
                        
                        <span className="flex items-center space-x-1">
                          <FiThumbsUp />
                          <span>{idea.likesCount} likes</span>
                        </span>
                        
                        <span className="flex items-center space-x-1">
                          <FiMessageSquare />
                          <span>{idea.commentsCount} comments</span>
                        </span>
                        
                        {idea.teamMembers.length > 0 && (
                          <span className="flex items-center space-x-1">
                            <FiUsers />
                            <span>{idea.teamMembers.length} team members</span>
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setExpandedIdea(expandedIdea === idea.id ? null : idea.id)}
                          className="btn btn-secondary text-sm"
                        >
                          <FiEye />
                          {expandedIdea === idea.id ? 'Hide Details' : 'View Details'}
                        </button>
                        
                        {/* Pitch Now Button for Endorsed Ideas */}
                        {idea.status === 'endorsed' && (
                          <button
                            onClick={() => {
                              setModalIdea(idea);
                              setReviewAction('pitch_now');
                              setShowReviewModal(true);
                            }}
                            className="btn btn-primary text-sm flex items-center space-x-1"
                          >
                            <FiTarget />
                            <span>Pitch Now</span>
                          </button>
                        )}
                        
                        {getReviewActions().map(action => {
                          const IconComponent = action.icon;
                          const colorClasses = {
                            green: 'btn-success',
                            red: 'btn-danger', 
                            yellow: 'btn-warning',
                            purple: 'btn-primary'
                          };
                          
                          return (
                            <button
                              key={action.value}
                              onClick={() => {
                                setModalIdea(idea);
                                setReviewAction(action.value);
                                setShowReviewModal(true);
                              }}
                              disabled={reviewingId === idea.id}
                              className={`btn ${colorClasses[action.color]} text-sm flex items-center space-x-1`}
                            >
                              {reviewingId === idea.id ? (
                                <FiRefreshCw className="animate-spin" />
                              ) : (
                                <IconComponent />
                              )}
                              <span>{action.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Expanded Details */}
              {expandedIdea === idea.id && (
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Problem Statement</h4>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        {idea.problemStatement || 'Not provided'}
                      </p>
                      
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Solution Approach</h4>
                      <p className="text-gray-600 dark:text-gray-400">
                        {idea.solutionApproach || 'Not provided'}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Market Potential</h4>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        {idea.marketPotential || 'Not provided'}
                      </p>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Funding Required</h4>
                          <p className="text-gray-600 dark:text-gray-400">
                            ₹{idea.fundingRequired.toLocaleString() || 'Not specified'}
                          </p>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Team Size</h4>
                          <p className="text-gray-600 dark:text-gray-400">
                            {idea.teamSize} member{idea.teamSize !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      
                      {idea.tags.length > 0 && (
                        <div className="mt-4">
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Tags</h4>
                          <div className="flex flex-wrap gap-2">
                            {idea.tags.map((tag, index) => (
                              <span key={index} className="px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded-full">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Review Modal */}
      {showReviewModal && modalIdea && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Review Idea: {modalIdea.title}
                </h2>
                <button
                  onClick={() => {
                    setShowReviewModal(false);
                    setModalIdea(null);
                    setReviewAction('');
                    setReviewFeedback('');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FiX className="text-xl" />
                </button>
              </div>
              
              <div className="space-y-4 mb-6">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">Student Information</h3>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <p><strong>Name:</strong> {modalIdea.student.name}</p>
                    <p><strong>Email:</strong> {modalIdea.student.email}</p>
                    <p><strong>Department:</strong> {modalIdea.student.department}</p>
                    <p><strong>Year:</strong> {modalIdea.student.year}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">Idea Description</h3>
                  <p className="text-gray-600 dark:text-gray-400">{modalIdea.description}</p>
                </div>
                
                {modalIdea.problemStatement && (
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white mb-2">Problem Statement</h3>
                    <p className="text-gray-600 dark:text-gray-400">{modalIdea.problemStatement}</p>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Action
                  </label>
                  <select
                    value={reviewAction}
                    onChange={(e) => setReviewAction(e.target.value)}
                    className="input-field w-full"
                  >
                    <option value="">Select Action</option>
                    {getReviewActions().map(action => (
                      <option key={action.value} value={action.value}>
                        {action.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Feedback for Student
                  </label>
                  <textarea
                    value={reviewFeedback}
                    onChange={(e) => setReviewFeedback(e.target.value)}
                    placeholder="Provide detailed feedback to help the student understand your decision..."
                    rows={4}
                    className="input-field w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This feedback will be sent to the student via notification
                  </p>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={() => {
                      setShowReviewModal(false);
                      setModalIdea(null);
                      setReviewAction('');
                      setReviewFeedback('');
                    }}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  
                  <button
                    onClick={() => handleReviewAction(modalIdea.id, reviewAction, reviewFeedback)}
                    disabled={!reviewAction || reviewingId === modalIdea.id}
                    className="btn btn-primary flex items-center space-x-2"
                  >
                    {reviewingId === modalIdea.id ? (
                      <>
                        <FiRefreshCw className="animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <FiSend />
                        <span>Submit Review</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewIdeas;
