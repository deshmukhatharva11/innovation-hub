import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { 
  FiActivity, 
  FiUser, 
  FiClock, 
  FiSearch, 
  FiFilter, 
  FiDownload, 
  FiEye, 
  FiAlertCircle, 
  FiCheckCircle, 
  FiXCircle,
  FiRefreshCw,
  FiTrendingUp,
  FiTrendingDown,
  FiShield,
  FiDatabase,
  FiBarChart3,
  FiCalendar,
  FiUsers,
  FiZap,
  FiAlertTriangle,
  FiInfo,
  FiExternalLink,
  FiChevronDown,
  FiChevronUp,
  FiMoreVertical,
  FiSettings,
  FiFileText,
  FiGlobe,
  FiServer,
  FiTarget,
  FiLock,
  FiUnlock,
  FiMail,
  FiPhone,
  FiMessageSquare,
  FiEdit3,
  FiTrash2,
  FiPlus,
  FiMinus,
  FiArrowRight,
  FiArrowLeft,
  FiPlay,
  FiPause,
  FiStop
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const EnhancedAuditTrail = () => {
  const { user } = useSelector(state => state.auth);
  const [auditLogs, setAuditLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAction, setSelectedAction] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [selectedLog, setSelectedLog] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0
  });
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [isSensitive, setIsSensitive] = useState(null);
  const [availableActions, setAvailableActions] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [availableStatuses, setAvailableStatuses] = useState([]);
  const [availableSeverities, setAvailableSeverities] = useState([]);

  const actionIcons = {
    'LOGIN': FiLock,
    'LOGOUT': FiUnlock,
    'OTP_REQUEST': FiPhone,
    'OTP_VERIFY': FiCheckCircle,
    'PASSWORD_RESET': FiRefreshCw,
    'PASSWORD_CHANGE': FiShield,
    'IDEA_SUBMIT': FiPlus,
    'IDEA_UPDATE': FiEdit3,
    'IDEA_DELETE': FiTrash2,
    'IDEA_EVALUATE': FiTarget,
    'USER_CREATE': FiUser,
    'USER_UPDATE': FiEdit3,
    'USER_DELETE': FiTrash2,
    'COLLEGE_REGISTER': FiGlobe,
    'MENTOR_ADD': FiUsers,
    'EVENT_CREATE': FiCalendar,
    'DOCUMENT_UPLOAD': FiFileText,
    'DOCUMENT_DOWNLOAD': FiDownload,
    'REPORT_GENERATE': FiBarChart3,
    'CHAT_MESSAGE': FiMessageSquare,
    'API_ACCESS': FiServer,
    'ERROR': FiAlertCircle,
    'AUDIT_ACCESS': FiEye,
    'SETTINGS_UPDATE': FiSettings
  };

  const severityColors = {
    'LOW': 'text-gray-600 bg-gray-100',
    'MEDIUM': 'text-yellow-600 bg-yellow-100',
    'HIGH': 'text-orange-600 bg-orange-100',
    'CRITICAL': 'text-red-600 bg-red-100'
  };

  const statusColors = {
    'SUCCESS': 'text-green-600 bg-green-100',
    'FAILED': 'text-red-600 bg-red-100',
    'PENDING': 'text-yellow-600 bg-yellow-100',
    'CANCELLED': 'text-gray-600 bg-gray-100'
  };

  const categoryColors = {
    'AUTHENTICATION': 'text-blue-600 bg-blue-100',
    'AUTHORIZATION': 'text-purple-600 bg-purple-100',
    'IDEA_MANAGEMENT': 'text-green-600 bg-green-100',
    'USER_MANAGEMENT': 'text-indigo-600 bg-indigo-100',
    'COLLEGE_MANAGEMENT': 'text-pink-600 bg-pink-100',
    'INCUBATOR_MANAGEMENT': 'text-cyan-600 bg-cyan-100',
    'MENTOR_MANAGEMENT': 'text-orange-600 bg-orange-100',
    'EVENT_MANAGEMENT': 'text-teal-600 bg-teal-100',
    'DOCUMENT_MANAGEMENT': 'text-amber-600 bg-amber-100',
    'REPORT_GENERATION': 'text-violet-600 bg-violet-100',
    'SYSTEM_CONFIGURATION': 'text-slate-600 bg-slate-100',
    'COMMUNICATION': 'text-emerald-600 bg-emerald-100',
    'WORKFLOW': 'text-rose-600 bg-rose-100',
    'SECURITY': 'text-red-600 bg-red-100',
    'ADMINISTRATION': 'text-gray-600 bg-gray-100',
    'NOTIFICATION': 'text-yellow-600 bg-yellow-100',
    'FILE_OPERATION': 'text-blue-600 bg-blue-100',
    'API_ACCESS': 'text-indigo-600 bg-indigo-100',
    'ERROR': 'text-red-600 bg-red-100',
    'OTHER': 'text-gray-600 bg-gray-100'
  };

  useEffect(() => {
    loadAuditLogs();
    loadAvailableOptions();
    loadStats();
  }, [pagination.page, pagination.limit, sortBy, sortOrder]);

  useEffect(() => {
    filterLogs();
  }, [auditLogs, searchTerm, selectedAction, selectedCategory, selectedUser, selectedStatus, selectedSeverity, dateRange, isSensitive]);

  const loadAuditLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        sort_by: sortBy,
        sort_order: sortOrder,
        ...(searchTerm && { search: searchTerm }),
        ...(selectedAction && { action: selectedAction }),
        ...(selectedCategory && { action_category: selectedCategory }),
        ...(selectedUser && { user_id: selectedUser }),
        ...(selectedStatus && { status: selectedStatus }),
        ...(selectedSeverity && { severity: selectedSeverity }),
        ...(dateRange.startDate && { start_date: dateRange.startDate }),
        ...(dateRange.endDate && { end_date: dateRange.endDate }),
        ...(isSensitive !== null && { is_sensitive: isSensitive })
      });

      const response = await fetch(`/api/admin/audit/logs?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch audit logs');
      }

      const data = await response.json();
      setAuditLogs(data.data.logs || []);
      setPagination(prev => ({
        ...prev,
        total: data.data.pagination.total,
        totalPages: data.data.pagination.totalPages
      }));
    } catch (error) {
      console.error('Error loading audit logs:', error);
      toast.error('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableOptions = async () => {
    try {
      const response = await fetch('/api/admin/audit/actions', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAvailableActions(data.data.actions || []);
        setAvailableCategories(data.data.categories || []);
        setAvailableStatuses(data.data.statuses || []);
        setAvailableSeverities(data.data.severities || []);
      }
    } catch (error) {
      console.error('Error loading available options:', error);
    }
  };

  const loadStats = async () => {
    try {
      const params = new URLSearchParams();
      if (dateRange.startDate) params.append('start_date', dateRange.startDate);
      if (dateRange.endDate) params.append('end_date', dateRange.endDate);

      const response = await fetch(`/api/admin/audit/stats?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const filterLogs = () => {
    let filtered = [...auditLogs];

    if (searchTerm) {
      filtered = filtered.filter(log => 
        log.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.resource_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredLogs(filtered);
  };

  const handleExport = async (format = 'csv') => {
    try {
      const params = new URLSearchParams({
        format,
        ...(dateRange.startDate && { start_date: dateRange.startDate }),
        ...(dateRange.endDate && { end_date: dateRange.endDate })
      });

      const response = await fetch(`/api/admin/audit/export?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.${format}`;
        a.click();
        window.URL.revokeObjectURL(url);
        toast.success(`Audit logs exported as ${format.toUpperCase()}`);
      } else {
        throw new Error('Export failed');
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export audit logs');
    }
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getActionIcon = (action) => {
    const Icon = actionIcons[action] || FiActivity;
    return <Icon className="w-4 h-4" />;
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedAction('');
    setSelectedCategory('');
    setSelectedUser('');
    setSelectedStatus('');
    setSelectedSeverity('');
    setDateRange({ startDate: '', endDate: '' });
    setIsSensitive(null);
  };

  if (loading && auditLogs.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FiDatabase className="w-8 h-8 text-blue-600" />
            Enhanced Audit Trail
          </h1>
          <p className="text-gray-600 mt-1">Comprehensive logging of all user activities and system events</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowStats(!showStats)}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
              showStats ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <FiBarChart3 className="w-4 h-4" />
            {showStats ? 'Hide Stats' : 'Show Stats'}
          </button>
          
          <button
            onClick={() => loadAuditLogs()}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2"
          >
            <FiRefreshCw className="w-4 h-4" />
            Refresh
          </button>
          
          <div className="flex gap-2">
            <button
              onClick={() => handleExport('csv')}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <FiDownload className="w-4 h-4" />
              Export CSV
            </button>
            <button
              onClick={() => handleExport('json')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <FiDownload className="w-4 h-4" />
              Export JSON
            </button>
          </div>
        </div>
      </div>

      {/* Stats Panel */}
      {showStats && stats && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FiBarChart3 className="w-5 h-5" />
            Audit Statistics
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{stats.summary?.totalLogs || 0}</div>
              <div className="text-sm text-gray-600">Total Logs</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{stats.summary?.uniqueUsers || 0}</div>
              <div className="text-sm text-gray-600">Unique Users</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">{stats.summary?.criticalActions || 0}</div>
              <div className="text-sm text-gray-600">Critical Actions</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">{stats.summary?.failedActions || 0}</div>
              <div className="text-sm text-gray-600">Failed Actions</div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FiFilter className="w-5 h-5" />
            Filters & Search
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1"
            >
              {showFilters ? <FiChevronUp className="w-4 h-4" /> : <FiChevronDown className="w-4 h-4" />}
              {showFilters ? 'Hide' : 'Show'} Filters
            </button>
            <button
              onClick={clearFilters}
              className="px-3 py-1 text-sm text-red-600 hover:text-red-800 flex items-center gap-1"
            >
              <FiXCircle className="w-4 h-4" />
              Clear All
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="mb-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search logs, users, actions, descriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
              <select
                value={selectedAction}
                onChange={(e) => setSelectedAction(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Actions</option>
                {availableActions.map(action => (
                  <option key={action} value={action}>{action.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                {availableCategories.map(category => (
                  <option key={category} value={category}>{category.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Statuses</option>
                {availableStatuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
              <select
                value={selectedSeverity}
                onChange={(e) => setSelectedSeverity(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Severities</option>
                {availableSeverities.map(severity => (
                  <option key={severity} value={severity}>{severity}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sensitive Data</label>
              <select
                value={isSensitive === null ? '' : isSensitive.toString()}
                onChange={(e) => setIsSensitive(e.target.value === '' ? null : e.target.value === 'true')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All</option>
                <option value="true">Sensitive Only</option>
                <option value="false">Non-Sensitive Only</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="created_at">Timestamp</option>
                <option value="action">Action</option>
                <option value="user_name">User</option>
                <option value="severity">Severity</option>
                <option value="status">Status</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <div>
          Showing {filteredLogs.length} of {pagination.total} logs
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span>Sort:</span>
            <button
              onClick={() => setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC')}
              className="flex items-center gap-1 px-2 py-1 border border-gray-300 rounded hover:bg-gray-50"
            >
              {sortOrder === 'ASC' ? <FiTrendingUp className="w-4 h-4" /> : <FiTrendingDown className="w-4 h-4" />}
              {sortOrder}
            </button>
          </div>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Resource
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Severity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <FiClock className="mr-2 text-gray-400 w-4 h-4" />
                      {formatDate(log.created_at)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FiUser className="mr-2 text-gray-400 w-4 h-4" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {log.user_name || 'System'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {log.user_role || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getActionIcon(log.action)}
                      <span className="ml-2 text-sm font-medium text-gray-900">
                        {log.action.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${categoryColors[log.action_category] || 'text-gray-600 bg-gray-100'}`}>
                      {log.action_category?.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {log.resource_name ? (
                      <div>
                        <div className="font-medium">{log.resource_name}</div>
                        <div className="text-gray-500 text-xs">{log.resource_type}</div>
                      </div>
                    ) : (
                      <span className="text-gray-400">N/A</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                    {log.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[log.status] || 'text-gray-600 bg-gray-100'}`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${severityColors[log.severity] || 'text-gray-600 bg-gray-100'}`}>
                      {log.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => {
                        setSelectedLog(log);
                        setShowDetails(true);
                      }}
                      className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                      title="View Details"
                    >
                      <FiEye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredLogs.length === 0 && (
          <div className="text-center py-12">
            <FiDatabase className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No audit logs found</h3>
            <p className="text-gray-600">Try adjusting your filters or search terms</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Page {pagination.page} of {pagination.totalPages}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
              disabled={pagination.page === 1}
              className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              <FiArrowLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
              disabled={pagination.page === pagination.totalPages}
              className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              <FiArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Log Details Modal */}
      {showDetails && selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Audit Log Details</h3>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FiXCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Timestamp</label>
                    <p className="text-sm text-gray-900">{formatDate(selectedLog.created_at)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">User</label>
                    <p className="text-sm text-gray-900">{selectedLog.user_name || 'System'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Action</label>
                    <p className="text-sm text-gray-900">{selectedLog.action}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Category</label>
                    <p className="text-sm text-gray-900">{selectedLog.action_category}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[selectedLog.status] || 'text-gray-600 bg-gray-100'}`}>
                      {selectedLog.status}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Severity</label>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${severityColors[selectedLog.severity] || 'text-gray-600 bg-gray-100'}`}>
                      {selectedLog.severity}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <p className="text-sm text-gray-900">{selectedLog.description}</p>
                </div>

                {selectedLog.resource_name && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Resource</label>
                    <p className="text-sm text-gray-900">{selectedLog.resource_name} ({selectedLog.resource_type})</p>
                  </div>
                )}

                {selectedLog.ip_address && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">IP Address</label>
                    <p className="text-sm text-gray-900">{selectedLog.ip_address}</p>
                  </div>
                )}

                {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Metadata</label>
                    <pre className="text-xs text-gray-900 bg-gray-100 p-2 rounded overflow-x-auto">
                      {JSON.stringify(selectedLog.metadata, null, 2)}
                    </pre>
                  </div>
                )}

                {selectedLog.error_message && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Error Message</label>
                    <p className="text-sm text-red-600">{selectedLog.error_message}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedAuditTrail;
