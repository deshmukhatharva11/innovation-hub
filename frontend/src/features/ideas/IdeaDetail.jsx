import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  FiArrowLeft,
  FiClock, 
  FiCheckCircle, 
  FiX,
  FiEye,
  FiMessageSquare, 
  FiThumbsUp, 
  FiDownload,
  FiUser,
  FiMail,
  FiCalendar,
  FiDollarSign,
  FiTag,
  FiUsers,
  FiFile,
  FiHeart
} from 'react-icons/fi';
import { ideasAPI } from '../../services/api';
import { toast } from 'react-hot-toast';

const IdeaDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [idea, setIdea] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    fetchIdeaDetails();
  }, [id]);

  // Refresh data when localStorage changes (for edit updates)
  useEffect(() => {
    const handleStorageChange = () => {
      fetchIdeaDetails();
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events (for same-tab updates)
    window.addEventListener('ideaUpdated', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('ideaUpdated', handleStorageChange);
    };
  }, [id]);

  const fetchIdeaDetails = async () => {
    try {
      setLoading(true);
      
      // Try to fetch from API first
      let fetchedIdea = null;
      try {
        const response = await ideasAPI.getById(id);
        if (response.data?.data?.idea) {
          fetchedIdea = response.data.data.idea;
          console.log('✅ Idea fetched from API:', fetchedIdea);
        }
      } catch (apiError) {
        console.log('⚠️ API fetch failed, trying localStorage:', apiError.message);
      }
      
      // If API failed, try localStorage
      if (!fetchedIdea) {
        const possibleKeys = ['submittedIdeas', 'ideas', 'userIdeas', 'myIdeas'];
        for (const key of possibleKeys) {
          const data = localStorage.getItem(key);
          if (data) {
            try {
              const parsed = JSON.parse(data);
              let ideas = [];
              
              if (Array.isArray(parsed)) {
                ideas = parsed;
              } else if (parsed && typeof parsed === 'object' && parsed.ideas) {
                ideas = parsed.ideas;
              }
              
              fetchedIdea = ideas.find(idea => idea.id === parseInt(id));
              if (fetchedIdea) {
                console.log('✅ Idea fetched from localStorage:', fetchedIdea);
                break;
              }
            } catch (e) {
              console.warn(`Failed to parse localStorage key '${key}':`, e);
            }
          }
        }
      }
      
      if (fetchedIdea) {
        console.log('🔍 Raw fetched idea data:', fetchedIdea);
        console.log('🔍 Team members data:', fetchedIdea.team_members || fetchedIdea.teamMembers);
        console.log('🔍 Implementation plan:', fetchedIdea.implementation_plan || fetchedIdea.implementationPlan);
        console.log('🔍 Market potential:', fetchedIdea.market_potential || fetchedIdea.marketPotential);
        console.log('🔍 Tech stack:', fetchedIdea.tech_stack || fetchedIdea.techStack);
        
        // Parse JSON fields from database
        const parseJsonField = (field) => {
          if (!field) return [];
          if (Array.isArray(field)) return field;
          if (typeof field === 'string') {
            try {
              return JSON.parse(field);
            } catch (e) {
              console.warn('Failed to parse JSON field:', field);
              return [];
            }
          }
          return field;
        };

        setIdea({
          id: fetchedIdea.id,
          title: fetchedIdea.title,
          description: fetchedIdea.description,
          category: fetchedIdea.category,
          techStack: parseJsonField(fetchedIdea.tech_stack || fetchedIdea.techStack || fetchedIdea.tags),
          status: fetchedIdea.status,
          submittedAt: fetchedIdea.created_at || fetchedIdea.submittedAt,
          views: fetchedIdea.views_count || fetchedIdea.views || 0,
          studentId: fetchedIdea.student?.id || fetchedIdea.student_id,
          studentName: fetchedIdea.student?.name || fetchedIdea.student_name || user?.name || 'Unknown',
          college: fetchedIdea.college?.name || fetchedIdea.college_name || 'Unknown',
          department: fetchedIdea.student?.department || fetchedIdea.department || 'Unknown',
          implementationPlan: fetchedIdea.implementation_plan || fetchedIdea.implementationPlan || 'Not provided',
          marketPotential: fetchedIdea.market_potential || fetchedIdea.marketPotential || 'Not provided',
          fundingRequired: `₹${fetchedIdea.funding_required?.toLocaleString() || fetchedIdea.fundingRequired?.toLocaleString() || '0'}`,
          timeline: fetchedIdea.timeline || 'Not specified',
          teamMembers: parseJsonField(fetchedIdea.team_members || fetchedIdea.teamMembers),
          files: fetchedIdea.files || [],
          endorsements: fetchedIdea.endorsements || [],
          likes: fetchedIdea.likes_count || fetchedIdea.likes || 0,
          isLiked: fetchedIdea.is_liked || false,
          comments: (fetchedIdea.comments || []).map(comment => ({
            id: comment.id,
            userId: comment.user?.id,
            userName: comment.user?.name || 'Unknown',
            userRole: comment.user?.role || 'user',
            comment: comment.content,
            createdAt: comment.created_at || comment.createdAt
          }))
        });
      } else {
        toast.error('Idea not found');
        navigate('/ideas');
      }
    } catch (error) {
      console.error('Error fetching idea details:', error);
      toast.error('Failed to load idea details');
      navigate('/ideas');
    } finally {
    setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'endorsed': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'rejected': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      default: return 'text-secondary-600 bg-secondary-100 dark:bg-secondary-900/20';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <FiClock size={16} />;
      case 'endorsed': return <FiCheckCircle size={16} />;
      case 'rejected': return <FiX size={16} />;
      default: return <FiClock size={16} />; // Default icon for pending
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      // Submit comment to API
      const response = await ideasAPI.addComment(idea.id, {
        content: newComment.trim()
      });

      if (response.data && response.data.success) {
        // Add the new comment to local state
        const newCommentData = {
          id: response.data.data.comment.id,
          userId: response.data.data.comment.user_id,
          userName: response.data.data.comment.user?.name || user.name,
      userRole: user.role,
          comment: response.data.data.comment.content,
          createdAt: response.data.data.comment.createdAt
    };

    setIdea(prev => ({
      ...prev,
          comments: [...prev.comments, newCommentData]
    }));
        
    setNewComment('');
        toast.success('Comment added successfully!');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment. Please try again.');
    }
  };

  const handleLikeIdea = async (ideaId, isLiked) => {
    try {
      // The backend toggles likes, so we just call the like endpoint
      const response = await ideasAPI.addLike(ideaId, { like_type: 'like' });
      
      if (response.data && response.data.success) {
        const newLikedState = response.data.data.liked;
        
        setIdea(prev => ({
          ...prev,
          isLiked: newLikedState,
          likes: newLikedState ? (prev.likes || 0) + 1 : Math.max(0, (prev.likes || 0) - 1)
        }));
        
        toast.success(newLikedState ? 'Liked!' : 'Removed like!');
      }
    } catch (error) {
      console.error('Error updating like:', error);
      toast.error('Failed to update like. Please try again.');
    }
  };

  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'student': return 'Student';
      case 'college_admin': return 'College Admin';
      case 'incubator_manager': return 'Incubator Manager';
      case 'admin': return 'Super Admin';
      default: return 'User';
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'student': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'college_admin': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'incubator_manager': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'admin': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-secondary-100 text-secondary-800 dark:bg-secondary-900/20 dark:text-secondary-400';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!idea) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-secondary-900 dark:text-white mb-4">
          Idea Not Found
        </h2>
        <p className="text-secondary-600 dark:text-secondary-400 mb-6">
          The idea you're looking for doesn't exist or has been removed.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="btn-primary"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 text-secondary-600 hover:text-secondary-900 dark:text-secondary-400 dark:hover:text-white rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors duration-200"
        >
          <FiArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h1 className="text-3xl font-bold text-secondary-900 dark:text-white">
              {idea.title}
            </h1>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(idea.status)}`}>
              {getStatusIcon(idea.status)}
              <span className="ml-2 capitalize">{idea.status}</span>
            </span>
            {/* Read-only indicator for endorsed ideas */}
            {idea.status === 'endorsed' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                <FiCheckCircle size={14} className="mr-1" />
                Read-Only
              </span>
            )}
          </div>
          <div className="flex items-center space-x-4 text-sm text-secondary-600 dark:text-secondary-400">
            <div className="flex items-center space-x-1">
              <FiUser size={14} />
              <span>By {idea.studentName}</span>
            </div>
            <div className="flex items-center space-x-1">
              <FiCalendar size={14} />
              <span>Submitted {formatDate(idea.submittedAt)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <FiEye size={14} />
              <span>{idea.views} views</span>
            </div>
            <div className="flex items-center space-x-1">
              <FiMessageSquare size={14} />
              <span>{idea.comments.length} comments</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-secondary-900 dark:text-white mb-4">
              Description
            </h2>
            <p className="text-secondary-700 dark:text-secondary-300 leading-relaxed break-words overflow-hidden">
              {idea.description}
            </p>
          </div>

          {/* Implementation Plan */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-secondary-900 dark:text-white mb-4">
              Implementation Plan
            </h2>
            <div className="text-secondary-700 dark:text-secondary-300 whitespace-pre-wrap break-words overflow-hidden">
              {idea.implementationPlan}
            </div>
          </div>

          {/* Market Potential */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-secondary-900 dark:text-white mb-4">
              Market Potential
            </h2>
            <p className="text-secondary-700 dark:text-secondary-300 leading-relaxed break-words overflow-hidden">
              {idea.marketPotential}
            </p>
          </div>

          {/* Comments Section */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-secondary-900 dark:text-white mb-6">
              Comments ({idea.comments.length})
            </h2>

            {/* Add Comment Form */}
            <form onSubmit={handleCommentSubmit} className="mb-6">
              <div className="flex space-x-4">
                <img
                  src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name}&background=3b82f6&color=fff`}
                  alt={user?.name}
                  className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                />
                <div className="flex-1">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    rows={3}
                    className="input-field resize-none"
                  />
                  <div className="flex justify-end mt-2">
                    <button
                      type="submit"
                      disabled={!newComment.trim()}
                      className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FiThumbsUp className="mr-2" size={14} />
                      Post Comment
                    </button>
                  </div>
                </div>
              </div>
            </form>

            {/* Comments List */}
            <div className="space-y-4">
              {idea.comments.map((comment) => (
                <div key={comment.id} className="flex space-x-4">
                  <img
                    src={`https://ui-avatars.com/api/?name=${comment.userName}&background=3b82f6&color=fff`}
                    alt={comment.userName}
                    className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-secondary-900 dark:text-white">
                        {comment.userName}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(comment.userRole)}`}>
                        {getRoleDisplayName(comment.userRole)}
                      </span>
                      <span className="text-sm text-secondary-500 dark:text-secondary-400">
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-secondary-700 dark:text-secondary-300">
                      {comment.comment}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Like Button */}
          <div className="card p-6">
            <div className="flex items-center justify-center">
              <button
                onClick={() => handleLikeIdea(idea.id, idea.isLiked)}
                className={`inline-flex items-center px-6 py-3 border shadow-sm text-sm font-medium rounded-lg transition-all duration-200 transform hover:scale-105 ${
                  idea.isLiked 
                    ? 'border-pink-300 text-pink-700 bg-pink-50 dark:bg-pink-900/20 shadow-pink-200 dark:shadow-pink-800' 
                    : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
              >
                <FiHeart className={`h-5 w-5 mr-2 transition-all duration-200 ${
                  idea.isLiked 
                    ? 'fill-current text-pink-500 animate-pulse' 
                    : 'hover:text-pink-400'
                }`} />
                <span className="font-semibold">{idea.likes || 0}</span>
                <span className="ml-2">{idea.isLiked ? 'Liked' : 'Like'}</span>
              </button>
            </div>
          </div>

          {/* Basic Info */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">
              Basic Information
            </h3>
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-secondary-600 dark:text-secondary-400">Category</span>
                <div className="flex items-center space-x-1 mt-1">
                  <FiTag size={14} className="text-secondary-400" />
                  <span className="text-secondary-900 dark:text-white">{idea.category}</span>
                </div>
              </div>
              <div>
                <span className="text-sm font-medium text-secondary-600 dark:text-secondary-400">College</span>
                <p className="text-secondary-900 dark:text-white">{idea.college}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-secondary-600 dark:text-secondary-400">Department</span>
                <p className="text-secondary-900 dark:text-white">{idea.department}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-secondary-600 dark:text-secondary-400">Funding Required</span>
                <p className="text-secondary-900 dark:text-white">{idea.fundingRequired}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-secondary-600 dark:text-secondary-400">Timeline</span>
                <p className="text-secondary-900 dark:text-white">{idea.timeline}</p>
              </div>
            </div>
          </div>

          {/* Technology Stack */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">
              Technology Stack
            </h3>
            <div className="flex flex-wrap gap-2">
              {(idea.techStack && Array.isArray(idea.techStack) ? idea.techStack : []).map((tech, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium"
                >
                  {tech}
                </span>
              ))}
              {(!idea.techStack || !Array.isArray(idea.techStack)) && (
                <span className="text-gray-500 dark:text-gray-400 text-sm">
                  No technology stack specified
                </span>
              )}
            </div>
          </div>

          {/* Team Members */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">
              Team Members
            </h3>
            <div className="space-y-3">
              {idea.teamMembers.map((member, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <img
                    src={`https://ui-avatars.com/api/?name=${member.name}&background=3b82f6&color=fff`}
                    alt={member.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-medium text-secondary-900 dark:text-white">
                      {member.name}
                    </p>
                    <p className="text-sm text-secondary-600 dark:text-secondary-400">
                      {member.role}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Files */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">
              Supporting Files ({idea.files?.length || 0})
              </h3>
            {idea.files && idea.files.length > 0 ? (
              <div className="space-y-2">
                {idea.files.map((file, index) => (
                  <a
                    key={index}
                    href={`http://localhost:3001/files/${file.file_path || file.filename}`}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-secondary-50 dark:hover:bg-secondary-800 transition-colors duration-200 border border-secondary-200 dark:border-secondary-700"
                  >
                    <FiDownload size={16} className="text-secondary-400" />
                    <div className="flex-1">
                      <span className="text-secondary-900 dark:text-white font-medium">
                        {file.original_name || file.filename}
                      </span>
                      {file.file_size && (
                        <span className="text-xs text-secondary-500 dark:text-secondary-400 ml-2">
                          ({(file.file_size / 1024).toFixed(1)} KB)
                        </span>
                      )}
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <FiFile className="mx-auto text-secondary-400 mb-2" size={24} />
                <p className="text-secondary-500 dark:text-secondary-400 text-sm">
                  No supporting files uploaded
                </p>
            </div>
          )}
          </div>

          {/* Endorsements */}
          {idea.endorsements.length > 0 && (
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">
                Endorsements
              </h3>
              <div className="space-y-4">
                {idea.endorsements.map((endorsement) => (
                  <div key={endorsement.id} className="border-l-4 border-green-500 pl-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <FiThumbsUp className="text-green-500" size={16} />
                      <span className="font-medium text-secondary-900 dark:text-white">
                        {endorsement.collegeName}
                      </span>
                    </div>
                    <p className="text-sm text-secondary-600 dark:text-secondary-400 mb-1">
                      Endorsed by {endorsement.endorsedBy}
                    </p>
                    <p className="text-sm text-secondary-700 dark:text-secondary-300">
                      {endorsement.comments}
                    </p>
                    <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-2">
                      {formatDate(endorsement.endorsedAt)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IdeaDetail;
