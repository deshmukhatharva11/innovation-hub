import React, { useState, useEffect } from 'react';
import { FiDownload, FiSearch, FiFilter, FiFile, FiCalendar, FiUser, FiEye } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { documentsAPI } from '../../services/api';

const StudentDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const documentTypes = [
    { value: '', label: 'All Types' },
    { value: 'circular', label: 'Circular' },
    { value: 'template', label: 'Template' },
    { value: 'poster', label: 'Poster' },
    { value: 'guideline', label: 'Guideline' },
    { value: 'form', label: 'Form' },
    { value: 'other', label: 'Other' }
  ];

  useEffect(() => {
    loadDocuments();
  }, [currentPage, selectedType, searchTerm]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 12,
        ...(selectedType && { type: selectedType }),
        ...(searchTerm && { search: searchTerm })
      };

      const response = await documentsAPI.getAll(params);

      if (response.data.success) {
        setDocuments(response.data.data.documents);
        setTotalPages(response.data.data.pagination?.total_pages || 1);
        setTotalItems(response.data.data.pagination?.total_items || response.data.data.documents.length);
      } else {
        throw new Error(response.data.message || 'Failed to load documents');
      }
    } catch (error) {
      console.error('Error loading documents:', error);
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadDocuments();
  };

  const handleTypeFilter = (type) => {
    setSelectedType(type);
    setCurrentPage(1);
  };

  const handleDownload = async (doc) => {
    try {
      // Direct download using the file path
      const downloadUrl = `http://localhost:3001/uploads/${doc.file_path}`;
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = doc.title;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Download started');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download document');
    }
  };

  const handleViewDocument = async (doc) => {
    try {
      setSelectedDocument(doc);
      setShowModal(true);
    } catch (error) {
      console.error('View document error:', error);
      toast.error('Failed to load document details');
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
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getFileIcon = (mimeType) => {
    if (mimeType?.includes('pdf')) return '📄';
    if (mimeType?.includes('word')) return '📝';
    if (mimeType?.includes('excel') || mimeType?.includes('spreadsheet')) return '📊';
    if (mimeType?.includes('powerpoint') || mimeType?.includes('presentation')) return '📈';
    if (mimeType?.includes('image')) return '🖼️';
    return '📁';
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Documents</h1>
        <p className="text-gray-600">Access and download important documents, guidelines, and templates</p>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={selectedType}
              onChange={(e) => handleTypeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {documentTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Search
            </button>
          </div>
        </form>
      </div>

      {/* Documents Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : documents.length === 0 ? (
        <div className="text-center py-12">
          <FiFile className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
          <p className="text-gray-500">No documents match your search criteria.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {documents.map((document) => (
              <div key={document.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getFileIcon(document.mime_type)}</span>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">{document.title}</h3>
                      <p className="text-xs text-gray-500 capitalize">{document.document_type}</p>
                    </div>
                  </div>
                </div>

                {document.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{document.description}</p>
                )}

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-xs text-gray-500">
                    <FiUser className="mr-2" />
                    <span>Uploaded by {document.uploader?.name}</span>
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <FiCalendar className="mr-2" />
                    <span>{formatDate(document.created_at)}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Size: {formatFileSize(document.file_size)}
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleViewDocument(document)}
                    className="flex-1 flex items-center justify-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <FiEye className="mr-2" />
                    View
                  </button>
                  <button
                    onClick={() => handleDownload(document)}
                    className="flex-1 flex items-center justify-center px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <FiDownload className="mr-2" />
                    Download
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-sm text-gray-700">
                Page {currentPage} of {totalPages} ({totalItems} documents)
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Document Details Modal */}
      {showModal && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">{getFileIcon(selectedDocument.mime_type)}</span>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{selectedDocument.title}</h2>
                    <p className="text-sm text-gray-500 capitalize">{selectedDocument.document_type}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FiEye className="h-6 w-6" />
                </button>
              </div>

              {selectedDocument.description && (
                <p className="text-gray-600 mb-4">{selectedDocument.description}</p>
              )}

              <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm text-gray-500">
                  <FiUser className="mr-2" />
                  <span>Uploaded by {selectedDocument.uploader?.name}</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <FiCalendar className="mr-2" />
                  <span>{formatDate(selectedDocument.created_at)}</span>
                </div>
                <div className="text-sm text-gray-500">
                  Size: {formatFileSize(selectedDocument.file_size)}
                </div>
                <div className="text-sm text-gray-500">
                  Type: {selectedDocument.mime_type}
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => handleDownload(selectedDocument)}
                  className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <FiDownload className="mr-2" />
                  Download Document
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDocuments;
