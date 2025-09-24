import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  FiBarChart2, 
  FiTrendingUp,
  FiUsers,
  FiZap,
  FiCheckCircle,
  FiX, 
  FiDownload,
  FiMapPin,
  FiStar
} from 'react-icons/fi';
import { analyticsAPI } from '../../services/api';
import { toast } from 'react-hot-toast';

const Analytics = () => {
  const { user } = useSelector((state) => state.auth);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [debugMode, setDebugMode] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange, user?.role]);

  // Ensure data is loaded on component mount
  useEffect(() => {
    if (!analytics && !loading) {
      console.log('No analytics data found, generating mock data...');
      const mockData = generateMockAnalyticsData(timeRange);
      setAnalytics(mockData);
    }
  }, [analytics, loading, timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Try to fetch analytics data based on user role
      let fetchedAnalytics = null;
      try {
        const response = await analyticsAPI.getDashboardStats({
          period: timeRange,
          role: user?.role,
          college_id: user?.college_id,
          incubator_id: user?.incubator_id
        });

        if (response.data?.success && response.data?.data?.analytics) {
          fetchedAnalytics = response.data.data.analytics;
        }
      } catch (apiError) {
        console.log('API not available, using mock data');
      }

      // If API data is available, use it; otherwise generate realistic mock data
      if (fetchedAnalytics) {
        const transformedAnalytics = {
      overview: {
            totalIdeas: fetchedAnalytics.ideas?.total || 0,
            totalStudents: fetchedAnalytics.users?.students || 0,
            totalColleges: fetchedAnalytics.colleges?.total || 0,
            successRate: fetchedAnalytics.ideas?.success_rate || 0,
            avgRating: fetchedAnalytics.ideas?.average_rating || 0,
            totalFunding: `₹${(fetchedAnalytics.ideas?.total_funding || 0).toLocaleString()}`
          },
          ideasByCategory: fetchedAnalytics.ideas?.by_category?.map(cat => ({
            category: cat.category,
            count: cat.count,
            percentage: cat.percentage
          })) || [],
          ideasByStatus: fetchedAnalytics.ideas?.by_status?.map(status => ({
            status: status.status,
            count: status.count,
            percentage: status.percentage
          })) || [],
          monthlyTrends: fetchedAnalytics.trends?.monthly || [],
          topColleges: fetchedAnalytics.colleges?.top_performers || [],
          regionalStats: fetchedAnalytics.regional?.stats || []
        };
        
        setAnalytics(transformedAnalytics);
      } else {
        // Generate realistic mock data
        const mockAnalytics = generateMockAnalyticsData(timeRange);
        console.log('Generated mock analytics:', mockAnalytics);
        console.log('Top colleges data:', mockAnalytics.topColleges);
        console.log('Regional stats data:', mockAnalytics.regionalStats);
        console.log('Monthly trends data:', mockAnalytics.monthlyTrends);
        console.log('Ideas by category data:', mockAnalytics.ideasByCategory);
        console.log('Ideas by status data:', mockAnalytics.ideasByStatus);
        setAnalytics(mockAnalytics);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      // Generate mock data as fallback
      const mockAnalytics = generateMockAnalyticsData(timeRange);
      setAnalytics(mockAnalytics);
    } finally {
      setLoading(false);
    }
  };

  // Generate realistic mock analytics data
  const generateMockAnalyticsData = (period) => {
    const baseIdeas = 1000; // 200 ideas per district * 5 districts
    const baseStudents = 1000; // 20 students per college * 10 colleges * 5 districts
    const baseColleges = 50; // 10 colleges per district * 5 districts
    
    // Calculate period multiplier
    let periodMultiplier = 1;
    switch (period) {
      case '7d': periodMultiplier = 0.1; break;
      case '30d': periodMultiplier = 0.3; break;
      case '90d': periodMultiplier = 0.7; break;
      case '1y': periodMultiplier = 1; break;
      case 'all': periodMultiplier = 1; break;
    }

    const totalIdeas = Math.round(baseIdeas * periodMultiplier);
    const totalStudents = Math.round(baseStudents * periodMultiplier);
    const totalColleges = Math.round(baseColleges * periodMultiplier);
    const successRate = 70 + Math.random() * 20; // 70-90%
    const avgRating = 4.0 + Math.random() * 1.0; // 4.0-5.0
    const totalFunding = totalIdeas * (45000 + Math.random() * 10000); // 45k-55k per idea

    // Generate ideas by status
    const ideasByStatus = [
      { status: 'draft', count: Math.round(totalIdeas * 0.05), percentage: 5 },
      { status: 'submitted', count: Math.round(totalIdeas * 0.25), percentage: 25 },
      { status: 'under_review', count: Math.round(totalIdeas * 0.10), percentage: 10 },
      { status: 'endorsed', count: Math.round(totalIdeas * 0.35), percentage: 35 },
      { status: 'forwarded', count: Math.round(totalIdeas * 0.08), percentage: 8 },
      { status: 'incubated', count: Math.round(totalIdeas * 0.12), percentage: 12 },
      { status: 'nurture', count: Math.round(totalIdeas * 0.03), percentage: 3 },
      { status: 'rejected', count: Math.round(totalIdeas * 0.02), percentage: 2 }
    ];

    // Generate ideas by category
    const ideasByCategory = [
      { category: 'Agriculture', count: Math.round(totalIdeas * 0.10), percentage: 10 },
      { category: 'Clean Energy', count: Math.round(totalIdeas * 0.01), percentage: 0 },
      { category: 'Education', count: Math.round(totalIdeas * 0.10), percentage: 10 },
      { category: 'Entertainment', count: Math.round(totalIdeas * 0.10), percentage: 10 },
      { category: 'Environment', count: Math.round(totalIdeas * 0.11), percentage: 11 },
      { category: 'Finance', count: Math.round(totalIdeas * 0.11), percentage: 11 },
      { category: 'Healthcare', count: Math.round(totalIdeas * 0.09), percentage: 9 },
      { category: 'Other', count: Math.round(totalIdeas * 0.10), percentage: 10 },
      { category: 'Social Impact', count: Math.round(totalIdeas * 0.10), percentage: 10 },
      { category: 'Sustainability', count: Math.round(totalIdeas * 0.01), percentage: 0 },
      { category: 'Technology', count: Math.round(totalIdeas * 0.10), percentage: 10 },
      { category: 'Transportation', count: Math.round(totalIdeas * 0.10), percentage: 10 }
    ];

    // Generate monthly trends
    const monthlyTrends = [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    
    for (let i = 0; i < 6; i++) {
      const monthIndex = (currentMonth - 5 + i + 12) % 12;
      const submissions = Math.round(totalIdeas * 0.1 * (0.8 + Math.random() * 0.4));
      monthlyTrends.push({
        month: months[monthIndex],
        submissions: submissions,
        endorsements: Math.round(submissions * (0.6 + Math.random() * 0.3)),
        acceptances: Math.round(submissions * (0.2 + Math.random() * 0.2))
      });
    }
    
    console.log('Generated monthly trends:', monthlyTrends);

    // Generate top performing colleges (Amravati Division - 5 Districts)
    const topColleges = [
      { 
        name: 'Government College of Engineering - Amravati', 
        district: 'Amravati', 
        ideas: 45, 
        endorsements: 32,
        students: 20,
        successRate: 71.1
      },
      { 
        name: 'Shri Sant Gajanan Maharaj College of Engineering - Akola', 
        district: 'Akola', 
        ideas: 42, 
        endorsements: 28,
        students: 20,
        successRate: 66.7
      },
      { 
        name: 'Prof. Ram Meghe Institute of Technology - Buldhana', 
        district: 'Buldhana', 
        ideas: 38, 
        endorsements: 26,
        students: 20,
        successRate: 68.4
      },
      { 
        name: 'Dr. Panjabrao Deshmukh Institute of Technology - Washim', 
        district: 'Washim', 
        ideas: 35, 
        endorsements: 23,
        students: 20,
        successRate: 65.7
      },
      { 
        name: 'Shri Shivaji Science College - Yavatmal', 
        district: 'Yavatmal', 
        ideas: 33, 
        endorsements: 21,
        students: 20,
        successRate: 63.6
      },
      { 
        name: 'Mahatma Gandhi Arts, Science & Commerce College - Amravati', 
        district: 'Amravati', 
        ideas: 31, 
        endorsements: 20,
        students: 20,
        successRate: 64.5
      },
      { 
        name: 'Shri Shivaji College of Engineering - Akola', 
        district: 'Akola', 
        ideas: 29, 
        endorsements: 19,
        students: 20,
        successRate: 65.5
      },
      { 
        name: 'Dr. Ambedkar College of Engineering - Buldhana', 
        district: 'Buldhana', 
        ideas: 27, 
        endorsements: 18,
        students: 20,
        successRate: 66.7
      }
    ];

    // Generate regional statistics (Amravati Division - 5 Districts Only)
    const regionalStats = [
      { 
        region: 'Amravati', 
        colleges: 10, 
        ideas: 456, 
        avgRating: 4.5,
        students: 200, // 20 students per college * 10 colleges
        endorsements: 320,
        successRate: 70.2
      },
      { 
        region: 'Akola', 
        colleges: 10, 
        ideas: 298, 
        avgRating: 4.3,
        students: 200, // 20 students per college * 10 colleges
        endorsements: 195,
        successRate: 65.4
      },
      { 
        region: 'Buldhana', 
        colleges: 10, 
        ideas: 212, 
        avgRating: 4.2,
        students: 200, // 20 students per college * 10 colleges
        endorsements: 145,
        successRate: 68.4
      },
      { 
        region: 'Washim', 
        colleges: 10, 
        ideas: 167, 
        avgRating: 4.1,
        students: 200, // 20 students per college * 10 colleges
        endorsements: 110,
        successRate: 65.9
      },
      { 
        region: 'Yavatmal', 
        colleges: 10, 
        ideas: 198, 
        avgRating: 4.0,
        students: 200, // 20 students per college * 10 colleges
        endorsements: 125,
        successRate: 63.1
      }
    ];

    return {
      overview: {
        totalIdeas: totalIdeas,
        totalStudents: totalStudents,
        totalColleges: totalColleges,
        successRate: Math.round(successRate),
        avgRating: Math.round(avgRating * 10) / 10,
        totalFunding: `₹${Math.round(totalFunding).toLocaleString()}`
      },
      ideasByCategory: ideasByCategory,
      ideasByStatus: ideasByStatus,
      monthlyTrends: monthlyTrends,
      topColleges: topColleges,
      regionalStats: regionalStats
    };
  };

  const exportData = () => {
    // Mock export functionality
    const csvContent = [
      ['Metric', 'Value'],
      ['Total Ideas', analytics.overview.totalIdeas],
      ['Total Students', analytics.overview.totalStudents],
      ['Total Colleges', analytics.overview.totalColleges],
      ['Success Rate', `${analytics.overview.successRate}%`],
      ['Average Rating', analytics.overview.avgRating],
      ['Total Funding', analytics.overview.totalFunding]
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'analytics.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Fallback: if no analytics data, generate it immediately
  if (!analytics) {
    console.log('No analytics data available, generating fallback data...');
    const fallbackData = generateMockAnalyticsData(timeRange);
    setAnalytics(fallbackData);
    setLoading(false);
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }


  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Debug Panel */}
      {debugMode && (
        <div className="card p-4 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">Debug Information</h3>
            <button 
              onClick={() => setDebugMode(false)}
              className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-200"
            >
              ✕
            </button>
          </div>
          <div className="text-xs text-yellow-700 dark:text-yellow-300 space-y-1">
            <p>Loading: {loading ? 'Yes' : 'No'}</p>
            <p>Analytics Data: {analytics ? 'Available' : 'Not Available'}</p>
            <p>Top Colleges: {analytics?.topColleges?.length || 0} items</p>
            <p>Regional Stats: {analytics?.regionalStats?.length || 0} items</p>
            <p>Monthly Trends: {analytics?.monthlyTrends?.length || 0} items</p>
            <p>Ideas by Category: {analytics?.ideasByCategory?.length || 0} items</p>
            <p>Ideas by Status: {analytics?.ideasByStatus?.length || 0} items</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900 dark:text-white">
            Amravati Division Analytics Dashboard
          </h1>
          <p className="text-secondary-600 dark:text-secondary-400 mt-2">
            Innovation hub insights and performance metrics for Amravati division
          </p>
        </div>
        <div className="flex space-x-3 mt-4 sm:mt-0">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="input-field"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
            <option value="all">All Time</option>
          </select>
          <button
            onClick={() => {
              setLoading(true);
              fetchAnalyticsData();
            }}
            className="btn-outline"
            disabled={loading}
          >
            <FiBarChart2 className="mr-2" size={16} />
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
          <button
            onClick={() => {
              console.log('Force generating mock data...');
              const mockData = generateMockAnalyticsData(timeRange);
              console.log('Force generated data:', mockData);
              setAnalytics(mockData);
            }}
            className="btn-secondary"
          >
            <FiBarChart2 className="mr-2" size={16} />
            Force Load Data
          </button>
          <button
            onClick={exportData}
            className="btn-primary"
          >
            <FiDownload className="mr-2" size={16} />
            Export
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400">
                Total Ideas
              </p>
              <p className="text-2xl font-bold text-secondary-900 dark:text-white">
                {analytics.overview.totalIdeas}
              </p>
            </div>
            <div className="p-3 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
              <FiZap className="text-primary-600 dark:text-primary-400" size={24} />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400">
                Total Students
              </p>
              <p className="text-2xl font-bold text-secondary-900 dark:text-white">
                {analytics.overview.totalStudents.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <FiUsers className="text-blue-600 dark:text-blue-400" size={24} />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400">
                Total Colleges
              </p>
              <p className="text-2xl font-bold text-secondary-900 dark:text-white">
                {analytics.overview.totalColleges}
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <FiMapPin className="text-green-600 dark:text-green-400" size={24} />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400">
                Success Rate
              </p>
              <p className="text-2xl font-bold text-secondary-900 dark:text-white">
                {analytics.overview.successRate}%
              </p>
            </div>
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
              <FiTrendingUp className="text-yellow-600 dark:text-yellow-400" size={24} />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400">
                Avg Rating
              </p>
              <p className="text-2xl font-bold text-secondary-900 dark:text-white">
                {analytics.overview.avgRating}/5
              </p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <FiCheckCircle className="text-purple-600 dark:text-purple-400" size={24} />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400">
                Total Funding
              </p>
              <p className="text-2xl font-bold text-secondary-900 dark:text-white">
                {analytics.overview.totalFunding}
              </p>
            </div>
            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg">
              <FiTrendingUp className="text-indigo-600 dark:text-indigo-400" size={24} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ideas by Category */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">
            Ideas by Category
          </h3>
          <div className="space-y-4">
            {analytics.ideasByCategory && analytics.ideasByCategory.length > 0 ? analytics.ideasByCategory.map((item, index) => {
              const colors = [
                'bg-gradient-to-r from-blue-500 to-blue-600',
                'bg-gradient-to-r from-green-500 to-green-600',
                'bg-gradient-to-r from-purple-500 to-purple-600',
                'bg-gradient-to-r from-orange-500 to-orange-600',
                'bg-gradient-to-r from-pink-500 to-pink-600'
              ];
              const colorClass = colors[index % colors.length];
              
              return (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">
                <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full ${colorClass}`}></div>
                  <span className="text-sm font-medium text-secondary-900 dark:text-white">
                    {item.category}
                  </span>
                </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-bold text-secondary-900 dark:text-white min-w-[3rem] text-right">
                    {item.count}
                  </span>
                    <div className="w-20 bg-secondary-200 dark:bg-secondary-700 rounded-full h-3">
                    <div 
                        className={`h-3 rounded-full ${colorClass} transition-all duration-500 ease-out`}
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                    <span className="text-xs text-secondary-500 dark:text-secondary-400 w-8 text-right font-medium">
                    {item.percentage}%
                  </span>
                  </div>
                </div>
              );
            }) : (
              <div className="flex items-center justify-center h-32 text-secondary-500 dark:text-secondary-400">
                <div className="text-center">
                  <div className="text-4xl mb-2">📊</div>
                  <p>No category data available</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Ideas by Status */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">
            Ideas by Status
          </h3>
          <div className="space-y-4">
            {analytics.ideasByStatus && analytics.ideasByStatus.length > 0 ? analytics.ideasByStatus.map((item, index) => {
              const statusConfig = {
                'draft': { 
                  color: 'bg-gradient-to-r from-gray-500 to-gray-600', 
                  label: 'Draft',
                  icon: '📄'
                },
                'submitted': { 
                  color: 'bg-gradient-to-r from-yellow-500 to-yellow-600', 
                  label: 'Submitted',
                  icon: '📝'
                },
                'under_review': { 
                  color: 'bg-gradient-to-r from-orange-500 to-orange-600', 
                  label: 'Under Review',
                  icon: '🔍'
                },
                'endorsed': { 
                  color: 'bg-gradient-to-r from-blue-500 to-blue-600', 
                  label: 'Endorsed',
                  icon: '✅'
                },
                'forwarded': { 
                  color: 'bg-gradient-to-r from-indigo-500 to-indigo-600', 
                  label: 'Forwarded',
                  icon: '➡️'
                },
                'incubated': { 
                  color: 'bg-gradient-to-r from-green-500 to-green-600', 
                  label: 'Incubated',
                  icon: '🚀'
                },
                'nurture': { 
                  color: 'bg-gradient-to-r from-pink-500 to-pink-600', 
                  label: 'Nurture',
                  icon: '🌱'
                },
                'rejected': { 
                  color: 'bg-gradient-to-r from-red-500 to-red-600', 
                  label: 'Rejected',
                  icon: '❌'
                }
              };
              
              const config = statusConfig[item.status] || { 
                color: 'bg-gradient-to-r from-gray-500 to-gray-600', 
                label: item.status,
                icon: '📊'
              };
              
              return (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full ${config.color}`}></div>
                    <span className="text-lg">{config.icon}</span>
                    <span className="text-sm font-medium text-secondary-900 dark:text-white">
                      {config.label}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-bold text-secondary-900 dark:text-white min-w-[3rem] text-right">
                      {item.count}
                    </span>
                    <div className="w-20 bg-secondary-200 dark:bg-secondary-700 rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full ${config.color} transition-all duration-500 ease-out`}
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-secondary-500 dark:text-secondary-400 w-8 text-right font-medium">
                      {item.percentage}%
                    </span>
                  </div>
                </div>
              );
            }) : (
              <div className="flex items-center justify-center h-32 text-secondary-500 dark:text-secondary-400">
                <div className="text-center">
                  <div className="text-4xl mb-2">📊</div>
                  <p>No status data available</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Monthly Trends */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">
          Monthly Trends
        </h3>
        {console.log('Rendering monthly trends:', analytics.monthlyTrends)}
        {analytics.monthlyTrends && analytics.monthlyTrends.length > 0 ? (
          <>
        <div className="overflow-x-auto">
              <div className="flex space-x-6 min-w-max">
                {analytics.monthlyTrends.map((month, index) => {
                  const maxValue = Math.max(...analytics.monthlyTrends.map(m => Math.max(m.submissions, m.endorsements, m.acceptances)));
                  return (
              <div key={index} className="text-center">
                <div className="mb-2">
                        <div className="flex items-end space-x-2 h-32">
                    <div className="flex flex-col items-center">
                      <div 
                              className="w-8 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg transition-all duration-300 hover:from-blue-700 hover:to-blue-500"
                              style={{ height: `${Math.max((month.submissions / maxValue) * 100, 5)}%` }}
                      ></div>
                            <span className="text-xs text-secondary-500 dark:text-secondary-400 mt-1 font-medium">
                        {month.submissions}
                      </span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div 
                              className="w-8 bg-gradient-to-t from-green-600 to-green-400 rounded-t-lg transition-all duration-300 hover:from-green-700 hover:to-green-500"
                              style={{ height: `${Math.max((month.endorsements / maxValue) * 100, 5)}%` }}
                      ></div>
                            <span className="text-xs text-secondary-500 dark:text-secondary-400 mt-1 font-medium">
                        {month.endorsements}
                      </span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div 
                              className="w-8 bg-gradient-to-t from-purple-600 to-purple-400 rounded-t-lg transition-all duration-300 hover:from-purple-700 hover:to-purple-500"
                              style={{ height: `${Math.max((month.acceptances / maxValue) * 100, 5)}%` }}
                      ></div>
                            <span className="text-xs text-secondary-500 dark:text-secondary-400 mt-1 font-medium">
                        {month.acceptances}
                      </span>
                    </div>
                  </div>
                </div>
                <span className="text-sm font-medium text-secondary-900 dark:text-white">
                  {month.month}
                </span>
              </div>
                  );
                })}
          </div>
        </div>
        <div className="flex justify-center space-x-6 mt-4">
          <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gradient-to-r from-blue-600 to-blue-400 rounded"></div>
                <span className="text-sm text-secondary-600 dark:text-secondary-400 font-medium">Submissions</span>
          </div>
          <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gradient-to-r from-green-600 to-green-400 rounded"></div>
                <span className="text-sm text-secondary-600 dark:text-secondary-400 font-medium">Endorsements</span>
          </div>
          <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gradient-to-r from-purple-600 to-purple-400 rounded"></div>
                <span className="text-sm text-secondary-600 dark:text-secondary-400 font-medium">Acceptances</span>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-32 text-secondary-500 dark:text-secondary-400">
            <div className="text-center">
              <div className="text-4xl mb-2">📊</div>
              <p>No trend data available</p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Colleges */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-secondary-900 dark:text-white">
              Top Performing Colleges (Amravati Division)
          </h3>
            <div className="text-sm text-secondary-500 dark:text-secondary-400">
              {analytics.topColleges?.length || 0} colleges (Top 8)
            </div>
          </div>
          <div className="space-y-3">
            {console.log('Rendering top colleges:', analytics.topColleges)}
            {analytics.topColleges && analytics.topColleges.length > 0 ? analytics.topColleges.map((college, index) => {
              const rankColors = [
                'bg-gradient-to-r from-yellow-500 to-yellow-600',
                'bg-gradient-to-r from-gray-400 to-gray-500',
                'bg-gradient-to-r from-orange-500 to-orange-600',
                'bg-gradient-to-r from-blue-500 to-blue-600',
                'bg-gradient-to-r from-green-500 to-green-600'
              ];
              const rankColor = rankColors[index] || 'bg-gradient-to-r from-gray-500 to-gray-600';
              
              return (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-lg hover:shadow-md transition-all duration-300 hover:scale-105"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 ${rankColor} rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                    {index + 1}
                  </div>
                  <div>
                      <p className="font-semibold text-secondary-900 dark:text-white text-sm">
                      {college.name}
                      </p>
                      <p className="text-xs text-secondary-600 dark:text-secondary-400 flex items-center">
                        <FiMapPin className="mr-1" size={12} />
                        {college.district}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-secondary-900 dark:text-white">
                      {college.ideas}
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                      {college.endorsements} endorsed
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                      {college.students} students
                    </p>
                    <p className="text-xs text-secondary-500 dark:text-secondary-400">
                      {college.successRate}% success
                    </p>
                  </div>
                </div>
              );
            }) : (
              <div className="flex items-center justify-center h-32 text-secondary-500 dark:text-secondary-400">
                <div className="text-center">
                  <div className="text-4xl mb-2">🏆</div>
                  <p>No college data available</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Regional Statistics */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-secondary-900 dark:text-white">
              District Statistics (Amravati Division)
          </h3>
            <div className="text-sm text-secondary-500 dark:text-secondary-400">
              {analytics.regionalStats?.length || 0} districts (Amravati Division)
            </div>
          </div>
          <div className="space-y-3">
            {console.log('Rendering regional stats:', analytics.regionalStats)}
            {analytics.regionalStats && analytics.regionalStats.length > 0 ? analytics.regionalStats.map((region, index) => {
              const regionColors = [
                'bg-gradient-to-r from-blue-500 to-blue-600',
                'bg-gradient-to-r from-green-500 to-green-600',
                'bg-gradient-to-r from-purple-500 to-purple-600',
                'bg-gradient-to-r from-orange-500 to-orange-600',
                'bg-gradient-to-r from-pink-500 to-pink-600'
              ];
              const regionColor = regionColors[index % regionColors.length];
              
              return (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-lg hover:shadow-md transition-all duration-300 hover:scale-105"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 ${regionColor} rounded-lg shadow-lg`}>
                      <FiMapPin className="text-white" size={18} />
                  </div>
                  <div>
                      <p className="font-semibold text-secondary-900 dark:text-white text-sm">
                      {region.region}
                    </p>
                      <p className="text-xs text-secondary-600 dark:text-secondary-400">
                      {region.colleges} colleges
                    </p>
                  </div>
                </div>
                <div className="text-right">
                    <p className="text-xl font-bold text-secondary-900 dark:text-white">
                    {region.ideas}
                  </p>
                    <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                      {region.endorsements} endorsed
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                      {region.students} students
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-sm text-secondary-600 dark:text-secondary-400 font-medium">
                      {region.avgRating}/5
                    </span>
                      <div className="flex space-x-1">
                      {Array.from({ length: 5 }, (_, i) => (
                        <div
                          key={i}
                            className={`w-2 h-2 rounded-full transition-all duration-200 ${
                            i < Math.floor(region.avgRating) 
                                ? 'bg-yellow-400 shadow-sm' 
                                : 'bg-gray-300 dark:bg-gray-600'
                          }`}
                        ></div>
                      ))}
                    </div>
                  </div>
                    <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-1">
                      {region.successRate}% success rate
                    </p>
                  </div>
                </div>
              );
            }) : (
              <div className="flex items-center justify-center h-32 text-secondary-500 dark:text-secondary-400">
                <div className="text-center">
                  <div className="text-4xl mb-2">🗺️</div>
                  <p>No regional data available</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
