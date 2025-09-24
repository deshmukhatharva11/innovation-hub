
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { ideasAPI, eventsAPI } from '../../services/api';
import { toast } from 'react-hot-toast';
import { FiEye, FiCheckCircle, FiXCircle, FiFilter, FiCalendar, FiClock, FiMapPin, FiGlobe, FiPlus } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const CollegeAdminDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [ideas, setIdeas] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    submitted: 0,
    endorsed: 0,
    rejected: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    search: '',
  });
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);

  useEffect(() => {
    fetchIdeas();
    fetchEvents();
  }, [filters]);

  const fetchIdeas = async () => {
    try {
      setLoading(true);
      
      // Try to use the central dashboard API first
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
            const { stats, recent_ideas } = dashboardData.data;
            
            // Set ideas from dashboard data
            if (recent_ideas) {
              setIdeas(recent_ideas);
            }
            
            // Set stats from dashboard data
            if (stats) {
              setStats({
                total: stats.total_ideas || 0,
                submitted: stats.submitted_ideas || 0,
                endorsed: stats.endorsed || 0,
                rejected: stats.rejected || 0
              });
            }
            
            console.log('✅ College admin dashboard data loaded successfully from central API');
            setLoading(false);
            return;
          }
        }
      } catch (dashboardError) {
        console.error('❌ Central dashboard API failed:', dashboardError);
      }
      
      // Fallback to ideas API if central API fails
      console.log('⚠️ Falling back to ideas API');
      
      const response = await ideasAPI.getAll({
        college_id: user.college?.id,
        status: filters.status,
        search: filters.search,
      });
      
      if (response.data.success) {
        setIdeas(response.data.data.ideas);
        // Calculate stats
        const ideaStats = response.data.data.ideas.reduce(
          (acc, idea) => {
            acc.total++;
            if (idea.status === 'submitted') acc.submitted++;
            if (idea.status === 'endorsed') acc.endorsed++;
            if (idea.status === 'rejected') acc.rejected++;
            return acc;
          },
          { total: 0, submitted: 0, endorsed: 0, rejected: 0 }
        );
        setStats(ideaStats);
      }
    } catch (error) {
      console.error('Error fetching ideas:', error);
      toast.error('Failed to load ideas');
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      setEventsLoading(true);
      const response = await eventsAPI.getAll({
        college_id: user.college.id,
        limit: 5
      });
      if (response.data.success) {
        setEvents(response.data.data.events || []);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
    } finally {
      setEventsLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleStatusUpdate = async (ideaId, status) => {
    try {
      await ideasAPI.update(ideaId, { status });
      toast.success(`Idea status updated to ${status}`);
      fetchIdeas();
    } catch (error) {
      console.error('Error updating idea status:', error);
      toast.error('Failed to update idea status');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-secondary-900 dark:text-white">
        College Admin Dashboard
      </h1>
      <p className="text-secondary-600 dark:text-secondary-400">
        Welcome, {user.name}. Here you can manage ideas from {user.college.name}.
      </p>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-medium text-secondary-600 dark:text-secondary-400">Total Ideas</h3>
          <p className="text-3xl font-bold text-secondary-900 dark:text-white">{stats.total}</p>
        </div>
        <div className="card p-6">
          <h3 className="text-lg font-medium text-secondary-600 dark:text-secondary-400">Submitted</h3>
          <p className="text-3xl font-bold text-secondary-900 dark:text-white">{stats.submitted}</p>
        </div>
        <div className="card p-6">
          <h3 className="text-lg font-medium text-secondary-600 dark:text-secondary-400">Endorsed</h3>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.endorsed}</p>
        </div>
        <div className="card p-6">
          <h3 className="text-lg font-medium text-secondary-600 dark:text-secondary-400">Rejected</h3>
          <p className="text-3xl font-bold text-red-600 dark:text-red-400">{stats.rejected}</p>
        </div>
      </div>

      {/* Events Section */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-secondary-900 dark:text-white flex items-center">
            <FiCalendar className="mr-2 text-blue-600" />
            Recent Events
          </h2>
          <button className="btn btn-primary flex items-center">
            <FiPlus className="mr-1" size={16} />
            Create Event
          </button>
        </div>
        
        {eventsLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-secondary-600 dark:text-secondary-400">Loading events...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-8">
            <FiCalendar className="mx-auto text-gray-400 mb-3" size={48} />
            <p className="text-secondary-600 dark:text-secondary-400">No events created yet</p>
            <button className="btn btn-primary mt-4">
              <FiPlus className="mr-1" size={16} />
              Create Your First Event
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event) => (
              <div key={event.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-medium text-secondary-900 dark:text-white">
                        {event.title}
                      </h3>
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {event.event_type.replace('_', ' ').toUpperCase()}
                      </span>
                      {new Date(event.start_date) > new Date() && (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          UPCOMING
                        </span>
                      )}
                    </div>
                    
                    {event.description && (
                      <p className="text-secondary-600 dark:text-secondary-400 text-sm mb-3 line-clamp-2">
                        {event.description}
                      </p>
                    )}
                    
                    <div className="flex items-center space-x-4 text-sm text-secondary-500 dark:text-secondary-400">
                      <div className="flex items-center">
                        <FiClock className="mr-1" size={14} />
                        <span>{new Date(event.start_date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</span>
                      </div>
                      
                      {event.location && (
                        <div className="flex items-center">
                          <FiMapPin className="mr-1" size={14} />
                          <span>{event.location}</span>
                        </div>
                      )}
                      
                      {event.is_online && (
                        <div className="flex items-center">
                          <FiGlobe className="mr-1" size={14} />
                          <span>Online Event</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="ml-4">
                    <button className="btn btn-outline">
                      <FiEye className="mr-1" size={14} />
                      View
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex items-center space-x-4">
          <FiFilter className="text-secondary-600 dark:text-secondary-400" />
          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="input"
          >
            <option value="">All Statuses</option>
            <option value="submitted">Submitted</option>
            <option value="under_review">Under Review</option>
            <option value="endorsed">Endorsed</option>
            <option value="rejected">Rejected</option>
          </select>
          <input
            type="text"
            name="search"
            placeholder="Search by title or student name..."
            value={filters.search}
            onChange={handleFilterChange}
            className="input w-full"
          />
        </div>
      </div>

      {/* Ideas Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-secondary-200 dark:divide-secondary-700">
            <thead className="bg-secondary-50 dark:bg-secondary-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Submitted</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-secondary-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-secondary-200 dark:bg-secondary-900 dark:divide-secondary-700">
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-4">Loading...</td>
                </tr>
              ) : ideas.length > 0 ? (
                ideas.map((idea) => (
                  <tr key={idea.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-secondary-900 dark:text-white">{idea.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500 dark:text-secondary-400">{idea.student.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${idea.status === 'endorsed'
                          ? 'bg-green-100 text-green-800'
                          : idea.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                          }`}
                      >
                        {idea.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500 dark:text-secondary-400">{new Date(idea.submission_date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link to={`/ideas/${idea.id}`} className="text-primary-600 hover:text-primary-900">
                        <FiEye className="inline mr-2" />
                        View
                      </Link>
                      <button
                        onClick={() => handleStatusUpdate(idea.id, 'endorsed')}
                        className="text-green-600 hover:text-green-900 ml-4"
                        disabled={idea.status === 'endorsed'}
                      >
                        <FiCheckCircle className="inline mr-2" />
                        Endorse
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(idea.id, 'rejected')}
                        className="text-red-600 hover:text-red-900 ml-4"
                        disabled={idea.status === 'rejected'}
                      >
                        <FiXCircle className="inline mr-2" />
                        Reject
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-4">No ideas found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CollegeAdminDashboard;
