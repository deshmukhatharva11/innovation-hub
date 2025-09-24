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
  FiServer
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const AuditTrail = () => {
  const { user } = useSelector(state => state.auth);
  const [auditLogs, setAuditLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAction, setSelectedAction] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [selectedLog, setSelectedLog] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const actionTypes = [
    'LOGIN',
    'LOGOUT',
    'IDEA_SUBMIT',
    'IDEA_UPDATE',
    'IDEA_DELETE',
    'IDEA_EVALUATE',
    'IDEA_FORWARD',
    'IDEA_REJECT',
    'USER_CREATE',
    'USER_UPDATE',
    'USER_DELETE',
    'COLLEGE_REGISTER',
    'COLLEGE_UPDATE',
    'MENTOR_ADD',
    'MENTOR_UPDATE',
    'EVENT_CREATE',
    'EVENT_UPDATE',
    'DOCUMENT_UPLOAD',
    'DOCUMENT_DOWNLOAD',
    'REPORT_GENERATE',
    'SETTINGS_UPDATE',
    'PASSWORD_CHANGE',
    'PROFILE_UPDATE'
  ];

  useEffect(() => {
    loadAuditLogs();
  }, []);

  useEffect(() => {
    filterLogs();
  }, [auditLogs, searchTerm, selectedAction, selectedUser, dateRange]);

  const loadAuditLogs = () => {
    // Mock data - in real app, this would come from API
    const mockLogs = [
      {
        id: 1,
        userId: 'user_001',
        userName: 'Rajesh Kumar',
        userRole: 'college_admin',
        action: 'IDEA_EVALUATE',
        resourceType: 'idea',
        resourceId: 'idea_123',
        resourceName: 'Smart Campus Management System',
        description: 'Evaluated idea with rating 4.5/5 and recommendation: Forward',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        timestamp: '2024-01-25T10:30:00Z',
        status: 'SUCCESS',
        metadata: {
          rating: 4.5,
          recommendation: 'Forward',
          comments: 'Excellent technical feasibility and market potential',
          evaluationTime: '15 minutes'
        }
      },
      {
        id: 2,
        userId: 'user_002',
        userName: 'Priya Sharma',
        userRole: 'student',
        action: 'IDEA_SUBMIT',
        resourceType: 'idea',
        resourceId: 'idea_124',
        resourceName: 'AI-Powered Agricultural Monitoring',
        description: 'Submitted new idea for evaluation',
        ipAddress: '192.168.1.101',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        timestamp: '2024-01-25T09:15:00Z',
        status: 'SUCCESS',
        metadata: {
          category: 'Agriculture Technology',
          innovationLevel: 'High',
          estimatedBudget: '₹50,000',
          teamSize: 3
        }
      },
      {
        id: 3,
        userId: 'user_003',
        userName: 'Dr. Amit Patel',
        userRole: 'incubator_manager',
        action: 'MENTOR_ADD',
        resourceType: 'mentor',
        resourceId: 'mentor_045',
        resourceName: 'Dr. Sneha Mehta',
        description: 'Added new mentor to database',
        ipAddress: '192.168.1.102',
        userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
        timestamp: '2024-01-25T08:45:00Z',
        status: 'SUCCESS',
        metadata: {
          specialization: 'Business Development',
          experience: '12 years',
          organization: 'TechCorp Solutions',
          rating: 4.6
        }
      },
      {
        id: 4,
        userId: 'user_001',
        userName: 'Rajesh Kumar',
        userRole: 'college_admin',
        action: 'EVENT_CREATE',
        resourceType: 'event',
        resourceId: 'event_078',
        resourceName: 'Innovation Workshop 2024',
        description: 'Created new event: Innovation Workshop 2024',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        timestamp: '2024-01-24T16:20:00Z',
        status: 'SUCCESS',
        metadata: {
          eventType: 'Workshop',
          date: '2024-02-15',
          maxParticipants: 50,
          location: 'SGBAU Main Campus'
        }
      },
      {
        id: 5,
        userId: 'user_004',
        userName: 'Super Admin',
        userRole: 'admin',
        action: 'COLLEGE_REGISTER',
        resourceType: 'college',
        resourceId: 'college_089',
        resourceName: 'Government Polytechnic, Washim',
        description: 'Registered new college in the system',
        ipAddress: '192.168.1.103',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        timestamp: '2024-01-24T14:30:00Z',
        status: 'SUCCESS',
        metadata: {
          district: 'Washim',
          establishedYear: 1985,
          contactEmail: 'principal@gpwashim.ac.in',
          contactPhone: '+91-7252-123456'
        }
      },
      {
        id: 6,
        userId: 'user_002',
        userName: 'Priya Sharma',
        userRole: 'student',
        action: 'LOGIN',
        resourceType: 'auth',
        resourceId: null,
        resourceName: null,
        description: 'User logged into the system',
        ipAddress: '192.168.1.101',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        timestamp: '2024-01-24T09:00:00Z',
        status: 'SUCCESS',
        metadata: {
          loginMethod: 'email',
          sessionDuration: '2 hours 30 minutes'
        }
      },
      {
        id: 7,
        userId: 'user_005',
        userName: 'Vikram Kulkarni',
        userRole: 'student',
        action: 'DOCUMENT_UPLOAD',
        resourceType: 'document',
        resourceId: 'doc_156',
        resourceName: 'Business Plan - HealthCare AI.pdf',
        description: 'Uploaded document: Business Plan - HealthCare AI.pdf',
        ipAddress: '192.168.1.104',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        timestamp: '2024-01-23T15:45:00Z',
        status: 'SUCCESS',
        metadata: {
          fileSize: '2.3 MB',
          fileType: 'PDF',
          ideaId: 'idea_122'
        }
      },
      {
        id: 8,
        userId: 'user_003',
        userName: 'Dr. Amit Patel',
        userRole: 'incubator_manager',
        action: 'REPORT_GENERATE',
        resourceType: 'report',
        resourceId: 'report_034',
        resourceName: 'Quarterly Progress Report Q4 2023',
        description: 'Generated quarterly progress report',
        ipAddress: '192.168.1.102',
        userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
        timestamp: '2024-01-23T11:20:00Z',
        status: 'SUCCESS',
        metadata: {
          reportType: 'Quarterly',
          period: 'Q4 2023',
          fileSize: '2.3 MB',
          downloadCount: 0
        }
      },
      {
        id: 9,
        userId: 'user_001',
        userName: 'Rajesh Kumar',
        userRole: 'college_admin',
        action: 'IDEA_REJECT',
        resourceType: 'idea',
        resourceId: 'idea_120',
        resourceName: 'Mobile Game Development',
        description: 'Rejected idea due to insufficient market research',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        timestamp: '2024-01-22T16:15:00Z',
        status: 'SUCCESS',
        metadata: {
          rating: 2.5,
          recommendation: 'Reject',
          reason: 'Insufficient market research and unclear business model',
          evaluationTime: '20 minutes'
        }
      },
      {
        id: 10,
        userId: 'user_006',
        userName: 'Unknown User',
        userRole: 'unknown',
        action: 'LOGIN',
        resourceType: 'auth',
        resourceId: null,
        resourceName: null,
        description: 'Failed login attempt with invalid credentials',
        ipAddress: '192.168.1.200',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        timestamp: '2024-01-22T14:30:00Z',
        status: 'FAILED',
        metadata: {
          loginMethod: 'email',
          failureReason: 'Invalid password',
          attemptsCount: 3
        }
      }
    ];
    setAuditLogs(mockLogs);
  };

  const filterLogs = () => {
    let filtered = auditLogs;

    if (searchTerm) {
      filtered = filtered.filter(log =>
        log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.resourceName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedAction) {
      filtered = filtered.filter(log => log.action === selectedAction);
    }

    if (selectedUser) {
      filtered = filtered.filter(log => log.userId === selectedUser);
    }

    if (dateRange.startDate) {
      filtered = filtered.filter(log => new Date(log.timestamp) >= new Date(dateRange.startDate));
    }

    if (dateRange.endDate) {
      filtered = filtered.filter(log => new Date(log.timestamp) <= new Date(dateRange.endDate + 'T23:59:59Z'));
    }

    setFilteredLogs(filtered);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'SUCCESS': return <FiCheckCircle className="text-green-500" />;
      case 'FAILED': return <FiXCircle className="text-red-500" />;
      case 'WARNING': return <FiAlertCircle className="text-yellow-500" />;
      default: return <FiActivity className="text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'SUCCESS': return 'bg-green-100 text-green-800';
      case 'FAILED': return 'bg-red-100 text-red-800';
      case 'WARNING': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionColor = (action) => {
    if (action.includes('LOGIN') || action.includes('LOGOUT')) return 'text-blue-600';
    if (action.includes('IDEA')) return 'text-green-600';
    if (action.includes('USER') || action.includes('COLLEGE')) return 'text-purple-600';
    if (action.includes('MENTOR') || action.includes('EVENT')) return 'text-orange-600';
    if (action.includes('DOCUMENT') || action.includes('REPORT')) return 'text-indigo-600';
    return 'text-gray-600';
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const exportLogs = () => {
    const csvContent = [
      ['Timestamp', 'User', 'Role', 'Action', 'Resource', 'Description', 'Status', 'IP Address'],
      ...filteredLogs.map(log => [
        formatDate(log.timestamp),
        log.userName,
        log.userRole,
        log.action,
        log.resourceName || 'N/A',
        log.description,
        log.status,
        log.ipAddress
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-trail-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const viewLogDetails = (log) => {
    setSelectedLog(log);
    setShowDetails(true);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Audit Trail</h1>
        <p className="text-gray-600">Comprehensive logging of all user activities and system events</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Actions</option>
            {actionTypes.map(action => (
              <option key={action} value={action}>{action.replace(/_/g, ' ')}</option>
            ))}
          </select>
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Users</option>
            {[...new Set(auditLogs.map(log => log.userId))].map(userId => {
              const user = auditLogs.find(log => log.userId === userId);
              return (
                <option key={userId} value={userId}>{user.userName}</option>
              );
            })}
          </select>
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Start Date"
          />
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="End Date"
          />
        </div>
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-gray-600">
            Showing {filteredLogs.length} of {auditLogs.length} logs
          </div>
          <button
            onClick={exportLogs}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <FiDownload className="mr-2" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
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
                  Resource
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
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
                      <FiClock className="mr-2 text-gray-400" />
                      {formatDate(log.timestamp)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FiUser className="mr-2 text-gray-400" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{log.userName}</div>
                        <div className="text-sm text-gray-500">{log.userRole}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-medium ${getActionColor(log.action)}`}>
                      {log.action.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {log.resourceName ? (
                      <div>
                        <div className="font-medium">{log.resourceName}</div>
                        <div className="text-gray-500 text-xs">{log.resourceType}</div>
                      </div>
                    ) : (
                      <span className="text-gray-400">N/A</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                    {log.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(log.status)}`}>
                      {getStatusIcon(log.status)}
                      <span className="ml-1">{log.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => viewLogDetails(log)}
                      className="text-blue-600 hover:text-blue-900 flex items-center"
                    >
                      <FiEye className="mr-1" />
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Details Modal */}
      {showDetails && selectedLog && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Audit Log Details</h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiXCircle className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Timestamp</label>
                  <p className="text-sm text-gray-900">{formatDate(selectedLog.timestamp)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">User</label>
                  <p className="text-sm text-gray-900">{selectedLog.userName} ({selectedLog.userRole})</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Action</label>
                  <p className="text-sm text-gray-900">{selectedLog.action.replace(/_/g, ' ')}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedLog.status)}`}>
                    {getStatusIcon(selectedLog.status)}
                    <span className="ml-1">{selectedLog.status}</span>
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">IP Address</label>
                  <p className="text-sm text-gray-900">{selectedLog.ipAddress}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Resource</label>
                  <p className="text-sm text-gray-900">{selectedLog.resourceName || 'N/A'}</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <p className="text-sm text-gray-900">{selectedLog.description}</p>
              </div>
              
              {selectedLog.metadata && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Additional Information</label>
                  <pre className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg overflow-auto">
                    {JSON.stringify(selectedLog.metadata, null, 2)}
                  </pre>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700">User Agent</label>
                <p className="text-sm text-gray-900 break-all">{selectedLog.userAgent}</p>
              </div>
            </div>
            
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowDetails(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {filteredLogs.length === 0 && (
        <div className="text-center py-8">
          <FiActivity className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No audit logs found</h3>
          <p className="mt-1 text-sm text-gray-500">Try adjusting your search criteria</p>
        </div>
      )}
    </div>
  );
};

export default AuditTrail;
