import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  FiPlus, 
  FiSearch, 
  FiEdit, 
  FiTrash2, 
  FiEye, 
  FiUsers, 
  FiMail, 
  FiPhone, 
  FiMapPin,
  FiStar,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiUserPlus,
  FiMessageSquare
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { mentorsAPI, usersAPI } from '../../services/api';

const CollegeMentorManagement = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSpecialization, setFilterSpecialization] = useState('');
  const [filterAvailability, setFilterAvailability] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showAssignmentsModal, setShowAssignmentsModal] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [students, setStudents] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    specialization: '',
    experience_years: 0,
    availability: 'available',
    max_students: 5,
    bio: '',
    linkedin_url: '',
    website_url: ''
  });

  const specializations = [
    'AI/ML', 'Data Science', 'Web Development', 'Mobile Development',
    'Blockchain', 'IoT', 'Cybersecurity', 'Cloud Computing',
    'Entrepreneurship', 'Business Strategy', 'Marketing', 'Finance',
    'Product Management', 'UI/UX Design', 'DevOps', 'Machine Learning'
  ];

  useEffect(() => {
    fetchMentors();
  }, []);

  const fetchMentors = async () => {
    try {
      setLoading(true);
      const response = await mentorsAPI.getAll({
        search: searchTerm,
        specialization: filterSpecialization,
        availability: filterAvailability
      });
      setMentors(response.data.data.mentors);
    } catch (error) {
      console.error('Error fetching mentors:', error);
      toast.error('Failed to fetch mentors');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      // Get all students from the college admin's college
      const response = await usersAPI.getStudents({ 
        college_id: user.college_id,
        limit: 100 // Get more students to show all available options
      });
      console.log('Students API response:', response.data);
      
      // The API returns: { success: true, data: { students: [...], pagination: {...} } }
      const studentsData = response.data.data?.students || [];
      
      // Filter out students who already have mentors assigned
      const availableStudents = studentsData.filter(student => !student.mentor_id);
      
      setStudents(availableStudents);
      console.log(`Found ${availableStudents.length} available students out of ${studentsData.length} total students`);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to fetch students');
      setStudents([]); // Set empty array on error
    }
  };

  useEffect(() => {
    fetchMentors();
  }, [searchTerm, filterSpecialization, filterAvailability]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddMentor = async (e) => {
    e.preventDefault();
    try {
      await mentorsAPI.create(formData);
      toast.success('Mentor created successfully');
      setShowAddModal(false);
      setFormData({
        name: '',
        email: '',
        password: '',
        phone: '',
        specialization: '',
        experience_years: 0,
        availability: 'available',
        max_students: 5,
        bio: '',
        linkedin_url: '',
        website_url: ''
      });
      fetchMentors();
    } catch (error) {
      console.error('Error creating mentor:', error);
      
      // Handle specific error messages
      if (error.response?.data?.message) {
        if (error.response.data.message.includes('email already exists')) {
          toast.error('A mentor with this email already exists. Please use a different email.');
        } else {
          toast.error(error.response.data.message);
        }
      } else {
        toast.error('Failed to create mentor');
      }
    }
  };

  const handleEditMentor = async (e) => {
    e.preventDefault();
    try {
      await mentorsAPI.update(selectedMentor.id, formData);
      toast.success('Mentor updated successfully');
      setShowEditModal(false);
      setSelectedMentor(null);
      fetchMentors();
    } catch (error) {
      console.error('Error updating mentor:', error);
      toast.error('Failed to update mentor');
    }
  };

  const handleDeleteMentor = async (mentorId) => {
    if (window.confirm('Are you sure you want to delete this mentor?')) {
      try {
        await mentorsAPI.delete(mentorId);
        toast.success('Mentor deleted successfully');
        fetchMentors();
      } catch (error) {
        console.error('Error deleting mentor:', error);
        toast.error('Failed to delete mentor');
      }
    }
  };

  const handleAssignToStudent = (mentor) => {
    setSelectedMentor(mentor);
    fetchStudents();
    setShowAssignModal(true);
  };

  const handleViewAssignments = (mentor) => {
    setSelectedMentor(mentor);
    fetchMentorAssignments(mentor.id);
    setShowAssignmentsModal(true);
  };

  const fetchMentorAssignments = async (mentorId) => {
    try {
      // Fetch students assigned to this mentor
      const response = await usersAPI.getStudents({ 
        mentor_id: mentorId,
        limit: 100
      });
      
      const assignedStudents = response.data.data?.students || [];
      setStudents(assignedStudents);
    } catch (error) {
      console.error('Error fetching mentor assignments:', error);
      toast.error('Failed to fetch mentor assignments');
      setStudents([]);
    }
  };

  const handleUnassignStudent = async (studentId) => {
    try {
      const response = await mentorsAPI.unassignStudent(selectedMentor.id, studentId);
      
      if (response.data.success) {
        toast.success('Student unassigned successfully');
        // Refresh assignments
        await fetchMentorAssignments(selectedMentor.id);
        // Refresh mentors list
        await fetchMentors();
      } else {
        toast.error(response.data.message || 'Failed to unassign student');
      }
    } catch (error) {
      console.error('Error unassigning student:', error);
      toast.error('Failed to unassign student');
    }
  };

  const handleConfirmAssignment = async (studentId) => {
    // Check capacity before assignment
    if (selectedMentor.current_students >= selectedMentor.max_students) {
      toast.error('Cannot assign: Mentor has reached maximum capacity');
      return;
    }

    try {
      // First, get the student's ideas to find one in nurture phase
      const studentIdeasResponse = await usersAPI.getStudentIdeas(studentId);
      const studentIdeas = studentIdeasResponse.data.data?.ideas || [];
      
      // Find an idea in nurture or needs_development phase
      const nurtureIdea = studentIdeas.find(idea => 
        ['nurture', 'needs_development'].includes(idea.status)
      );
      
      if (!nurtureIdea) {
        toast.error('Student has no ideas in nurture or needs_development phase. Mentor can only be assigned to ideas in these phases.');
        return;
      }

      console.log('Assigning mentor:', selectedMentor.id, 'to student:', studentId, 'for idea:', nurtureIdea.id);
      const response = await mentorsAPI.assignToStudent(
        nurtureIdea.id, 
        selectedMentor.id, 
        'college', 
        `Assigned by college admin to mentor idea: ${nurtureIdea.title}`
      );
      console.log('Assignment response:', response.data);
      
      toast.success('Mentor assigned to student successfully');
      
      // Show success message with chat initiation info
      toast.success('Mentor-student chat initiated automatically!', {
        duration: 4000
      });
      
      setShowAssignModal(false);
      setSelectedMentor(null);
      
      // Refresh mentors list to show updated student count
      await fetchMentors();
    } catch (error) {
      console.error('Error assigning mentor:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to assign mentor to student');
      }
    }
  };

  const filteredMentors = (mentors || []).filter(mentor => {
    const matchesSearch = mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mentor.specialization.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialization = !filterSpecialization || mentor.specialization.includes(filterSpecialization);
    const matchesAvailability = !filterAvailability || mentor.availability === filterAvailability;
    
    return matchesSearch && matchesSpecialization && matchesAvailability;
  });

  const getAvailabilityColor = (availability) => {
    switch (availability) {
      case 'available': return 'text-green-600 bg-green-100';
      case 'busy': return 'text-yellow-600 bg-yellow-100';
      case 'unavailable': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getAvailabilityIcon = (availability) => {
    switch (availability) {
      case 'available': return <FiCheckCircle className="w-4 h-4" />;
      case 'busy': return <FiClock className="w-4 h-4" />;
      case 'unavailable': return <FiXCircle className="w-4 h-4" />;
      default: return <FiClock className="w-4 h-4" />;
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Mentor Management</h1>
        <p className="text-gray-600">Manage mentors for your college students</p>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search mentors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <select
            value={filterSpecialization}
            onChange={(e) => setFilterSpecialization(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Specializations</option>
            {specializations.map(spec => (
              <option key={spec} value={spec}>{spec}</option>
            ))}
          </select>
          
          <select
            value={filterAvailability}
            onChange={(e) => setFilterAvailability(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Availability</option>
            <option value="available">Available</option>
            <option value="busy">Busy</option>
            <option value="unavailable">Unavailable</option>
          </select>
          
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FiPlus className="w-4 h-4" />
            Add Mentor
          </button>
        </div>
      </div>

      {/* Mentors Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMentors.map((mentor) => (
            <div key={mentor.id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <FiUsers className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{mentor.name}</h3>
                    <p className="text-sm text-gray-600">{mentor.specialization}</p>
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getAvailabilityColor(mentor.availability)}`}>
                  {getAvailabilityIcon(mentor.availability)}
                  {mentor.availability}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FiMail className="w-4 h-4" />
                  {mentor.email}
                </div>
                {mentor.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FiPhone className="w-4 h-4" />
                    {mentor.phone}
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FiStar className="w-4 h-4" />
                  {mentor.experience_years} years experience
                </div>
                {mentor.college && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FiMapPin className="w-4 h-4" />
                    {mentor.college.name}
                    {mentor.college.district && (
                      <span className="text-xs text-gray-500">
                        ({mentor.college.district}, {mentor.college.state})
                      </span>
                    )}
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <FiUsers className="w-4 h-4" />
                  <span className={mentor.current_students >= mentor.max_students ? "text-red-600 font-medium" : "text-gray-600"}>
                    {mentor.current_students}/{mentor.max_students} students
                  </span>
                  {mentor.current_students >= mentor.max_students && (
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                      Full
                    </span>
                  )}
                </div>
              </div>

              {mentor.bio && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{mentor.bio}</p>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSelectedMentor(mentor);
                    setFormData(mentor);
                    setShowViewModal(true);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <FiEye className="w-4 h-4" />
                  View
                </button>
                <button
                  onClick={() => {
                    setSelectedMentor(mentor);
                    setFormData(mentor);
                    setShowEditModal(true);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  <FiEdit className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteMentor(mentor.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                >
                  <FiTrash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
              
              {/* Assignment Actions */}
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex gap-2">
                  <button
                    onClick={() => handleViewAssignments(mentor)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                  >
                    <FiUsers className="w-4 h-4" />
                    View Assignments ({mentor.current_students})
                  </button>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                {mentor.current_students >= mentor.max_students ? (
                  <button
                    disabled
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm bg-gray-100 text-gray-500 rounded-lg cursor-not-allowed"
                  >
                    <FiXCircle className="w-4 h-4" />
                    At Capacity ({mentor.current_students}/{mentor.max_students})
                  </button>
                ) : (
                  <button
                    onClick={() => handleAssignToStudent(mentor)}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                  >
                    <FiUserPlus className="w-4 h-4" />
                    Assign to Student ({mentor.current_students}/{mentor.max_students})
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Mentor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Add New Mentor</h2>
            <form onSubmit={handleAddMentor} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    minLength="6"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Minimum 6 characters"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Specialization *</label>
                  <select
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Specialization</option>
                    {specializations.map(spec => (
                      <option key={spec} value={spec}>{spec}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Experience (Years) *</label>
                  <input
                    type="number"
                    name="experience_years"
                    value={formData.experience_years}
                    onChange={handleInputChange}
                    min="0"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Availability *</label>
                  <select
                    name="availability"
                    value={formData.availability}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="available">Available</option>
                    <option value="busy">Busy</option>
                    <option value="unavailable">Unavailable</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Students</label>
                  <input
                    type="number"
                    name="max_students"
                    value={formData.max_students}
                    onChange={handleInputChange}
                    min="1"
                    max="50"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn URL</label>
                  <input
                    type="url"
                    name="linkedin_url"
                    value={formData.linkedin_url}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Website URL</label>
                  <input
                    type="url"
                    name="website_url"
                    value={formData.website_url}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Mentor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Mentor Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Edit Mentor</h2>
            <form onSubmit={handleEditMentor} className="space-y-4">
              {/* Same form fields as Add Modal */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Specialization *</label>
                  <select
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Specialization</option>
                    {specializations.map(spec => (
                      <option key={spec} value={spec}>{spec}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Experience (Years) *</label>
                  <input
                    type="number"
                    name="experience_years"
                    value={formData.experience_years}
                    onChange={handleInputChange}
                    min="0"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Availability *</label>
                  <select
                    name="availability"
                    value={formData.availability}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="available">Available</option>
                    <option value="busy">Busy</option>
                    <option value="unavailable">Unavailable</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Students</label>
                  <input
                    type="number"
                    name="max_students"
                    value={formData.max_students}
                    onChange={handleInputChange}
                    min="1"
                    max="50"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn URL</label>
                  <input
                    type="url"
                    name="linkedin_url"
                    value={formData.linkedin_url}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Website URL</label>
                  <input
                    type="url"
                    name="website_url"
                    value={formData.website_url}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Update Mentor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Mentor Modal */}
      {showViewModal && selectedMentor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Mentor Details</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <p className="text-gray-900">{selectedMentor.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <p className="text-gray-900">{selectedMentor.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <p className="text-gray-900">{selectedMentor.phone || 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                  <p className="text-gray-900">{selectedMentor.specialization}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
                  <p className="text-gray-900">{selectedMentor.experience_years} years</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getAvailabilityColor(selectedMentor.availability)}`}>
                    {getAvailabilityIcon(selectedMentor.availability)}
                    {selectedMentor.availability}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Students</label>
                  <p className="text-gray-900">{selectedMentor.current_students}/{selectedMentor.max_students}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                  <p className="text-gray-900">{selectedMentor.rating || 'Not rated yet'}</p>
                </div>
              </div>
              {selectedMentor.bio && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                  <p className="text-gray-900">{selectedMentor.bio}</p>
                </div>
              )}
              {selectedMentor.linkedin_url && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
                  <a href={selectedMentor.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {selectedMentor.linkedin_url}
                  </a>
                </div>
              )}
              {selectedMentor.website_url && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                  <a href={selectedMentor.website_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {selectedMentor.website_url}
                  </a>
                </div>
              )}
            </div>
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setShowViewModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assignment Modal */}
      {showAssignModal && selectedMentor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Assign Mentor to Student
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Select a student to assign <strong>{selectedMentor.name}</strong> as their mentor.
            </p>
            
            {selectedMentor.current_students >= selectedMentor.max_students ? (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">
                  ⚠️ <strong>Warning:</strong> This mentor has reached maximum capacity ({selectedMentor.current_students}/{selectedMentor.max_students} students).
                </p>
              </div>
            ) : (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-700">
                  ✅ <strong>Available:</strong> This mentor can take {selectedMentor.max_students - selectedMentor.current_students} more students ({selectedMentor.current_students}/{selectedMentor.max_students}).
                </p>
              </div>
            )}
            
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {!students || students.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-gray-500 mb-2">No available students found</p>
                  <p className="text-xs text-gray-400">
                    All students may already have mentors assigned, or there are no students in your college.
                  </p>
                </div>
              ) : (
                <>
                  <div className="text-sm text-gray-600 mb-2">
                    Available students ({students.length}):
                  </div>
                  {students.map((student) => (
                    <div key={student.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{student.name}</p>
                        <p className="text-sm text-gray-600">{student.email}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          {student.department && (
                            <span>📚 {student.department}</span>
                          )}
                          {student.year_of_study && (
                            <span>🎓 Year {student.year_of_study}</span>
                          )}
                          {student.ideas_count > 0 && (
                            <span>💡 {student.ideas_count} ideas</span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleConfirmAssignment(student.id)}
                        className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                      >
                        Assign
                      </button>
                    </div>
                  ))}
                </>
              )}
            </div>
            
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setShowAssignModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Assignments Modal */}
      {showAssignmentsModal && selectedMentor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Mentor Assignments - {selectedMentor.name}
            </h3>
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                📊 <strong>Capacity:</strong> {selectedMentor.current_students}/{selectedMentor.max_students} students assigned
              </p>
              <p className="text-sm text-blue-700 mt-1">
                🎯 <strong>Specialization:</strong> {selectedMentor.specialization}
              </p>
            </div>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {!students || students.length === 0 ? (
                <div className="text-center py-8">
                  <FiUsers className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 mb-2">No students assigned to this mentor</p>
                  <p className="text-xs text-gray-400">
                    Click "Assign to Student" to assign students to this mentor.
                  </p>
                </div>
              ) : (
                <>
                  <div className="text-sm text-gray-600 mb-2">
                    Assigned students ({students.length}):
                  </div>
                  {students.map((student) => (
                    <div key={student.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{student.name}</p>
                        <p className="text-sm text-gray-600">{student.email}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          {student.department && (
                            <span>📚 {student.department}</span>
                          )}
                          {student.year_of_study && (
                            <span>🎓 Year {student.year_of_study}</span>
                          )}
                          {student.ideas_count > 0 && (
                            <span>💡 {student.ideas_count} ideas</span>
                          )}
                          {student.endorsed_ideas > 0 && (
                            <span>✅ {student.endorsed_ideas} endorsed</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                          Assigned
                        </span>
                        <button
                          onClick={() => handleUnassignStudent(student.id)}
                          className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                        >
                          Unassign
                        </button>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
            
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setShowAssignmentsModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollegeMentorManagement;
