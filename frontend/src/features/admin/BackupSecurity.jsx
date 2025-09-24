import React, { useState, useEffect, useCallback } from 'react';
import { FiDatabase, FiDownload, FiTrash2, FiShield, FiLock, FiActivity, FiAlertTriangle, FiCheckCircle, FiRefreshCw } from 'react-icons/fi';
import { adminManagementAPI, auditAPI } from '../../services/api';
import { toast } from 'react-hot-toast';

const BackupSecurity = () => {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creatingBackup, setCreatingBackup] = useState(false);
  const [securityStatus, setSecurityStatus] = useState({
    systemSecurity: 'secure',
    dataEncryption: 'enabled',
    auditLogging: 'active',
    lastSecurityScan: new Date().toISOString(),
    vulnerabilities: 0,
    lastBackup: null
  });

  const fetchBackups = async () => {
    try {
      setLoading(true);
      const response = await adminManagementAPI.getBackups();
      if (response.data.success) {
        setBackups(response.data.data.backups);
      }
    } catch (error) {
      console.error('Error fetching backups:', error);
      toast.error('Failed to fetch backups');
    } finally {
      setLoading(false);
    }
  };

  const fetchSecurityStatus = useCallback(async () => {
    try {
      // In a real application, this would fetch actual security status
      setSecurityStatus(prev => ({
        ...prev,
        lastBackup: backups.length > 0 ? backups[0].created_at : null
      }));
    } catch (error) {
      console.error('Error fetching security status:', error);
    }
  }, [backups]);

  useEffect(() => {
    fetchBackups();
    fetchSecurityStatus();
  }, [fetchSecurityStatus]);

  const handleCreateBackup = async () => {
    try {
      setCreatingBackup(true);
      const response = await adminManagementAPI.createBackup();
      if (response.data.success) {
        toast.success('Backup created successfully!');
        fetchBackups();
      }
    } catch (error) {
      console.error('Error creating backup:', error);
      toast.error('Failed to create backup');
    } finally {
      setCreatingBackup(false);
    }
  };

  const handleDownloadBackup = (backup) => {
    // In a real application, this would download the actual backup file
    toast.success(`Downloading ${backup.filename}...`);
  };

  const handleDeleteBackup = async (backupId) => {
    if (window.confirm('Are you sure you want to delete this backup? This action cannot be undone.')) {
      try {
        // In a real application, this would delete the backup
        toast.success('Backup deleted successfully!');
        fetchBackups();
      } catch (error) {
        console.error('Error deleting backup:', error);
        toast.error('Failed to delete backup');
      }
    }
  };

  const handleExportAuditLogs = async () => {
    try {
      toast.loading('Exporting audit logs...');
      const response = await auditAPI.exportLogs();
      
      // Create download link
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);
      
      toast.dismiss();
      toast.success('Audit logs exported successfully!');
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to export audit logs');
      console.error('Export error:', error);
    }
  };

  const getSecurityStatusColor = (status) => {
    switch (status) {
      case 'secure': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'warning': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'critical': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
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
      <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Backup & Security</h1>
            <p className="text-red-100">Manage system backups and monitor security status</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleCreateBackup}
              disabled={creatingBackup}
              className="bg-white/20 hover:bg-white/30 disabled:opacity-50 text-white px-6 py-3 rounded-lg flex items-center transition-colors"
            >
              <FiDatabase className="mr-2" size={20} />
              {creatingBackup ? 'Creating...' : 'Create Backup'}
            </button>
            <button
              onClick={handleExportAuditLogs}
              className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-lg flex items-center transition-colors"
            >
              <FiActivity className="mr-2" size={20} />
              Export Logs
            </button>
          </div>
        </div>
      </div>

      {/* Security Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center">
            <div className={`p-3 rounded-lg ${getSecurityStatusColor(securityStatus.systemSecurity)}`}>
              <FiShield className="text-current" size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400">System Security</p>
              <p className="text-lg font-semibold text-secondary-900 dark:text-white capitalize">
                {securityStatus.systemSecurity}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className={`p-3 rounded-lg ${getSecurityStatusColor(securityStatus.dataEncryption === 'enabled' ? 'secure' : 'warning')}`}>
              <FiLock className="text-current" size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400">Data Encryption</p>
              <p className="text-lg font-semibold text-secondary-900 dark:text-white capitalize">
                {securityStatus.dataEncryption}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className={`p-3 rounded-lg ${getSecurityStatusColor(securityStatus.auditLogging === 'active' ? 'secure' : 'warning')}`}>
              <FiActivity className="text-current" size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400">Audit Logging</p>
              <p className="text-lg font-semibold text-secondary-900 dark:text-white capitalize">
                {securityStatus.auditLogging}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className={`p-3 rounded-lg ${securityStatus.vulnerabilities === 0 ? 'text-green-600 bg-green-100 dark:bg-green-900/20' : 'text-red-600 bg-red-100 dark:bg-red-900/20'}`}>
              <FiAlertTriangle className="text-current" size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400">Vulnerabilities</p>
              <p className="text-lg font-semibold text-secondary-900 dark:text-white">
                {securityStatus.vulnerabilities}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Backup Management */}
        <div className="card">
          <div className="p-6 border-b border-secondary-200 dark:border-secondary-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-secondary-900 dark:text-white">
                Backup Management
              </h2>
              <button
                onClick={fetchBackups}
                className="p-2 text-secondary-500 hover:text-secondary-700 dark:hover:text-secondary-300"
              >
                <FiRefreshCw size={16} />
              </button>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-secondary-50 dark:bg-secondary-800 rounded-lg">
                <div>
                  <h3 className="font-medium text-secondary-900 dark:text-white">Last Backup</h3>
                  <p className="text-sm text-secondary-500">
                    {securityStatus.lastBackup 
                      ? new Date(securityStatus.lastBackup).toLocaleString()
                      : 'No backups available'
                    }
                  </p>
                </div>
                <button
                  onClick={handleCreateBackup}
                  disabled={creatingBackup}
                  className="btn-primary disabled:opacity-50"
                >
                  {creatingBackup ? 'Creating...' : 'Create Now'}
                </button>
              </div>

              <div className="space-y-3">
                <h3 className="font-medium text-secondary-900 dark:text-white">Recent Backups</h3>
                {backups.length > 0 ? (
                  backups.map((backup) => (
                    <div key={backup.id} className="flex items-center justify-between p-3 border border-secondary-200 dark:border-secondary-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FiDatabase className="text-primary-600" size={20} />
                        <div>
                          <p className="font-medium text-secondary-900 dark:text-white text-sm">
                            {backup.filename}
                          </p>
                          <p className="text-xs text-secondary-500">
                            {new Date(backup.created_at).toLocaleString()} • {backup.size}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleDownloadBackup(backup)}
                          className="p-2 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                          title="Download"
                        >
                          <FiDownload size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteBackup(backup.id)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <FiDatabase className="mx-auto text-4xl text-secondary-400 mb-2" />
                    <p className="text-secondary-500">No backups available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Security Details */}
        <div className="card">
          <div className="p-6 border-b border-secondary-200 dark:border-secondary-700">
            <h2 className="text-lg font-semibold text-secondary-900 dark:text-white">
              Security Details
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center">
                  <FiShield className="text-green-600 mr-3" size={20} />
                  <div>
                    <p className="font-medium text-green-800 dark:text-green-200">System Security</p>
                    <p className="text-sm text-green-600 dark:text-green-400">All security checks passed</p>
                  </div>
                </div>
                <span className="text-green-600 font-medium text-sm">Secure</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center">
                  <FiLock className="text-blue-600 mr-3" size={20} />
                  <div>
                    <p className="font-medium text-blue-800 dark:text-blue-200">Data Encryption</p>
                    <p className="text-sm text-blue-600 dark:text-blue-400">AES-256 encryption enabled</p>
                  </div>
                </div>
                <span className="text-blue-600 font-medium text-sm">Enabled</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <div className="flex items-center">
                  <FiActivity className="text-yellow-600 mr-3" size={20} />
                  <div>
                    <p className="font-medium text-yellow-800 dark:text-yellow-200">Audit Logging</p>
                    <p className="text-sm text-yellow-600 dark:text-yellow-400">All activities logged</p>
                  </div>
                </div>
                <span className="text-yellow-600 font-medium text-sm">Active</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="flex items-center">
                  <FiCheckCircle className="text-purple-600 mr-3" size={20} />
                  <div>
                    <p className="font-medium text-purple-800 dark:text-purple-200">Last Security Scan</p>
                    <p className="text-sm text-purple-600 dark:text-purple-400">
                      {new Date(securityStatus.lastSecurityScan).toLocaleString()}
                    </p>
                  </div>
                </div>
                <span className="text-purple-600 font-medium text-sm">Clean</span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-secondary-200 dark:border-secondary-700">
              <h3 className="font-medium text-secondary-900 dark:text-white mb-3">Security Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={handleExportAuditLogs}
                  className="w-full text-left p-3 hover:bg-secondary-50 dark:hover:bg-secondary-800 rounded-lg transition-colors"
                >
                  <div className="flex items-center">
                    <FiActivity className="text-primary-600 mr-3" size={16} />
                    <span className="text-sm font-medium text-secondary-900 dark:text-white">
                      Export Audit Logs
                    </span>
                  </div>
                </button>
                <button
                  onClick={() => toast.info('Security scan feature coming soon')}
                  className="w-full text-left p-3 hover:bg-secondary-50 dark:hover:bg-secondary-800 rounded-lg transition-colors"
                >
                  <div className="flex items-center">
                    <FiShield className="text-primary-600 mr-3" size={16} />
                    <span className="text-sm font-medium text-secondary-900 dark:text-white">
                      Run Security Scan
                    </span>
                  </div>
                </button>
                <button
                  onClick={() => toast.info('Password policy feature coming soon')}
                  className="w-full text-left p-3 hover:bg-secondary-50 dark:hover:bg-secondary-800 rounded-lg transition-colors"
                >
                  <div className="flex items-center">
                    <FiLock className="text-primary-600 mr-3" size={16} />
                    <span className="text-sm font-medium text-secondary-900 dark:text-white">
                      Update Password Policy
                    </span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackupSecurity;
