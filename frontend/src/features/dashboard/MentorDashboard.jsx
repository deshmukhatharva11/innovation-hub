import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  FiUsers,
  FiBookOpen,
  FiMessageSquare,
  FiTrendingUp,
  FiEye,
  FiBarChart2,
  FiMapPin,
  FiUserPlus,
  FiFileText,
  FiDownload,
  FiCalendar,
  FiTarget,
  FiAward,
  FiActivity,
  FiEdit3,
  FiStar,
  FiRefreshCw,
  FiChevronRight,
  FiChevronDown,
  FiHome,
  FiGlobe
} from 'react-icons/fi';
import { mentorsAPI, mentorChatAPI, usersAPI } from '../../services/api';
import { toast } from 'react-hot-toast';

const MentorDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState({
    totalStudents: 0,
    myCollegeStudents: 0,
    otherCollegeStudents: 0,
    totalIdeas: 0,
    activeChats: 0,
    rating: 0
  });
  
  const [myCollegeStudents, setMyCollegeStudents] = useState([]);
  const [otherCollegeStudents, setOtherCollegeStudents] = useState([]);
  const [recentChats, setRecentChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('myCollege');

  useEffect(() => {
    fetchDashboardData();
  }, [user?.college_id]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching mentor dashboard data for:', user?.email);
      
      // Call the central dashboard API first
      try {
        const dashboardResponse = await fetch('http://localhost:3001/api/dashboard', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (dashboardResponse.ok) {
          const dashboardData = await dashboardResponse.json();
          console.log('✅ Dashboard API response:', dashboardData);
          
          if (dashboardData.success && dashboardData.data) {
            const { stats, students, conversations } = dashboardData.data;
            
            // Set stats from central dashboard API
            setStats({
              totalStudents: stats.total_students || 0,
              myCollegeStudents: stats.my_college || 0,
              otherCollegeStudents: stats.other_colleges || 0,
              totalIdeas: stats.total_ideas || 0,
              activeChats: stats.active_chats || 0,
              rating: user?.rating || 0
            });
            
            // Set students from central dashboard API
            if (students) {
              setMyCollegeStudents(students.my_college || []);
              setOtherCollegeStudents(students.other_colleges || []);
            }
            
            // Set chats from central dashboard API
            if (conversations) {
              setRecentChats(conversations.slice(0, 5));
            }
            
            console.log('✅ Mentor dashboard data loaded successfully from central API');
            setLoading(false);
            return;
          }
        }
      } catch (dashboardError) {
        console.error('❌ Central dashboard API failed:', dashboardError);
      }
      
      // Fallback to individual APIs if central API fails
      console.log('⚠️ Falling back to individual APIs');
      
      // Initialize with empty data
      let myCollegeStudents = [];
      let otherCollegeStudents = [];
      let chats = [];
      
      // Try to fetch students using users API instead of college coordinator API
      try {
        if (user?.college_id) {
          const myCollegeResponse = await usersAPI.getStudents({
            college_id: user.college_id,
            limit: 10
          });
          myCollegeStudents = myCollegeResponse.data?.data?.students || myCollegeResponse.data?.data || [];
          console.log('✅ My college students:', myCollegeStudents.length);
        }
      } catch (error) {
        console.warn('⚠️ Failed to fetch my college students:', error.message);
      }
      
      // Try to fetch students from other colleges
      try {
        const otherCollegesResponse = await usersAPI.getStudents({
          exclude_college_id: user?.college_id,
          limit: 10
        });
        otherCollegeStudents = otherCollegesResponse.data?.data?.students || otherCollegesResponse.data?.data || [];
        console.log('✅ Other college students:', otherCollegeStudents.length);
      } catch (error) {
        console.warn('⚠️ Failed to fetch other college students:', error.message);
      }
      
      // Try to fetch mentor chats
      try {
        const chatsResponse = await mentorChatAPI.getConversations();
        chats = chatsResponse.data?.data?.conversations || chatsResponse.data?.data || [];
        console.log('✅ Mentor chats:', chats.length);
      } catch (error) {
        console.warn('⚠️ Failed to fetch mentor chats:', error.message);
      }
      
      // Calculate stats
      const totalStudents = myCollegeStudents.length + otherCollegeStudents.length;
      const totalIdeas = myCollegeStudents.reduce((sum, student) => sum + (student.ideas_count || 0), 0) +
                        otherCollegeStudents.reduce((sum, student) => sum + (student.ideas_count || 0), 0);
      
      setStats({
        totalStudents,
        myCollegeStudents: myCollegeStudents.length,
        otherCollegeStudents: otherCollegeStudents.length,
        totalIdeas,
        activeChats: chats.length,
        rating: user?.rating || 0
      });
      
      setMyCollegeStudents(myCollegeStudents);
      setOtherCollegeStudents(otherCollegeStudents);
      setRecentChats(chats.slice(0, 5));
      
      console.log('✅ Mentor dashboard data loaded successfully from individual APIs');
      
    } catch (error) {
      console.error('❌ Error fetching mentor dashboard data:', error);
      toast.error('Failed to load dashboard data');
      
      // Set mock data for testing when APIs fail
      const mockStudents = [
        {
          id: 1,
          name: 'John Doe',
          email: 'john.doe@student.edu',
          college_name: 'Government College of Engineering, Amravati',
          ideas_count: 3,
          status: 'active'
        },
        {
          id: 2,
          name: 'Jane Smith',
          email: 'jane.smith@student.edu',
          college_name: 'Government College of Engineering, Amravati',
          ideas_count: 2,
          status: 'active'
        }
      ];
      
      const mockChats = [
        {
          id: 1,
          student: { name: 'John Doe', email: 'john.doe@student.edu' },
          last_message: 'Thank you for the guidance!',
          created_at: new Date().toISOString()
        }
      ];
      
      setStats({
        totalStudents: mockStudents.length,
        myCollegeStudents: mockStudents.length,
        otherCollegeStudents: 0,
        totalIdeas: mockStudents.reduce((sum, student) => sum + student.ideas_count, 0),
        activeChats: mockChats.length,
        rating: 4.5
      });
      
      setMyCollegeStudents(mockStudents);
      setOtherCollegeStudents([]);
      setRecentChats(mockChats);
      
      console.log('📊 Using mock data for mentor dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading mentor dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Welcome, {user?.name}! 👨‍🏫
        </h1>
        <p className="text-primary-100 mb-4">
          Mentor students across colleges and guide their innovative ideas.
        </p>
        <div className="flex space-x-4">
          <Link
            to="/mentor-chat"
            className="inline-flex items-center px-4 py-2 bg-white text-primary-600 rounded-lg font-medium hover:bg-primary-50 transition-colors duration-200"
          >
            <FiMessageSquare className="mr-2" size={16} />
            View Chats
          </Link>
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-400 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiRefreshCw className={`mr-2 ${loading ? 'animate-spin' : ''}`} size={16} />
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Students</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalStudents}</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
              <FiUsers className="text-blue-600 dark:text-blue-400" size={20} />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">My College</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.myCollegeStudents}</p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
              <FiHome className="text-green-600 dark:text-green-400" size={20} />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Other Colleges</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.otherCollegeStudents}</p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-full">
              <FiGlobe className="text-purple-600 dark:text-purple-400" size={20} />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Chats</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.activeChats}</p>
            </div>
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-full">
              <FiMessageSquare className="text-yellow-600 dark:text-yellow-400" size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Student Sections */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Student Management</h2>
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('myCollege')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                activeTab === 'myCollege'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              <FiHome className="inline mr-2" size={16} />
              My College
            </button>
            <button
              onClick={() => setActiveTab('otherColleges')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                activeTab === 'otherColleges'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              <FiGlobe className="inline mr-2" size={16} />
              Other Colleges
            </button>
          </div>
        </div>

        {/* My College Students */}
        {activeTab === 'myCollege' && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Students from {user?.college?.name || 'Your College'}
            </h3>
            {myCollegeStudents.length > 0 ? (
              <div className="space-y-3">
                {myCollegeStudents.map((student) => (
                  <div key={student.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center">
                        <FiUserPlus className="text-primary-600 dark:text-primary-400" size={20} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{student.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {student.department} • {student.year_of_study} Year
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          {student.college?.district && `${student.college.district}, ${student.college.state}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {student.ideas_count || 0} ideas
                      </span>
                      <Link
                        to={`/mentor-chat?student=${student.id}`}
                        className="px-3 py-1 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 transition-colors duration-200"
                      >
                        Chat
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FiUsers className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-gray-600 dark:text-gray-400">No students from your college yet</p>
              </div>
            )}
          </div>
        )}

        {/* Other Colleges Students */}
        {activeTab === 'otherColleges' && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Students from Other Colleges
            </h3>
            {otherCollegeStudents.length > 0 ? (
              <div className="space-y-3">
                {otherCollegeStudents.map((student) => (
                  <div key={student.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                        <FiGlobe className="text-purple-600 dark:text-purple-400" size={20} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{student.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {student.department} • {student.year_of_study} Year
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          {student.college?.name || 'Unknown College'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          {student.college?.district && `${student.college.district}, ${student.college.state}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {student.ideas_count || 0} ideas
                      </span>
                      <Link
                        to={`/mentor-chat?student=${student.id}`}
                        className="px-3 py-1 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 transition-colors duration-200"
                      >
                        Chat
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FiGlobe className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-gray-600 dark:text-gray-400">No students from other colleges yet</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Recent Chats */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Chats</h2>
          <Link
            to="/mentor-chat"
            className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
          >
            View All →
          </Link>
        </div>
        {recentChats.length > 0 ? (
          <div className="space-y-3">
            {recentChats.map((chat) => (
              <div key={chat.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                    <FiMessageSquare className="text-green-600 dark:text-green-400" size={20} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{chat.student_name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {chat.last_message ? chat.last_message.substring(0, 50) + '...' : 'No messages yet'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {chat.unread_count > 0 && (
                    <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                      {chat.unread_count}
                    </span>
                  )}
                  <Link
                    to={`/mentor-chat?chat=${chat.id}`}
                    className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors duration-200"
                  >
                    Open
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <FiMessageSquare className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-gray-600 dark:text-gray-400">No recent chats</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MentorDashboard;
