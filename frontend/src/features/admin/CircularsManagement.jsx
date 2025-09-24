import React, { useState, useEffect } from 'react';
import { FiUpload, FiDownload, FiTrash2, FiEye, FiFileText, FiCalendar, FiAlertCircle } from 'react-icons/fi';
import { cmsAPI } from '../../services/api';
import { toast } from 'react-hot-toast';

const CircularsManagement = () => {
  const [circulars, setCirculars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadData, setUploadData] = useState({
    title: '',
    description: '',
    category: 'academic',
    priority: 'medium',
    expires_at: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    fetchCirculars();
  }, []);

  const fetchCirculars = async () => {
    try {
      setLoading(true);
      const response = await cmsAPI.getCirculars();
      if (response.data.success) {
        setCirculars(response.data.data.circulars);
      }
    } catch (error) {
      console.error('Error fetching circulars:', error);
      toast.error('Failed to fetch circulars');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Check file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Only PDF, DOC, and DOCX files are allowed');
        return;
      }
      
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !uploadData.title) {
      toast.error('Please select a file and enter a title');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('title', uploadData.title);
      formData.append('description', uploadData.description);
      formData.append('category', uploadData.category);
      formData.append('priority', uploadData.priority);
      if (uploadData.expires_at) {
        formData.append('expires_at', uploadData.expires_at);
      }

      await cmsAPI.uploadCircular(formData);
      toast.success('Circular uploaded successfully!');
      setShowUploadModal(false);
      setUploadData({
        title: '',
        description: '',
        category: 'academic',
        priority: 'medium',
        expires_at: ''
      });
      setSelectedFile(null);
      fetchCirculars();
    } catch (error) {
      console.error('Error uploading circular:', error);
      toast.error('Failed to upload circular');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this circular?')) {
      try {
        await cmsAPI.deleteCircular(id);
        toast.success('Circular deleted successfully!');
        fetchCirculars();
      } catch (error) {
        console.error('Error deleting circular:', error);
        toast.error('Failed to delete circular');
      }
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'academic': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'administrative': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'examination': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'admission': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Circulars Management</h1>
            <p className="text-green-100">Upload and manage university circulars and official documents</p>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-lg flex items-center transition-colors"
          >
            <FiUpload className="mr-2" size={20} />
            Upload Circular
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <FiFileText className="text-blue-600 dark:text-blue-400" size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400">Total Circulars</p>
              <p className="text-2xl font-bold text-secondary-900 dark:text-white">{circulars.length}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <FiCalendar className="text-green-600 dark:text-green-400" size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400">This Month</p>
              <p className="text-2xl font-bold text-secondary-900 dark:text-white">
                {circulars.filter(c => {
                  const created = new Date(c.created_at);
                  const now = new Date();
                  return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
                }).length}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
              <FiAlertCircle className="text-orange-600 dark:text-orange-400" size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400">High Priority</p>
              <p className="text-2xl font-bold text-secondary-900 dark:text-white">
                {circulars.filter(c => c.priority === 'high' || c.priority === 'urgent').length}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <FiDownload className="text-purple-600 dark:text-purple-400" size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400">Total Downloads</p>
              <p className="text-2xl font-bold text-secondary-900 dark:text-white">
                {circulars.reduce((sum, c) => sum + (c.download_count || 0), 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Circulars List */}
      <div className="card">
        <div className="p-6 border-b border-secondary-200 dark:border-secondary-700">
          <h2 className="text-lg font-semibold text-secondary-900 dark:text-white">
            All Circulars
          </h2>
        </div>
        <div className="p-6">
          {circulars.length > 0 ? (
            <div className="space-y-4">
              {circulars.map((circular) => (
                <div key={circular.id} className="border border-secondary-200 dark:border-secondary-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-secondary-900 dark:text-white">
                          {circular.title}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(circular.priority)}`}>
                          {circular.priority.toUpperCase()}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(circular.category)}`}>
                          {circular.category.toUpperCase()}
                        </span>
                      </div>
                      
                      {circular.description && (
                        <p className="text-sm text-secondary-600 dark:text-secondary-400 mb-2">
                          {circular.description}
                        </p>
                      )}
                      
                      <div className="flex items-center space-x-4 text-xs text-secondary-500">
                        <span className="flex items-center">
                          <FiFileText className="mr-1" size={14} />
                          {circular.file_name}
                        </span>
                        <span>{formatFileSize(circular.file_size)}</span>
                        <span className="flex items-center">
                          <FiDownload className="mr-1" size={14} />
                          {circular.download_count || 0} downloads
                        </span>
                        <span className="flex items-center">
                          <FiCalendar className="mr-1" size={14} />
                          {new Date(circular.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => window.open(`/uploads/circulars/${circular.file_name}`, '_blank')}
                        className="p-2 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                        title="View/Download"
                      >
                        <FiEye size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(circular.id)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FiFileText className="mx-auto text-6xl text-secondary-400 mb-4" />
              <h3 className="text-lg font-medium text-secondary-900 dark:text-white mb-2">
                No circulars uploaded yet
              </h3>
              <p className="text-secondary-500 mb-4">
                Upload your first circular to get started
              </p>
              <button
                onClick={() => setShowUploadModal(true)}
                className="btn-primary"
              >
                <FiUpload className="mr-2" size={16} />
                Upload Circular
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-secondary-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">
              Upload New Circular
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={uploadData.title}
                  onChange={(e) => setUploadData({...uploadData, title: e.target.value})}
                  className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter circular title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  Description
                </label>
                <textarea
                  value={uploadData.description}
                  onChange={(e) => setUploadData({...uploadData, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter description (optional)"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    Category
                  </label>
                  <select
                    value={uploadData.category}
                    onChange={(e) => setUploadData({...uploadData, category: e.target.value})}
                    className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
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
                  <select
                    value={uploadData.priority}
                    onChange={(e) => setUploadData({...uploadData, priority: e.target.value})}
                    className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  Expiry Date (Optional)
                </label>
                <input
                  type="date"
                  value={uploadData.expires_at}
                  onChange={(e) => setUploadData({...uploadData, expires_at: e.target.value})}
                  className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  File *
                </label>
                <input
                  type="file"
                  onChange={handleFileSelect}
                  accept=".pdf,.doc,.docx"
                  className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <p className="text-xs text-secondary-500 mt-1">
                  Only PDF, DOC, and DOCX files are allowed. Max size: 10MB
                </p>
              </div>

              {selectedFile && (
                <div className="p-3 bg-secondary-50 dark:bg-secondary-800 rounded-lg">
                  <p className="text-sm text-secondary-700 dark:text-secondary-300">
                    Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 text-secondary-600 dark:text-secondary-400 hover:text-secondary-800 dark:hover:text-secondary-200"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={uploading || !selectedFile || !uploadData.title}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CircularsManagement;
