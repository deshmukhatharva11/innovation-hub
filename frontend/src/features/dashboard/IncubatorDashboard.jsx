import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  FiZap,
  FiCheckCircle,
  FiClock,
  FiTrendingUp,
  FiEye,
  FiBarChart2,
  FiMapPin,
  FiUsers,
  FiUser,
  FiUserPlus,
  FiFileText,
  FiDownload,
  FiCalendar,
  FiTarget,
  FiAward,
  FiMessageSquare,
  FiEdit3,
  FiStar,
  FiActivity,
  FiPlus,
  FiX
} from 'react-icons/fi';
import { analyticsAPI, ideasAPI, incubatorsAPI, usersAPI } from '../../services/api';
import { toast } from 'react-hot-toast';
import MentorChatModal from '../../components/common/MentorChatModal';
import useMentorChatModal from '../../hooks/useMentorChatModal';
import useIdeaStatusUpdates from '../../hooks/useIdeaStatusUpdates';

const IncubatorDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const { isOpen: isMentorChatOpen, openModal: openMentorChat, closeModal: closeMentorChat } = useMentorChatModal();
  useIdeaStatusUpdates(); // Listen for status updates
  const [stats, setStats] = useState({
    totalIdeas: 0,
    newSubmissions: 0,
    submittedIdeas: 0,
    underReviewIdeas: 0,
    pendingReview: 0,
    endorsedIdeas: 0,
    incubatedIdeas: 0,
    rejectedIdeas: 0,
    nurturedIdeas: 0,
    acceptedIdeas: 0,
    activeProjects: 0
  });
  const [recentIdeas, setRecentIdeas] = useState([]);
  const [incubatorData, setIncubatorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [colleges, setColleges] = useState([]);
  const [selectedCollege, setSelectedCollege] = useState(null);
  const [collegeStudents, setCollegeStudents] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredColleges, setFilteredColleges] = useState([]);
  const [districtFilter, setDistrictFilter] = useState('');
  const [studentFilters, setStudentFilters] = useState({
    department: '',
    gpaRange: '',
    year: '',
    status: ''
  });
  const [filteredStudents, setFilteredStudents] = useState([]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Set fallback data first
      setStats({
        totalIdeas: 0,
        newSubmissions: 0,
        submittedIdeas: 0,
        underReviewIdeas: 0,
        pendingReview: 0,
        endorsedIdeas: 0,
        incubatedIdeas: 0,
        rejectedIdeas: 0,
        nurturedIdeas: 0,
        acceptedIdeas: 0,
        activeProjects: 0
      });
      setRecentIdeas([]);
      setColleges([]);
      
      // Fetch colleges data - use incubator manager endpoint
      try {
        const collegesResponse = await Promise.race([
          usersAPI.getIncubatorColleges(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
        ]);
        
        if (collegesResponse.data?.success && collegesResponse.data?.data?.colleges) {
          console.log('Fetched colleges:', collegesResponse.data.data.colleges.length);
          console.log('Colleges data:', collegesResponse.data.data.colleges);
          setColleges(collegesResponse.data.data.colleges);
        } else {
          console.error('Colleges response error:', collegesResponse.data);
        }
      } catch (error) {
        console.warn('Colleges fetch failed:', error.message);
        // Fallback to general colleges endpoint
        try {
          const fallbackResponse = await usersAPI.getColleges();
          
          if (fallbackResponse.data?.success && fallbackResponse.data?.data?.colleges) {
            console.log('Fallback colleges fetched:', fallbackResponse.data.data.colleges.length);
            setColleges(fallbackResponse.data.data.colleges);
          } else {
            console.error('Fallback colleges response error:', fallbackResponse.data);
          }
        } catch (fallbackError) {
          console.warn('Fallback colleges fetch also failed:', fallbackError.message);
        }
      }
      
      // Fetch incubator data with timeout
      if (user?.incubator_id) {
        try {
          const incubatorResponse = await Promise.race([
            incubatorsAPI.getById(user.incubator_id),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
          ]);
          if (incubatorResponse.data?.success && incubatorResponse.data?.data?.incubator) {
          setIncubatorData(incubatorResponse.data.data.incubator);
          }
        } catch (error) {
          console.warn('Incubator data fetch failed:', error.message);
        }
      }
      
      // Fetch analytics data with timeout and fallback
      try {
        const analyticsResponse = await Promise.race([
          analyticsAPI.getDashboardStats({ period: '30d' }),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 8000))
        ]);
        
        if (analyticsResponse.data?.success && analyticsResponse.data?.data?.analytics) {
        const analytics = analyticsResponse.data.data.analytics;
        const statusCounts = analytics.ideas?.by_status || [];
        
        setStats({
          totalIdeas: analytics.ideas?.total || 0,
          newSubmissions: statusCounts.find(s => s.status === 'new_submission')?.count || 0,
          submittedIdeas: statusCounts.find(s => s.status === 'submitted')?.count || 0,
          underReviewIdeas: statusCounts.find(s => s.status === 'under_review')?.count || 0,
          pendingReview: statusCounts.find(s => s.status === 'endorsed')?.count || 0,
          endorsedIdeas: statusCounts.find(s => s.status === 'endorsed')?.count || 0,
          incubatedIdeas: statusCounts.find(s => s.status === 'incubated')?.count || 0,
          rejectedIdeas: statusCounts.find(s => s.status === 'rejected')?.count || 0,
          nurturedIdeas: statusCounts.find(s => s.status === 'nurtured')?.count || 0,
          acceptedIdeas: analytics.ideas?.incubated || 0,
          activeProjects: analytics.ideas?.incubated || 0
        });
        }
      } catch (error) {
        console.warn('Analytics fetch failed:', error.message);
        // Use fallback stats
        setStats({
          totalIdeas: 0,
          newSubmissions: 0,
          submittedIdeas: 0,
          underReviewIdeas: 0,
          pendingReview: 0,
          endorsedIdeas: 0,
          incubatedIdeas: 0,
          rejectedIdeas: 0,
          nurturedIdeas: 0,
          acceptedIdeas: 0,
          activeProjects: 0
        });
      }
      
      // Fetch recent ideas with timeout
      try {
        const ideasResponse = await Promise.race([
          ideasAPI.getAll({
            incubator_id: user?.incubator_id,
            status: 'endorsed',
            limit: 5,
            sort_by: 'created_at',
            sort_order: 'desc'
          }),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
        ]);

        if (ideasResponse.data?.success && ideasResponse.data?.data?.ideas) {
        setRecentIdeas(ideasResponse.data.data.ideas.map(idea => ({
          id: idea.id,
          title: idea.title,
          studentName: idea.student?.name || 'Unknown',
          college: idea.college?.name || 'Unknown',
          submittedAt: idea.created_at,
          status: idea.status,
          category: idea.category
        })));
        }
      } catch (error) {
        console.warn('Ideas fetch failed:', error.message);
        setRecentIdeas([]);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Some dashboard data failed to load, but you can still use the system');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user?.incubator_id]);

  // Listen for idea status changes and refresh dashboard
  useEffect(() => {
    const handleIdeaStatusChanged = () => {
      console.log('🔄 Idea status changed, refreshing incubator dashboard...');
      fetchDashboardData();
    };

    const handleIdeaCreated = () => {
      console.log('✨ New idea created, refreshing incubator dashboard...');
      fetchDashboardData();
    };

    window.addEventListener('ideaStatusChanged', handleIdeaStatusChanged);
    window.addEventListener('ideaCreated', handleIdeaCreated);

    return () => {
      window.removeEventListener('ideaStatusChanged', handleIdeaStatusChanged);
      window.removeEventListener('ideaCreated', handleIdeaCreated);
    };
  }, [fetchDashboardData]);

  // Filter colleges based on search term and district
  useEffect(() => {
    let filtered = colleges;

    if (searchTerm) {
      filtered = filtered.filter(college =>
        college.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        college.district?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        college.city?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (districtFilter) {
      filtered = filtered.filter(college => college.district === districtFilter);
    }

    setFilteredColleges(filtered);
  }, [colleges, searchTerm, districtFilter]);

  // Filter students based on filters
  useEffect(() => {
    let filtered = collegeStudents;

    if (studentFilters.department) {
      filtered = filtered.filter(student => 
        student.department?.toLowerCase().includes(studentFilters.department.toLowerCase())
      );
    }

    if (studentFilters.gpaRange) {
      const [min, max] = studentFilters.gpaRange.split('-').map(Number);
      filtered = filtered.filter(student => {
        const gpa = parseFloat(student.gpa);
        return gpa >= min && gpa <= max;
      });
    }

    if (studentFilters.year) {
      filtered = filtered.filter(student => 
        student.year_of_study?.toString() === studentFilters.year
      );
    }

    if (studentFilters.status) {
      switch (studentFilters.status) {
        case 'active':
          filtered = filtered.filter(student => student.is_active !== false);
          break;
        case 'inactive':
          filtered = filtered.filter(student => student.is_active === false);
          break;
        case 'with_ideas':
          filtered = filtered.filter(student => student.ideas && student.ideas.length > 0);
          break;
        case 'without_ideas':
          filtered = filtered.filter(student => !student.ideas || student.ideas.length === 0);
          break;
        default:
          break;
      }
    }

    setFilteredStudents(filtered);
  }, [collegeStudents, studentFilters]);

  const handleCollegeSelect = async (college) => {
    try {
      console.log('Selected college:', college);
      setSelectedCollege(college);
      setActiveTab('college-details');
      
      // Fetch students for selected college
      console.log('Fetching students for college ID:', college.id);
      const studentsResponse = await usersAPI.getStudents({ college_id: college.id });
      
      console.log('Students response:', studentsResponse.data);
      
      if (studentsResponse.data?.success && studentsResponse.data?.data?.students) {
        console.log('Found students:', studentsResponse.data.data.students.length);
        setCollegeStudents(studentsResponse.data.data.students);
      } else {
        console.log('No students found or API error');
        setCollegeStudents([]);
      }
    } catch (error) {
      console.error('Error fetching college students:', error);
      toast.error('Failed to fetch college students');
      setCollegeStudents([]);
    }
  };

  const handleBackToOverview = () => {
    setSelectedCollege(null);
    setActiveTab('overview');
    setCollegeStudents([]);
    setFilteredStudents([]);
  };

  const handleStudentFilterChange = (filterType, value) => {
    setStudentFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const clearStudentFilters = () => {
    setStudentFilters({
      department: '',
      gpaRange: '',
      year: '',
      status: ''
    });
  };

  const exportCollegeData = () => {
    const csvContent = [
      ['College Name', 'District', 'City', 'State', 'Total Students', 'Total Ideas', 'Endorsed Ideas', 'Incubated Ideas', 'Endorsement Rate'],
      ...filteredColleges.map(college => [
        college.name,
        college.district || 'N/A',
        college.city || 'N/A',
        college.state || 'N/A',
        college.total_students || 0,
        college.total_ideas || 0,
        college.endorsed_ideas || 0,
        college.incubated_ideas || 0,
        college.total_ideas > 0 ? `${Math.round(((college.endorsed_ideas || 0) / college.total_ideas) * 100)}%` : '0%'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `college-oversight-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast.success('College data exported successfully!');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'endorsed': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'incubated': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'under_review': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      default: return 'text-secondary-600 bg-secondary-100 dark:bg-secondary-900/20';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading dashboard...</p>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-500">
            This may take a moment due to database queries
          </p>
          <button
            onClick={fetchDashboardData}
            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200"
          >
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Welcome, {user?.name}! 🚀
        </h1>
        <p className="text-primary-100 mb-4">
          Manage and nurture innovative ideas in your incubator.
        </p>
        <div className="flex space-x-4">
          <Link
            to="/ideas/review"
            className="inline-flex items-center px-4 py-2 bg-white text-primary-600 rounded-lg font-medium hover:bg-primary-50 transition-colors duration-200"
          >
            <FiCheckCircle className="mr-2" size={16} />
            Review Ideas
          </Link>
          <Link
            to="/analytics"
            className="inline-flex items-center px-4 py-2 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-400 transition-colors duration-200"
          >
            <FiBarChart2 className="mr-2" size={16} />
            View Analytics
          </Link>
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-400 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiActivity className={`mr-2 ${loading ? 'animate-spin' : ''}`} size={16} />
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Incubator Info */}
      {incubatorData && (
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {incubatorData.name}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {incubatorData.description}
              </p>
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <FiMapPin className="text-gray-400" size={16} />
                  <span className="text-gray-600 dark:text-gray-400">
                    {incubatorData.city}, {incubatorData.state}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <FiUsers className="text-gray-400" size={16} />
                  <span className="text-gray-600 dark:text-gray-400">
                    {incubatorData.current_occupancy}/{incubatorData.capacity} capacity
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary-600">
                {incubatorData.capacity ? Math.round((incubatorData.current_occupancy / incubatorData.capacity) * 100) : 0}%
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Occupancy Rate</p>
            </div>
          </div>
        </div>
      )}

      {/* College Oversight Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                College Oversight
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Monitor all colleges across districts
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                  activeTab === 'overview'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                Overview
              </button>
              {selectedCollege && (
                <button
                  onClick={() => setActiveTab('college-details')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                    activeTab === 'college-details'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                  }`}
                >
                  {selectedCollege.name}
                </button>
              )}
              {activeTab === 'overview' && filteredColleges.length > 0 && (
                <button
                  onClick={exportCollegeData}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center space-x-2"
                >
                  <FiDownload size={16} />
                  <span>Export CSV</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {activeTab === 'overview' ? (
          <div className="p-6">
            {/* Search and Filter Controls */}
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Search Colleges
                  </label>
                  <input
                    type="text"
                    placeholder="Search by name, district, or city..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Filter by District
                  </label>
                  <select
                    value={districtFilter}
                    onChange={(e) => setDistrictFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">All Districts</option>
                    {[...new Set(colleges.map(c => c.district).filter(Boolean))].sort().map(district => (
                      <option key={district} value={district}>{district}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setDistrictFilter('');
                    }}
                    className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors duration-200"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>

            {/* District Summary */}
            {colleges.length > 0 && (
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">District Overview</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {(() => {
                    const districtStats = colleges.reduce((acc, college) => {
                      const district = college.district || 'Unknown';
                      if (!acc[district]) {
                        acc[district] = {
                          colleges: 0,
                          students: 0,
                          ideas: 0,
                          endorsed: 0
                        };
                      }
                      acc[district].colleges += 1;
                      acc[district].students += college.total_students || 0;
                      acc[district].ideas += college.total_ideas || 0;
                      acc[district].endorsed += college.endorsed_ideas || 0;
                      return acc;
                    }, {});

                    return Object.entries(districtStats).map(([district, stats]) => (
                      <div key={district} className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                        <h4 className="font-medium text-gray-900 dark:text-white">{district}</h4>
                        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                          <div>{stats.colleges} colleges</div>
                          <div>{stats.students} students</div>
                          <div>{stats.ideas} ideas</div>
                          <div className="text-green-600 dark:text-green-400">{stats.endorsed} endorsed</div>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            )}

            {/* Results Summary */}
            {filteredColleges.length > 0 && (
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-blue-800 dark:text-blue-200">
                    Showing {filteredColleges.length} of {colleges.length} colleges
                    {searchTerm && ` matching "${searchTerm}"`}
                    {districtFilter && ` in ${districtFilter} district`}
                  </span>
                  <div className="flex items-center space-x-4 text-blue-700 dark:text-blue-300">
                    <span>Total Students: {filteredColleges.reduce((sum, c) => sum + (c.total_students || 0), 0)}</span>
                    <span>Total Ideas: {filteredColleges.reduce((sum, c) => sum + (c.total_ideas || 0), 0)}</span>
                    <span>Endorsed: {filteredColleges.reduce((sum, c) => sum + (c.endorsed_ideas || 0), 0)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* College Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredColleges.map((college) => (
                <div
                  key={college.id}
                  onClick={() => handleCollegeSelect(college)}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-300 dark:hover:border-primary-600 cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                      {college.name}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 text-xs rounded-full">
                        {college.district || 'Unknown'}
                      </span>
                      <FiMapPin className="text-gray-400" size={16} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <FiMapPin className="mr-2" size={14} />
                      {college.district && college.state 
                        ? `${college.district}, ${college.state}`
                        : college.city && college.state 
                        ? `${college.city}, ${college.state}`
                        : 'Location not specified'
                      }
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <FiUsers className="mr-2" size={14} />
                        {college.total_students || 0} students
                      </div>
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <FiZap className="mr-2" size={14} />
                        {college.total_ideas || 0} ideas
                      </div>
                      <div className="flex items-center text-green-600 dark:text-green-400">
                        <FiCheckCircle className="mr-2" size={14} />
                        {college.endorsed_ideas || 0} endorsed
                      </div>
                      <div className="flex items-center text-purple-600 dark:text-purple-400">
                        <FiTrendingUp className="mr-2" size={14} />
                        {college.incubated_ideas || 0} incubated
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-primary-600 dark:text-primary-400 font-medium">
                        Click to view details →
                      </span>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {college.total_ideas > 0 ? 
                          `${Math.round(((college.endorsed_ideas || 0) / college.total_ideas) * 100)}% endorsed` : 
                          'No ideas yet'
                        }
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredColleges.length === 0 && colleges.length > 0 && (
              <div className="text-center py-12">
                <FiUsers className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Colleges Match Your Filters</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Try adjusting your search terms or district filter.
                </p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setDistrictFilter('');
                  }}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200"
                >
                  Clear Filters
                </button>
              </div>
            )}

            {colleges.length === 0 && (
              <div className="text-center py-12">
                <FiUsers className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Colleges Found</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  No colleges are currently associated with your incubator.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {selectedCollege.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {selectedCollege.district && selectedCollege.state 
                    ? `${selectedCollege.district}, ${selectedCollege.state}`
                    : selectedCollege.city && selectedCollege.state 
                    ? `${selectedCollege.city}, ${selectedCollege.state}`
                    : 'Location not specified'
                  }
                </p>
              </div>
              <button
                onClick={handleBackToOverview}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
              >
                ← Back to Overview
              </button>
            </div>

            {/* College Statistics */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Students</p>
                    <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{collegeStudents.length}</p>
                  </div>
                  <FiUsers className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600 dark:text-green-400">Filtered Students</p>
                    <p className="text-2xl font-bold text-green-900 dark:text-green-100">{filteredStudents.length}</p>
                  </div>
                  <FiUser className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600 dark:text-purple-400">With Ideas</p>
                    <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                      {filteredStudents.filter(s => s.ideas && s.ideas.length > 0).length}
                    </p>
                  </div>
                  <FiZap className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Endorsed Ideas</p>
                    <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                      {filteredStudents.reduce((total, s) => 
                        total + (s.ideas ? s.ideas.filter(idea => idea.status === 'endorsed').length : 0), 0
                      )}
                    </p>
                  </div>
                  <FiCheckCircle className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </div>

            {/* Student Filters */}
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">Filter Students</h4>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Department
                  </label>
                  <select 
                    value={studentFilters.department}
                    onChange={(e) => handleStudentFilterChange('department', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">All Departments</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Electrical Engineering">Electrical Engineering</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Civil Engineering">Civil Engineering</option>
                    <option value="Electronics Engineering">Electronics Engineering</option>
                    <option value="Chemical Engineering">Chemical Engineering</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Mechanical">Mechanical</option>
                    <option value="Civil">Civil</option>
                    <option value="Chemical">Chemical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    GPA Range
                  </label>
                  <select 
                    value={studentFilters.gpaRange}
                    onChange={(e) => handleStudentFilterChange('gpaRange', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">All GPA</option>
                    <option value="8-10">8.0 - 10.0</option>
                    <option value="6-8">6.0 - 8.0</option>
                    <option value="4-6">4.0 - 6.0</option>
                    <option value="0-4">0.0 - 4.0</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Year of Study
                  </label>
                  <select 
                    value={studentFilters.year}
                    onChange={(e) => handleStudentFilterChange('year', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">All Years</option>
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Status
                  </label>
                  <select 
                    value={studentFilters.status}
                    onChange={(e) => handleStudentFilterChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="with_ideas">With Ideas</option>
                    <option value="without_ideas">Without Ideas</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={clearStudentFilters}
                    className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors duration-200"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>

            {/* Students List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Students ({filteredStudents.length} of {collegeStudents.length})
                </h4>
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <span>Last updated: {new Date().toLocaleTimeString()}</span>
                  <button
                    onClick={() => handleCollegeSelect(selectedCollege)}
                    className="px-3 py-1 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200"
                  >
                    Refresh
                  </button>
                </div>
              </div>
              
              {filteredStudents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredStudents.map((student) => (
                    <div
                      key={student.id}
                      className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-lg transition-all duration-200 hover:border-primary-300 dark:hover:border-primary-600"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="font-medium text-gray-900 dark:text-white truncate">
                          {student.name}
                        </h5>
                        <div className="flex items-center space-x-2">
                          {student.is_active !== false && (
                            <span className="w-2 h-2 bg-green-500 rounded-full" title="Active"></span>
                          )}
                          <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center">
                            <FiUser className="text-primary-600 dark:text-primary-400" size={16} />
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2 mb-3">
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <FiEdit3 className="mr-2" size={14} />
                          {student.department || 'N/A'}
                        </div>
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <FiStar className="mr-2" size={14} />
                          GPA: {student.gpa || 'N/A'}
                        </div>
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <FiCalendar className="mr-2" size={14} />
                          Year: {student.year_of_study || 'N/A'}
                        </div>
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <FiMessageSquare className="mr-2" size={14} />
                          {student.email}
                        </div>
                      </div>

                      {/* Ideas Summary */}
                      <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center text-gray-600 dark:text-gray-400">
                            <FiZap className="mr-2" size={14} />
                            Ideas: {student.ideas ? student.ideas.length : 0}
                          </div>
                          {student.ideas && student.ideas.length > 0 && (
                            <div className="flex space-x-1">
                              {student.ideas.filter(idea => idea.status === 'endorsed').length > 0 && (
                                <span className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 text-xs rounded-full">
                                  {student.ideas.filter(idea => idea.status === 'endorsed').length} endorsed
                                </span>
                              )}
                              {student.ideas.filter(idea => idea.status === 'incubated').length > 0 && (
                                <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-400 text-xs rounded-full">
                                  {student.ideas.filter(idea => idea.status === 'incubated').length} incubated
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : collegeStudents.length > 0 ? (
                <div className="text-center py-12">
                  <FiUsers className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Students Match Your Filters</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    Try adjusting your filter criteria to see more students.
                  </p>
                  <button
                    onClick={clearStudentFilters}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200"
                  >
                    Clear Filters
                  </button>
                </div>
              ) : (
                <div className="text-center py-12">
                  <FiUsers className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Students Found</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    No students are currently registered in this college.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Ideas</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalIdeas}</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
              <FiZap className="text-blue-600 dark:text-blue-400" size={20} />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Review</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pendingReview}</p>
            </div>
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-full">
              <FiClock className="text-yellow-600 dark:text-yellow-400" size={20} />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Accepted Ideas</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.acceptedIdeas}</p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
              <FiCheckCircle className="text-green-600 dark:text-green-400" size={20} />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Projects</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.activeProjects}</p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-full">
              <FiTrendingUp className="text-purple-600 dark:text-purple-400" size={20} />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">New Submissions</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.newSubmissions}</p>
            </div>
            <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-full">
              <FiPlus className="text-orange-600 dark:text-orange-400" size={20} />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Under Review</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.underReviewIdeas}</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
              <FiEye className="text-blue-600 dark:text-blue-400" size={20} />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Endorsed Ideas</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.endorsedIdeas}</p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
              <FiCheckCircle className="text-green-600 dark:text-green-400" size={20} />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Rejected Ideas</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.rejectedIdeas}</p>
            </div>
            <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-full">
              <FiX className="text-red-600 dark:text-red-400" size={20} />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Nurtured Ideas</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.nurturedIdeas}</p>
            </div>
            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/20 rounded-full">
              <FiTarget className="text-indigo-600 dark:text-indigo-400" size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Ideas */}
      <div className="card">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Endorsed Ideas</h2>
          <Link
            to="/ideas"
            className="text-primary-600 hover:text-primary-500 font-medium text-sm"
          >
            View All
          </Link>
        </div>
        <div className="p-6">
          {recentIdeas.length === 0 ? (
            <div className="text-center py-8">
              <FiZap className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No endorsed ideas yet</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Ideas will appear here once they are endorsed by colleges.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentIdeas.map((idea) => (
                <div key={idea.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-white">{idea.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      by {idea.studentName} • {idea.college}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      Endorsed {formatDate(idea.submittedAt)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(idea.status)}`}>
                      {idea.status.replace('_', ' ').toUpperCase()}
                    </span>
                    <Link
                      to={`/ideas/${idea.id}`}
                      className="text-primary-600 hover:text-primary-500"
                    >
                      <FiEye size={16} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link
              to="/ideas/review"
              className="flex items-center p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors duration-200"
            >
              <FiCheckCircle className="text-primary-600 dark:text-primary-400 mr-3" size={20} />
              <span className="font-medium text-primary-700 dark:text-primary-300">Review Endorsed Ideas</span>
            </Link>
            <Link
              to="/analytics"
              className="flex items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors duration-200"
            >
              <FiBarChart2 className="text-blue-600 dark:text-blue-400 mr-3" size={20} />
              <span className="font-medium text-blue-700 dark:text-blue-300">View Analytics</span>
            </Link>
            <Link
              to="/incubator/settings"
              className="flex items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors duration-200"
            >
              <FiTrendingUp className="text-green-600 dark:text-green-400 mr-3" size={20} />
              <span className="font-medium text-green-700 dark:text-green-300">Manage Incubator</span>
            </Link>
            <button
              onClick={openMentorChat}
              className="flex items-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors duration-200 w-full text-left"
            >
              <FiMessageSquare className="text-purple-600 dark:text-purple-400 mr-3" size={20} />
              <span className="font-medium text-purple-700 dark:text-purple-300">Mentor Chat</span>
            </button>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {recentIdeas.slice(0, 3).map((idea) => (
              <div key={idea.id} className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900 dark:text-white">
                    New endorsed idea: <span className="font-medium">{idea.title}</span>
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(idea.submittedAt)}
                  </p>
                </div>
              </div>
            ))}
            {recentIdeas.length === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400">No recent activity</p>
            )}
          </div>
        </div>
      </div>

      {/* Focus Areas */}
      {incubatorData?.focus_areas && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Focus Areas</h3>
          <div className="flex flex-wrap gap-2">
            {incubatorData.focus_areas.map((area, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium"
              >
                {area}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Enhanced Features Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Forwarded Ideas Review */}
        <div className="card">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <FiCheckCircle className="mr-2" size={20} />
              Forwarded Ideas Review
            </h2>
            <Link
              to="/ideas/review-forwarded"
              className="text-primary-600 hover:text-primary-500 font-medium text-sm"
            >
              Review All
            </Link>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-green-900 dark:text-green-100">Smart Campus System</h3>
                    <p className="text-sm text-green-700 dark:text-green-200 mt-1">Forwarded by GCE Amravati</p>
                    <p className="text-xs text-green-600 dark:text-green-300 mt-2">Innovation Score: 8.5/10</p>
                  </div>
                  <div className="flex space-x-2">
                    <button className="px-3 py-1 bg-green-600 text-white text-xs rounded-full hover:bg-green-700">
                      Select for Incubation
                    </button>
                    <button className="px-3 py-1 bg-blue-600 text-white text-xs rounded-full hover:bg-blue-700">
                      Re-evaluate
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-blue-900 dark:text-blue-100">HealthCare AI</h3>
                    <p className="text-sm text-blue-700 dark:text-blue-200 mt-1">Forwarded by Jotiba Fule College</p>
                    <p className="text-xs text-blue-600 dark:text-blue-300 mt-2">Innovation Score: 9.2/10</p>
                  </div>
                  <div className="flex space-x-2">
                    <button className="px-3 py-1 bg-green-600 text-white text-xs rounded-full hover:bg-green-700">
                      Select for Incubation
                    </button>
                    <button className="px-3 py-1 bg-blue-600 text-white text-xs rounded-full hover:bg-blue-700">
                      Re-evaluate
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mentor Database */}
        <div className="card">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <FiUserPlus className="mr-2" size={20} />
              Mentor Database
            </h2>
            <Link
              to="/mentors"
              className="text-primary-600 hover:text-primary-500 font-medium text-sm"
            >
              Manage Mentors
            </Link>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">DR</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-purple-900 dark:text-purple-100">Dr. Rajesh Kumar</h3>
                    <p className="text-sm text-purple-700 dark:text-purple-200">Technology Expert</p>
                    <p className="text-xs text-purple-600 dark:text-purple-300">Available for 3 projects</p>
                  </div>
                  <button className="px-3 py-1 bg-purple-600 text-white text-xs rounded-full hover:bg-purple-700">
                    Assign
                  </button>
                </div>
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">SM</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-blue-900 dark:text-blue-100">Sneha Mehta</h3>
                    <p className="text-sm text-blue-700 dark:text-blue-200">Business Development</p>
                    <p className="text-xs text-blue-600 dark:text-blue-300">Available for 2 projects</p>
                  </div>
                  <button className="px-3 py-1 bg-blue-600 text-white text-xs rounded-full hover:bg-blue-700">
                    Assign
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pre-Incubatees Progress Tracker */}
      <div className="card">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <FiActivity className="mr-2" size={20} />
            Pre-Incubatees Progress Tracker
          </h2>
          <Link
            to="/pre-incubatees"
            className="text-primary-600 hover:text-primary-500 font-medium text-sm"
          >
            View All
          </Link>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">AgriTech Solutions</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">by Sneha Joshi</p>
                </div>
                <span className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 rounded-full text-xs font-medium">
                  Phase 2: Development
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                <div className="bg-green-600 h-2 rounded-full" style={{width: '65%'}}></div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">65% Complete - MVP Development</p>
            </div>
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">HealthCare AI</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">by Vikram Kulkarni</p>
                </div>
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 rounded-full text-xs font-medium">
                  Phase 1: Research
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{width: '30%'}}></div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">30% Complete - Market Research</p>
            </div>
          </div>
        </div>
      </div>

      {/* Comprehensive Reporting */}
      <div className="card">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <FiFileText className="mr-2" size={20} />
            Comprehensive Reports
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
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">University Report</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Total ideas, colleges involved, funding</p>
              <button className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200">
                Generate Report
              </button>
            </div>
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">College-wise Reports</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Individual college feedback summaries</p>
              <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200">
                Generate Report
              </button>
            </div>
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">Mentor Performance</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Mentor assignments and outcomes</p>
              <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
                Generate Report
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Services Offered */}
      {incubatorData?.services_offered && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Services Offered</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {incubatorData.services_offered.map((service, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                <span className="text-gray-700 dark:text-gray-300">{service}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Mentor Chat Modal */}
      <MentorChatModal 
        isOpen={isMentorChatOpen} 
        onClose={closeMentorChat} 
        userRole="incubator_manager"
      />
    </div>
  );
};

export default IncubatorDashboard;
