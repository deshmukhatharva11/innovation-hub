import React, { useState, useEffect } from 'react';
import { 
  FiEdit3, FiSave, FiFileText, FiSettings, FiUpload, FiEye, FiGlobe, 
  FiCheckCircle, FiAlertTriangle, FiDownload, FiTrash2, FiPlus, FiSearch,
  FiFilter, FiCalendar, FiUsers, FiBell, FiImage, FiVideo, FiMusic,
  FiFile, FiArchive, FiSend, FiRefreshCw, FiBarChart, FiTrendingUp,
  FiClock, FiTarget, FiZap, FiShield, FiDatabase, FiLayers, FiGrid,
  FiList, FiChevronDown, FiChevronUp, FiMoreVertical, FiCopy, FiShare2,
  FiExternalLink, FiLink, FiTag, FiFolder, FiStar, FiHeart, FiThumbsUp,
  FiMessageSquare, FiMail, FiPhone, FiMonitor, FiSmartphone, FiTablet,
  FiWifi, FiWifiOff, FiActivity, FiPieChart, FiTrendingDown, FiMinus,
  FiX, FiCheck, FiAlertCircle, FiInfo, FiHelpCircle, FiLock, FiUnlock,
  FiEyeOff, FiEdit, FiTrash, FiFolderPlus, FiFolderMinus,
  FiFilePlus, FiFileMinus, FiImage as FiImageIcon, FiVideo as FiVideoIcon,
  FiMusic as FiMusicIcon, FiFile as FiFileIcon, FiArchive as FiArchiveIcon
} from 'react-icons/fi';
import { cmsAPI } from '../../services/api';
import { toast } from 'react-hot-toast';
// import ReactQuill from 'react-quill';
// import 'react-quill/dist/quill.snow.css';

const CMSEditor = () => {
  // Content Management States
  const [pages, setPages] = useState([]);
  const [selectedPage, setSelectedPage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('pages');
  
  // Enhanced States
  const [content, setContent] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [media, setMedia] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  
  // UI States
  const [showFilters, setShowFilters] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [showNotificationBuilder, setShowNotificationBuilder] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // grid, list
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  
  // Form States
  const [newContent, setNewContent] = useState({
    title: '',
    slug: '',
    content_type: 'page',
    content: '',
    excerpt: '',
    meta_title: '',
    meta_description: '',
    status: 'draft',
    visibility: 'public',
    featured_image: '',
    tags: [],
    categories: [],
    template: '',
    is_featured: false,
    is_sticky: false,
    allow_comments: true,
    allow_sharing: true
  });
  
  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    notification_type: 'info',
    priority: 'normal',
    target_audience: 'all',
    target_user_ids: [],
    target_roles: [],
    target_colleges: [],
    target_incubators: [],
    action_url: '',
    action_text: '',
    icon: '',
    image_url: '',
    delivery_methods: ['in_app'],
    is_global: false,
    is_sticky: false,
    auto_dismiss: true,
    dismiss_delay: 5000
  });
  
  // Pagination States
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  useEffect(() => {
    fetchAllData();
  }, [activeTab, pagination.page, pagination.limit]);

  useEffect(() => {
    filterContent();
  }, [content, searchTerm, selectedCategory, selectedStatus]);

  // Comprehensive Data Fetching
  const fetchAllData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchContent(),
        fetchNotifications(),
        fetchMedia(),
        fetchTemplates(),
        fetchAnalytics()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const fetchContent = async () => {
    try {
      const response = await cmsAPI.getContent({
        page: pagination.page,
        limit: pagination.limit,
        content_type: selectedCategory,
        status: selectedStatus,
        search: searchTerm
      });
      if (response.data.success) {
        setContent(response.data.data.content || []);
        setPagination(prev => ({
          ...prev,
          total: response.data.data.pagination?.total || 0,
          totalPages: response.data.data.pagination?.totalPages || 0
        }));
      }
    } catch (error) {
      console.error('Error fetching content:', error);
      toast.error('Failed to fetch content');
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await cmsAPI.getNotifications({
        page: pagination.page,
        limit: pagination.limit
      });
      if (response.data.success) {
        setNotifications(response.data.data.notifications || []);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to fetch notifications');
    }
  };

  const fetchMedia = async () => {
    try {
      const response = await cmsAPI.getMedia({
        page: pagination.page,
        limit: pagination.limit
      });
      if (response.data.success) {
        setMedia(response.data.data.media || []);
      }
    } catch (error) {
      console.error('Error fetching media:', error);
      toast.error('Failed to fetch media');
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await cmsAPI.getTemplates();
      if (response.data.success) {
        setTemplates(response.data.data.templates || []);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error('Failed to fetch templates');
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await cmsAPI.getAnalytics();
      if (response.data.success) {
        setAnalytics(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to fetch analytics');
    }
  };

  const fetchPages = async () => {
    try {
      setLoading(true);
      // Use content API to get pages (content_type: 'page')
      const response = await cmsAPI.getContent({ content_type: 'page' });
      if (response.data.success) {
        setPages(response.data.data.content || []);
        if (response.data.data.content && response.data.data.content.length > 0) {
          setSelectedPage(response.data.data.content[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching pages:', error);
      toast.error('Failed to fetch pages');
    } finally {
      setLoading(false);
    }
  };

  // Content Management Functions
  const handlePageSelect = async (page) => {
    try {
      const response = await cmsAPI.getContentById(page.id);
      if (response.data.success) {
        setSelectedPage(response.data.data);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error fetching page:', error);
      toast.error('Failed to fetch page details');
    }
  };

  const handleCreateContent = async () => {
    try {
      setSaving(true);
      const response = await cmsAPI.createContent(newContent);
      if (response.data.success) {
        toast.success('Content created successfully!');
        setNewContent({
          title: '',
          slug: '',
          content_type: 'page',
          content: '',
          excerpt: '',
          meta_title: '',
          meta_description: '',
          status: 'draft',
          visibility: 'public',
          featured_image: '',
          tags: [],
          categories: [],
          template: '',
          is_featured: false,
          is_sticky: false,
          allow_comments: true,
          allow_sharing: true
        });
        fetchContent();
      }
    } catch (error) {
      console.error('Error creating content:', error);
      toast.error('Failed to create content');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateContent = async (contentId, updateData) => {
    try {
      setSaving(true);
      const response = await cmsAPI.updateContent(contentId, updateData);
      if (response.data.success) {
        toast.success('Content updated successfully!');
        fetchContent();
      }
    } catch (error) {
      console.error('Error updating content:', error);
      toast.error('Failed to update content');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteContent = async (contentId) => {
    if (window.confirm('Are you sure you want to delete this content?')) {
      try {
        setSaving(true);
        const response = await cmsAPI.deleteContent(contentId);
        if (response.data.success) {
          toast.success('Content deleted successfully!');
          fetchContent();
        }
      } catch (error) {
        console.error('Error deleting content:', error);
        toast.error('Failed to delete content');
      } finally {
        setSaving(false);
      }
    }
  };

  // Notification Management Functions
  const handleCreateNotification = async () => {
    try {
      setSaving(true);
      const response = await cmsAPI.createNotification(newNotification);
      if (response.data.success) {
        toast.success('Notification created successfully!');
        setNewNotification({
          title: '',
          message: '',
          notification_type: 'info',
          priority: 'normal',
          target_audience: 'all',
          target_user_ids: [],
          target_roles: [],
          target_colleges: [],
          target_incubators: [],
          action_url: '',
          action_text: '',
          icon: '',
          image_url: '',
          delivery_methods: ['in_app'],
          is_global: false,
          is_sticky: false,
          auto_dismiss: true,
          dismiss_delay: 5000
        });
        fetchNotifications();
      }
    } catch (error) {
      console.error('Error creating notification:', error);
      toast.error('Failed to create notification');
    } finally {
      setSaving(false);
    }
  };

  const handleSendNotification = async (notificationId) => {
    try {
      setSaving(true);
      const response = await cmsAPI.sendNotification(notificationId);
      if (response.data.success) {
        toast.success('Notification sent successfully!');
        fetchNotifications();
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      toast.error('Failed to send notification');
    } finally {
      setSaving(false);
    }
  };

  // Media Management Functions
  const handleUploadMedia = async (file, metadata = {}) => {
    try {
      setSaving(true);
      const formData = new FormData();
      formData.append('file', file);
      Object.keys(metadata).forEach(key => {
        formData.append(key, metadata[key]);
      });

      const response = await cmsAPI.uploadMedia(formData);
      if (response.data.success) {
        toast.success('Media uploaded successfully!');
        fetchMedia();
      }
    } catch (error) {
      console.error('Error uploading media:', error);
      toast.error('Failed to upload media');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMedia = async (mediaId) => {
    if (window.confirm('Are you sure you want to delete this media?')) {
      try {
        setSaving(true);
        const response = await cmsAPI.deleteMedia(mediaId);
        if (response.data.success) {
          toast.success('Media deleted successfully!');
          fetchMedia();
        }
      } catch (error) {
        console.error('Error deleting media:', error);
        toast.error('Failed to delete media');
      } finally {
        setSaving(false);
      }
    }
  };

  // Utility Functions
  const filterContent = () => {
    // This will be implemented based on the current content state
    // For now, it's a placeholder
  };

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  };

  const getContentTypeIcon = (type) => {
    const iconMap = {
      'page': FiFileText,
      'post': FiEdit3,
      'announcement': FiBell,
      'circular': FiFile,
      'notification': FiBell,
      'banner': FiImage,
      'footer': FiLayers,
      'header': FiLayers,
      'sidebar': FiLayers,
      'popup': FiZap,
      'email_template': FiMail,
      'sms_template': FiPhone,
      'custom': FiSettings
    };
    return iconMap[type] || FiFileText;
  };

  const getStatusColor = (status) => {
    const colorMap = {
      'draft': 'bg-gray-100 text-gray-800',
      'published': 'bg-green-100 text-green-800',
      'archived': 'bg-yellow-100 text-yellow-800',
      'scheduled': 'bg-blue-100 text-blue-800'
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority) => {
    const colorMap = {
      'low': 'bg-gray-100 text-gray-800',
      'normal': 'bg-blue-100 text-blue-800',
      'high': 'bg-orange-100 text-orange-800',
      'urgent': 'bg-red-100 text-red-800'
    };
    return colorMap[priority] || 'bg-gray-100 text-gray-800';
  };

  const handleSave = async () => {
    if (!selectedPage) return;

    try {
      setSaving(true);
      await cmsAPI.updateContent(selectedPage.id, {
        title: selectedPage.title,
        content: selectedPage.content,
        meta_title: selectedPage.meta_title,
        meta_description: selectedPage.meta_description,
        status: selectedPage.status || 'draft'
      });
      toast.success('Page updated successfully!');
      setIsEditing(false);
      fetchPages(); // Refresh pages list
    } catch (error) {
      console.error('Error saving page:', error);
      toast.error('Failed to save page');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setSelectedPage(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-teal-600 to-blue-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <FiDatabase className="w-8 h-8" />
              Enhanced CMS Editor
            </h1>
            <p className="text-teal-100">Comprehensive content, notification, and media management system</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('content')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'content' ? 'bg-white/20' : 'bg-white/10 hover:bg-white/15'
              }`}
            >
              <FiFileText className="inline mr-2" size={16} />
              Content
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'notifications' ? 'bg-white/20' : 'bg-white/10 hover:bg-white/15'
              }`}
            >
              <FiBell className="inline mr-2" size={16} />
              Notifications
            </button>
            <button
              onClick={() => setActiveTab('media')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'media' ? 'bg-white/20' : 'bg-white/10 hover:bg-white/15'
              }`}
            >
              <FiImage className="inline mr-2" size={16} />
              Media
            </button>
            <button
              onClick={() => setActiveTab('templates')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'templates' ? 'bg-white/20' : 'bg-white/10 hover:bg-white/15'
              }`}
            >
              <FiLayers className="inline mr-2" size={16} />
              Templates
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'analytics' ? 'bg-white/20' : 'bg-white/10 hover:bg-white/15'
              }`}
            >
              <FiBarChart className="inline mr-2" size={16} />
              Analytics
            </button>
          </div>
        </div>
        
        {/* Quick Stats */}
        {analytics && (
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/10 rounded-lg p-4">
              <div className="flex items-center">
                <FiFileText className="w-8 h-8 text-teal-200 mr-3" />
                <div>
                  <div className="text-2xl font-bold">{analytics.content?.total || 0}</div>
                  <div className="text-teal-200 text-sm">Total Content</div>
                </div>
              </div>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <div className="flex items-center">
                <FiBell className="w-8 h-8 text-teal-200 mr-3" />
                <div>
                  <div className="text-2xl font-bold">{analytics.notifications?.total || 0}</div>
                  <div className="text-teal-200 text-sm">Notifications</div>
                </div>
              </div>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <div className="flex items-center">
                <FiImage className="w-8 h-8 text-teal-200 mr-3" />
                <div>
                  <div className="text-2xl font-bold">{analytics.media?.total || 0}</div>
                  <div className="text-teal-200 text-sm">Media Files</div>
                </div>
              </div>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <div className="flex items-center">
                <FiTrendingUp className="w-8 h-8 text-teal-200 mr-3" />
                <div>
                  <div className="text-2xl font-bold">{analytics.content?.published || 0}</div>
                  <div className="text-teal-200 text-sm">Published</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Content Management Tab */}
      {activeTab === 'content' && (
        <div className="space-y-6">
          {/* Content Controls */}
          <div className="card">
            <div className="p-6 border-b border-secondary-200 dark:border-secondary-700">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-secondary-900 dark:text-white">
                  Content Management
                </h2>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="btn-outline flex items-center"
                  >
                    <FiFilter className="mr-2" size={16} />
                    Filters
                  </button>
                  <button
                    onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                    className="btn-outline flex items-center"
                  >
                    {viewMode === 'grid' ? <FiList className="mr-2" size={16} /> : <FiGrid className="mr-2" size={16} />}
                    {viewMode === 'grid' ? 'List' : 'Grid'}
                  </button>
                  <button
                    onClick={() => setShowTemplates(true)}
                    className="btn-outline flex items-center"
                  >
                    <FiLayers className="mr-2" size={16} />
                    Templates
                  </button>
                  <button
                    onClick={() => setShowMediaLibrary(true)}
                    className="btn-outline flex items-center"
                  >
                    <FiImage className="mr-2" size={16} />
                    Media
                  </button>
                  <button
                    onClick={handleCreateContent}
                    className="btn-primary flex items-center"
                  >
                    <FiPlus className="mr-2" size={16} />
                    New Content
                  </button>
                </div>
              </div>
              
              {/* Search and Filters */}
              <div className="mt-4 flex items-center space-x-4">
                <div className="flex-1 relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400" size={16} />
                  <input
                    type="text"
                    placeholder="Search content..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">All Types</option>
                  <option value="page">Page</option>
                  <option value="post">Post</option>
                  <option value="announcement">Announcement</option>
                  <option value="circular">Circular</option>
                  <option value="notification">Notification</option>
                  <option value="banner">Banner</option>
                </select>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">All Status</option>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                  <option value="scheduled">Scheduled</option>
                </select>
              </div>
            </div>
          </div>

          {/* Content List/Grid */}
          <div className="card">
            <div className="p-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
              ) : content.length === 0 ? (
                <div className="text-center py-12">
                  <FiFileText className="mx-auto text-6xl text-secondary-400 mb-4" />
                  <h3 className="text-lg font-medium text-secondary-900 dark:text-white mb-2">
                    No content found
                  </h3>
                  <p className="text-secondary-500 mb-4">
                    Create your first piece of content to get started
                  </p>
                  <button
                    onClick={handleCreateContent}
                    className="btn-primary flex items-center mx-auto"
                  >
                    <FiPlus className="mr-2" size={16} />
                    Create Content
                  </button>
                </div>
              ) : (
                <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                  {content.map((item) => {
                    const IconComponent = getContentTypeIcon(item.content_type);
                    return (
                      <div
                        key={item.id}
                        className={`${
                          viewMode === 'grid'
                            ? 'border border-secondary-200 dark:border-secondary-700 rounded-lg p-6 hover:shadow-lg transition-shadow'
                            : 'flex items-center space-x-4 p-4 border border-secondary-200 dark:border-secondary-700 rounded-lg hover:bg-secondary-50 dark:hover:bg-secondary-800/50'
                        }`}
                      >
                        {viewMode === 'grid' ? (
                          <>
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center">
                                <div className="p-2 bg-primary-100 dark:bg-primary-900/20 rounded-lg mr-3">
                                  <IconComponent className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                                </div>
                                <div>
                                  <h3 className="font-semibold text-secondary-900 dark:text-white">
                                    {item.title}
                                  </h3>
                                  <p className="text-sm text-secondary-500 dark:text-secondary-400">
                                    /{item.slug}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(item.status)}`}>
                                  {item.status}
                                </span>
                                {item.is_featured && (
                                  <FiStar className="w-4 h-4 text-yellow-500" />
                                )}
                                {item.is_sticky && (
                                  <FiZap className="w-4 h-4 text-blue-500" />
                                )}
                              </div>
                            </div>
                            <p className="text-sm text-secondary-600 dark:text-secondary-400 mb-4 line-clamp-2">
                              {item.excerpt || item.content?.substring(0, 100) + '...'}
                            </p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2 text-xs text-secondary-500 dark:text-secondary-400">
                                <span>{item.content_type}</span>
                                <span>•</span>
                                <span>{new Date(item.created_at).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <button
                                  onClick={() => handleUpdateContent(item.id, { status: 'published' })}
                                  className="p-1 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                                  title="Publish"
                                >
                                  <FiCheckCircle size={16} />
                                </button>
                                <button
                                  onClick={() => handleUpdateContent(item.id, { status: 'draft' })}
                                  className="p-1 text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-300"
                                  title="Draft"
                                >
                                  <FiEdit size={16} />
                                </button>
                                <button
                                  onClick={() => handleDeleteContent(item.id)}
                                  className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                  title="Delete"
                                >
                                  <FiTrash size={16} />
                                </button>
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="p-2 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
                              <IconComponent className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-secondary-900 dark:text-white">
                                  {item.title}
                                </h3>
                                <div className="flex items-center space-x-2">
                                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(item.status)}`}>
                                    {item.status}
                                  </span>
                                  {item.is_featured && (
                                    <FiStar className="w-4 h-4 text-yellow-500" />
                                  )}
                                  {item.is_sticky && (
                                    <FiZap className="w-4 h-4 text-blue-500" />
                                  )}
                                </div>
                              </div>
                              <p className="text-sm text-secondary-500 dark:text-secondary-400">
                                /{item.slug} • {item.content_type} • {new Date(item.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={() => handleUpdateContent(item.id, { status: 'published' })}
                                className="p-1 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                                title="Publish"
                              >
                                <FiCheckCircle size={16} />
                              </button>
                              <button
                                onClick={() => handleUpdateContent(item.id, { status: 'draft' })}
                                className="p-1 text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-300"
                                title="Draft"
                              >
                                <FiEdit size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteContent(item.id)}
                                className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                title="Delete"
                              >
                                <FiTrash size={16} />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Legacy Pages Tab - keeping for backward compatibility */}
      {activeTab === 'pages' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pages List */}
          <div className="lg:col-span-1">
            <div className="card">
              <div className="p-6 border-b border-secondary-200 dark:border-secondary-700">
                <h2 className="text-lg font-semibold text-secondary-900 dark:text-white">
                  Website Pages
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-2">
                  {pages.map((page) => (
                    <button
                      key={page.id}
                      onClick={() => handlePageSelect(page)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        selectedPage?.id === page.id
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-secondary-200 dark:border-secondary-700 hover:border-primary-300'
                      }`}
                    >
                      <div className="font-medium text-secondary-900 dark:text-white">
                        {page.title}
                      </div>
                      <div className="text-sm text-secondary-500">
                        /{page.slug}
                      </div>
                      <div className="flex items-center mt-1">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          page.is_published
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                        }`}>
                          {page.is_published ? 'Published' : 'Draft'}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Page Editor */}
          <div className="lg:col-span-2">
            {selectedPage ? (
              <div className="card">
                <div className="p-6 border-b border-secondary-200 dark:border-secondary-700">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-secondary-900 dark:text-white">
                      Edit: {selectedPage.title}
                    </h2>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => setIsEditing(!isEditing)}
                        className="btn-outline flex items-center"
                      >
                        <FiEdit3 className="mr-2" size={16} />
                        {isEditing ? 'Preview' : 'Edit'}
                      </button>
                      {isEditing && (
                        <button
                          onClick={handleSave}
                          disabled={saving}
                          className="btn-primary flex items-center"
                        >
                          <FiSave className="mr-2" size={16} />
                          {saving ? 'Saving...' : 'Save'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  {isEditing ? (
                    <div className="space-y-6">
                      {/* Basic Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                            Page Title
                          </label>
                          <input
                            type="text"
                            value={selectedPage.title}
                            onChange={(e) => handleInputChange('title', e.target.value)}
                            className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                            Slug
                          </label>
                          <input
                            type="text"
                            value={selectedPage.slug}
                            disabled
                            className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg bg-secondary-50 dark:bg-secondary-800"
                          />
                        </div>
                      </div>

                      {/* Meta Information */}
                      <div>
                        <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                          Meta Title
                        </label>
                        <input
                          type="text"
                          value={selectedPage.meta_title}
                          onChange={(e) => handleInputChange('meta_title', e.target.value)}
                          className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                          Meta Description
                        </label>
                        <textarea
                          value={selectedPage.meta_description}
                          onChange={(e) => handleInputChange('meta_description', e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>

                      {/* Content */}
                      <div>
                        <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                          Page Content
                        </label>
                        <div className="border border-secondary-300 dark:border-secondary-600 rounded-lg overflow-hidden">
                          <textarea
                            value={selectedPage.content}
                            onChange={(e) => handleInputChange('content', e.target.value)}
                            className="w-full h-64 px-3 py-2 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white border-0 focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                            placeholder="Enter content for this page..."
                          />
                        </div>
                        <p className="mt-2 text-xs text-secondary-500 dark:text-secondary-400">
                          Enter your content in plain text. Rich text editing will be available soon.
                        </p>
                      </div>

                      {/* Status */}
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="is_published"
                          checked={selectedPage.is_published}
                          onChange={(e) => handleInputChange('is_published', e.target.checked)}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
                        />
                        <label htmlFor="is_published" className="ml-2 text-sm text-secondary-700 dark:text-secondary-300">
                          Publish this page
                        </label>
                      </div>
                    </div>
                  ) : (
                    <div className="prose max-w-none">
                      <h1 className="text-3xl font-bold text-secondary-900 dark:text-white mb-4">
                        {selectedPage.title}
                      </h1>
                      <div 
                        className="text-secondary-700 dark:text-secondary-300"
                        dangerouslySetInnerHTML={{ __html: selectedPage.content }}
                      />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="card p-12 text-center">
                <FiFileText className="mx-auto text-6xl text-secondary-400 mb-4" />
                <h3 className="text-lg font-medium text-secondary-900 dark:text-white mb-2">
                  Select a page to edit
                </h3>
                <p className="text-secondary-500">
                  Choose a page from the list to start editing
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Notification Management Tab */}
      {activeTab === 'notifications' && (
        <div className="space-y-6">
          {/* Notification Controls */}
          <div className="card">
            <div className="p-6 border-b border-secondary-200 dark:border-secondary-700">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-secondary-900 dark:text-white">
                  Notification Management
                </h2>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setShowNotificationBuilder(true)}
                    className="btn-outline flex items-center"
                  >
                    <FiPlus className="mr-2" size={16} />
                    New Notification
                  </button>
                  <button
                    onClick={fetchNotifications}
                    className="btn-outline flex items-center"
                  >
                    <FiRefreshCw className="mr-2" size={16} />
                    Refresh
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Notifications List */}
          <div className="card">
            <div className="p-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-12">
                  <FiBell className="mx-auto text-6xl text-secondary-400 mb-4" />
                  <h3 className="text-lg font-medium text-secondary-900 dark:text-white mb-2">
                    No notifications found
                  </h3>
                  <p className="text-secondary-500 mb-4">
                    Create your first notification to get started
                  </p>
                  <button
                    onClick={() => setShowNotificationBuilder(true)}
                    className="btn-primary flex items-center mx-auto"
                  >
                    <FiPlus className="mr-2" size={16} />
                    Create Notification
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="border border-secondary-200 dark:border-secondary-700 rounded-lg p-6 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <div className="p-2 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
                            <FiBell className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="font-semibold text-secondary-900 dark:text-white">
                                {notification.title}
                              </h3>
                              <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(notification.priority)}`}>
                                {notification.priority}
                              </span>
                              {notification.is_global && (
                                <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                                  Global
                                </span>
                              )}
                              {notification.is_sticky && (
                                <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                                  Sticky
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-secondary-600 dark:text-secondary-400 mb-3">
                              {notification.message}
                            </p>
                            <div className="flex items-center space-x-4 text-xs text-secondary-500 dark:text-secondary-400">
                              <span>Type: {notification.notification_type}</span>
                              <span>•</span>
                              <span>Audience: {notification.target_audience}</span>
                              <span>•</span>
                              <span>Created: {new Date(notification.created_at).toLocaleDateString()}</span>
                              {notification.sent_at && (
                                <>
                                  <span>•</span>
                                  <span>Sent: {new Date(notification.sent_at).toLocaleDateString()}</span>
                                </>
                              )}
                            </div>
                            {notification.action_url && (
                              <div className="mt-2">
                                <a
                                  href={notification.action_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 text-sm"
                                >
                                  <FiExternalLink className="mr-1" size={14} />
                                  {notification.action_text || 'View Action'}
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {!notification.sent_at && (
                            <button
                              onClick={() => handleSendNotification(notification.id)}
                              className="btn-primary btn-sm flex items-center"
                            >
                              <FiSend className="mr-1" size={14} />
                              Send
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteContent(notification.id)}
                            className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                            title="Delete"
                          >
                            <FiTrash size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Media Management Tab */}
      {activeTab === 'media' && (
        <div className="space-y-6">
          {/* Media Controls */}
          <div className="card">
            <div className="p-6 border-b border-secondary-200 dark:border-secondary-700">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-secondary-900 dark:text-white">
                  Media Library
                </h2>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setShowMediaLibrary(true)}
                    className="btn-outline flex items-center"
                  >
                    <FiUpload className="mr-2" size={16} />
                    Upload Media
                  </button>
                  <button
                    onClick={fetchMedia}
                    className="btn-outline flex items-center"
                  >
                    <FiRefreshCw className="mr-2" size={16} />
                    Refresh
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Media Grid */}
          <div className="card">
            <div className="p-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
              ) : media.length === 0 ? (
                <div className="text-center py-12">
                  <FiImage className="mx-auto text-6xl text-secondary-400 mb-4" />
                  <h3 className="text-lg font-medium text-secondary-900 dark:text-white mb-2">
                    No media files found
                  </h3>
                  <p className="text-secondary-500 mb-4">
                    Upload your first media file to get started
                  </p>
                  <button
                    onClick={() => setShowMediaLibrary(true)}
                    className="btn-primary flex items-center mx-auto"
                  >
                    <FiUpload className="mr-2" size={16} />
                    Upload Media
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {media.map((item) => (
                    <div
                      key={item.id}
                      className="border border-secondary-200 dark:border-secondary-700 rounded-lg p-4 hover:shadow-lg transition-shadow"
                    >
                      <div className="aspect-square bg-secondary-100 dark:bg-secondary-800 rounded-lg mb-3 flex items-center justify-center">
                        {item.file_type?.startsWith('image/') ? (
                          <img
                            src={item.url}
                            alt={item.alt_text || item.file_name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : item.file_type?.startsWith('video/') ? (
                          <FiVideo className="w-8 h-8 text-secondary-400" />
                        ) : item.file_type?.startsWith('audio/') ? (
                          <FiMusic className="w-8 h-8 text-secondary-400" />
                        ) : (
                          <FiFile className="w-8 h-8 text-secondary-400" />
                        )}
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-secondary-900 dark:text-white truncate">
                          {item.file_name}
                        </p>
                        <p className="text-xs text-secondary-500 dark:text-secondary-400">
                          {(item.file_size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        <div className="flex items-center justify-center space-x-1 mt-2">
                          <button
                            onClick={() => navigator.clipboard.writeText(item.url)}
                            className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                            title="Copy URL"
                          >
                            <FiCopy size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteMedia(item.id)}
                            className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                            title="Delete"
                          >
                            <FiTrash size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="card">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-secondary-900 dark:text-white mb-6">
                CMS Analytics
              </h2>
              {analytics ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100 text-sm">Total Content</p>
                        <p className="text-3xl font-bold">{analytics.content?.total || 0}</p>
                      </div>
                      <FiFileText className="w-8 h-8 text-blue-200" />
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-100 text-sm">Published</p>
                        <p className="text-3xl font-bold">{analytics.content?.published || 0}</p>
                      </div>
                      <FiCheckCircle className="w-8 h-8 text-green-200" />
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-100 text-sm">Notifications</p>
                        <p className="text-3xl font-bold">{analytics.notifications?.total || 0}</p>
                      </div>
                      <FiBell className="w-8 h-8 text-purple-200" />
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-orange-100 text-sm">Media Files</p>
                        <p className="text-3xl font-bold">{analytics.media?.total || 0}</p>
                      </div>
                      <FiImage className="w-8 h-8 text-orange-200" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <FiBarChart className="mx-auto text-6xl text-secondary-400 mb-4" />
                  <h3 className="text-lg font-medium text-secondary-900 dark:text-white mb-2">
                    No analytics data available
                  </h3>
                  <p className="text-secondary-500">
                    Analytics will appear here once you start creating content
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'circulars' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upload Form */}
          <div className="lg:col-span-1">
            <div className="card">
              <div className="p-6 border-b border-secondary-200 dark:border-secondary-700">
                <h2 className="text-lg font-semibold text-secondary-900 dark:text-white">
                  Upload New Circular
                </h2>
              </div>
              <div className="p-6">
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                      Circular Title*
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Enter circular title"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                      Category*
                    </label>
                    <select className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                      <option value="">Select a category</option>
                      <option value="academic">Academic</option>
                      <option value="administrative">Administrative</option>
                      <option value="examination">Examination</option>
                      <option value="admission">Admission</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                      Priority
                    </label>
                    <select className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                      Description
                    </label>
                    <textarea
                      rows={3}
                      className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Enter a brief description"
                    ></textarea>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                      File Upload*
                    </label>
                    <div className="border-2 border-dashed border-secondary-300 dark:border-secondary-600 rounded-lg p-4 text-center">
                      <input
                        type="file"
                        className="hidden"
                        id="circular-file"
                        accept=".pdf,.doc,.docx"
                      />
                      <label 
                        htmlFor="circular-file"
                        className="cursor-pointer flex flex-col items-center justify-center py-4"
                      >
                        <FiUpload className="text-4xl text-secondary-400 mb-2" />
                        <span className="text-secondary-600 dark:text-secondary-400">
                          Click to upload PDF, DOC, or DOCX (max 10MB)
                        </span>
                        <span className="text-xs text-secondary-500 mt-2">
                          No file selected
                        </span>
                      </label>
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <button
                      type="submit"
                      className="btn-primary w-full flex items-center justify-center"
                    >
                      <FiUpload className="mr-2" size={16} />
                      Upload Circular
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          
          {/* Circulars List */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="p-6 border-b border-secondary-200 dark:border-secondary-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-secondary-900 dark:text-white">
                    University Circulars
                  </h2>
                  <div className="flex items-center">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search circulars..."
                        className="pl-8 pr-4 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-4 w-4 text-secondary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-secondary-200 dark:divide-secondary-700">
                  <thead className="bg-secondary-50 dark:bg-secondary-800">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                        Title
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                        Category
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                        Downloads
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-secondary-900 divide-y divide-secondary-200 dark:divide-secondary-800">
                    {[
                      {
                        id: 1,
                        title: 'Academic Calendar 2025-26',
                        category: 'academic',
                        priority: 'high',
                        date: '2025-08-15',
                        downloads: 45
                      },
                      {
                        id: 2,
                        title: 'Examination Guidelines',
                        category: 'examination',
                        priority: 'medium',
                        date: '2025-08-10',
                        downloads: 23
                      },
                      {
                        id: 3,
                        title: 'Admission Process Update',
                        category: 'admission',
                        priority: 'urgent',
                        date: '2025-08-05',
                        downloads: 78
                      }
                    ].map((circular) => (
                      <tr key={circular.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-secondary-100 dark:bg-secondary-800 rounded-lg">
                              <FiFileText className="text-secondary-600 dark:text-secondary-400" size={20} />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-secondary-900 dark:text-white">
                                {circular.title}
                              </div>
                              <div className="text-xs text-secondary-500 dark:text-secondary-400">
                                PDF Document
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                            ${circular.category === 'academic' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' : ''}
                            ${circular.category === 'examination' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400' : ''}
                            ${circular.category === 'admission' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : ''}
                            ${circular.category === 'administrative' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400' : ''}
                            ${circular.category === 'other' ? 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400' : ''}
                          `}>
                            {circular.category.charAt(0).toUpperCase() + circular.category.slice(1)}
                          </span>
                          {circular.priority === 'urgent' && (
                            <span className="ml-2 px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                              Urgent
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500 dark:text-secondary-400">
                          {circular.date}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500 dark:text-secondary-400">
                          {circular.downloads}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300">
                              <FiEye size={18} />
                            </button>
                            <button className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300">
                              <FiDownload size={18} />
                            </button>
                            <button className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300">
                              <FiTrash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-4 border-t border-secondary-200 dark:border-secondary-700 flex items-center justify-between">
                <div className="text-sm text-secondary-500 dark:text-secondary-400">
                  Showing 3 of 3 circulars
                </div>
                <div className="flex items-center space-x-2">
                  <button className="px-3 py-1 border border-secondary-300 dark:border-secondary-600 rounded-md text-sm text-secondary-500 dark:text-secondary-400 disabled:opacity-50">
                    Previous
                  </button>
                  <button className="px-3 py-1 border border-secondary-300 dark:border-secondary-600 rounded-md text-sm text-secondary-500 dark:text-secondary-400 disabled:opacity-50">
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'email' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* SMTP Settings */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="p-6 border-b border-secondary-200 dark:border-secondary-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-secondary-900 dark:text-white">
                    Email Server Configuration
                  </h2>
                  <div className="flex items-center space-x-2">
                    <button className="btn-outline flex items-center">
                      <FiCheckCircle className="mr-2" size={16} />
                      Test Connection
                    </button>
                    <button className="btn-primary flex items-center">
                      <FiSave className="mr-2" size={16} />
                      Save Settings
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <form className="space-y-6">
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <FiAlertTriangle className="h-5 w-5 text-blue-400" aria-hidden="true" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">
                          Email Configuration
                        </h3>
                        <div className="mt-2 text-sm text-blue-700 dark:text-blue-400">
                          <p>
                            These settings determine how the system sends emails to users. Incorrect settings may prevent emails from being delivered.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                        SMTP Host*
                      </label>
                      <input
                        type="text"
                        value="smtp.gmail.com"
                        className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="e.g. smtp.gmail.com"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                        SMTP Port*
                      </label>
                      <input
                        type="number"
                        value="587"
                        className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="e.g. 587"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                        SMTP Username*
                      </label>
                      <input
                        type="text"
                        value="noreply@innovationhub.gov.in"
                        className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="e.g. username@example.com"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                        SMTP Password*
                      </label>
                      <input
                        type="password"
                        value="••••••••••••"
                        className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Enter password"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                        From Name*
                      </label>
                      <input
                        type="text"
                        value="Innovation Hub Maharashtra"
                        className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="e.g. Innovation Hub"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                        From Email*
                      </label>
                      <input
                        type="email"
                        value="noreply@innovationhub.gov.in"
                        className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="e.g. noreply@example.com"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                        Reply-To Email
                      </label>
                      <input
                        type="email"
                        value="support@innovationhub.gov.in"
                        className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="e.g. support@example.com"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                        Connection Security
                      </label>
                      <select className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                        <option value="tls">TLS</option>
                        <option value="ssl">SSL</option>
                        <option value="none">None</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-secondary-200 dark:border-secondary-700">
                    <h3 className="text-lg font-medium text-secondary-900 dark:text-white mb-4">
                      Test Email Configuration
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                          Test Email Address
                        </label>
                        <input
                          type="email"
                          className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="Enter your email for testing"
                        />
                      </div>
                      <div className="flex items-end">
                        <button type="button" className="btn-secondary">
                          Send Test Email
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
          
          {/* Email Templates */}
          <div className="lg:col-span-1">
            <div className="card">
              <div className="p-6 border-b border-secondary-200 dark:border-secondary-700">
                <h2 className="text-lg font-semibold text-secondary-900 dark:text-white">
                  Email Templates
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {[
                    {
                      id: 'welcome',
                      name: 'Welcome Email',
                      subject: 'Welcome to Innovation Hub Maharashtra',
                      description: 'Sent when a new user registers'
                    },
                    {
                      id: 'password_reset',
                      name: 'Password Reset',
                      subject: 'Password Reset Request',
                      description: 'Sent when a user requests a password reset'
                    },
                    {
                      id: 'idea_submitted',
                      name: 'Idea Submission',
                      subject: 'Idea Submitted Successfully',
                      description: 'Sent when a student submits a new idea'
                    },
                    {
                      id: 'idea_approved',
                      name: 'Idea Approval',
                      subject: 'Your Idea Has Been Approved',
                      description: 'Sent when an idea is approved by reviewers'
                    }
                  ].map((template) => (
                    <div 
                      key={template.id}
                      className="p-4 border border-secondary-200 dark:border-secondary-700 rounded-lg hover:bg-secondary-50 dark:hover:bg-secondary-800/50 transition-colors duration-200 cursor-pointer"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-sm font-medium text-secondary-900 dark:text-white">
                            {template.name}
                          </h3>
                          <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-1">
                            Subject: {template.subject}
                          </p>
                          <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-1">
                            {template.description}
                          </p>
                        </div>
                        <button className="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300">
                          <FiEdit3 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-4">
                    Notification Preferences
                  </h3>
                  
                  <div className="space-y-3">
                    {[
                      { id: 'welcome_emails', label: 'Send welcome emails to new users', checked: true },
                      { id: 'password_reset', label: 'Send password reset emails', checked: true },
                      { id: 'idea_status', label: 'Send idea status update emails', checked: true },
                      { id: 'announcements', label: 'Send announcement emails', checked: true },
                      { id: 'reminders', label: 'Send reminder emails', checked: true }
                    ].map((pref) => (
                      <div key={pref.id} className="flex items-center">
                        <input
                          id={pref.id}
                          type="checkbox"
                          defaultChecked={pref.checked}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
                        />
                        <label htmlFor={pref.id} className="ml-2 text-sm text-secondary-700 dark:text-secondary-300">
                          {pref.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CMSEditor;
