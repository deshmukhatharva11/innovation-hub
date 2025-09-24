import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
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
  FiFilter,
  FiMessageSquare,
  FiMail,
  FiDollarSign
} from 'react-icons/fi';
import { ideasAPI } from '../../services/api';
import { toast } from 'react-hot-toast';

const EndorseIdeas = () => {
  const { user } = useSelector((state) => state.auth);
  const [ideas, setIdeas] = useState([]);
  const [filteredIdeas, setFilteredIdeas] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [endorsingId, setEndorsingId] = useState(null);

  useEffect(() => {
    fetchIdeasForEndorsement();
  }, [user?.college_id]);

  const fetchIdeasForEndorsement = async () => {
    try {
      setLoading(true);
      
      // Use the new review endpoint for college admins - only submitted ideas
      const response = await ideasAPI.getForReview({
        status: 'submitted',
        limit: 100,
        page: 1
      });

      if (response.data?.data?.ideas) {
        const fetchedIdeas = response.data.data.ideas.map(idea => ({
          id: idea.id,
          title: idea.title,
          description: idea.description,
          category: idea.category,
          status: idea.status,
          submittedAt: idea.created_at,
          studentId: idea.student?.id,
          studentName: idea.student?.name || 'Unknown',
          studentEmail: idea.student?.email || 'Unknown',
          department: idea.student?.department || 'Unknown',
          year: idea.student?.year_of_study || 'Unknown',
          techStack: idea.tags || [],
          fundingRequired: `₹${idea.funding_required?.toLocaleString() || '0'}`,
          views: idea.views_count || 0,
          endorsedAt: idea.endorsed_at,
          endorsementComments: idea.endorsement_comments
        }));
        
        setIdeas(fetchedIdeas);
        setFilteredIdeas(fetchedIdeas.filter(idea => idea.status === 'submitted'));
      } else {
        setIdeas([]);
        setFilteredIdeas([]);
      }
    } catch (error) {
      console.error('Error fetching ideas:', error);
      toast.error('Failed to load ideas for endorsement');
      setIdeas([]);
      setFilteredIdeas([]);
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
        idea.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(idea => idea.category === categoryFilter);
    }

    setFilteredIdeas(filtered);
  }, [ideas, searchTerm, categoryFilter, statusFilter]);

  const handleEndorse = async (ideaId, action, comments = '') => {
    setEndorsingId(ideaId);
    
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIdeas(prev => prev.map(idea => 
        idea.id === ideaId 
          ? { 
              ...idea, 
              status: action === 'approve' ? 'endorsed' : 'rejected',
              endorsedAt: new Date().toISOString(),
              endorsementComments: comments
            }
          : idea
      ));
      
      toast.success(`Idea ${action === 'approve' ? 'endorsed' : 'rejected'} successfully!`);
    } catch (error) {
      toast.error('Failed to process endorsement. Please try again.');
    } finally {
      setEndorsingId(null);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'under_review': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      case 'endorsed': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'rejected': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      default: return 'text-secondary-600 bg-secondary-100 dark:bg-secondary-900/20';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'submitted': return <FiClock size={16} />;
      case 'under_review': return <FiEye size={16} />;
      case 'endorsed': return <FiCheckCircle size={16} />;
      case 'rejected': return <FiX size={16} />;
      default: return <FiClock size={16} />;
    }
  };

  const categories = [...new Set(ideas.map(idea => idea.category))];

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
          Endorse Ideas
        </h1>
        <p className="text-secondary-600 dark:text-secondary-400 mt-2">
          Review and endorse student ideas for incubation
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400">
                Pending Review
              </p>
              <p className="text-2xl font-bold text-secondary-900 dark:text-white">
                {ideas.filter(idea => idea.status === 'submitted').length}
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
                Under Review
              </p>
              <p className="text-2xl font-bold text-secondary-900 dark:text-white">
                {ideas.filter(idea => idea.status === 'under_review').length}
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
                Endorsed
              </p>
              <p className="text-2xl font-bold text-secondary-900 dark:text-white">
                {ideas.filter(idea => idea.status === 'endorsed').length}
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
                Total Ideas
              </p>
              <p className="text-2xl font-bold text-secondary-900 dark:text-white">
                {ideas.length}
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              <option value="submitted">Submitted</option>
              <option value="under_review">Under Review</option>
              <option value="endorsed">Endorsed</option>
              <option value="rejected">Rejected</option>
              <option value="all">All Status</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiFilter className="h-5 w-5 text-secondary-400" />
              </div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="input-field pl-10"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Ideas List */}
      <div className="space-y-4">
        {filteredIdeas.length === 0 ? (
          <div className="card p-12 text-center">
            <FiCheckCircle className="mx-auto text-secondary-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-secondary-900 dark:text-white mb-2">
              No ideas found
            </h3>
            <p className="text-secondary-600 dark:text-secondary-400">
              {searchTerm || categoryFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : statusFilter === 'submitted' 
                  ? 'All ideas have been reviewed!'
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
                      <span className="ml-1 capitalize">{idea.status}</span>
                    </span>
                  </div>
                  <p className="text-secondary-600 dark:text-secondary-400 mb-3 line-clamp-2">
                    {idea.description}
                  </p>
                  
                  {/* Student Info */}
                  <div className="flex items-center space-x-4 text-sm text-secondary-500 dark:text-secondary-400 mb-3">
                    <div className="flex items-center space-x-1">
                      <FiUser size={14} />
                      <span>{idea.studentName}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <FiMail size={14} />
                      <span>{idea.studentEmail}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <FiTag size={14} />
                      <span>{idea.category}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <FiCalendar size={14} />
                      <span>Submitted {formatDate(idea.submittedAt)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <FiDollarSign size={14} />
                      <span>{idea.fundingRequired}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <FiEye size={14} />
                      <span>{idea.views} views</span>
                    </div>
                  </div>

                  {/* Tech Stack */}
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

                  {/* Endorsement Comments */}
                  {idea.status !== 'submitted' && idea.endorsementComments && (
                    <div className="mt-3 p-3 bg-secondary-50 dark:bg-secondary-800 rounded-lg">
                      <div className="flex items-start space-x-2">
                        <FiMessageSquare size={16} className="text-secondary-400 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-secondary-900 dark:text-white">
                            Endorsement Comments:
                          </p>
                          <p className="text-sm text-secondary-600 dark:text-secondary-400">
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
                  
                  {idea.status === 'submitted' && (
                    <>
                      <button
                        onClick={() => {
                          const comments = prompt('Add endorsement comments (optional):');
                          if (comments !== null) {
                            handleEndorse(idea.id, 'approve', comments);
                          }
                        }}
                        disabled={endorsingId === idea.id}
                        className="btn-primary text-sm disabled:opacity-50"
                      >
                        {endorsingId === idea.id ? (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                            Processing...
                          </div>
                        ) : (
                          <>
                            <FiCheckCircle className="mr-1" size={14} />
                            Endorse
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => {
                          const comments = prompt('Add rejection reason:');
                          if (comments !== null && comments.trim()) {
                            handleEndorse(idea.id, 'reject', comments);
                          } else if (comments !== null) {
                            alert('Please provide a reason for rejection.');
                          }
                        }}
                        disabled={endorsingId === idea.id}
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

export default EndorseIdeas;
