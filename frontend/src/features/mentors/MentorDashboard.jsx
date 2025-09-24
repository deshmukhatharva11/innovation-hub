import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  FiUsers,
  FiMessageSquare,
  FiTrendingUp,
  FiClock,
  FiStar,
  FiTarget,
  FiAward,
  FiCalendar,
  FiBarChart3,
  FiActivity,
  FiBookOpen,
  FiCheckCircle,
  FiAlertCircle,
  FiUserCheck,
  FiUserX
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { mentorsAPI, mentorAssignmentsAPI, mentorChatAPI } from '../../services/api';

const MentorDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalStudents: 0,
      activeAssignments: 0,
      completedSessions: 0,
      averageRating: 0,
      responseTime: 0,
      successRate: 0
    },
    recentActivity: [],
    upcomingSessions: [],
    studentProgress: [],
    assignedStudents: [],
    assignments: [],
    performanceMetrics: {
      monthlySessions: [],
      studentSatisfaction: [],
      responseTime: []
    }
  });
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');

  useEffect(() => {
    fetchDashboardData();
  }, [selectedPeriod]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [dashboardResponse, assignmentsResponse] = await Promise.all([
        mentorsAPI.getDashboard(selectedPeriod),
        mentorAssignmentsAPI.getByMentor(user.id)
      ]);
      
      const dashboardData = dashboardResponse.data.data;
      const assignments = assignmentsResponse.data.data.assignments || [];
      
      // Extract unique students from assignments
      const assignedStudents = assignments.map(assignment => ({
        id: assignment.student?.id,
        name: assignment.student?.name,
        email: assignment.student?.email,
        idea: assignment.idea?.title,
        status: assignment.status,
        assignedAt: assignment.created_at
      })).filter((student, index, self) => 
        student.id && self.findIndex(s => s.id === student.id) === index
      );
      
      setDashboardData({
        ...dashboardData,
        assignedStudents,
        assignments
      });
    } catch (error) {
      console.error('Error fetching mentor dashboard:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getPerformanceColor = (value, type) => {
    if (type === 'rating') {
      if (value >= 4.5) return 'text-green-600';
      if (value >= 3.5) return 'text-yellow-600';
      return 'text-red-600';
    }
    if (type === 'response') {
      if (value <= 2) return 'text-green-600';
      if (value <= 4) return 'text-yellow-600';
      return 'text-red-600';
    }
    if (type === 'success') {
      if (value >= 80) return 'text-green-600';
      if (value >= 60) return 'text-yellow-600';
      return 'text-red-600';
    }
    return 'text-gray-600';
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mentor Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user.name}</p>
        </div>
        <div className="flex gap-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.stats.totalStudents}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <FiUsers className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Assignments</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.stats.activeAssignments}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <FiTarget className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Sessions Completed</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.stats.completedSessions}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <FiCheckCircle className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Rating</p>
              <p className={`text-2xl font-bold ${getPerformanceColor(dashboardData.stats.averageRating, 'rating')}`}>
                {dashboardData.stats.averageRating.toFixed(1)}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <FiStar className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Response Time</p>
              <p className={`text-2xl font-bold ${getPerformanceColor(dashboardData.stats.responseTime, 'response')}`}>
                {dashboardData.stats.responseTime}h
              </p>
            </div>
            <div className="p-3 bg-indigo-100 rounded-full">
              <FiClock className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Success Rate</p>
              <p className={`text-2xl font-bold ${getPerformanceColor(dashboardData.stats.successRate, 'success')}`}>
                {dashboardData.stats.successRate}%
              </p>
            </div>
            <div className="p-3 bg-emerald-100 rounded-full">
              <FiTrendingUp className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Assigned Students Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FiUsers className="w-5 h-5" />
            Assigned Students
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Students currently assigned to you for mentoring
          </p>
        </div>
        <div className="p-6">
          {dashboardData.assignedStudents.length > 0 ? (
            <div className="space-y-4">
              {dashboardData.assignedStudents.map((student) => (
                <div key={student.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <FiUser className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{student.name}</h4>
                      <p className="text-sm text-gray-600">{student.email}</p>
                      <p className="text-xs text-gray-500">Idea: {student.idea || 'No idea assigned'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      student.status === 'active' ? 'bg-green-100 text-green-800' :
                      student.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      student.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {student.status || 'Unknown'}
                    </span>
                    <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                      <FiMessageSquare className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FiUsers className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No students assigned yet</h3>
              <p className="text-gray-600">You'll see your assigned students here once they are assigned to you.</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FiActivity className="w-5 h-5" />
              Recent Activity
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {dashboardData.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className={`p-2 rounded-full ${
                    activity.type === 'session' ? 'bg-blue-100' :
                    activity.type === 'message' ? 'bg-green-100' :
                    activity.type === 'assignment' ? 'bg-purple-100' : 'bg-gray-100'
                  }`}>
                    {activity.type === 'session' && <FiCalendar className="w-4 h-4 text-blue-600" />}
                    {activity.type === 'message' && <FiMessageSquare className="w-4 h-4 text-green-600" />}
                    {activity.type === 'assignment' && <FiUserCheck className="w-4 h-4 text-purple-600" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{activity.description}</p>
                    <p className="text-xs text-gray-500">{activity.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Upcoming Sessions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FiCalendar className="w-5 h-5" />
              Upcoming Sessions
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {dashboardData.upcomingSessions.map((session, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{session.studentName}</p>
                    <p className="text-sm text-gray-600">{session.topic}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{session.time}</p>
                    <p className="text-xs text-gray-500">{session.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Student Progress */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FiBarChart3 className="w-5 h-5" />
            Student Progress Overview
          </h3>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Idea
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progress
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Session
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dashboardData.studentProgress.map((student, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">
                            {student.name.charAt(0)}
                          </span>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{student.name}</div>
                          <div className="text-sm text-gray-500">{student.college}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{student.ideaTitle}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${student.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">{student.progress}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.lastSession}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        student.status === 'active' ? 'bg-green-100 text-green-800' :
                        student.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {student.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorDashboard;
