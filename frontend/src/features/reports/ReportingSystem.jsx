import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { FiFileText, FiDownload, FiCalendar, FiTrendingUp, FiUsers, FiAward, FiBarChart, FiRefreshCw } from 'react-icons/fi';
import { collegeCoordinatorAPI } from '../../services/api';
import { toast } from 'react-toastify';

const ReportingSystem = () => {
  const { user } = useSelector((state) => state.auth);
  const [reports, setReports] = useState([]);
  const [selectedReportType, setSelectedReportType] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [isGenerating, setIsGenerating] = useState(false);

  // Check if user has permission to access reports
  const allowedRoles = ['college_admin', 'incubator_manager', 'admin'];
  const hasPermission = allowedRoles.includes(user?.role);

  const reportTypes = [
    {
      id: 'quarterly',
      name: 'Quarterly Progress Report',
      description: 'Comprehensive quarterly report on pre-incubation activities for your college',
      icon: FiCalendar,
      frequency: 'Quarterly'
    },
    {
      id: 'annual',
      name: 'Annual Report',
      description: 'Year-end comprehensive report on all activities for your college',
      icon: FiFileText,
      frequency: 'Annual'
    },
    {
      id: 'idea_analytics',
      name: 'Idea Analytics Report',
      description: 'Detailed analysis of idea submissions and evaluations for your college',
      icon: FiTrendingUp,
      frequency: 'On Demand'
    },
    {
      id: 'college_performance',
      name: 'College Performance Report',
      description: 'Performance metrics and statistics for your college',
      icon: FiUsers,
      frequency: 'Monthly'
    },
    {
      id: 'mentor_effectiveness',
      name: 'Mentor Effectiveness Report',
      description: 'Analysis of mentor performance and impact for your college',
      icon: FiAward,
      frequency: 'Quarterly'
    },
    {
      id: 'incubation_pipeline',
      name: 'Incubation Pipeline Report',
      description: 'Status and progress of ideas in incubation pipeline for your college',
      icon: FiBarChart,
      frequency: 'Monthly'
    }
  ];

  useEffect(() => {
    if (hasPermission) {
      loadReports();
    }
  }, [hasPermission]);

  const loadReports = async () => {
    try {
      const response = await collegeCoordinatorAPI.getReports();
      console.log('Reports API response:', response.data);
      
      if (response.data.success) {
        // Handle different response structures
        let reportsData = [];
        
        if (Array.isArray(response.data.data)) {
          reportsData = response.data.data;
        } else if (response.data.data && Array.isArray(response.data.data.reports)) {
          reportsData = response.data.data.reports;
        } else if (response.data.data && Array.isArray(response.data.data.rows)) {
          reportsData = response.data.data.rows;
        } else {
          console.warn('Unexpected data structure:', response.data.data);
          reportsData = [];
        }
        
        // Transform the data to match the expected format
        const transformedReports = reportsData.map(report => ({
          id: report.id,
          title: report.title,
          type: report.report_type,
          status: report.status,
          period: report.period_start && report.period_end ? 
            `${new Date(report.period_start).toLocaleDateString()} - ${new Date(report.period_end).toLocaleDateString()}` : 
            'N/A',
          generatedBy: report.createdBy?.name || 'Unknown',
          generatedDate: report.created_at,
          summary: report.data?.summary || {
            totalIdeas: report.data?.summary?.total_ideas || report.data?.statistics?.total_ideas || report.data?.total_ideas || 0,
            evaluatedIdeas: report.data?.summary?.evaluated_ideas || report.data?.statistics?.endorsed_ideas || report.data?.evaluated_ideas || 0,
            forwardedIdeas: report.data?.summary?.forwarded_ideas || report.data?.statistics?.incubated_ideas || report.data?.forwarded_ideas || 0,
            incubatedIdeas: report.data?.summary?.incubated_ideas || report.data?.statistics?.incubated_ideas || report.data?.incubated_ideas || 0,
            totalStudents: report.data?.summary?.total_students || 0,
            totalMentors: report.data?.summary?.total_mentors || 0,
            totalEvents: report.data?.summary?.total_events || 0,
            ideaGrowthRate: report.data?.summary?.idea_growth_rate || 0,
            ideaAcceptanceRate: report.data?.summary?.idea_acceptance_rate || 0
          },
          fileSize: '2.4 MB', // Mock data
          downloadCount: Math.floor(Math.random() * 50) + 1 // Mock data
        }));
        setReports(transformedReports);
      } else {
        toast.error('Failed to load reports');
        setReports([]);
      }
    } catch (error) {
      console.error('Error loading reports:', error);
      toast.error('Failed to load reports');
      setReports([]);
    }
  };

  // Show access denied if user doesn't have permission
  if (!hasPermission) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-50 dark:bg-secondary-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-secondary-900 dark:text-white mb-4">
            Access Denied
          </h1>
          <p className="text-secondary-600 dark:text-secondary-400 mb-6">
            You don't have permission to access the reports section.
          </p>
          <button
            onClick={() => window.history.back()}
            className="btn-primary"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const generateReport = async () => {
    if (!hasPermission) {
      toast.error('You don\'t have permission to generate reports');
      return;
    }

    if (!selectedReportType) {
      toast.error('Please select a report type');
      return;
    }

    if (!dateRange.startDate || !dateRange.endDate) {
      toast.error('Please select both start and end dates');
      return;
    }

    if (new Date(dateRange.startDate) > new Date(dateRange.endDate)) {
      toast.error('Start date cannot be after end date');
      return;
    }

    try {
      setIsGenerating(true);
      
      const reportData = {
        report_type: selectedReportType,
        period_start: new Date(dateRange.startDate).toISOString(),
        period_end: new Date(dateRange.endDate).toISOString(),
        title: `${reportTypes.find(rt => rt.id === selectedReportType)?.name} - ${new Date().toLocaleDateString()}`,
        description: `Generated ${reportTypes.find(rt => rt.id === selectedReportType)?.name} for period ${dateRange.startDate} to ${dateRange.endDate}`
      };

      const response = await collegeCoordinatorAPI.createReport(reportData);
      
      if (response.data.success) {
        toast.success('Comprehensive report generated successfully!');
        await loadReports(); // Reload reports
        // Reset form
        setSelectedReportType('');
        setDateRange({ startDate: '', endDate: '' });
      } else {
        toast.error(response.data.message || 'Failed to generate report');
      }
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate report');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadReport = async (report) => {
    if (!hasPermission) {
      toast.error('You don\'t have permission to download reports');
      return;
    }

    try {
      const response = await collegeCoordinatorAPI.downloadReport(report.id);
      
      // Check if response is CSV content
      if (response.headers['content-type'] === 'text/csv') {
        // Create download link for CSV file
        const blob = new Blob([response.data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${report.title}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        toast.success('CSV report downloaded successfully!');
      } else if (response.headers['content-type'] === 'text/html') {
        // Handle HTML content (fallback)
        const blob = new Blob([response.data], { type: 'text/html' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${report.title}.html`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        toast.success('Report downloaded successfully!');
      } else if (response.headers['content-type'] === 'application/pdf') {
        // Handle PDF content (fallback)
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${report.title}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        toast.success('Report downloaded successfully!');
      } else if (response.data && response.data.success === false) {
        toast.error(response.data.message || 'Failed to download report');
      } else {
        // Fallback: try to download as CSV
        const blob = new Blob([response.data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${report.title}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        toast.success('CSV report downloaded successfully!');
      }
    } catch (error) {
      console.error('Error downloading report:', error);
      toast.error('Failed to download report');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'generating': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getReportIcon = (reportType) => {
    const type = reportTypes.find(rt => rt.id === reportType);
    return type ? type.icon : FiFileText;
  };

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">SGBAU Pre-Incubation Centre</h1>
        <p className="text-gray-600 dark:text-gray-400">Generate comprehensive reports and analytics</p>
      </div>

      {/* Report Generation */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Generate New Report</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Report Type</label>
            <select
              value={selectedReportType}
              onChange={(e) => setSelectedReportType(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Select Report Type</option>
              {reportTypes.map(reportType => (
                <option key={reportType.id} value={reportType.id}>
                  {reportType.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>
        <div className="mt-4">
          <button
            onClick={generateReport}
            disabled={isGenerating || !selectedReportType}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
          >
            {isGenerating ? (
              <>
                <FiRefreshCw className="mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FiFileText className="mr-2" />
                Generate Report
              </>
            )}
          </button>
        </div>
      </div>

      {/* Report Types Overview */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Available Reports</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reportTypes.map((reportType) => {
            const IconComponent = reportType.icon;
            return (
              <div key={reportType.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 dark:border-gray-700">
                <div className="flex items-center mb-4">
                  <IconComponent className="h-8 w-8 text-blue-600 dark:text-blue-400 mr-3" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{reportType.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{reportType.frequency}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{reportType.description}</p>
                <button
                  onClick={() => setSelectedReportType(reportType.id)}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium transition-colors"
                >
                  Select for Generation →
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Generated Reports */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Generated Reports</h2>
        </div>
        <div className="p-6">
          {reports.length === 0 ? (
            <div className="text-center py-8">
              <FiFileText className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No reports generated yet</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Generate your first report using the form above</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Array.isArray(reports) && reports.map((report) => {
                const IconComponent = getReportIcon(report.type);
                return (
                  <div key={report.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow bg-gray-50 dark:bg-gray-700">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-start">
                        <IconComponent className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-3 mt-1" />
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{report.title}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300">{report.period}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Generated by {report.generatedBy}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                          {report.status.toUpperCase()}
                        </span>
                        <button
                          onClick={() => downloadReport(report)}
                          className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors flex items-center text-sm"
                        >
                          <FiDownload className="mr-1" />
                          Download
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-3">
                      <div className="text-center">
                        <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">{report.summary.totalIdeas}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Total Ideas</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-green-600 dark:text-green-400">{report.summary.evaluatedIdeas}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Evaluated</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-purple-600 dark:text-purple-400">{report.summary.forwardedIdeas}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Forwarded</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-orange-600 dark:text-orange-400">{report.summary.incubatedIdeas}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Incubated</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">{report.summary.totalStudents}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Students</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-pink-600 dark:text-pink-400">{report.summary.totalEvents}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Events</div>
                      </div>
                    </div>
                    
                    {/* Additional Metrics Row */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                      <div className="text-center">
                        <div className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                          {report.summary.ideaGrowthRate > 0 ? '+' : ''}{report.summary.ideaGrowthRate}%
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Growth Rate</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-cyan-600 dark:text-cyan-400">
                          {report.summary.ideaAcceptanceRate}%
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Acceptance Rate</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-rose-600 dark:text-rose-400">
                          {report.summary.totalMentors}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Mentors</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-amber-600 dark:text-amber-400">
                          {report.summary.totalStudents > 0 ? (report.summary.totalIdeas / report.summary.totalStudents).toFixed(1) : 0}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Ideas/Student</div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                      <span>Generated: {formatDate(report.generatedDate)}</span>
                      <span>{report.fileSize} • {report.downloadCount} downloads</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportingSystem;
