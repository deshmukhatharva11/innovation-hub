import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  FiCalendar,
  FiClock,
  FiMapPin,
  FiUsers,
  FiExternalLink,
  FiRefreshCw,
  FiFilter,
  FiSearch,
  FiEye,
  FiDownload,
  FiX
} from 'react-icons/fi';
import { studentEventsAPI } from '../../services/api';
import { toast } from 'react-toastify';

const StudentEventsDashboard = () => {
  const { user } = useSelector(state => state.auth);
  const [events, setEvents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      console.log('🔍 Student loading events...');
      const response = await studentEventsAPI.getAll();
      
      console.log('Student events response:', response.data);
      
      if (response.data.success) {
        console.log('✅ Student events loaded successfully');
        console.log('All events:', response.data.data.allEvents.length);
        console.log('Upcoming events:', response.data.data.upcomingEvents.length);
        console.log('Past events:', response.data.data.pastEvents.length);
        
        setEvents(response.data.data.allEvents);
        setUpcomingEvents(response.data.data.upcomingEvents);
        setPastEvents(response.data.data.pastEvents);
      } else {
        console.log('❌ Student events failed:', response.data.message);
        toast.error('Failed to load events');
      }
    } catch (error) {
      console.error('❌ Student events error:', error);
      console.error('Error response:', error.response?.data);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleEventClick = async (event) => {
    try {
      const response = await studentEventsAPI.getById(event.id);
      if (response.data.success) {
        setSelectedEvent(response.data.data);
        setShowEventModal(true);
      }
    } catch (error) {
      console.error('Error loading event details:', error);
      toast.error('Failed to load event details');
    }
  };

  const getEventTypeColor = (type) => {
    const colors = {
      webinar: 'bg-blue-100 text-blue-800',
      workshop: 'bg-green-100 text-green-800',
      ideathon: 'bg-purple-100 text-purple-800',
      competition: 'bg-orange-100 text-orange-800',
      seminar: 'bg-indigo-100 text-indigo-800',
      conference: 'bg-pink-100 text-pink-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[type] || colors.other;
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      published: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      completed: 'bg-blue-100 text-blue-800'
    };
    return colors[status] || colors.draft;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredEvents = () => {
    let filtered = activeTab === 'upcoming' ? upcomingEvents : pastEvents;
    
    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterType !== 'all') {
      filtered = filtered.filter(event => event.event_type === filterType);
    }
    
    return filtered;
  };

  const eventTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'webinar', label: 'Webinar' },
    { value: 'workshop', label: 'Workshop' },
    { value: 'ideathon', label: 'Ideathon' },
    { value: 'competition', label: 'Competition' },
    { value: 'seminar', label: 'Seminar' },
    { value: 'conference', label: 'Conference' },
    { value: 'other', label: 'Other' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Events Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Discover and participate in events organized by your college
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
                <FiCalendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Events</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{events.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 dark:bg-green-900">
                <FiClock className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Upcoming</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{upcomingEvents.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900">
                <FiUsers className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Past Events</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{pastEvents.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                {eventTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
              <button
                onClick={loadEvents}
                className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <FiRefreshCw className="h-4 w-4" />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('upcoming')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'upcoming'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Upcoming Events ({upcomingEvents.length})
              </button>
              <button
                onClick={() => setActiveTab('past')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'past'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Past Events ({pastEvents.length})
              </button>
            </nav>
          </div>

          {/* Events List */}
          <div className="p-6">
            {filteredEvents().length === 0 ? (
              <div className="text-center py-12">
                <FiCalendar className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No events found</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {searchTerm || filterType !== 'all' 
                    ? 'Try adjusting your search or filter criteria'
                    : 'No events available at the moment'
                  }
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents().map((event) => (
                  <div
                    key={event.id}
                    className="bg-white dark:bg-gray-700 rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => handleEventClick(event)}
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            {event.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                            {event.description}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEventTypeColor(event.event_type)}`}>
                          {event.event_type}
                        </span>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <FiCalendar className="h-4 w-4 mr-2" />
                          <span>{formatDate(event.start_date)}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <FiClock className="h-4 w-4 mr-2" />
                          <span>{formatTime(event.start_date)}</span>
                        </div>
                        {event.location && (
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <FiMapPin className="h-4 w-4 mr-2" />
                            <span>{event.location}</span>
                          </div>
                        )}
                        {event.is_online && event.meeting_link && (
                          <div className="flex items-center text-sm text-blue-600 dark:text-blue-400">
                            <FiExternalLink className="h-4 w-4 mr-2" />
                            <span>Online Event</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                          {event.status}
                        </span>
                        <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Event Details Modal */}
        {showEventModal && selectedEvent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {selectedEvent.title}
                  </h2>
                  <button
                    onClick={() => setShowEventModal(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <FiX className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Description</h3>
                    <p className="text-gray-600 dark:text-gray-400">{selectedEvent.description}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-1">Date & Time</h4>
                      <p className="text-gray-600 dark:text-gray-400">
                        {formatDate(selectedEvent.start_date)} at {formatTime(selectedEvent.start_date)}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-1">Type</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEventTypeColor(selectedEvent.event_type)}`}>
                        {selectedEvent.event_type}
                      </span>
                    </div>
                    {selectedEvent.location && (
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-1">Location</h4>
                        <p className="text-gray-600 dark:text-gray-400">{selectedEvent.location}</p>
                      </div>
                    )}
                    {selectedEvent.is_online && selectedEvent.meeting_link && (
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-1">Meeting Link</h4>
                        <a
                          href={selectedEvent.meeting_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
                        >
                          Join Online Event
                        </a>
                      </div>
                    )}
                  </div>

                  {selectedEvent.max_participants && (
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-1">Max Participants</h4>
                      <p className="text-gray-600 dark:text-gray-400">{selectedEvent.max_participants}</p>
                    </div>
                  )}

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      onClick={() => setShowEventModal(false)}
                      className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                    >
                      Close
                    </button>
                    {selectedEvent.meeting_link && (
                      <a
                        href={selectedEvent.meeting_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                      >
                        Join Event
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentEventsDashboard;
