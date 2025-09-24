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
  FiXCircle,
  FiRocket,
  FiZap,
  FiStar,
  FiFlag,
  FiPieChart,
  FiLineChart,
  FiTrendingDown,
  FiAlertCircle,
  FiInfo,
  FiBookOpen,
  FiShield,
  FiLayers,
  FiGrid,
  FiList,
  FiSettings
} from 'react-icons/fi';
import { preIncubateesAPI } from '../../services/api';

const EnhancedPreIncubationTracker = () => {
  const { user } = useSelector((state) => state.auth);
  const [preIncubatees, setPreIncubatees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [selectedPreIncubatee, setSelectedPreIncubatee] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [phaseFilter, setPhaseFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // grid, list, kanban
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [analytics, setAnalytics] = useState({
    total: 0,
    byStatus: {},
    byPhase: {},
    successRate: 0,
    avgProgress: 0,
    monthlyTrends: []
  });

  const phases = [
    { id: 'ideation', name: 'Ideation', color: 'blue', description: 'Initial idea development and validation' },
    { id: 'prototyping', name: 'Prototyping', color: 'yellow', description: 'Building and testing prototypes' },
    { id: 'market_validation', name: 'Market Validation', color: 'green', description: 'Testing market fit and customer needs' },
    { id: 'business_planning', name: 'Business Planning', color: 'purple', description: 'Developing comprehensive business plans' },
    { id: 'funding', name: 'Funding', color: 'orange', description: 'Securing investment and funding' },
    { id: 'launch', name: 'Launch', color: 'red', description: 'Market launch and scaling' }
  ];

  const statuses = [
    { id: 'active', name: 'Active', color: 'green', description: 'Currently in progress' },
    { id: 'completed', name: 'Completed', color: 'blue', description: 'Successfully completed' },
    { id: 'paused', name: 'Paused', color: 'yellow', description: 'Temporarily paused' },
    { id: 'cancelled', name: 'Cancelled', color: 'red', description: 'Project cancelled' }
  ];

  useEffect(() => {
    fetchPreIncubatees();
    fetchAnalytics();
  }, [statusFilter, phaseFilter, sortBy, sortOrder]);

  const fetchPreIncubatees = async () => {
    try {
      setLoading(true);
      const params = {
        status: statusFilter !== 'all' ? statusFilter : undefined,
        phase: phaseFilter !== 'all' ? phaseFilter : undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
        search: searchTerm || undefined
      };
      
      const response = await preIncubateesAPI.getAll(params);
      setPreIncubatees(response.data.data || []);
    } catch (error) {
      console.error('Error fetching pre-incubatees:', error);
      toast.error('Failed to load pre-incubatees');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await preIncubateesAPI.getAnalytics();
      setAnalytics(response.data.data || analytics);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    // Debounce search
    clearTimeout(window.searchTimeout);
    window.searchTimeout = setTimeout(() => {
      fetchPreIncubatees();
    }, 500);
  };

  const getPhaseColor = (phase) => {
    const phaseObj = phases.find(p => p.id === phase);
    return phaseObj ? phaseObj.color : 'gray';
  };

  const getStatusColor = (status) => {
    const statusObj = statuses.find(s => s.id === status);
    return statusObj ? statusObj.color : 'gray';
  };

  const getProgressPercentage = (preIncubatee) => {
    const phaseIndex = phases.findIndex(p => p.id === preIncubatee.current_phase);
    return Math.round(((phaseIndex + 1) / phases.length) * 100);
  };

  const exportToPDF = () => {
    // Implementation for PDF export
    toast.success('PDF export functionality will be implemented');
  };

  const exportToExcel = () => {
    // Implementation for Excel export
    toast.success('Excel export functionality will be implemented');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pre-Incubation Tracker</h1>
          <p className="text-gray-600">Monitor and manage pre-incubation projects</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            {viewMode === 'grid' ? <FiList className="w-4 h-4" /> : <FiGrid className="w-4 h-4" />}
            {viewMode === 'grid' ? 'List View' : 'Grid View'}
          </button>
          
          <button
            onClick={exportToPDF}
            className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <FiDownload className="w-4 h-4" />
            Export PDF
          </button>
          
          <button
            onClick={exportToExcel}
            className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <FiDownload className="w-4 h-4" />
            Export Excel
          </button>
          
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <FiPlus className="w-4 h-4" />
            Add Project
          </button>
        </div>
      </div>

      {/* Analytics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Projects</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.total}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <FiTarget className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.successRate}%</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <FiTrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Progress</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.avgProgress}%</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <FiBarChart3 className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Projects</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.byStatus.active || 0}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <FiActivity className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search projects, students, or ideas..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Statuses</option>
              {statuses.map(status => (
                <option key={status.id} value={status.id}>{status.name}</option>
              ))}
            </select>
            
            <select
              value={phaseFilter}
              onChange={(e) => setPhaseFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Phases</option>
              {phases.map(phase => (
                <option key={phase.id} value={phase.id}>{phase.name}</option>
              ))}
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="created_at">Created Date</option>
              <option value="updated_at">Updated Date</option>
              <option value="progress">Progress</option>
              <option value="name">Name</option>
            </select>
            
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              {sortOrder === 'asc' ? <FiTrendingUp className="w-4 h-4" /> : <FiTrendingDown className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Projects Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {preIncubatees.map((preIncubatee) => (
            <div
              key={preIncubatee.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {preIncubatee.project_name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {preIncubatee.student?.name || 'Unknown Student'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {preIncubatee.idea?.title || 'No idea linked'}
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedPreIncubatee(preIncubatee);
                      setShowViewModal(true);
                    }}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <FiEye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedPreIncubatee(preIncubatee);
                      setShowEditModal(true);
                    }}
                    className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg"
                  >
                    <FiEdit3 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">Progress</span>
                    <span className="text-sm text-gray-600">{getProgressPercentage(preIncubatee)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`bg-${getPhaseColor(preIncubatee.current_phase)}-600 h-2 rounded-full transition-all duration-300`}
                      style={{ width: `${getProgressPercentage(preIncubatee)}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full bg-${getPhaseColor(preIncubatee.current_phase)}-100 text-${getPhaseColor(preIncubatee.current_phase)}-800`}>
                    {phases.find(p => p.id === preIncubatee.current_phase)?.name || 'Unknown Phase'}
                  </span>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full bg-${getStatusColor(preIncubatee.status)}-100 text-${getStatusColor(preIncubatee.status)}-800`}>
                    {statuses.find(s => s.id === preIncubatee.status)?.name || 'Unknown Status'}
                  </span>
                </div>
                
                <div className="text-xs text-gray-500">
                  Started: {new Date(preIncubatee.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Project
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phase
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progress
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {preIncubatees.map((preIncubatee) => (
                  <tr key={preIncubatee.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {preIncubatee.project_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {preIncubatee.idea?.title || 'No idea linked'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {preIncubatee.student?.name || 'Unknown Student'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {preIncubatee.student?.email || 'No email'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full bg-${getPhaseColor(preIncubatee.current_phase)}-100 text-${getPhaseColor(preIncubatee.current_phase)}-800`}>
                        {phases.find(p => p.id === preIncubatee.current_phase)?.name || 'Unknown Phase'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full bg-${getStatusColor(preIncubatee.status)}-100 text-${getStatusColor(preIncubatee.status)}-800`}>
                        {statuses.find(s => s.id === preIncubatee.status)?.name || 'Unknown Status'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className={`bg-${getPhaseColor(preIncubatee.current_phase)}-600 h-2 rounded-full`}
                            style={{ width: `${getProgressPercentage(preIncubatee)}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">{getProgressPercentage(preIncubatee)}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedPreIncubatee(preIncubatee);
                            setShowViewModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <FiEye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedPreIncubatee(preIncubatee);
                            setShowEditModal(true);
                          }}
                          className="text-green-600 hover:text-green-900"
                        >
                          <FiEdit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedPreIncubatee(preIncubatee);
                            setShowProgressModal(true);
                          }}
                          className="text-purple-600 hover:text-purple-900"
                        >
                          <FiBarChart3 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {preIncubatees.length === 0 && (
        <div className="text-center py-12">
          <FiTarget className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No pre-incubation projects found</h3>
          <p className="text-gray-600 mb-4">Get started by adding your first pre-incubation project</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Add Project
          </button>
        </div>
      )}

      {/* Modals would go here - Add, Edit, View, Progress tracking */}
    </div>
  );
};

export default EnhancedPreIncubationTracker;
