import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiCheckCircle,
  FiX,
  FiClock,
  FiEye,
  FiUser,
  FiCalendar,
  FiTag,
  FiSearch,
  FiMapPin,
  FiStar,
  FiMessageSquare
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { ideasAPI } from '../../services/api';

const IdeaReview = () => {
  const [ideas, setIdeas] = useState([]);
  const [filteredIdeas, setFilteredIdeas] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('endorsed');
  const [regionFilter, setRegionFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState(null);

  useEffect(() => {
    fetchIdeas();
  }, []);

  const fetchIdeas = async () => {
    try {
      setLoading(true);
      // Use the new review endpoint for incubator managers - only endorsed ideas
      const response = await ideasAPI.getForReview({
        status: 'endorsed',
        limit: 100,
        page: 1
      });

      if (response.data?.data?.ideas) {
        const formattedIdeas = response.data.data.ideas.map(idea => ({
          id: idea.id,
          title: idea.title,
          description: idea.description,
          category: idea.category,
          status: idea.status,
          submittedAt: idea.created_at,
          endorsedAt: idea.endorsement_date,
          studentId: idea.student_id,
          studentName: idea.student?.name || 'Unknown',
          studentEmail: idea.student?.email || '',
          college: idea.college?.name || 'Unknown',
          region: idea.college?.city || 'Unknown',
          department: idea.student?.department || '',
          year: idea.student?.year_of_study || '',
          techStack: idea.tags || [],
          fundingRequired: idea.funding_required || 'Not specified',
          marketPotential: idea.market_potential || 'Medium',
          views: idea.views_count || 0,
          rating: idea.rating || 0,
          endorsementComments: idea.reviewer_notes || '',
          likes: idea.likes_count || 0,
          comments: idea.comments?.length || 0,
          teamSize: idea.team_size || 1
        }));

        setIdeas(formattedIdeas);
        setFilteredIdeas(formattedIdeas.filter(idea => idea.status === 'endorsed'));
      }
    } catch (error) {
      console.error('Error fetching ideas:', error);
      toast.error('Failed to load ideas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = ideas;

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(idea => idea.status === statusFilter);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(idea =>
        idea.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        idea.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        idea.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        idea.college.toLowerCase().includes(searchTerm.toLowerCase()) ||
        idea.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(idea => idea.category === categoryFilter);
    }

    // Filter by region
    if (regionFilter !== 'all') {
      filtered = filtered.filter(idea => idea.region === regionFilter);
    }

    setFilteredIdeas(filtered);
  }, [ideas, searchTerm, categoryFilter, statusFilter, regionFilter]);

  const handleReview = async (ideaId, action, comments = '', rating = 0) => {
    setReviewingId(ideaId);
    
    try {
      const newStatus = action === 'accept' ? 'incubated' : 'rejected';
      
      await ideasAPI.updateStatus(ideaId, {
        status: newStatus,
        reviewer_notes: comments,
        rating: rating,
        review_date: new Date().toISOString()
      });
      
      // Update local state
      setIdeas(prev => prev.map(idea => 
        idea.id === ideaId 
          ? { 
              ...idea, 
              status: newStatus,
              endorsementComments: comments,
              rating: rating
            }
          : idea
      ));
      
      toast.success(`Idea ${action === 'accept' ? 'accepted' : 'rejected'} for incubation!`);
    } catch (error) {
      console.error('Error reviewing idea:', error);
      toast.error('Failed to process review. Please try again.');
    } finally {
      setReviewingId(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'endorsed': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      case 'under_review': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'incubated': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'rejected': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      default: return 'text-secondary-600 bg-secondary-100 dark:bg-secondary-900/20';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'endorsed': return <FiEye size={16} />;
      case 'under_review': return <FiClock size={16} />;
      case 'incubated': return <FiCheckCircle size={16} />;
      case 'rejected': return <FiX size={16} />;
      default: return <FiClock size={16} />;
    }
  };

  const getMarketPotentialColor = (potential) => {
    switch (potential) {
      case 'Very High': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'High': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      case 'Medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'Low': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      default: return 'text-secondary-600 bg-secondary-100 dark:bg-secondary-900/20';
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <FiStar
        key={i}
        size={14}
        className={i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-secondary-300'}
      />
    ));
  };

  const categories = [...new Set(ideas.map(idea => idea.category))];
  const regions = [...new Set(ideas.map(idea => idea.region))];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-secondary-900 dark:text-white">
          Idea Review
        </h1>
        <p className="text-secondary-600 dark:text-secondary-400 mt-2">
          Review endorsed ideas for incubation opportunities
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400">
                Endorsed Ideas
              </p>
              <p className="text-2xl font-bold text-secondary-900 dark:text-white">
                {ideas.filter(idea => idea.status === 'endorsed').length}
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <FiEye className="text-blue-600 dark:text-blue-400" size={24} />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400">
                Under Review
              </p>
              <p className="text-2xl font-bold text-secondary-900 dark:text-white">
                {ideas.filter(idea => idea.status === 'under_review').length}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
              <FiClock className="text-yellow-600 dark:text-yellow-400" size={24} />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400">
                Incubated
              </p>
              <p className="text-2xl font-bold text-secondary-900 dark:text-white">
                {ideas.filter(idea => idea.status === 'incubated').length}
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <FiCheckCircle className="text-green-600 dark:text-green-400" size={24} />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400">
                Total Views
              </p>
              <p className="text-2xl font-bold text-secondary-900 dark:text-white">
                {ideas.reduce((sum, idea) => sum + idea.views, 0)}
              </p>
            </div>
            <div className="p-3 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
              <FiEye className="text-primary-600 dark:text-primary-400" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-secondary-400" />
              </div>
              <input
                type="text"
                placeholder="Search ideas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field"
            >
              <option value="endorsed">Endorsed</option>
              <option value="under_review">Under Review</option>
              <option value="incubated">Incubated</option>
              <option value="rejected">Rejected</option>
              <option value="all">All Status</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="input-field"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* Region Filter */}
          <div>
            <select
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              className="input-field"
            >
              <option value="all">All Regions</option>
              {regions.map(region => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Ideas List */}
      <div className="space-y-4">
        {filteredIdeas.length === 0 ? (
          <div className="card p-12 text-center">
            <FiEye className="mx-auto text-secondary-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-secondary-900 dark:text-white mb-2">
              No ideas found
            </h3>
            <p className="text-secondary-600 dark:text-secondary-400">
              {searchTerm || categoryFilter !== 'all' || regionFilter !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : statusFilter === 'endorsed' 
                  ? 'No endorsed ideas available for review'
                  : 'No ideas match the selected status'
              }
            </p>
          </div>
        ) : (
          filteredIdeas.map((idea) => (
            <div key={idea.id} className="card p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-semibold text-secondary-900 dark:text-white">
                      {idea.title}
                    </h3>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(idea.status)}`}>
                      {getStatusIcon(idea.status)}
                      <span className="ml-1 capitalize">{idea.status.replace('_', ' ')}</span>
                    </span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getMarketPotentialColor(idea.marketPotential)}`}>
                      {idea.marketPotential} Potential
                    </span>
                  </div>
                  
                  <p className="text-secondary-600 dark:text-secondary-400 mb-3 line-clamp-2">
                    {idea.description}
                  </p>
                  
                  {/* Student & College Info */}
                  <div className="flex items-center space-x-4 text-sm text-secondary-500 dark:text-secondary-400 mb-3">
                    <div className="flex items-center space-x-1">
                      <FiUser size={14} />
                      <span>{idea.studentName}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <FiMapPin size={14} />
                      <span>{idea.college}, {idea.region}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <FiTag size={14} />
                      <span>{idea.category}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <FiCalendar size={14} />
                      <span>Endorsed {formatDate(idea.endorsedAt)}</span>
                    </div>
                  </div>

                  {/* Rating */}
                  {idea.rating > 0 && (
                    <div className="flex items-center space-x-2 mb-3">
                      <span className="text-sm font-medium text-secondary-700 dark:text-secondary-300">
                        College Rating:
                      </span>
                      <div className="flex items-center space-x-1">
                        {renderStars(idea.rating)}
                        <span className="text-sm text-secondary-600 dark:text-secondary-400 ml-1">
                          {idea.rating}/5
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Tech Stack */}
                  {idea.techStack.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {idea.techStack.slice(0, 4).map((tech, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-secondary-100 dark:bg-secondary-800 text-secondary-700 dark:text-secondary-300 rounded text-xs"
                        >
                          {tech}
                        </span>
                      ))}
                      {idea.techStack.length > 4 && (
                        <span className="px-2 py-1 bg-secondary-100 dark:bg-secondary-800 text-secondary-700 dark:text-secondary-300 rounded text-xs">
                          +{idea.techStack.length - 4} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Funding & Views */}
                  <div className="flex items-center space-x-4 text-sm text-secondary-600 dark:text-secondary-400">
                    <span><span className="font-medium">Funding:</span> {idea.fundingRequired}</span>
                    <div className="flex items-center space-x-1">
                      <FiEye size={14} />
                      <span>{idea.views} views</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <FiMessageSquare size={14} />
                      <span>{idea.comments} comments</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <FiUser size={14} />
                      <span>{idea.teamSize} team members</span>
                    </div>
                  </div>

                  {/* Endorsement Comments */}
                  {idea.endorsementComments && (
                    <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="flex items-start space-x-2">
                        <FiMessageSquare size={16} className="text-blue-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-blue-900 dark:text-blue-300">
                            College Endorsement:
                          </p>
                          <p className="text-sm text-blue-700 dark:text-blue-400">
                            {idea.endorsementComments}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col space-y-2 ml-4">
                  <Link
                    to={`/ideas/${idea.id}`}
                    className="btn-outline text-sm"
                  >
                    <FiEye className="mr-1" size={14} />
                    View Details
                  </Link>
                  
                  {idea.status === 'endorsed' && (
                    <>
                      <button
                        onClick={() => {
                          const comments = prompt('Add review comments (optional):');
                          const rating = prompt('Rate this idea (1-5):');
                          if (comments !== null && rating && rating >= 1 && rating <= 5) {
                            handleReview(idea.id, 'accept', comments, parseInt(rating));
                          }
                        }}
                        disabled={reviewingId === idea.id}
                        className="btn-primary text-sm disabled:opacity-50"
                      >
                        {reviewingId === idea.id ? (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                            Processing...
                          </div>
                        ) : (
                          <>
                            <FiCheckCircle className="mr-1" size={14} />
                            Accept for Incubation
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => {
                          const comments = prompt('Add rejection reason:');
                          if (comments !== null && comments.trim()) {
                            handleReview(idea.id, 'reject', comments);
                          } else if (comments !== null) {
                            alert('Please provide a reason for rejection.');
                          }
                        }}
                        disabled={reviewingId === idea.id}
                        className="btn-outline text-red-600 border-red-600 hover:bg-red-600 hover:text-white text-sm disabled:opacity-50"
                      >
                        <FiX className="mr-1" size={14} />
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default IdeaReview;
