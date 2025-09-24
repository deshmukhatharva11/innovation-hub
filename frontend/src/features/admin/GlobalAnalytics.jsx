import React, { useState, useEffect, useCallback } from 'react';
import { FiTrendingUp, FiUsers, FiZap, FiMapPin, FiTarget, FiBarChart2, FiRefreshCw, FiCalendar, FiAward } from 'react-icons/fi';
import { adminAnalyticsAPI } from '../../services/api';
import { toast } from 'react-hot-toast';

const GlobalAnalytics = () => {
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [activeTab, setActiveTab] = useState('overview');

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminAnalyticsAPI.getGlobalAnalytics({ period: selectedPeriod });
      if (response.data.success) {
        setAnalytics(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  }, [selectedPeriod]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num?.toString() || '0';
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
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Global Analytics</h1>
            <p className="text-purple-100">Comprehensive insights across all colleges and incubators</p>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="bg-white/20 border border-white/30 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-white/50"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last year</option>
            </select>
            <button
              onClick={fetchAnalytics}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
            >
              <FiRefreshCw className="mr-2" size={16} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-sm border border-secondary-200 dark:border-secondary-700">
        <div className="border-b border-secondary-200 dark:border-secondary-700">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {[
              { id: 'overview', name: 'Overview', icon: FiBarChart2 },
              { id: 'users', name: 'Users', icon: FiUsers },
              { id: 'ideas', name: 'Ideas', icon: FiZap },
              { id: 'performance', name: 'Performance', icon: FiTrendingUp },
              { id: 'trends', name: 'Trends', icon: FiCalendar }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                      : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300 dark:text-secondary-400 dark:hover:text-secondary-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                >
                  <Icon className="mr-2" size={16} />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <FiUsers className="text-blue-600 dark:text-blue-400" size={24} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400">Total Users</p>
                  <p className="text-2xl font-bold text-secondary-900 dark:text-white">
                    {formatNumber(analytics.overview?.total_users || 0)}
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400">
                    +{formatNumber(analytics.overview?.new_users || 0)} this period
                  </p>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <FiZap className="text-green-600 dark:text-green-400" size={24} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400">Total Ideas</p>
                  <p className="text-2xl font-bold text-secondary-900 dark:text-white">
                    {formatNumber(analytics.overview?.total_ideas || 0)}
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400">
                    +{formatNumber(analytics.overview?.new_ideas || 0)} this period
                  </p>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                  <FiMapPin className="text-purple-600 dark:text-purple-400" size={24} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400">Colleges</p>
                  <p className="text-2xl font-bold text-secondary-900 dark:text-white">
                    {analytics.overview?.total_colleges || 0}
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    {analytics.overview?.total_incubators || 0} incubators
                  </p>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center">
                <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                  <FiTarget className="text-orange-600 dark:text-orange-400" size={24} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400">Active Users</p>
                  <p className="text-2xl font-bold text-secondary-900 dark:text-white">
                    {formatNumber(analytics.overview?.active_users || 0)}
                  </p>
                  <p className="text-xs text-orange-600 dark:text-orange-400">
                    {analytics.overview?.total_mentors || 0} mentors
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* User Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <div className="p-6 border-b border-secondary-200 dark:border-secondary-700">
                <h2 className="text-lg font-semibold text-secondary-900 dark:text-white">
                  User Distribution
                </h2>
              </div>
              <div className="p-6">
                {analytics.breakdown?.users_by_role && (
                  <div className="space-y-4">
                    {analytics.breakdown.users_by_role.map((role) => (
                      <div key={role.role} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${
                            role.role === 'student' ? 'bg-blue-500' :
                            role.role === 'college_admin' ? 'bg-green-500' :
                            role.role === 'incubator_manager' ? 'bg-purple-500' :
                            'bg-red-500'
                          }`}></div>
                          <span className="text-secondary-700 dark:text-secondary-300 capitalize">
                            {role.role.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-semibold text-secondary-900 dark:text-white">
                            {formatNumber(role.count)}
                          </span>
                          <span className="text-sm text-secondary-500 dark:text-secondary-400 ml-2">
                            ({((role.count / analytics.overview?.total_users) * 100).toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="card">
              <div className="p-6 border-b border-secondary-200 dark:border-secondary-700">
                <h2 className="text-lg font-semibold text-secondary-900 dark:text-white">
                  Ideas by Status
                </h2>
              </div>
              <div className="p-6">
                {analytics.breakdown?.ideas_by_status && (
                  <div className="space-y-4">
                    {analytics.breakdown.ideas_by_status.map((status) => (
                      <div key={status.status} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${
                            status.status === 'submitted' ? 'bg-yellow-500' :
                            status.status === 'endorsed' ? 'bg-green-500' :
                            status.status === 'incubated' ? 'bg-blue-500' :
                            'bg-red-500'
                          }`}></div>
                          <span className="text-secondary-700 dark:text-secondary-300 capitalize">
                            {status.status}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-semibold text-secondary-900 dark:text-white">
                            {formatNumber(status.count)}
                          </span>
                          <span className="text-sm text-secondary-500 dark:text-secondary-400 ml-2">
                            ({((status.count / analytics.overview?.total_ideas) * 100).toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Performance Tab */}
      {activeTab === 'performance' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Performing Colleges */}
            <div className="card">
              <div className="p-6 border-b border-secondary-200 dark:border-secondary-700">
                <h2 className="text-lg font-semibold text-secondary-900 dark:text-white">
                  Top Performing Colleges
                </h2>
              </div>
              <div className="p-6">
                {analytics.top_performers?.colleges && analytics.top_performers.colleges.length > 0 ? (
                  <div className="space-y-4">
                    {analytics.top_performers.colleges.slice(0, 5).map((college, index) => (
                      <div key={college.id} className="flex items-center justify-between p-3 bg-secondary-50 dark:bg-secondary-800 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center">
                            <span className="text-sm font-bold text-primary-600 dark:text-primary-400">
                              {index + 1}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-secondary-900 dark:text-white">
                              {college.name}
                            </p>
                            <p className="text-sm text-secondary-500">
                              {college.city}, {college.state}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-secondary-900 dark:text-white">
                            {college.endorsed_ideas || 0}
                          </p>
                          <p className="text-xs text-secondary-500">endorsed ideas</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FiAward className="mx-auto text-4xl text-secondary-400 mb-2" />
                    <p className="text-secondary-500">No performance data available</p>
                  </div>
                )}
              </div>
            </div>

            {/* Top Performing Incubators */}
            <div className="card">
              <div className="p-6 border-b border-secondary-200 dark:border-secondary-700">
                <h2 className="text-lg font-semibold text-secondary-900 dark:text-white">
                  Top Performing Incubators
                </h2>
              </div>
              <div className="p-6">
                {analytics.top_performers?.incubators && analytics.top_performers.incubators.length > 0 ? (
                  <div className="space-y-4">
                    {analytics.top_performers.incubators.slice(0, 5).map((incubator, index) => (
                      <div key={incubator.id} className="flex items-center justify-between p-3 bg-secondary-50 dark:bg-secondary-800 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center">
                            <span className="text-sm font-bold text-primary-600 dark:text-primary-400">
                              {index + 1}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-secondary-900 dark:text-white">
                              {incubator.name}
                            </p>
                            <p className="text-sm text-secondary-500">
                              {incubator.city}, {incubator.state}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-secondary-900 dark:text-white">
                            {incubator.incubated_ideas || 0}
                          </p>
                          <p className="text-xs text-secondary-500">incubated ideas</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FiTarget className="mx-auto text-4xl text-secondary-400 mb-2" />
                    <p className="text-secondary-500">No performance data available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="card">
        <div className="p-6 border-b border-secondary-200 dark:border-secondary-700">
          <h2 className="text-lg font-semibold text-secondary-900 dark:text-white">
            Recent Activity
          </h2>
        </div>
        <div className="p-6">
          {analytics.recent_activity && (
            <div className="space-y-4">
              {/* Recent Users */}
              {analytics.recent_activity.users && analytics.recent_activity.users.length > 0 && (
                <div>
                  <h3 className="font-medium text-secondary-900 dark:text-white mb-3">Recent Users</h3>
                  <div className="space-y-2">
                    {analytics.recent_activity.users.slice(0, 3).map((user) => (
                      <div key={user.id} className="flex items-center space-x-3 p-2 bg-secondary-50 dark:bg-secondary-800 rounded-lg">
                        <FiUsers className="text-primary-600" size={16} />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-secondary-900 dark:text-white">
                            {user.name}
                          </p>
                          <p className="text-xs text-secondary-500">
                            {user.email} • {user.role}
                          </p>
                        </div>
                        <span className="text-xs text-secondary-400">
                          {new Date(user.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Ideas */}
              {analytics.recent_activity.ideas && analytics.recent_activity.ideas.length > 0 && (
                <div>
                  <h3 className="font-medium text-secondary-900 dark:text-white mb-3">Recent Ideas</h3>
                  <div className="space-y-2">
                    {analytics.recent_activity.ideas.slice(0, 3).map((idea) => (
                      <div key={idea.id} className="flex items-center space-x-3 p-2 bg-secondary-50 dark:bg-secondary-800 rounded-lg">
                        <FiZap className="text-primary-600" size={16} />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-secondary-900 dark:text-white">
                            {idea.title}
                          </p>
                          <p className="text-xs text-secondary-500">
                            by {idea.student?.name} • {idea.status}
                          </p>
                        </div>
                        <span className="text-xs text-secondary-400">
                          {new Date(idea.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GlobalAnalytics;
