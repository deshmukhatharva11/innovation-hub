import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiZap,
  FiDownload,
  FiBook,
  FiFileText,
  FiUsers,
  FiTarget,
  FiAward,
  FiTrendingUp,
  FiArrowRight,
  FiSearch,
  FiFilter,
  FiExternalLink,
  FiRefreshCw
} from 'react-icons/fi';
import { documentsAPI } from '../../services/api';

const Resources = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'table'

  const categories = [
    { id: 'all', name: 'All Resources' },
    { id: 'circular', name: 'Circulars' },
    { id: 'template', name: 'Templates' },
    { id: 'poster', name: 'Posters' },
    { id: 'guideline', name: 'Guidelines' },
    { id: 'form', name: 'Forms' },
    { id: 'other', name: 'Other' }
  ];

  // Load public documents
  useEffect(() => {
    const loadDocuments = async () => {
      try {
        setLoading(true);
        const response = await documentsAPI.getPublic();
        if (response.data?.success) {
          setDocuments(response.data.data?.documents || []);
        }
      } catch (err) {
        console.error('Error loading documents:', err);
        setError('Failed to load documents');
      } finally {
        setLoading(false);
      }
    };

    loadDocuments();
  }, []);

  const filteredResources = documents.filter(document => {
    const matchesCategory = selectedCategory === 'all' || document.document_type === selectedCategory;
    const matchesSearch = document.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (document.description && document.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const getCategoryIcon = (documentType) => {
    switch (documentType) {
      case 'circular': return FiFileText;
      case 'template': return FiBook;
      case 'poster': return FiTarget;
      case 'guideline': return FiAward;
      case 'form': return FiUsers;
      default: return FiFileText;
    }
  };

  const getFileTypeIcon = (mimeType) => {
    if (mimeType?.includes('pdf')) return 'PDF';
    if (mimeType?.includes('word') || mimeType?.includes('document')) return 'DOCX';
    if (mimeType?.includes('excel') || mimeType?.includes('spreadsheet')) return 'XLSX';
    if (mimeType?.includes('powerpoint') || mimeType?.includes('presentation')) return 'PPTX';
    if (mimeType?.includes('image')) return 'IMG';
    return 'FILE';
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleDownload = async (document) => {
    try {
      const response = await documentsAPI.download(document.id, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { type: document.mime_type || 'application/octet-stream' });
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${document.title}${document.file_path ? document.file_path.substring(document.file_path.lastIndexOf('.')) : ''}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download document: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-secondary-900">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white py-20">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl lg:text-6xl font-bold mb-6">
              Learning Resources
            </h1>
            <p className="text-xl lg:text-2xl mb-8 text-primary-100 max-w-4xl mx-auto">
              Access important documents, guidelines, templates, and resources
            </p>
            {loading && (
              <div className="flex items-center justify-center py-8">
                <FiRefreshCw className="animate-spin h-8 w-8 text-primary-200 mr-3" />
                <span className="text-primary-200">Loading resources...</span>
              </div>
            )}
            {error && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-6 max-w-2xl mx-auto">
                <h3 className="text-xl font-semibold mb-2 text-red-200">⚠️ Error Loading Resources</h3>
                <p className="text-red-100">{error}</p>
              </div>
            )}
                          <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/register" className="btn-primary bg-white text-primary-600 hover:bg-primary-50 px-8 py-4 text-lg font-semibold">
                  <FiZap className="mr-2" size={20} />
                  Get Started
                </Link>
                <Link to="/success-stories" className="btn-outline border-white text-white hover:bg-white hover:text-primary-600 px-8 py-4 text-lg font-semibold">
                  <FiAward className="mr-2" size={20} />
                  View Success Stories
                </Link>
              </div>
          </div>
        </div>
      </section>

      {/* Search and Filter */}
      <section className="py-12 bg-secondary-50 dark:bg-secondary-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400" size={20} />
              <input
                type="text"
                placeholder="Search resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-secondary-300 dark:border-secondary-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-secondary-900 dark:text-white"
              />
            </div>
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-4 py-2 rounded-full font-medium transition-all duration-300 ${
                      selectedCategory === category.id
                        ? 'bg-primary-600 text-white shadow-lg'
                        : 'bg-white dark:bg-secondary-900 text-secondary-600 dark:text-secondary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
              
              {/* View Toggle */}
              <div className="flex bg-white dark:bg-secondary-900 rounded-lg p-1 border border-secondary-300 dark:border-secondary-600">
                <button
                  onClick={() => setViewMode('cards')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    viewMode === 'cards'
                      ? 'bg-primary-600 text-white shadow-sm'
                      : 'text-secondary-600 dark:text-secondary-400 hover:text-primary-600 dark:hover:text-primary-400'
                  }`}
                >
                  <FiTarget className="inline mr-1" size={16} />
                  Cards
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    viewMode === 'table'
                      ? 'bg-primary-600 text-white shadow-sm'
                      : 'text-secondary-600 dark:text-secondary-400 hover:text-primary-600 dark:hover:text-primary-400'
                  }`}
                >
                  <FiFileText className="inline mr-1" size={16} />
                  Table
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Resources Grid */}
      <section className="py-20 bg-white dark:bg-secondary-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-secondary-900 dark:text-white mb-6">
              Available Resources
            </h2>
            <p className="text-xl text-secondary-600 dark:text-secondary-400 max-w-3xl mx-auto">
              {filteredResources.length} resources found
            </p>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <FiRefreshCw className="animate-spin h-8 w-8 text-primary-600 mr-3" />
              <span className="text-gray-600 dark:text-gray-400">Loading resources...</span>
            </div>
          ) : filteredResources.length > 0 ? (
            viewMode === 'cards' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredResources.map((document) => {
                  const CategoryIcon = getCategoryIcon(document.document_type);
                  const fileType = getFileTypeIcon(document.mime_type);
                  return (
                    <div key={document.id} className="group bg-white dark:bg-secondary-900 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <CategoryIcon className="text-primary-600 dark:text-primary-400" size={64} />
                        </div>
                        <div className="absolute top-4 right-4">
                          <span className="px-3 py-1 bg-primary-600 text-white text-sm font-medium rounded-full">
                            {fileType}
                          </span>
                        </div>
                        <div className="absolute bottom-4 left-4">
                          <div className="flex items-center text-primary-700 dark:text-primary-300 text-sm font-medium">
                            <CategoryIcon className="mr-1" size={14} />
                            {document.document_type ? document.document_type.charAt(0).toUpperCase() + document.document_type.slice(1) : 'Other'}
                          </div>
                        </div>
                      </div>
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-secondary-900 dark:text-white mb-3">
                          {document.title}
                        </h3>
                        <p className="text-secondary-600 dark:text-secondary-400 mb-4">
                          {document.description || 'No description available'}
                        </p>
                        
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center text-sm text-secondary-500 dark:text-secondary-400">
                            <FiFileText className="mr-1" size={14} />
                            {formatFileSize(document.file_size)}
                          </div>
                          <div className="flex items-center text-sm text-secondary-500 dark:text-secondary-400">
                            <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-xs rounded-full">
                              PUBLIC
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-sm text-secondary-500 dark:text-secondary-400">
                            {document.created_at ? new Date(document.created_at).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            }) : 'Recent'}
                          </span>
                        </div>
                        
                        <button 
                          onClick={() => handleDownload(document)}
                          className="btn-primary w-full"
                        >
                          <FiDownload className="mr-2" size={16} />
                          Download
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white dark:bg-secondary-900 rounded-xl shadow-lg overflow-hidden border border-secondary-200 dark:border-secondary-700">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-secondary-50 dark:bg-secondary-700">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                          Document
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                          Type & Size
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                          Uploaded
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                          Access
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-secondary-200 dark:divide-secondary-700">
                      {filteredResources.map((document) => {
                        const CategoryIcon = getCategoryIcon(document.document_type);
                        const fileType = getFileTypeIcon(document.mime_type);
                        return (
                          <tr 
                            key={document.id}
                            className="hover:bg-secondary-50 dark:hover:bg-secondary-700 transition-colors duration-200"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                  <div className="h-10 w-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                                    <CategoryIcon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                                  </div>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-secondary-900 dark:text-white">
                                    {document.title}
                                  </div>
                                  <div className="text-sm text-secondary-500 dark:text-secondary-400">
                                    {document.description ? 
                                      (document.description.length > 50 ? 
                                        `${document.description.substring(0, 50)}...` : 
                                        document.description
                                      ) : 'No description'
                                    }
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex flex-col space-y-1">
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                                  {fileType}
                                </span>
                                <span className="text-xs text-secondary-500 dark:text-secondary-400">
                                  {formatFileSize(document.file_size)}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400">
                                {document.document_type ? document.document_type.charAt(0).toUpperCase() + document.document_type.slice(1) : 'Other'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500 dark:text-secondary-400">
                              {document.created_at ? new Date(document.created_at).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              }) : 'Recent'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                PUBLIC
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <button 
                                onClick={() => handleDownload(document)}
                                className="inline-flex items-center px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                              >
                                <FiDownload className="mr-1" size={14} />
                                Download
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          ) : (
            <div className="text-center py-12">
              <FiFileText className="text-secondary-400 mx-auto mb-4" size={48} />
              <h3 className="text-xl font-bold text-secondary-900 dark:text-white mb-2">
                No resources found
              </h3>
              <p className="text-secondary-600 dark:text-secondary-400">
                {searchQuery ? 'Try adjusting your search criteria' : 'No public documents are available yet'}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Featured Resources */}
      {documents.length > 0 && (
        <section className="py-20 bg-secondary-50 dark:bg-secondary-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold text-secondary-900 dark:text-white mb-6">
                Featured Resources
              </h2>
              <p className="text-xl text-secondary-600 dark:text-secondary-400 max-w-3xl mx-auto">
                Latest and most important documents from our platform
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {documents.slice(0, 2).map((document, index) => {
                const CategoryIcon = getCategoryIcon(document.document_type);
                const fileType = getFileTypeIcon(document.mime_type);
                return (
                  <div key={document.id} className="bg-white dark:bg-secondary-900 rounded-2xl p-8 shadow-lg">
                    <div className="flex items-center mb-6">
                      <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center mr-6">
                        <CategoryIcon className="text-primary-600 dark:text-primary-400" size={32} />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-secondary-900 dark:text-white">
                          {document.title}
                        </h3>
                        <p className="text-primary-600 dark:text-primary-400">
                          {fileType} • {formatFileSize(document.file_size)}
                        </p>
                      </div>
                    </div>
                    <p className="text-secondary-600 dark:text-secondary-400 mb-6">
                      {document.description || 'No description available'}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-secondary-500 dark:text-secondary-400">
                        {document.created_at ? new Date(document.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        }) : 'Recent'} • Public Document
                      </div>
                      <button 
                        onClick={() => handleDownload(document)}
                        className="btn-primary"
                      >
                        <FiDownload className="mr-2" size={16} />
                        Download
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Ready to Access All Resources?
          </h2>
          <p className="text-xl lg:text-2xl mb-8 text-primary-100">
            Join our community to unlock unlimited access to all resources and tools
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="btn-primary bg-white text-primary-600 hover:bg-primary-50 px-8 py-4 text-lg font-semibold">
              <FiZap className="mr-2" size={20} />
              Join Now
            </Link>
            <Link to="/contact" className="btn-outline border-white text-white hover:bg-white hover:text-primary-600 px-8 py-4 text-lg font-semibold">
              <FiExternalLink className="mr-2" size={20} />
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Resources;
