import React, { useState, useEffect } from 'react';
import { FiUser, FiMail, FiPhone, FiMapPin, FiBriefcase, FiAward, FiSearch, FiPlus, FiEdit, FiTrash2, FiStar } from 'react-icons/fi';

const MentorDatabase = () => {
  const [mentors, setMentors] = useState([]);
  const [filteredMentors, setFilteredMentors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMentor, setEditingMentor] = useState(null);
  const [newMentor, setNewMentor] = useState({
    name: '',
    email: '',
    phone: '',
    specialization: '',
    experience: '',
    organization: '',
    location: '',
    rating: 0,
    availability: 'Available',
    bio: '',
    achievements: '',
    linkedin: '',
    website: ''
  });

  const specializations = [
    'Technology & Innovation',
    'Business Development',
    'Marketing & Sales',
    'Finance & Investment',
    'Agriculture Technology',
    'Environmental Science',
    'Education Technology',
    'Healthcare Technology',
    'Manufacturing',
    'Social Entrepreneurship'
  ];

  useEffect(() => {
    loadMentors();
  }, []);

  useEffect(() => {
    filterMentors();
  }, [mentors, searchTerm, selectedSpecialization]);

  const loadMentors = () => {
    // Mock data - in real app, this would come from API
    const mockMentors = [
      {
        id: 1,
        name: 'Dr. Rajesh Kumar',
        email: 'rajesh.kumar@sgbau.ac.in',
        phone: '+91-9876543210',
        specialization: 'Technology & Innovation',
        experience: '15 years',
        organization: 'SGBAU Research Foundation',
        location: 'Amravati',
        rating: 4.8,
        availability: 'Available',
        bio: 'Expert in AI/ML technologies with extensive experience in startup mentoring',
        achievements: 'Mentored 50+ startups, 3 patents, Industry expert',
        linkedin: 'https://linkedin.com/in/rajeshkumar',
        website: 'https://rajeshkumar.com',
        joinedDate: '2023-01-15',
        mentoredStartups: 25
      },
      {
        id: 2,
        name: 'Ms. Priya Sharma',
        email: 'priya.sharma@techcorp.com',
        phone: '+91-9876543211',
        specialization: 'Business Development',
        experience: '12 years',
        organization: 'TechCorp Solutions',
        location: 'Mumbai',
        rating: 4.6,
        availability: 'Available',
        bio: 'Business development expert with focus on scaling startups',
        achievements: 'Successfully scaled 20+ startups, MBA from IIM',
        linkedin: 'https://linkedin.com/in/priyasharma',
        website: 'https://priyasharma.com',
        joinedDate: '2023-02-20',
        mentoredStartups: 18
      },
      {
        id: 3,
        name: 'Dr. Amit Patel',
        email: 'amit.patel@agritech.org',
        phone: '+91-9876543212',
        specialization: 'Agriculture Technology',
        experience: '18 years',
        organization: 'AgriTech Foundation',
        location: 'Pune',
        rating: 4.9,
        availability: 'Available',
        bio: 'Agricultural technology expert with focus on sustainable farming',
        achievements: 'PhD in Agricultural Engineering, 5 patents in AgriTech',
        linkedin: 'https://linkedin.com/in/amitpatel',
        website: 'https://amitpatel.com',
        joinedDate: '2023-03-10',
        mentoredStartups: 32
      },
      {
        id: 4,
        name: 'Mr. Suresh Gupta',
        email: 'suresh.gupta@finance.com',
        phone: '+91-9876543213',
        specialization: 'Finance & Investment',
        experience: '20 years',
        organization: 'Investment Partners',
        location: 'Delhi',
        rating: 4.7,
        availability: 'Limited',
        bio: 'Investment banking expert with focus on early-stage funding',
        achievements: 'Managed $100M+ in investments, CFA certified',
        linkedin: 'https://linkedin.com/in/sureshgupta',
        website: 'https://sureshgupta.com',
        joinedDate: '2023-01-25',
        mentoredStartups: 15
      }
    ];
    setMentors(mockMentors);
  };

  const filterMentors = () => {
    let filtered = mentors;

    if (searchTerm) {
      filtered = filtered.filter(mentor =>
        mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mentor.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mentor.organization.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedSpecialization) {
      filtered = filtered.filter(mentor => mentor.specialization === selectedSpecialization);
    }

    setFilteredMentors(filtered);
  };

  const handleAddMentor = () => {
    if (!newMentor.name || !newMentor.email || !newMentor.specialization) {
      alert('Please fill in required fields');
      return;
    }

    const mentor = {
      ...newMentor,
      id: mentors.length + 1,
      joinedDate: new Date().toISOString().split('T')[0],
      mentoredStartups: 0
    };

    setMentors([...mentors, mentor]);
    setNewMentor({
      name: '',
      email: '',
      phone: '',
      specialization: '',
      experience: '',
      organization: '',
      location: '',
      rating: 0,
      availability: 'Available',
      bio: '',
      achievements: '',
      linkedin: '',
      website: ''
    });
    setShowAddForm(false);
    alert('Mentor added successfully!');
  };

  const handleEditMentor = (mentor) => {
    setEditingMentor(mentor);
    setNewMentor(mentor);
    setShowAddForm(true);
  };

  const handleUpdateMentor = () => {
    const updatedMentors = mentors.map(mentor =>
      mentor.id === editingMentor.id ? { ...newMentor, id: mentor.id } : mentor
    );
    setMentors(updatedMentors);
    setShowAddForm(false);
    setEditingMentor(null);
    setNewMentor({
      name: '',
      email: '',
      phone: '',
      specialization: '',
      experience: '',
      organization: '',
      location: '',
      rating: 0,
      availability: 'Available',
      bio: '',
      achievements: '',
      linkedin: '',
      website: ''
    });
    alert('Mentor updated successfully!');
  };

  const handleDeleteMentor = (mentorId) => {
    if (window.confirm('Are you sure you want to delete this mentor?')) {
      setMentors(mentors.filter(mentor => mentor.id !== mentorId));
      alert('Mentor deleted successfully!');
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <FiStar
        key={i}
        className={`h-4 w-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mentor Database</h1>
        <p className="text-gray-600">Manage and connect with industry mentors</p>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search mentors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={selectedSpecialization}
            onChange={(e) => setSelectedSpecialization(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Specializations</option>
            {specializations.map(spec => (
              <option key={spec} value={spec}>{spec}</option>
            ))}
          </select>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            <FiPlus className="mr-2" />
            Add Mentor
          </button>
        </div>
      </div>

      {/* Add/Edit Mentor Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {editingMentor ? 'Edit Mentor' : 'Add New Mentor'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input
                type="text"
                value={newMentor.name}
                onChange={(e) => setNewMentor({...newMentor, name: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                type="email"
                value={newMentor.email}
                onChange={(e) => setNewMentor({...newMentor, email: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                value={newMentor.phone}
                onChange={(e) => setNewMentor({...newMentor, phone: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Specialization *</label>
              <select
                value={newMentor.specialization}
                onChange={(e) => setNewMentor({...newMentor, specialization: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Specialization</option>
                {specializations.map(spec => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
              <input
                type="text"
                value={newMentor.experience}
                onChange={(e) => setNewMentor({...newMentor, experience: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Organization</label>
              <input
                type="text"
                value={newMentor.organization}
                onChange={(e) => setNewMentor({...newMentor, organization: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                value={newMentor.location}
                onChange={(e) => setNewMentor({...newMentor, location: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
              <select
                value={newMentor.availability}
                onChange={(e) => setNewMentor({...newMentor, availability: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Available">Available</option>
                <option value="Limited">Limited</option>
                <option value="Unavailable">Unavailable</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
              <textarea
                value={newMentor.bio}
                onChange={(e) => setNewMentor({...newMentor, bio: e.target.value})}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Achievements</label>
              <textarea
                value={newMentor.achievements}
                onChange={(e) => setNewMentor({...newMentor, achievements: e.target.value})}
                rows={2}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-4">
            <button
              onClick={() => {
                setShowAddForm(false);
                setEditingMentor(null);
                setNewMentor({
                  name: '',
                  email: '',
                  phone: '',
                  specialization: '',
                  experience: '',
                  organization: '',
                  location: '',
                  rating: 0,
                  availability: 'Available',
                  bio: '',
                  achievements: '',
                  linkedin: '',
                  website: ''
                });
              }}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={editingMentor ? handleUpdateMentor : handleAddMentor}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {editingMentor ? 'Update Mentor' : 'Add Mentor'}
            </button>
          </div>
        </div>
      )}

      {/* Mentors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMentors.map((mentor) => (
          <div key={mentor.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{mentor.name}</h3>
                  <p className="text-sm text-gray-600">{mentor.specialization}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditMentor(mentor)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <FiEdit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteMentor(mentor.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <FiTrash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <FiMail className="mr-2" />
                  <span>{mentor.email}</span>
                </div>
                {mentor.phone && (
                  <div className="flex items-center text-sm text-gray-600">
                    <FiPhone className="mr-2" />
                    <span>{mentor.phone}</span>
                  </div>
                )}
                <div className="flex items-center text-sm text-gray-600">
                  <FiBriefcase className="mr-2" />
                  <span>{mentor.organization}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <FiMapPin className="mr-2" />
                  <span>{mentor.location}</span>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center mb-1">
                  <span className="text-sm font-medium text-gray-700 mr-2">Rating:</span>
                  <div className="flex">
                    {renderStars(mentor.rating)}
                  </div>
                  <span className="text-sm text-gray-600 ml-2">({mentor.rating})</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Experience: {mentor.experience}</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    mentor.availability === 'Available' ? 'bg-green-100 text-green-800' :
                    mentor.availability === 'Limited' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {mentor.availability}
                  </span>
                </div>
              </div>

              {mentor.bio && (
                <p className="text-sm text-gray-600 mb-4">{mentor.bio}</p>
              )}

              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>Mentored: {mentor.mentoredStartups} startups</span>
                <span>Joined: {new Date(mentor.joinedDate).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredMentors.length === 0 && (
        <div className="text-center py-8">
          <FiUser className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No mentors found</h3>
          <p className="mt-1 text-sm text-gray-500">Try adjusting your search criteria</p>
        </div>
      )}
    </div>
  );
};

export default MentorDatabase;
