import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import {
  FiPlus,
  FiEdit3,
  FiEye,
  FiSearch,
  FiFilter,
  FiDownload,
  FiRefreshCw,
  FiTarget,
  FiUsers,
  FiTrendingUp,
  FiClock,
  FiCheckCircle,
  FiX,
  FiUser,
  FiCalendar,
  FiDollarSign,
  FiActivity,
  FiBarChart3,
  FiThumbsUp,
  FiMessageSquare,
  FiFileText,
  FiExternalLink,
  FiUserCheck,
  FiMapPin,
  FiMail,
  FiPhone,
  FiAward,
  FiCheck,
  FiXCircle
} from 'react-icons/fi';
import { preIncubateesAPI } from '../../services/api';
import jsPDF from 'jspdf';

const PreIncubateesTracker = () => {
  const { user } = useSelector((state) => state.auth);
  const [preIncubatees, setPreIncubatees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showIdeaDetailModal, setShowIdeaDetailModal] = useState(false);
  const [selectedPreIncubatee, setSelectedPreIncubatee] = useState(null);
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [phaseFilter, setPhaseFilter] = useState('all');
  const [statistics, setStatistics] = useState({
    total_active: 0,
    total_completed: 0,
    total_paused: 0,
    by_phase: {},
    average_progress: 0
  });
  const [formData, setFormData] = useState({
    idea_id: '',
    current_phase: 'research',
    progress_percentage: 0,
    phase_description: '',
    funding_required: 0,
    expected_completion_date: '',
    notes: ''
  });

  useEffect(() => {
    fetchPreIncubatees();
    fetchStatistics();
  }, [user?.incubator_id]);

  const fetchPreIncubatees = async () => {
    try {
      setLoading(true);
      const response = await preIncubateesAPI.getAll({
        status: statusFilter,
        phase: phaseFilter,
        search: searchTerm
      });
      
      if (response.data?.success && response.data?.data?.preIncubatees) {
        setPreIncubatees(response.data.data.preIncubatees);
      } else {
        setPreIncubatees([]);
      }
    } catch (error) {
      console.error('Error fetching pre-incubatees:', error);
      toast.error('Failed to fetch pre-incubatees');
      setPreIncubatees([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await preIncubateesAPI.getStatistics();
      if (response.data?.success && response.data?.data) {
        setStatistics(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const handleAddPreIncubatee = async () => {
    try {
      if (!formData.idea_id) {
        toast.error('Please select an idea');
        return;
      }

      const response = await preIncubateesAPI.create(formData);
      if (response.data?.success) {
        toast.success('Pre-incubatee created successfully');
        setShowAddModal(false);
        resetForm();
        fetchPreIncubatees();
        fetchStatistics();
      }
    } catch (error) {
      console.error('Error creating pre-incubatee:', error);
      toast.error(error.response?.data?.message || 'Failed to create pre-incubatee');
    }
  };

  const handleUpdatePreIncubatee = async () => {
    try {
      if (!selectedPreIncubatee) return;

      const response = await preIncubateesAPI.update(selectedPreIncubatee.id, formData);
      if (response.data?.success) {
        toast.success('Pre-incubatee updated successfully');
        setShowEditModal(false);
        resetForm();
        fetchPreIncubatees();
        fetchStatistics();
      }
    } catch (error) {
      console.error('Error updating pre-incubatee:', error);
      toast.error(error.response?.data?.message || 'Failed to update pre-incubatee');
    }
  };

  const handleViewPreIncubatee = (preIncubatee) => {
    setSelectedPreIncubatee(preIncubatee);
    setShowViewModal(true);
  };

  const handleIdeaCardClick = (preIncubatee) => {
    setSelectedIdea(preIncubatee);
    setShowIdeaDetailModal(true);
  };

  const generatePDF = (preIncubatee) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text('Pre-Incubatee Report', 20, 20);
    
    // Idea Details
    doc.setFontSize(16);
    doc.text('Idea Information', 20, 40);
    doc.setFontSize(12);
    doc.text(`Title: ${preIncubatee.idea?.title || 'N/A'}`, 20, 55);
    doc.text(`Description: ${preIncubatee.idea?.description || 'N/A'}`, 20, 65);
    doc.text(`Category: ${preIncubatee.idea?.category || 'N/A'}`, 20, 75);
    doc.text(`Status: ${preIncubatee.idea?.status || 'N/A'}`, 20, 85);
    
    // Student Details
    doc.setFontSize(16);
    doc.text('Student Information', 20, 105);
    doc.setFontSize(12);
    doc.text(`Name: ${preIncubatee.student?.name || 'N/A'}`, 20, 120);
    doc.text(`Email: ${preIncubatee.student?.email || 'N/A'}`, 20, 130);
    doc.text(`Phone: ${preIncubatee.student?.phone || 'N/A'}`, 20, 140);
    
    // College Details
    doc.setFontSize(16);
    doc.text('College Information', 20, 160);
    doc.setFontSize(12);
    doc.text(`College: ${preIncubatee.college?.name || 'N/A'}`, 20, 175);
    doc.text(`Location: ${preIncubatee.college?.city || 'N/A'}, ${preIncubatee.college?.state || 'N/A'}`, 20, 185);
    
    // Mentor Details
    if (preIncubatee.mentor) {
      doc.setFontSize(16);
      doc.text('Mentor Information', 20, 205);
      doc.setFontSize(12);
      doc.text(`Name: ${preIncubatee.mentor?.name || 'N/A'}`, 20, 220);
      doc.text(`Email: ${preIncubatee.mentor?.email || 'N/A'}`, 20, 230);
      doc.text(`Specialization: ${preIncubatee.mentor?.specialization || 'N/A'}`, 20, 240);
      doc.text(`Assignment Date: ${preIncubatee.mentor_assigned_date ? new Date(preIncubatee.mentor_assigned_date).toLocaleDateString() : 'N/A'}`, 20, 250);
    }
    
    // Incubation Status
    doc.setFontSize(16);
    doc.text('Incubation Status', 20, 270);
    doc.setFontSize(12);
    doc.text(`Current Phase: ${preIncubatee.current_phase || 'N/A'}`, 20, 285);
    doc.text(`Progress: ${preIncubatee.progress_percentage || 0}%`, 20, 295);
    doc.text(`Status: ${preIncubatee.status || 'N/A'}`, 20, 305);
    doc.text(`Incubator Decision: ${preIncubatee.incubator_status || 'Pending'}`, 20, 315);
    doc.text(`Decision Date: ${preIncubatee.incubator_decision_date ? new Date(preIncubatee.incubator_decision_date).toLocaleDateString() : 'N/A'}`, 20, 325);
    
    // Funding Information
    doc.setFontSize(16);
    doc.text('Funding Information', 20, 345);
    doc.setFontSize(12);
    doc.text(`Funding Required: ₹${preIncubatee.funding_required?.toLocaleString() || 0}`, 20, 360);
    doc.text(`Funding Received: ₹${preIncubatee.funding_received?.toLocaleString() || 0}`, 20, 370);
    
    // Notes
    if (preIncubatee.notes) {
      doc.setFontSize(16);
      doc.text('Notes', 20, 390);
      doc.setFontSize(12);
      const splitNotes = doc.splitTextToSize(preIncubatee.notes, 170);
      doc.text(splitNotes, 20, 405);
    }
    
    // Footer
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, doc.internal.pageSize.height - 20);
    
    // Save the PDF
    doc.save(`pre-incubatee-${preIncubatee.idea?.title?.replace(/\s+/g, '-') || 'report'}.pdf`);
  };

  const handleEditClick = (preIncubatee) => {
    setSelectedPreIncubatee(preIncubatee);
    setFormData({
      current_phase: preIncubatee.current_phase,
      progress_percentage: preIncubatee.progress_percentage,
      phase_description: preIncubatee.phase_description || '',
      funding_received: preIncubatee.funding_received || 0,
      status: preIncubatee.status,
      notes: preIncubatee.notes || ''
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      idea_id: '',
      current_phase: 'research',
      progress_percentage: 0,
      phase_description: '',
      funding_required: 0,
      expected_completion_date: '',
      notes: ''
    });
    setSelectedPreIncubatee(null);
  };

  const getPhaseColor = (phase) => {
    switch (phase) {
      case 'research': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200';
      case 'development': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200';
      case 'testing': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200';
      case 'market_validation': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-200';
      case 'scaling': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200';
      case 'completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200';
      case 'paused': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200';
      case 'terminated': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200';
    }
  };

  const filteredPreIncubatees = preIncubatees.filter(preIncubatee => {
    const matchesSearch = preIncubatee.idea?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         preIncubatee.student?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         preIncubatee.college?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900 dark:text-white">
            Pre-Incubatees Tracker
          </h1>
          <p className="text-secondary-600 dark:text-secondary-400">
            Track progress of incubated ideas and startups
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <FiPlus size={16} />
          <span>Add Pre-Incubatee</span>
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white dark:bg-secondary-800 rounded-lg p-6 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <FiActivity className="text-green-600 dark:text-green-400" size={20} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400">
                Active Projects
              </p>
              <p className="text-2xl font-bold text-secondary-900 dark:text-white">
                {statistics.total_active}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-secondary-800 rounded-lg p-6 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <FiCheckCircle className="text-blue-600 dark:text-blue-400" size={20} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400">
                Completed
              </p>
              <p className="text-2xl font-bold text-secondary-900 dark:text-white">
                {statistics.total_completed}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-secondary-800 rounded-lg p-6 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
              <FiClock className="text-yellow-600 dark:text-yellow-400" size={20} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400">
                Paused
              </p>
              <p className="text-2xl font-bold text-secondary-900 dark:text-white">
                {statistics.total_paused}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-secondary-800 rounded-lg p-6 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <FiTrendingUp className="text-purple-600 dark:text-purple-400" size={20} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400">
                Avg Progress
              </p>
              <p className="text-2xl font-bold text-secondary-900 dark:text-white">
                {statistics.average_progress}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-secondary-800 rounded-lg p-4 mb-6 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400" size={16} />
              <input
                type="text"
                placeholder="Search pre-incubatees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-secondary-700 dark:text-white"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-secondary-700 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="paused">Paused</option>
              <option value="terminated">Terminated</option>
            </select>
            <select
              value={phaseFilter}
              onChange={(e) => setPhaseFilter(e.target.value)}
              className="px-4 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-secondary-700 dark:text-white"
            >
              <option value="all">All Phases</option>
              <option value="research">Research</option>
              <option value="development">Development</option>
              <option value="testing">Testing</option>
              <option value="market_validation">Market Validation</option>
              <option value="scaling">Scaling</option>
            </select>
            <button
              onClick={fetchPreIncubatees}
              className="btn-secondary flex items-center space-x-2"
            >
              <FiRefreshCw size={16} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Pre-Incubatees Table */}
      <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-secondary-200 dark:divide-secondary-700">
            <thead className="bg-secondary-50 dark:bg-secondary-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-300 uppercase tracking-wider">
                  Project
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-300 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-300 uppercase tracking-wider">
                  Phase
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-300 uppercase tracking-wider">
                  Progress
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-300 uppercase tracking-wider">
                  Engagement
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-secondary-800 divide-y divide-secondary-200 dark:divide-secondary-700">
              {filteredPreIncubatees.map((preIncubatee) => (
                <tr key={preIncubatee.id} className="hover:bg-secondary-50 dark:hover:bg-secondary-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div 
                      className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded-lg transition-colors"
                      onClick={() => handleIdeaCardClick(preIncubatee)}
                    >
                      <div className="text-sm font-medium text-secondary-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400">
                        {preIncubatee.idea?.title}
                      </div>
                      <div className="text-sm text-secondary-500 dark:text-secondary-400">
                        {preIncubatee.college?.name}
                      </div>
                      <div className="text-xs text-secondary-400 dark:text-secondary-500 mt-1 flex items-center">
                        <FiExternalLink size={12} className="mr-1" />
                        Click to view details
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-secondary-900 dark:text-white">
                      {preIncubatee.student?.name}
                    </div>
                    <div className="text-sm text-secondary-500 dark:text-secondary-400">
                      {preIncubatee.student?.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPhaseColor(preIncubatee.current_phase)}`}>
                      {preIncubatee.current_phase.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                        <div 
                          className="bg-primary-600 h-2 rounded-full" 
                          style={{width: `${preIncubatee.progress_percentage}%`}}
                        ></div>
                      </div>
                      <span className="text-sm text-secondary-900 dark:text-white">
                        {preIncubatee.progress_percentage}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(preIncubatee.status)}`}>
                      {preIncubatee.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-4 text-sm text-secondary-500 dark:text-secondary-400">
                      <span className="flex items-center space-x-1">
                        <FiEye size={14} />
                        <span>{preIncubatee.idea?.views_count || 0}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <FiThumbsUp size={14} />
                        <span>{preIncubatee.idea?.likes_count || 0}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <FiMessageSquare size={14} />
                        <span>{preIncubatee.idea?.comments_count || 0}</span>
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewPreIncubatee(preIncubatee)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        title="View Details"
                      >
                        <FiEye size={16} />
                      </button>
                      <button
                        onClick={() => handleEditClick(preIncubatee)}
                        className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                        title="Edit Progress"
                      >
                        <FiEdit3 size={16} />
                      </button>
                      <button
                        onClick={() => generatePDF(preIncubatee)}
                        className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300"
                        title="Export PDF"
                      >
                        <FiDownload size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Pre-Incubatee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-secondary-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-secondary-900 dark:text-white">
                  Add New Pre-Incubatee
                </h2>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="text-secondary-400 hover:text-secondary-600"
                >
                  <FiX size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    Idea ID *
                  </label>
                  <input
                    type="number"
                    value={formData.idea_id}
                    onChange={(e) => setFormData({...formData, idea_id: e.target.value})}
                    className="input-field w-full"
                    placeholder="Enter idea ID"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    Current Phase *
                  </label>
                  <select
                    value={formData.current_phase}
                    onChange={(e) => setFormData({...formData, current_phase: e.target.value})}
                    className="input-field w-full"
                  >
                    <option value="research">Research</option>
                    <option value="development">Development</option>
                    <option value="testing">Testing</option>
                    <option value="market_validation">Market Validation</option>
                    <option value="scaling">Scaling</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    Progress Percentage *
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.progress_percentage}
                    onChange={(e) => setFormData({...formData, progress_percentage: e.target.value})}
                    className="input-field w-full"
                    placeholder="Enter progress percentage"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    Phase Description
                  </label>
                  <textarea
                    value={formData.phase_description}
                    onChange={(e) => setFormData({...formData, phase_description: e.target.value})}
                    className="input-field w-full"
                    rows="3"
                    placeholder="Describe current phase activities"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    Funding Required
                  </label>
                  <input
                    type="number"
                    value={formData.funding_required}
                    onChange={(e) => setFormData({...formData, funding_required: e.target.value})}
                    className="input-field w-full"
                    placeholder="Enter funding amount"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    Expected Completion Date
                  </label>
                  <input
                    type="date"
                    value={formData.expected_completion_date}
                    onChange={(e) => setFormData({...formData, expected_completion_date: e.target.value})}
                    className="input-field w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    className="input-field w-full"
                    rows="3"
                    placeholder="Additional notes"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddPreIncubatee}
                  className="btn-primary"
                >
                  Add Pre-Incubatee
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Pre-Incubatee Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-secondary-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-secondary-900 dark:text-white">
                  Update Pre-Incubatee Progress
                </h2>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    resetForm();
                  }}
                  className="text-secondary-400 hover:text-secondary-600"
                >
                  <FiX size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    Current Phase
                  </label>
                  <select
                    value={formData.current_phase}
                    onChange={(e) => setFormData({...formData, current_phase: e.target.value})}
                    className="input-field w-full"
                  >
                    <option value="research">Research</option>
                    <option value="development">Development</option>
                    <option value="testing">Testing</option>
                    <option value="market_validation">Market Validation</option>
                    <option value="scaling">Scaling</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    Progress Percentage
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.progress_percentage}
                    onChange={(e) => setFormData({...formData, progress_percentage: e.target.value})}
                    className="input-field w-full"
                    placeholder="Enter progress percentage"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="input-field w-full"
                  >
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="paused">Paused</option>
                    <option value="terminated">Terminated</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    Funding Received
                  </label>
                  <input
                    type="number"
                    value={formData.funding_received}
                    onChange={(e) => setFormData({...formData, funding_received: e.target.value})}
                    className="input-field w-full"
                    placeholder="Enter funding received"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    className="input-field w-full"
                    rows="3"
                    placeholder="Update notes"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    resetForm();
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdatePreIncubatee}
                  className="btn-primary"
                >
                  Update Progress
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Pre-Incubatee Modal */}
      {showViewModal && selectedPreIncubatee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-secondary-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-secondary-900 dark:text-white">
                  Pre-Incubatee Details
                </h2>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-secondary-400 hover:text-secondary-600"
                >
                  <FiX size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-secondary-900 dark:text-white mb-2">
                    {selectedPreIncubatee.idea?.title}
                  </h3>
                  <p className="text-secondary-600 dark:text-secondary-400">
                    {selectedPreIncubatee.idea?.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300">
                      Student
                    </label>
                    <p className="text-secondary-900 dark:text-white">
                      {selectedPreIncubatee.student?.name}
                    </p>
                    <p className="text-secondary-500 dark:text-secondary-400">
                      {selectedPreIncubatee.student?.email}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300">
                      College
                    </label>
                    <p className="text-secondary-900 dark:text-white">
                      {selectedPreIncubatee.college?.name}
                    </p>
                    <p className="text-secondary-500 dark:text-secondary-400">
                      {selectedPreIncubatee.college?.city}, {selectedPreIncubatee.college?.state}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300">
                      Current Phase
                    </label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPhaseColor(selectedPreIncubatee.current_phase)}`}>
                      {selectedPreIncubatee.current_phase.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300">
                      Status
                    </label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedPreIncubatee.status)}`}>
                      {selectedPreIncubatee.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    Progress
                  </label>
                  <div className="flex items-center">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mr-2">
                      <div 
                        className="bg-primary-600 h-3 rounded-full" 
                        style={{width: `${selectedPreIncubatee.progress_percentage}%`}}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-secondary-900 dark:text-white">
                      {selectedPreIncubatee.progress_percentage}%
                    </span>
                  </div>
                </div>

                {selectedPreIncubatee.phase_description && (
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300">
                      Phase Description
                    </label>
                    <p className="text-secondary-900 dark:text-white">
                      {selectedPreIncubatee.phase_description}
                    </p>
                  </div>
                )}

                {selectedPreIncubatee.notes && (
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300">
                      Notes
                    </label>
                    <p className="text-secondary-900 dark:text-white">
                      {selectedPreIncubatee.notes}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-secondary-50 dark:bg-secondary-700 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-secondary-900 dark:text-white">
                      ₹{selectedPreIncubatee.funding_received?.toLocaleString() || 0}
                    </div>
                    <div className="text-sm text-secondary-600 dark:text-secondary-400">
                      Funding Received
                    </div>
                  </div>
                  <div className="bg-secondary-50 dark:bg-secondary-700 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-secondary-900 dark:text-white">
                      ₹{selectedPreIncubatee.funding_required?.toLocaleString() || 0}
                    </div>
                    <div className="text-sm text-secondary-600 dark:text-secondary-400">
                      Funding Required
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="btn-secondary"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Idea Modal */}
      {showIdeaDetailModal && selectedIdea && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-secondary-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-secondary-900 dark:text-white">
                  Idea Details & Incubation Status
                </h2>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => generatePDF(selectedIdea)}
                    className="btn-secondary flex items-center space-x-2"
                  >
                    <FiDownload size={16} />
                    <span>Export PDF</span>
                  </button>
                  <button
                    onClick={() => setShowIdeaDetailModal(false)}
                    className="text-secondary-400 hover:text-secondary-600"
                  >
                    <FiX size={24} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Idea Information */}
                <div className="space-y-6">
                  {/* Idea Details */}
                  <div className="bg-secondary-50 dark:bg-secondary-700 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4 flex items-center">
                      <FiFileText className="mr-2" />
                      Idea Information
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300">
                          Title
                        </label>
                        <p className="text-secondary-900 dark:text-white font-medium">
                          {selectedIdea.idea?.title}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300">
                          Description
                        </label>
                        <p className="text-secondary-900 dark:text-white">
                          {selectedIdea.idea?.description}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300">
                            Category
                          </label>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200`}>
                            {selectedIdea.idea?.category}
                          </span>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300">
                            Status
                          </label>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedIdea.idea?.status)}`}>
                            {selectedIdea.idea?.status?.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Student Information */}
                  <div className="bg-secondary-50 dark:bg-secondary-700 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4 flex items-center">
                      <FiUser className="mr-2" />
                      Student Information
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300">
                          Name
                        </label>
                        <p className="text-secondary-900 dark:text-white">
                          {selectedIdea.student?.name}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300">
                            Email
                          </label>
                          <p className="text-secondary-900 dark:text-white flex items-center">
                            <FiMail size={14} className="mr-1" />
                            {selectedIdea.student?.email}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300">
                            Phone
                          </label>
                          <p className="text-secondary-900 dark:text-white flex items-center">
                            <FiPhone size={14} className="mr-1" />
                            {selectedIdea.student?.phone || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* College Information */}
                  <div className="bg-secondary-50 dark:bg-secondary-700 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4 flex items-center">
                      <FiMapPin className="mr-2" />
                      College Information
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300">
                          College Name
                        </label>
                        <p className="text-secondary-900 dark:text-white">
                          {selectedIdea.college?.name}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300">
                          Location
                        </label>
                        <p className="text-secondary-900 dark:text-white">
                          {selectedIdea.college?.city}, {selectedIdea.college?.state}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Incubation & Mentor Information */}
                <div className="space-y-6">
                  {/* Mentor Information */}
                  {selectedIdea.mentor && (
                    <div className="bg-secondary-50 dark:bg-secondary-700 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4 flex items-center">
                        <FiUserCheck className="mr-2" />
                        Mentor Information
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300">
                            Name
                          </label>
                          <p className="text-secondary-900 dark:text-white">
                            {selectedIdea.mentor?.name}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300">
                            Email
                          </label>
                          <p className="text-secondary-900 dark:text-white flex items-center">
                            <FiMail size={14} className="mr-1" />
                            {selectedIdea.mentor?.email}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300">
                            Specialization
                          </label>
                          <p className="text-secondary-900 dark:text-white">
                            {selectedIdea.mentor?.specialization}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300">
                            Assignment Date
                          </label>
                          <p className="text-secondary-900 dark:text-white flex items-center">
                            <FiCalendar size={14} className="mr-1" />
                            {selectedIdea.mentor_assigned_date ? new Date(selectedIdea.mentor_assigned_date).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Incubation Status */}
                  <div className="bg-secondary-50 dark:bg-secondary-700 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4 flex items-center">
                      <FiAward className="mr-2" />
                      Incubation Status
                    </h3>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300">
                            Current Phase
                          </label>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPhaseColor(selectedIdea.current_phase)}`}>
                            {selectedIdea.current_phase?.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300">
                            Status
                          </label>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedIdea.status)}`}>
                            {selectedIdea.status?.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                          Progress
                        </label>
                        <div className="flex items-center">
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mr-2">
                            <div 
                              className="bg-primary-600 h-3 rounded-full" 
                              style={{width: `${selectedIdea.progress_percentage}%`}}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-secondary-900 dark:text-white">
                            {selectedIdea.progress_percentage}%
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300">
                          Incubator Decision
                        </label>
                        <div className="flex items-center space-x-2 mt-1">
                          {selectedIdea.incubator_status === 'endorsed' ? (
                            <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200">
                              <FiCheck size={12} className="mr-1" />
                              ENDORSED
                            </span>
                          ) : selectedIdea.incubator_status === 'rejected' ? (
                            <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200">
                              <FiXCircle size={12} className="mr-1" />
                              REJECTED
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200">
                              <FiClock size={12} className="mr-1" />
                              PENDING
                            </span>
                          )}
                        </div>
                        {selectedIdea.incubator_decision_date && (
                          <p className="text-sm text-secondary-500 dark:text-secondary-400 mt-1">
                            Decision Date: {new Date(selectedIdea.incubator_decision_date).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Funding Information */}
                  <div className="bg-secondary-50 dark:bg-secondary-700 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4 flex items-center">
                      <FiDollarSign className="mr-1" />
                      Funding Information
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300">
                          Required
                        </label>
                        <p className="text-lg font-bold text-secondary-900 dark:text-white">
                          ₹{selectedIdea.funding_required?.toLocaleString() || 0}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300">
                          Received
                        </label>
                        <p className="text-lg font-bold text-secondary-900 dark:text-white">
                          ₹{selectedIdea.funding_received?.toLocaleString() || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes Section */}
              {selectedIdea.notes && (
                <div className="mt-6 bg-secondary-50 dark:bg-secondary-700 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-2">
                    Notes
                  </h3>
                  <p className="text-secondary-900 dark:text-white">
                    {selectedIdea.notes}
                  </p>
                </div>
              )}

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowIdeaDetailModal(false)}
                  className="btn-secondary"
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

export default PreIncubateesTracker;
