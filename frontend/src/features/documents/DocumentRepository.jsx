import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { FiFileText, FiUpload, FiDownload, FiEdit, FiTrash2, FiSearch, FiPlus, FiFolder, FiEye } from 'react-icons/fi';
import { documentsAPI } from '../../services/api';

const DocumentRepository = () => {
  const { user } = useSelector(state => state.auth);
  const [documents, setDocuments] = useState([]);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [editingDocument, setEditingDocument] = useState(null);
  const [newDocument, setNewDocument] = useState({
    title: '',
    description: '',
    category: '',
    type: '',
    version: '',
    status: 'active',
    accessLevel: 'public',
    tags: '',
    uploadedBy: user.name,
    file: null,
    fileName: '',
    fileSize: 0,
    fileType: ''
  });

  const categories = [
    { value: 'circular', label: 'Circular' },
    { value: 'template', label: 'Template' },
    { value: 'poster', label: 'Poster' },
    { value: 'guideline', label: 'Guideline' },
    { value: 'form', label: 'Form' },
    { value: 'other', label: 'Other' }
  ];

  const documentTypes = [
    'PDF',
    'Word Document',
    'Excel Spreadsheet',
    'PowerPoint Presentation',
    'Image',
    'Video',
    'Audio',
    'Text File',
    'Other'
  ];

  const accessLevels = [
    { 
      value: 'public', 
      label: 'Public', 
      description: 'Visible to everyone (students, college admins, incubator managers, super admins, and non-users on homepage)',
      allowedRoles: ['student', 'college_admin', 'incubator_manager', 'admin']
    },
    { 
      value: 'student_restricted', 
      label: 'Restricted', 
      description: 'Visible to students and college admins only',
      allowedRoles: ['college_admin', 'incubator_manager', 'admin']
    },
    { 
      value: 'private', 
      label: 'Private', 
      description: 'Visible only to you (own documents)',
      allowedRoles: ['incubator_manager', 'admin']
    }
  ];

  useEffect(() => {
    loadDocuments();
  }, []);

  useEffect(() => {
    filterDocuments();
  }, [documents, searchTerm, selectedCategory]);

  const loadDocuments = async () => {
    try {
      // Call the actual API to load documents
      const response = await documentsAPI.getAll();
      
      if (response.data?.success && response.data?.data?.documents) {
        setDocuments(response.data.data.documents);
      } else {
        setDocuments([]);
      }
    } catch (error) {
      console.error('Error loading documents:', error);
      setDocuments([]);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const filterDocuments = () => {
    let filtered = documents;

    if (searchTerm) {
      filtered = filtered.filter(doc =>
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.tags.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(doc => doc.document_type === selectedCategory);
    }

    setFilteredDocuments(filtered);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setNewDocument(prev => ({
        ...prev,
        file: file,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      }));
    }
  };

  const handleUploadDocument = async () => {
    if (!newDocument.title || !newDocument.file) {
      alert('Please fill in required fields and select a file');
      return;
    }

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('document', newDocument.file);
      formData.append('title', newDocument.title);
      formData.append('description', newDocument.description || '');
      formData.append('document_type', newDocument.category || 'other');
      formData.append('access_level', newDocument.accessLevel || 'public');

      // Call the API to upload document
      const response = await documentsAPI.create(formData);
      
      if (response.data.success) {
        console.log('✅ Document uploaded successfully:', response.data.data);
        
        // Reload documents from server
        await loadDocuments();
        
        // Reset form
        setNewDocument({
          title: '',
          description: '',
          category: '',
          type: '',
          version: '',
          status: 'active',
          accessLevel: 'public',
          tags: '',
          uploadedBy: user.name,
          file: null,
          fileName: '',
          fileSize: 0,
          fileType: ''
        });
        setShowUploadForm(false);
        alert('Document uploaded successfully!');
      } else {
        alert('Failed to upload document: ' + response.data.message);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload document: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleEditDocument = (document) => {
    setEditingDocument(document);
    setNewDocument(document);
    setShowUploadForm(true);
  };

  const handleUpdateDocument = () => {
    const updatedDocuments = documents.map(doc =>
      doc.id === editingDocument.id ? { ...newDocument, id: doc.id } : doc
    );
    setDocuments(updatedDocuments);
    setShowUploadForm(false);
    setEditingDocument(null);
    setNewDocument({
      title: '',
      description: '',
      category: '',
      type: '',
      version: '',
      status: 'active',
      accessLevel: 'public',
      tags: '',
      uploadedBy: user.name
    });
    alert('Document updated successfully!');
  };

  const handleDeleteDocument = (documentId) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      setDocuments(documents.filter(doc => doc.id !== documentId));
      alert('Document deleted successfully!');
    }
  };

  const handleDownload = async (doc) => {
    try {
      // Use the API endpoint for download
      const response = await documentsAPI.download(doc.id, {
        responseType: 'blob' // Important for file downloads
      });
      
      // Create blob from response
      const blob = new Blob([response.data], { type: doc.mime_type || 'application/octet-stream' });
      const url = window.URL.createObjectURL(blob);
      
      // Create download link
      const link = document.createElement('a');
      link.href = url;
      link.download = `${doc.title}${doc.file_path ? doc.file_path.substring(doc.file_path.lastIndexOf('.')) : ''}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      window.URL.revokeObjectURL(url);
      
      console.log(`Downloaded: ${doc.title}`);
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download document: ' + (error.response?.data?.message || error.message));
    }
  };

  const getAccessLevelColor = (accessLevel) => {
    switch (accessLevel) {
      case 'public': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'student_restricted': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'private': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Invalid date';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      case 'draft': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Document Repository</h1>
        <p className="text-gray-600">Manage university circulars, templates, and reference documents</p>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category.value} value={category.value}>{category.label}</option>
            ))}
          </select>
          <button
            onClick={() => setShowUploadForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            <FiUpload className="mr-2" />
            Upload Document
          </button>
        </div>
      </div>

      {/* Upload/Edit Document Form */}
      {showUploadForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {editingDocument ? 'Edit Document' : 'Upload New Document'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Document Title *</label>
              <input
                type="text"
                value={newDocument.title}
                onChange={(e) => setNewDocument({...newDocument, title: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={newDocument.description}
                onChange={(e) => setNewDocument({...newDocument, description: e.target.value})}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <select
                value={newDocument.category}
                onChange={(e) => setNewDocument({...newDocument, category: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Category</option>
                {categories.map(category => (
                  <option key={category.value} value={category.value}>{category.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Document Type</label>
              <select
                value={newDocument.type}
                onChange={(e) => setNewDocument({...newDocument, type: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Type</option>
                {documentTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Version</label>
              <input
                type="text"
                value={newDocument.version}
                onChange={(e) => setNewDocument({...newDocument, version: e.target.value})}
                placeholder="e.g., 1.0, 2.1"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={newDocument.status}
                onChange={(e) => setNewDocument({...newDocument, status: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Access Level</label>
              <select
                value={newDocument.accessLevel}
                onChange={(e) => setNewDocument({...newDocument, accessLevel: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {accessLevels
                  .filter(level => level.allowedRoles.includes(user?.role))
                  .map(level => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))
                }
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {accessLevels.find(level => level.value === newDocument.accessLevel)?.description}
              </p>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
              <input
                type="text"
                value={newDocument.tags}
                onChange={(e) => setNewDocument({...newDocument, tags: e.target.value})}
                placeholder="Enter tags separated by commas"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {!editingDocument && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">File Upload</label>
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer"
                  onClick={() => document.getElementById('file-upload-input').click()}
                >
                  <FiUpload className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-600">Click to upload or drag and drop</p>
                  <p className="text-xs text-gray-500">PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX</p>
                  <input
                    id="file-upload-input"
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                    onChange={handleFileUpload}
                  />
                </div>
                
                {/* File Preview */}
                {newDocument.file && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <FiFileText className="h-8 w-8 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {newDocument.fileName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatFileSize(newDocument.fileSize)} • {newDocument.fileType}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => setNewDocument(prev => ({ ...prev, file: null, fileName: '', fileSize: 0, fileType: '' }))}
                          className="text-red-600 hover:text-red-800"
                        >
                          <FiTrash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="flex justify-end space-x-3 mt-4">
            <button
              onClick={() => {
                setShowUploadForm(false);
                setEditingDocument(null);
                setNewDocument({
                  title: '',
                  description: '',
                  category: '',
                  type: '',
                  version: '',
                  status: 'active',
                  accessLevel: 'public',
                  tags: '',
                  uploadedBy: user.name,
                  file: null,
                  fileName: '',
                  fileSize: 0,
                  fileType: ''
                });
              }}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={editingDocument ? handleUpdateDocument : handleUploadDocument}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {editingDocument ? 'Update Document' : 'Upload Document'}
            </button>
          </div>
        </div>
      )}

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDocuments.map((document) => (
          <div key={document.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{document.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{document.description}</p>
                </div>
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => handleEditDocument(document)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <FiEdit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteDocument(document.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <FiTrash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <FiFolder className="mr-2" />
                  <span className="capitalize">{document.document_type}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <FiFileText className="mr-2" />
                  <span>{document.mime_type} • {formatFileSize(document.file_size)}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <span>By {document.uploader?.name || 'Unknown'}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <span>Uploaded {formatDate(document.created_at)}</span>
                </div>
              </div>

              <div className="flex justify-between items-center mb-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(document.is_active ? 'active' : 'archived')}`}>
                  {(document.is_active ? 'ACTIVE' : 'ARCHIVED')}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAccessLevelColor(document.access_level)}`}>
                  {document.access_level ? document.access_level.toUpperCase().replace('_', ' ') : 'UNKNOWN'}
                </span>
              </div>

              {document.tags && document.tags.length > 0 && (
                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {document.tags.split(',').map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">
                  {formatDate(document.created_at)}
                </span>
                <button
                  onClick={() => handleDownload(document)}
                  className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors flex items-center text-sm"
                >
                  <FiDownload className="mr-1" />
                  Download
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredDocuments.length === 0 && (
        <div className="text-center py-8">
          <FiFileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No documents found</h3>
          <p className="mt-1 text-sm text-gray-500">Try adjusting your search criteria or upload a new document</p>
        </div>
      )}
    </div>
  );
};

export default DocumentRepository;
