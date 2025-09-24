import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  FiDownload,
  FiCalendar,
  FiBarChart3,
  FiTrendingUp,
  FiUsers,
  FiLightbulb,
  FiBookOpen,
  FiTarget,
  FiAward,
  FiActivity,
  FiEye,
  FiFilter,
  FiRefreshCw,
  FiFileText,
  FiPieChart,
  FiLineChart
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { reportsAPI } from '../../services/api';

const EnhancedReportingSystem = () => {
  const { user } = useSelector((state) => state.auth);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportFilters, setReportFilters] = useState({
    period: 'quarterly',
    startDate: '',
    endDate: '',
    reportType: 'comprehensive',
    includeCharts: true,
    includeInsights: true,
    includeRecommendations: true
  });

  const reportTypes = [
    {
      id: 'comprehensive',
      name: 'Comprehensive Report',
      description: 'Complete overview with all metrics and insights',
      icon: FiFileText,
      color: 'blue'
    },
    {
      id: 'ideas',
      name: 'Idea Analytics',
      description: 'Detailed analysis of idea submissions and progress',
      icon: FiLightbulb,
      color: 'yellow'
    },
    {
      id: 'students',
      name: 'Student Engagement',
      description: 'Student participation and performance metrics',
      icon: FiUsers,
      color: 'green'
    },
    {
      id: 'events',
      name: 'Event Performance',
      description: 'Event attendance and impact analysis',
      icon: FiCalendar,
      color: 'purple'
    },
    {
      id: 'mentors',
      name: 'Mentor Effectiveness',
      description: 'Mentor performance and student outcomes',
      icon: FiTarget,
      color: 'indigo'
    },
    {
      id: 'financial',
      name: 'Financial Overview',
      description: 'Budget utilization and resource allocation',
      icon: FiTrendingUp,
      color: 'emerald'
    }
  ];

  const periodOptions = [
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'annually', label: 'Annually' },
    { value: 'custom', label: 'Custom Range' }
  ];

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const response = await reportsAPI.getReports();
      setReports(response.data.data || []);
    } catch (error) {
      console.error('Error loading reports:', error);
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    try {
      setLoading(true);
      const response = await reportsAPI.generateReport({
        ...reportFilters,
        generated_by: user.id,
        generated_at: new Date().toISOString()
      });
      
      toast.success('Report generated successfully');
      loadReports();
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = async (reportId) => {
    try {
      const response = await reportsAPI.downloadReport(reportId);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `report-${reportId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading report:', error);
      toast.error('Failed to download report');
    }
  };

  const viewReport = (report) => {
    setSelectedReport(report);
    setShowReportModal(true);
  };

  const getReportTypeInfo = (type) => {
    return reportTypes.find(rt => rt.id === type) || reportTypes[0];
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'generating':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && reports.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Enhanced Reporting System</h1>
          <p className="text-gray-600">Generate comprehensive reports and analytics</p>
        </div>
        <button
          onClick={loadReports}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
        >
          <FiRefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Report Generation Panel */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Generate New Report</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Report Type
            </label>
            <select
              value={reportFilters.reportType}
              onChange={(e) => setReportFilters({ ...reportFilters, reportType: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {reportTypes.map(type => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Period
            </label>
            <select
              value={reportFilters.period}
              onChange={(e) => setReportFilters({ ...reportFilters, period: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {periodOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          {reportFilters.period === 'custom' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={reportFilters.startDate}
                  onChange={(e) => setReportFilters({ ...reportFilters, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={reportFilters.endDate}
                  onChange={(e) => setReportFilters({ ...reportFilters, endDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-4 mb-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={reportFilters.includeCharts}
              onChange={(e) => setReportFilters({ ...reportFilters, includeCharts: e.target.checked })}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">Include Charts & Visualizations</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={reportFilters.includeInsights}
              onChange={(e) => setReportFilters({ ...reportFilters, includeInsights: e.target.checked })}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">Include Insights & Analysis</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={reportFilters.includeRecommendations}
              onChange={(e) => setReportFilters({ ...reportFilters, includeRecommendations: e.target.checked })}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">Include Recommendations</span>
          </label>
        </div>

        <button
          onClick={generateReport}
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <FiBarChart3 className="w-4 h-4" />
          )}
          Generate Report
        </button>
      </div>

      {/* Report Types Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportTypes.map((type) => {
          const Icon = type.icon;
          return (
            <div key={type.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-3 bg-${type.color}-100 rounded-full`}>
                  <Icon className={`w-6 h-6 text-${type.color}-600`} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{type.name}</h3>
                  <p className="text-sm text-gray-600">{type.description}</p>
                </div>
              </div>
              <button
                onClick={() => setReportFilters({ ...reportFilters, reportType: type.id })}
                className={`w-full px-4 py-2 bg-${type.color}-50 text-${type.color}-600 rounded-lg hover:bg-${type.color}-100 transition-colors`}
              >
                Select Report Type
              </button>
            </div>
          );
        })}
      </div>

      {/* Generated Reports */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Generated Reports</h2>
        </div>
        <div className="p-6">
          {reports.length === 0 ? (
            <div className="text-center py-12">
              <FiFileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No reports generated yet</h3>
              <p className="text-gray-600">Generate your first report to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map((report) => {
                const typeInfo = getReportTypeInfo(report.report_type);
                const Icon = typeInfo.icon;
                return (
                  <div key={report.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 bg-${typeInfo.color}-100 rounded-full`}>
                        <Icon className={`w-6 h-6 text-${typeInfo.color}-600`} />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{typeInfo.name}</h3>
                        <p className="text-sm text-gray-600">
                          Generated on {new Date(report.created_at).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-500">
                          Period: {report.period} • Status: 
                          <span className={`ml-1 px-2 py-1 text-xs rounded-full ${getStatusColor(report.status)}`}>
                            {report.status}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => viewReport(report)}
                        className="px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 flex items-center gap-2"
                      >
                        <FiEye className="w-4 h-4" />
                        View
                      </button>
                      {report.status === 'completed' && (
                        <button
                          onClick={() => downloadReport(report.id)}
                          className="px-3 py-2 text-sm bg-green-50 text-green-600 rounded-lg hover:bg-green-100 flex items-center gap-2"
                        >
                          <FiDownload className="w-4 h-4" />
                          Download
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Report View Modal */}
      {showReportModal && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Report Details</h2>
              <button
                onClick={() => setShowReportModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Report Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Report Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Type</p>
                    <p className="font-medium">{getReportTypeInfo(selectedReport.report_type).name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Period</p>
                    <p className="font-medium">{selectedReport.period}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Generated</p>
                    <p className="font-medium">{new Date(selectedReport.created_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(selectedReport.status)}`}>
                      {selectedReport.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Report Content Preview */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Report Content</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                    {JSON.stringify(selectedReport.data, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedReportingSystem;
