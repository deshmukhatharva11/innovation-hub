import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  FiUsers,
  FiZap,
  FiCheckCircle,
  FiClock,
  FiTrendingUp,
  FiEye,
  FiSend,
  FiBarChart,
  FiAward,
  FiTarget,
  FiActivity,
  FiCalendar,
  FiDollarSign,
  FiStar,
  FiMessageSquare,
  FiDownload
} from 'react-icons/fi';
import { analyticsAPI, ideasAPI, usersAPI } from '../../services/api';
import { toast } from 'react-hot-toast';

const CollegeDashboard = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalIdeas: 0,
    pendingEndorsements: 0,
    endorsedIdeas: 0,
    incubatedIdeas: 0,
    totalViews: 0,
    totalLikes: 0,
    monthlyGrowth: 0
  });
  const [recentIdeas, setRecentIdeas] = useState([]);
  const [students, setStudents] = useState([]);
  const [topPerformers, setTopPerformers] = useState([]);
  const [departmentStats, setDepartmentStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchDashboardData();
    }
  }, [user?.id, isAuthenticated, timeRange]);

  const fetchDashboardData = async () => {
    if (!user?.id) {
      console.log('User not available for dashboard data fetch');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Use user.college_id instead of nested college object
      const collegeId = user.college_id || user.college?.id;
      
      if (!collegeId && user.role === 'college_admin') {
        toast.error('College information not available. Please update your profile.');
        setLoading(false);
        return;
      }
      
      // Fetch all data in parallel for better performance
      const [analyticsResponse, ideasResponse, studentsResponse, topPerformersResponse] = await Promise.all([
        analyticsAPI.getDashboardStats({ period: timeRange }).catch(err => {
          console.warn('Analytics API failed:', err);
          return { data: { success: false, data: { analytics: {} } } };
        }),
        ideasAPI.getAll({
          college_id: collegeId,
          limit: 10,
          sort_by: 'created_at',
          sort_order: 'desc'
        }).catch(err => {
          console.warn('Ideas API failed:', err);
          return { data: { success: false, data: { ideas: [] } } };
        }),
        usersAPI.getStudents({ 
          college_id: collegeId,
          limit: 100 
        }).catch(err => {
          console.warn('Students API failed:', err);
          return { data: { success: false, data: { students: [] } } };
        }),
        usersAPI.getStudents({ 
          college_id: collegeId,
          limit: 5,
          sort_by: 'ideas_count',
          sort_order: 'desc'
        }).catch(err => {
          console.warn('Top performers API failed:', err);
          return { data: { success: false, data: { students: [] } } };
        })
      ]);

      // Update students list
      if (studentsResponse.data?.success && studentsResponse.data?.data?.students) {
        setStudents(studentsResponse.data.data.students.map(student => ({
          id: student.id,
          name: student.name,
          email: student.email,
          department: student.department || 'Not specified',
          ideasCount: student.ideas_count || 0,
          avatar: student.profile_image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=random`
        })));
      }

      // Update top performers
      if (topPerformersResponse.data?.success && topPerformersResponse.data?.data?.students) {
        setTopPerformers(topPerformersResponse.data.data.students.map(student => ({
          id: student.id,
          name: student.name,
          department: student.department || 'Not specified',
          ideasCount: student.ideas_count || 0,
          endorsedIdeas: student.endorsed_ideas_count || 0,
          avatar: student.profile_image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=random`
        })));
      }

      // Update comprehensive stats
      if (analyticsResponse.data?.success && analyticsResponse.data?.data?.analytics) {
        const analytics = analyticsResponse.data.data.analytics;
        setStats({
          totalStudents: analytics.users?.students || 0,
          totalIdeas: analytics.ideas?.total || 0,
          pendingEndorsements: analytics.ideas?.by_status?.find(s => s.status === 'submitted')?.count || 0,
          endorsedIdeas: analytics.ideas?.by_status?.find(s => s.status === 'endorsed')?.count || 0,
          incubatedIdeas: analytics.ideas?.by_status?.find(s => s.status === 'incubated')?.count || 0,
          totalViews: analytics.ideas?.total_views || 0,
          totalLikes: analytics.ideas?.total_likes || 0,
          monthlyGrowth: analytics.growth?.ideas_monthly || 0
        });

        // Set department stats
        if (analytics.departments) {
          setDepartmentStats(analytics.departments);
        }
      }

      // Update recent ideas
      if (ideasResponse.data?.success && ideasResponse.data?.data?.ideas) {
        setRecentIdeas(ideasResponse.data.data.ideas.map(idea => ({
          id: idea.id,
          title: idea.title,
          studentName: idea.student?.name || 'Unknown',
          submittedAt: idea.created_at,
          status: idea.status,
          category: idea.category,
          views: idea.views_count || 0,
          likes: idea.likes_count || 0,
          department: idea.student?.department || 'Unknown'
        })));
      }

    } catch (error) {
      if (error.name === 'CancelledError' || error.code === 'ERR_CANCELED') {
        console.log('Dashboard request was cancelled');
        return;
      }
      
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
      case 'submitted': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'under_review': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      case 'endorsed': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'incubated': return 'text-purple-600 bg-purple-100 dark:bg-purple-900/20';
      case 'rejected': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      default: return 'text-secondary-600 bg-secondary-100 dark:bg-secondary-900/20';
    }
  };

  const getStatusDisplayName = (status) => {
    switch (status) {
      case 'draft': return 'Draft';
      case 'submitted': return 'New Submission';
      case 'under_review': return 'Under Review';
      case 'endorsed': return 'Endorsed';
      case 'incubated': return 'Reviewed';
      case 'rejected': return 'Rejected';
      default: return status.replace('_', ' ');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatNumber = (num) => {
    return num?.toLocaleString() || '0';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Welcome, {user?.name}! 🎓
        </h1>
        <p className="text-primary-100 mb-4">
          Manage student innovations and endorse promising ideas for incubation.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link
            to="/ideas/review"
            className="inline-flex items-center px-4 py-2 bg-white text-primary-600 rounded-lg font-medium hover:bg-primary-50 transition-colors duration-200"
          >
            <FiCheckCircle className="mr-2" size={16} />
            Review Ideas
          </Link>
          <Link
            to="/students"
            className="inline-flex items-center px-4 py-2 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-400 transition-colors duration-200"
          >
            <FiUsers className="mr-2" size={16} />
            Manage Students
          </Link>
          <Link
            to="/analytics"
            className="inline-flex items-center px-4 py-2 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-400 transition-colors duration-200"
          >
            <FiBarChart className="mr-2" size={16} />
            View Analytics
          </Link>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Dashboard Overview</h2>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="1y">Last year</option>
        </select>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Students</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatNumber(stats.totalStudents)}</p>
              <p className="text-xs text-green-600 dark:text-green-400">+{stats.monthlyGrowth}% this month</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
              <FiUsers className="text-blue-600 dark:text-blue-400" size={20} />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Ideas</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatNumber(stats.totalIdeas)}</p>
              <p className="text-xs text-blue-600 dark:text-blue-400">{formatNumber(stats.totalViews)} views</p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
              <FiZap className="text-green-600 dark:text-green-400" size={20} />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Reviews</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatNumber(stats.pendingEndorsements)}</p>
              <p className="text-xs text-yellow-600 dark:text-yellow-400">Awaiting endorsement</p>
            </div>
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-full">
              <FiClock className="text-yellow-600 dark:text-yellow-400" size={20} />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Endorsed Ideas</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatNumber(stats.endorsedIdeas)}</p>
              <p className="text-xs text-purple-600 dark:text-purple-400">{formatNumber(stats.incubatedIdeas)} incubated</p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-full">
              <FiAward className="text-purple-600 dark:text-purple-400" size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Department Performance */}
      {departmentStats.length > 0 && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <FiTarget className="mr-2" />
            Department Performance
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {departmentStats.map((dept, index) => (
              <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white">{dept.department}</h4>
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Students: {dept.students_count}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Ideas: {dept.ideas_count}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Endorsed: {dept.endorsed_count}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Performers */}
      {topPerformers.length > 0 && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <FiStar className="mr-2" />
            Top Performing Students
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topPerformers.map((student, index) => (
              <div key={student.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center mb-3">
                  <img
                    src={student.avatar}
                    alt={student.name}
                    className="w-10 h-10 rounded-full mr-3"
                  />
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">{student.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{student.department}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Ideas: {student.ideasCount}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Endorsed: {student.endorsedIdeas}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Ideas */}
      <div className="card p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            <FiActivity className="mr-2" />
            Recent Ideas
          </h3>
          <Link
            to="/ideas/review"
            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            View All →
          </Link>
        </div>
        
        {recentIdeas.length > 0 ? (
          <div className="space-y-4">
            {recentIdeas.map((idea) => (
              <div key={idea.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-1">{idea.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      by {idea.studentName} • {idea.department}
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center">
                        <FiCalendar className="mr-1" />
                        {formatDate(idea.submittedAt)}
                      </span>
                      <span className="flex items-center">
                        <FiEye className="mr-1" />
                        {idea.views} views
                      </span>
                      <span className="flex items-center">
                        <FiMessageSquare className="mr-1" />
                        {idea.likes} likes
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(idea.status)}`}>
                      {getStatusDisplayName(idea.status)}
                    </span>
                    <Link
                      to={`/ideas/${idea.id}`}
                      className="text-primary-600 hover:text-primary-700"
                    >
                      <FiEye size={16} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <FiZap className="mx-auto mb-2" size={24} />
            <p>No ideas submitted yet</p>
          </div>
        )}
      </div>

      {/* Enhanced Features Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Idea Evaluation System */}
        <div className="card">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <FiCheckCircle className="mr-2" size={20} />
              Idea Evaluation
            </h2>
            <Link
              to="/ideas/evaluate"
              className="text-primary-600 hover:text-primary-500 font-medium text-sm"
            >
              Evaluate Ideas
            </Link>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-yellow-900 dark:text-yellow-100">Smart Campus System</h3>
                    <p className="text-sm text-yellow-700 dark:text-yellow-200 mt-1">by Rahul Sharma</p>
                    <p className="text-xs text-yellow-600 dark:text-yellow-300 mt-2">Submitted 2 days ago</p>
                  </div>
                  <div className="flex space-x-2">
                    <button className="px-3 py-1 bg-green-600 text-white text-xs rounded-full hover:bg-green-700">
                      Forward
                    </button>
                    <button className="px-3 py-1 bg-blue-600 text-white text-xs rounded-full hover:bg-blue-700">
                      Nurture
                    </button>
                    <button className="px-3 py-1 bg-red-600 text-white text-xs rounded-full hover:bg-red-700">
                      Reject
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-blue-900 dark:text-blue-100">HealthCare AI</h3>
                    <p className="text-sm text-blue-700 dark:text-blue-200 mt-1">by Sneha Joshi</p>
                    <p className="text-xs text-blue-600 dark:text-blue-300 mt-2">Submitted 1 day ago</p>
                  </div>
                  <div className="flex space-x-2">
                    <button className="px-3 py-1 bg-green-600 text-white text-xs rounded-full hover:bg-green-700">
                      Forward
                    </button>
                    <button className="px-3 py-1 bg-blue-600 text-white text-xs rounded-full hover:bg-blue-700">
                      Nurture
                    </button>
                    <button className="px-3 py-1 bg-red-600 text-white text-xs rounded-full hover:bg-red-700">
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Events Management */}
        <div className="card">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <FiCalendar className="mr-2" size={20} />
              Events Management
            </h2>
            <Link
              to="/events"
              className="text-primary-600 hover:text-primary-500 font-medium text-sm"
            >
              Manage Events
            </Link>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <h3 className="font-medium text-green-900 dark:text-green-100">Ideathon 2024</h3>
                <p className="text-sm text-green-700 dark:text-green-200 mt-1">March 15-17, 2024</p>
                <p className="text-xs text-green-600 dark:text-green-300 mt-2">45 students registered</p>
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h3 className="font-medium text-blue-900 dark:text-blue-100">Entrepreneurship Workshop</h3>
                <p className="text-sm text-blue-700 dark:text-blue-200 mt-1">March 20, 2024</p>
                <p className="text-xs text-blue-600 dark:text-blue-300 mt-2">28 students registered</p>
              </div>
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <h3 className="font-medium text-purple-900 dark:text-purple-100">Mentor Meet</h3>
                <p className="text-sm text-purple-700 dark:text-purple-200 mt-1">March 25, 2024</p>
                <p className="text-xs text-purple-600 dark:text-purple-300 mt-2">15 students registered</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reporting System */}
      <div className="card">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <FiDownload className="mr-2" size={20} />
            Reports & Analytics
          </h2>
          <Link
            to="/reports"
            className="text-primary-600 hover:text-primary-500 font-medium text-sm"
          >
            View All Reports
          </Link>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">Biannual Report</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">January-June 2024</p>
              <button className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200">
                Generate Report
              </button>
            </div>
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">Annual Progress Report</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">2024 Summary</p>
              <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200">
                Generate Report
              </button>
            </div>
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">Student Analytics</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Performance Insights</p>
              <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
                View Analytics
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/ideas/review"
            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-center"
          >
            <FiCheckCircle className="mx-auto mb-2 text-green-600" size={24} />
            <p className="font-medium">Review Ideas</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{stats.pendingEndorsements} pending</p>
          </Link>
          
          <Link
            to="/students"
            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-center"
          >
            <FiUsers className="mx-auto mb-2 text-blue-600" size={24} />
            <p className="font-medium">Manage Students</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{stats.totalStudents} students</p>
          </Link>
          
          <Link
            to="/analytics"
            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-center"
          >
            <FiBarChart className="mx-auto mb-2 text-purple-600" size={24} />
            <p className="font-medium">View Analytics</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Performance insights</p>
          </Link>
          
          <Link
            to="/ideas/export"
            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-center"
          >
            <FiDownload className="mx-auto mb-2 text-orange-600" size={24} />
            <p className="font-medium">Export Data</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Reports & analytics</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CollegeDashboard;
