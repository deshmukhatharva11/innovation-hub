import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { FiCalendar, FiPlus, FiEdit, FiTrash2, FiUsers, FiMapPin, FiClock, FiTag, FiEye, FiHome } from 'react-icons/fi';
import { eventsAPI } from '../../services/api';

const EventsManagement = () => {
  const { user } = useSelector(state => state.auth);
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    category: '',
    date: '',
    time: '',
    duration: '',
    location: '',
    maxParticipants: '',
    registrationDeadline: '',
    status: 'upcoming',
    organizer: '',
    contactEmail: '',
    contactPhone: '',
    requirements: '',
    agenda: '',
    resources: ''
  });

  const categories = [
    'Workshop',
    'Seminar',
    'Conference',
    'Training',
    'Networking',
    'Competition',
    'Award Ceremony',
    'Guest Lecture',
    'Panel Discussion',
    'Hackathon'
  ];

  // Map frontend category to backend type
  const categoryMapping = {
    'Workshop': 'workshop',
    'Seminar': 'seminar',
    'Conference': 'conference',
    'Training': 'training',
    'Networking': 'networking',
    'Competition': 'competition',
    'Award Ceremony': 'award_ceremony',
    'Guest Lecture': 'guest_lecture',
    'Panel Discussion': 'panel_discussion',
    'Hackathon': 'hackathon'
  };

  useEffect(() => {
    if (user?.role) {
      loadEvents();
    }
  }, [user?.role]);

  useEffect(() => {
    if (events.length > 0) {
      filterEvents();
    }
  }, [events, searchTerm, selectedCategory]);

  const loadEvents = async () => {
    try {
      console.log('🔄 Loading events...');
      // Call the actual API to load ALL events (no pagination limit)
      const response = await eventsAPI.getAll({ limit: 1000 }); // Load up to 1000 events
      
      console.log('📡 API Response:', response.data);
      
      if (response.data?.success && response.data?.data?.events) {
        setEvents(response.data.data.events);
        console.log(`✅ Loaded ${response.data.data.events.length} events`);
      } else {
        setEvents([]);
        console.log('❌ No events found or API error');
        console.log('Response data:', response.data);
      }
    } catch (error) {
      console.error('❌ Error loading events:', error);
      setEvents([]);
    }
  };

  const filterEvents = () => {
    let filtered = events;

    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (event.creator?.name && event.creator.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedCategory) {
      // Map frontend category to backend event_type for filtering
      const backendEventType = categoryMapping[selectedCategory];
      filtered = filtered.filter(event => event.event_type === backendEventType);
    }

    setFilteredEvents(filtered);
  };

  const handleAddEvent = async () => {
    // Frontend validation to match backend requirements
    if (!newEvent.title || !newEvent.date || !newEvent.time || !newEvent.category) {
      alert('Please fill in required fields (Title, Date, Time, Category)');
      return;
    }

    // Validate title length (5-200 characters)
    if (newEvent.title.length < 5 || newEvent.title.length > 200) {
      alert('Title must be between 5 and 200 characters');
      return;
    }

    // Validate description length (1-2000 characters)
    if (newEvent.description && (newEvent.description.length < 1 || newEvent.description.length > 2000)) {
      alert('Description must be between 1 and 2000 characters');
      return;
    }

    // Validate location length (1-200 characters)
    if (newEvent.location && (newEvent.location.length < 1 || newEvent.location.length > 200)) {
      alert('Location must be between 1 and 200 characters');
      return;
    }

    // Validate max participants (1-1000)
    const maxParticipants = parseInt(newEvent.maxParticipants);
    if (isNaN(maxParticipants) || maxParticipants < 1 || maxParticipants > 1000) {
      alert('Max participants must be between 1 and 1000');
      return;
    }

    try {
      // Prepare event data for API
      const eventData = {
        title: newEvent.title,
        description: newEvent.description,
        type: categoryMapping[newEvent.category] || 'workshop',
        start_date: new Date(`${newEvent.date}T${newEvent.time}`).toISOString(),
        end_date: newEvent.duration ? 
          new Date(`${newEvent.date}T${newEvent.time}`).toISOString() : 
          new Date(`${newEvent.date}T${newEvent.time}`).toISOString(),
        location: newEvent.location,
        max_participants: parseInt(newEvent.maxParticipants) || 100
      };

      console.log('🔍 Creating event with data:', eventData);
      console.log('🔍 User role:', user?.role);
      console.log('🔍 User details:', user);

      // Call the backend API to create event
      const response = await eventsAPI.create(eventData);
      
      if (response.data.success) {
        console.log('✅ Event created successfully:', response.data.data.event);
        
        // Refresh events list
        await loadEvents();
        
        // Reset form
        setNewEvent({
          title: '',
          description: '',
          category: '',
          date: '',
          time: '',
          duration: '',
          location: '',
          maxParticipants: '',
          registrationDeadline: '',
          status: 'upcoming',
          organizer: '',
          contactEmail: '',
          contactPhone: '',
          requirements: '',
          agenda: '',
          resources: ''
        });
        setShowAddForm(false);
        alert('Event created successfully!');
      } else {
        alert('Failed to create event: ' + response.data.message);
      }
    } catch (error) {
      console.error('❌ Error creating event:', error);
      alert('Failed to create event: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setNewEvent(event);
    setShowAddForm(true);
  };

  const handleUpdateEvent = async () => {
    // Frontend validation to match backend requirements
    if (!newEvent.title || !newEvent.date || !newEvent.time || !newEvent.category) {
      alert('Please fill in required fields (Title, Date, Time, Category)');
      return;
    }

    // Validate title length (5-200 characters)
    if (newEvent.title.length < 5 || newEvent.title.length > 200) {
      alert('Title must be between 5 and 200 characters');
      return;
    }

    // Validate description length (1-2000 characters)
    if (newEvent.description && (newEvent.description.length < 1 || newEvent.description.length > 2000)) {
      alert('Description must be between 1 and 2000 characters');
      return;
    }

    // Validate location length (1-200 characters)
    if (newEvent.location && (newEvent.location.length < 1 || newEvent.location.length > 200)) {
      alert('Location must be between 1 and 200 characters');
      return;
    }

    // Validate max participants (1-1000)
    const maxParticipants = parseInt(newEvent.maxParticipants);
    if (isNaN(maxParticipants) || maxParticipants < 1 || maxParticipants > 1000) {
      alert('Max participants must be between 1 and 1000');
      return;
    }

    try {
      // Prepare event data for API
      const eventData = {
        title: newEvent.title,
        description: newEvent.description,
        type: categoryMapping[newEvent.category] || 'workshop',
        start_date: new Date(`${newEvent.date}T${newEvent.time}`).toISOString(),
        end_date: newEvent.duration ? 
          new Date(`${newEvent.date}T${newEvent.time}`).toISOString() : 
          new Date(`${newEvent.date}T${newEvent.time}`).toISOString(),
        location: newEvent.location,
        max_participants: parseInt(newEvent.maxParticipants) || 100
      };

      console.log('🔍 Updating event with data:', eventData);

      // Call the backend API to update event
      const response = await eventsAPI.update(editingEvent.id, eventData);
      
      if (response.data.success) {
        console.log('✅ Event updated successfully:', response.data.data.event);
        
        // Refresh events list
        await loadEvents();
        
        // Reset form
        setShowAddForm(false);
        setEditingEvent(null);
        setNewEvent({
          title: '',
          description: '',
          category: '',
          date: '',
          time: '',
          duration: '',
          location: '',
          maxParticipants: '',
          registrationDeadline: '',
          status: 'upcoming',
          organizer: '',
          contactEmail: '',
          contactPhone: '',
          requirements: '',
          agenda: '',
          resources: ''
        });
        alert('Event updated successfully!');
      } else {
        alert('Failed to update event: ' + response.data.message);
      }
    } catch (error) {
      console.error('❌ Error updating event:', error);
      alert('Failed to update event: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        console.log('🔍 Deleting event with ID:', eventId);

        // Call the backend API to delete event
        const response = await eventsAPI.delete(eventId);
        
        if (response.data.success) {
          console.log('✅ Event deleted successfully');
          
          // Refresh events list
          await loadEvents();
          
          alert('Event deleted successfully!');
        } else {
          alert('Failed to delete event: ' + response.data.message);
        }
      } catch (error) {
        console.error('❌ Error deleting event:', error);
        alert('Failed to delete event: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming': return 'bg-green-100 text-green-800';
      case 'ongoing': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'Not specified';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Time';
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      return 'Invalid Time';
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Events Management</h1>
        <p className="text-gray-600">Create and manage events, workshops, and activities</p>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <div className="flex space-x-2">
            <button
              onClick={() => loadEvents()}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
            >
              <FiEye className="mr-2" />
              Refresh Events
            </button>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <FiPlus className="mr-2" />
              Create Event
            </button>
          </div>
        </div>
      </div>

      {/* Add/Edit Event Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {editingEvent ? 'Edit Event' : 'Create New Event'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Event Title *</label>
              <input
                type="text"
                value={newEvent.title}
                onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${
                  newEvent.title.length > 0 && (newEvent.title.length < 5 || newEvent.title.length > 200)
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
                required
              />
              <div className="text-xs text-gray-500 mt-1">
                {newEvent.title.length}/200 characters
                {newEvent.title.length > 0 && newEvent.title.length < 5 && (
                  <span className="text-red-500 ml-2">Minimum 5 characters required</span>
                )}
                {newEvent.title.length > 200 && (
                  <span className="text-red-500 ml-2">Maximum 200 characters allowed</span>
                )}
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <textarea
                value={newEvent.description}
                onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                rows={3}
                className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${
                  newEvent.description.length > 0 && (newEvent.description.length < 20 || newEvent.description.length > 2000)
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
                required
              />
              <div className="text-xs text-gray-500 mt-1">
                {newEvent.description.length}/2000 characters
                {newEvent.description.length > 0 && newEvent.description.length < 20 && (
                  <span className="text-red-500 ml-2">Minimum 20 characters required</span>
                )}
                {newEvent.description.length > 2000 && (
                  <span className="text-red-500 ml-2">Maximum 2000 characters allowed</span>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={newEvent.category}
                onChange={(e) => setNewEvent({...newEvent, category: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Category</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
              <input
                type="date"
                value={newEvent.date}
                onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time *</label>
              <input
                type="time"
                value={newEvent.time}
                onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
              <input
                type="text"
                value={newEvent.duration}
                onChange={(e) => setNewEvent({...newEvent, duration: e.target.value})}
                placeholder="e.g., 2 hours, 1 day"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
              <input
                type="text"
                value={newEvent.location}
                onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${
                  newEvent.location.length > 0 && (newEvent.location.length < 3 || newEvent.location.length > 200)
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
                required
              />
              <div className="text-xs text-gray-500 mt-1">
                {newEvent.location.length}/200 characters
                {newEvent.location.length > 0 && newEvent.location.length < 3 && (
                  <span className="text-red-500 ml-2">Minimum 3 characters required</span>
                )}
                {newEvent.location.length > 200 && (
                  <span className="text-red-500 ml-2">Maximum 200 characters allowed</span>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Participants *</label>
              <input
                type="number"
                value={newEvent.maxParticipants}
                onChange={(e) => setNewEvent({...newEvent, maxParticipants: e.target.value})}
                min="1"
                max="1000"
                className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${
                  newEvent.maxParticipants && (parseInt(newEvent.maxParticipants) < 1 || parseInt(newEvent.maxParticipants) > 1000)
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
                required
              />
              <div className="text-xs text-gray-500 mt-1">
                {newEvent.maxParticipants && parseInt(newEvent.maxParticipants) < 1 && (
                  <span className="text-red-500">Minimum 1 participant required</span>
                )}
                {newEvent.maxParticipants && parseInt(newEvent.maxParticipants) > 1000 && (
                  <span className="text-red-500">Maximum 1000 participants allowed</span>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Registration Deadline</label>
              <input
                type="date"
                value={newEvent.registrationDeadline}
                onChange={(e) => setNewEvent({...newEvent, registrationDeadline: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={newEvent.status}
                onChange={(e) => setNewEvent({...newEvent, status: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Organizer</label>
              <input
                type="text"
                value={newEvent.organizer}
                onChange={(e) => setNewEvent({...newEvent, organizer: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
              <input
                type="email"
                value={newEvent.contactEmail}
                onChange={(e) => setNewEvent({...newEvent, contactEmail: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
              <input
                type="tel"
                value={newEvent.contactPhone}
                onChange={(e) => setNewEvent({...newEvent, contactPhone: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Requirements</label>
              <textarea
                value={newEvent.requirements}
                onChange={(e) => setNewEvent({...newEvent, requirements: e.target.value})}
                rows={2}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="What participants need to bring or prepare"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Agenda</label>
              <textarea
                value={newEvent.agenda}
                onChange={(e) => setNewEvent({...newEvent, agenda: e.target.value})}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Event schedule and activities"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Resources</label>
              <textarea
                value={newEvent.resources}
                onChange={(e) => setNewEvent({...newEvent, resources: e.target.value})}
                rows={2}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Materials, documents, or resources provided"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-4">
            <button
              onClick={() => {
                setShowAddForm(false);
                setEditingEvent(null);
                setNewEvent({
                  title: '',
                  description: '',
                  category: '',
                  date: '',
                  time: '',
                  duration: '',
                  location: '',
                  maxParticipants: '',
                  registrationDeadline: '',
                  status: 'upcoming',
                  organizer: '',
                  contactEmail: '',
                  contactPhone: '',
                  requirements: '',
                  agenda: '',
                  resources: ''
                });
              }}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={editingEvent ? handleUpdateEvent : handleAddEvent}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {editingEvent ? 'Update Event' : 'Create Event'}
            </button>
          </div>
        </div>
      )}

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map((event, index) => (
          <div key={`${event.id}-${index}`} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{event.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{event.description}</p>
                </div>
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => handleEditEvent(event)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <FiEdit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteEvent(event.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <FiTrash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <FiCalendar className="mr-2" />
                  <span>{formatDate(event.start_date)}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <FiClock className="mr-2" />
                  <span>{formatTime(event.start_date)} {event.end_date ? `- ${formatTime(event.end_date)}` : ''}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <FiMapPin className="mr-2" />
                  <span>{event.location}</span>
                </div>
                {event.college && (
                  <div className="flex items-center text-sm text-gray-600">
                    <FiHome className="mr-2" />
                    <span>{event.college.name} {event.college.district && `(${event.college.district})`}</span>
                  </div>
                )}
                <div className="flex items-center text-sm text-gray-600">
                  <FiTag className="mr-2" />
                  <span>{event.event_type}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <FiUsers className="mr-2" />
                  <span>{event.current_participants || 0}/{event.max_participants || 0} participants</span>
                </div>
              </div>

              <div className="flex justify-between items-center mb-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                  {event.status.toUpperCase()}
                </span>
                <span className="text-xs text-gray-500">
                  By {event.creator?.name || 'Unknown'}
                </span>
              </div>

              <div className="text-xs text-gray-500">
                <p>Registration Deadline: {formatDate(event.registration_deadline)}</p>
                <p>Created: {formatDate(event.created_at)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredEvents.length === 0 && (
        <div className="text-center py-8">
          <FiCalendar className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No events found</h3>
          <p className="mt-1 text-sm text-gray-500">Try adjusting your search criteria or create a new event</p>
        </div>
      )}
    </div>
  );
};

export default EventsManagement;
