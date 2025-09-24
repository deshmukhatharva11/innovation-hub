import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  FiSearch,
  FiFilter,
  FiMoreVertical, 
  FiEdit3, 
  FiTrash2, 
  FiEye,
  FiUserCheck, 
  FiUserX,
  FiMail,
  FiPhone,
  FiCalendar,
  FiZap,
  FiCheckCircle,
  FiUsers,
  FiUserPlus,
  FiBarChart,
  FiDownload,
  FiStar,
  FiAward,
  FiTrendingUp,
  FiBookOpen,
  FiTarget,
  FiX,
  FiSave
} from 'react-icons/fi';
import { collegeCoordinatorAPI, ideasAPI, authAPI, usersAPI } from '../../services/api';
import { toast } from 'react-hot-toast';
import { setUser } from '../../store/slices/authSlice';

const StudentManagement = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeStudents: 0,
    totalIdeas: 0,
    endorsedIdeas: 0,
    averageIdeasPerStudent: 0
  });
  const [departments, setDepartments] = useState([]);
  const [years, setYears] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [bulkAction, setBulkAction] = useState('');
  
  // Add Student Modal State
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [addStudentLoading, setAddStudentLoading] = useState(false);
  const [newStudent, setNewStudent] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    department: '',
    year_of_study: '',
    roll_number: ''
  });

  useEffect(() => {
    fetchStudents();
  }, [user?.college_id]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      
      // Check if user has college_id
      if (!user?.college_id) {
        console.log('User college_id not available:', user);
        console.log('Attempting to fetch user data...');
        
        // Try to fetch user data from /auth/me
        try {
          const userResponse = await authAPI.getCurrentUser();
          if (userResponse.data?.data?.user?.college_id) {
            console.log('User data fetched successfully:', userResponse.data.data.user);
            // Update the user in Redux store
            dispatch(setUser(userResponse.data.data.user));
            // Retry fetching students
            return fetchStudents();
          }
        } catch (userError) {
          console.error('Failed to fetch user data:', userError);
        }
        
        toast.error('College information not available. Please refresh the page.');
        setStudents([]);
        setFilteredStudents([]);
        return;
      }
      
      console.log('Fetching students for college_id:', user.college_id);
      
      // Fetch students for this college
      const response = await collegeCoordinatorAPI.getStudents({
        limit: 100,
        sort_by: 'created_at',
        sort_order: 'desc'
      });

      if (response.data?.data?.students) {
        const fetchedStudents = response.data.data.students.map(student => ({
          id: student.id,
          name: student.name,
          email: student.email,
          phone: student.phone,
          department: student.department || 'Not specified',
          year: student.year_of_study || 'Not specified',
          registeredAt: student.created_at,
          ideasCount: student.performance?.totalIdeas || 0,
          endorsedIdeas: student.performance?.endorsedIdeas || 0,
          incubatedIdeas: student.performance?.incubatedIdeas || 0,
          avatar: student.profile_image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=random`,
          isActive: student.is_active,
          lastLogin: student.last_login || student.created_at,
          skills: student.skills || [],
          bio: student.bio || '',
          gpa: student.gpa || 'N/A',
          rollNumber: student.roll_number || 'N/A'
        }));
        
        setStudents(fetchedStudents);
        setFilteredStudents(fetchedStudents);
        
        // Extract unique departments and years
        const uniqueDepartments = [...new Set(fetchedStudents.map(s => s.department).filter(d => d !== 'Not specified'))];
        const uniqueYears = [...new Set(fetchedStudents.map(s => s.year).filter(y => y !== 'Not specified'))];
        setDepartments(uniqueDepartments);
        setYears(uniqueYears);
        
        // Calculate stats
        const totalStudents = fetchedStudents.length;
        const activeStudents = fetchedStudents.filter(s => s.isActive).length;
        const totalIdeas = fetchedStudents.reduce((sum, s) => sum + s.ideasCount, 0);
        const endorsedIdeas = fetchedStudents.reduce((sum, s) => sum + s.endorsedIdeas, 0);
        const averageIdeas = totalStudents > 0 ? (totalIdeas / totalStudents).toFixed(1) : 0;
        
        setStats({
          totalStudents,
          activeStudents,
          totalIdeas,
          endorsedIdeas,
          averageIdeasPerStudent: averageIdeas
        });
      } else {
        setStudents([]);
        setFilteredStudents([]);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      console.error('Error details:', error.response?.data || error.message);
      toast.error(`Failed to load students: ${error.response?.data?.message || error.message}`);
      setStudents([]);
      setFilteredStudents([]);
    } finally {
    setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = students;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by department
    if (departmentFilter !== 'all') {
      filtered = filtered.filter(student => student.department === departmentFilter);
    }

    // Filter by year
    if (yearFilter !== 'all') {
      filtered = filtered.filter(student => student.year.toString() === yearFilter);
    }

    // Filter by status
    if (statusFilter !== 'all') {
      if (statusFilter === 'active') {
        filtered = filtered.filter(student => student.isActive);
      } else if (statusFilter === 'inactive') {
        filtered = filtered.filter(student => !student.isActive);
      } else if (statusFilter === 'with_ideas') {
        filtered = filtered.filter(student => student.ideasCount > 0);
      } else if (statusFilter === 'top_performers') {
        filtered = filtered.filter(student => student.ideasCount >= 2);
      }
    }

    setFilteredStudents(filtered);
  }, [students, searchTerm, departmentFilter, yearFilter, statusFilter]);

  const handleBulkAction = async () => {
    if (!bulkAction || selectedStudents.length === 0) {
      toast.error('Please select an action and students');
      return;
    }

    try {
      // Implement bulk actions here
      switch (bulkAction) {
        case 'activate':
          // await usersAPI.bulkUpdate(selectedStudents, { is_active: true });
          toast.success(`${selectedStudents.length} students activated`);
          break;
        case 'deactivate':
          // await usersAPI.bulkUpdate(selectedStudents, { is_active: false });
          toast.success(`${selectedStudents.length} students deactivated`);
          break;
        case 'export':
          // Export selected students data
          exportStudentsData();
          break;
        default:
          toast.error('Invalid action');
      }
      
      setSelectedStudents([]);
      setBulkAction('');
      fetchStudents(); // Refresh data
    } catch (error) {
      console.error('Bulk action error:', error);
      toast.error('Failed to perform bulk action');
    }
  };

  const toggleStudentSelection = (studentId) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const selectAllStudents = () => {
    setSelectedStudents(filteredStudents.map(s => s.id));
  };

  const clearSelection = () => {
    setSelectedStudents([]);
  };

  // Action handlers
  const handleViewStudent = (student) => {
    // Show student details in a modal or navigate to student detail page
    toast.info(`Viewing details for ${student.name}`);
    // You can implement a modal here to show student details
  };

  const handleEditStudent = (student) => {
    // Show edit form in a modal or navigate to edit page
    toast.info(`Editing ${student.name}`);
    // You can implement an edit modal here
  };

  const handleEmailStudent = (student) => {
    // Open email client or show email form
    const collegeName = user?.college?.name || 'SGBAU';
    const subject = encodeURIComponent(`Message from ${collegeName} Pre-Incubation Centre`);
    const body = encodeURIComponent(`Hello ${student.name},\n\n`);
    const mailtoLink = `mailto:${student.email}?subject=${subject}&body=${body}`;
    window.open(mailtoLink);
    toast.success(`Opening email client for ${student.name}`);
  };

  const exportStudentsData = () => {
    try {
      const studentsToExport = selectedStudents.length > 0 
        ? filteredStudents.filter(student => selectedStudents.includes(student.id))
        : filteredStudents;

      if (studentsToExport.length === 0) {
        toast.error('No students to export');
        return;
      }

      // Get current filter information
      const filterInfo = [];
      if (searchTerm) filterInfo.push(`Search: "${searchTerm}"`);
      if (departmentFilter !== 'all') filterInfo.push(`Department: ${departmentFilter}`);
      if (yearFilter !== 'all') filterInfo.push(`Year: ${yearFilter}`);
      if (statusFilter !== 'all') filterInfo.push(`Status: ${statusFilter}`);

      // Prepare comprehensive CSV data
      const csvHeaders = [
        'Student ID',
        'Name',
        'Email', 
        'Phone',
        'Roll Number',
        'Department',
        'Year of Study',
        'GPA',
        'Total Ideas',
        'Endorsed Ideas',
        'Incubated Ideas',
        'Registration Date',
        'Last Login',
        'Status',
        'Skills',
        'Bio'
      ].join(',');

      const csvData = studentsToExport.map(student => [
        student.id,
        `"${student.name}"`,
        `"${student.email}"`,
        `"${student.phone || 'N/A'}"`,
        `"${student.rollNumber || 'N/A'}"`,
        `"${student.department}"`,
        student.year,
        `"${student.gpa || 'N/A'}"`,
        student.ideasCount,
        student.endorsedIdeas,
        student.incubatedIdeas || 0,
        `"${formatDate(student.registeredAt)}"`,
        `"${formatDate(student.lastLogin)}"`,
        student.isActive ? 'Active' : 'Inactive',
        `"${student.skills ? student.skills.join(', ') : 'N/A'}"`,
        `"${student.bio || 'N/A'}"`
      ].join(',')).join('\n');

      // Add metadata header
      const collegeName = user?.college?.name || 'SGBAU';
      const metadata = [
        `# ${collegeName} Pre-Incubation Centre - Student Export`,
        `# Export Date: ${new Date().toLocaleString()}`,
        `# College: ${user?.college?.name || (user?.college_id ? `College ID ${user.college_id}` : 'All Colleges')}`,
        `# Total Students: ${studentsToExport.length}`,
        `# Filters Applied: ${filterInfo.length > 0 ? filterInfo.join(', ') : 'None'}`,
        `# Generated by: ${user?.name || 'System'}`,
        `#`,
        ``
      ].join('\n');

      const csvContent = `${metadata}${csvHeaders}\n${csvData}`;

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        
        // Generate filename with timestamp and filter info
        const timestamp = new Date().toISOString().split('T')[0];
        const filterSuffix = filterInfo.length > 0 ? '_filtered' : '';
        link.setAttribute('download', `students_export_${timestamp}${filterSuffix}.csv`);
        
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast.success(`Exported ${studentsToExport.length} students successfully${filterInfo.length > 0 ? ' (with filters applied)' : ''}`);
      } else {
        toast.error('Export not supported in this browser');
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export students data');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Add Student Functions
  const handleAddStudent = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!newStudent.name.trim()) {
      toast.error('Name is required');
      return;
    }
    if (!newStudent.email.trim()) {
      toast.error('Email is required');
      return;
    }
    if (!newStudent.password.trim()) {
      toast.error('Password is required');
      return;
    }
    if (newStudent.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      setAddStudentLoading(true);
      
      const response = await usersAPI.addStudent({
        name: newStudent.name.trim(),
        email: newStudent.email.trim(),
        password: newStudent.password,
        phone: newStudent.phone.trim() || undefined,
        department: newStudent.department.trim() || undefined,
        year_of_study: newStudent.year_of_study ? parseInt(newStudent.year_of_study) : undefined,
        roll_number: newStudent.roll_number.trim() || undefined
      });

      if (response.data?.success) {
        toast.success('Student added successfully!');
        setShowAddStudentModal(false);
        setNewStudent({
          name: '',
          email: '',
          password: '',
          phone: '',
          department: '',
          year_of_study: '',
          roll_number: ''
        });
        fetchStudents(); // Refresh the list
      } else {
        toast.error(response.data?.message || 'Failed to add student');
      }
    } catch (error) {
      console.error('Add student error:', error);
      toast.error(error.response?.data?.message || 'Failed to add student');
    } finally {
      setAddStudentLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewStudent(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetAddStudentForm = () => {
    setNewStudent({
      name: '',
      email: '',
      password: '',
      phone: '',
      department: '',
      year_of_study: '',
      roll_number: ''
    });
    setShowAddStudentModal(false);
  };

  const getPerformanceColor = (ideasCount) => {
    if (ideasCount >= 3) return 'text-green-600 bg-green-100 dark:bg-green-900/20';
    if (ideasCount >= 1) return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
    return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Student Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage and monitor student activities</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowAddStudentModal(true)}
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <FiUserPlus className="mr-2" size={16} />
            Add Student
          </button>
          <button
            onClick={exportStudentsData}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FiDownload className="mr-2" size={16} />
            Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="card p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <FiUsers className="text-blue-600 dark:text-blue-400" size={20} />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Students</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.totalStudents}</p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <FiUserCheck className="text-green-600 dark:text-green-400" size={20} />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Students</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.activeStudents}</p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <FiZap className="text-purple-600 dark:text-purple-400" size={20} />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Ideas</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.totalIdeas}</p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
              <FiAward className="text-yellow-600 dark:text-yellow-400" size={20} />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Endorsed Ideas</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.endorsedIdeas}</p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
              <FiTrendingUp className="text-orange-600 dark:text-orange-400" size={20} />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Ideas/Student</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.averageIdeasPerStudent}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="card p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Search</label>
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Department</label>
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Year</label>
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Years</option>
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Students</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="with_ideas">With Ideas</option>
              <option value="top_performers">Top Performers</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setDepartmentFilter('all');
                setYearFilter('all');
                setStatusFilter('all');
              }}
              className="w-full px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedStudents.length > 0 && (
        <div className="card p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                {selectedStudents.length} student(s) selected
              </span>
              <button
                onClick={clearSelection}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Clear selection
              </button>
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded text-sm"
              >
                <option value="">Select action</option>
                <option value="activate">Activate</option>
                <option value="deactivate">Deactivate</option>
                <option value="export">Export Selected</option>
              </select>
              <button
                onClick={handleBulkAction}
                disabled={!bulkAction}
                className="px-4 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Students Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedStudents.length === filteredStudents.length && filteredStudents.length > 0}
                    onChange={selectedStudents.length === filteredStudents.length ? clearSelection : selectAllStudents}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Performance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Registered
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedStudents.includes(student.id)}
                      onChange={() => toggleStudentSelection(student.id)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        src={student.avatar}
                        alt={student.name}
                        className="w-10 h-10 rounded-full mr-3"
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {student.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {student.email}
                        </div>
                        <div className="text-xs text-gray-400 dark:text-gray-500">
                          Roll: {student.rollNumber}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">{student.department}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Year {student.year}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPerformanceColor(student.ideasCount)}`}>
                        {student.ideasCount} ideas
                      </span>
                      {student.endorsedIdeas > 0 && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium text-green-600 bg-green-100 dark:bg-green-900/20">
                          {student.endorsedIdeas} endorsed
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      GPA: {student.gpa}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        student.isActive 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                      }`}>
                        {student.isActive ? 'Active' : 'Inactive'}
                      </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(student.registeredAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewStudent(student)}
                        className="text-primary-600 hover:text-primary-900 dark:hover:text-primary-400"
                        title="View Student Details"
                      >
                        <FiEye size={16} />
                      </button>
                      <button
                        onClick={() => handleEditStudent(student)}
                        className="text-blue-600 hover:text-blue-900 dark:hover:text-blue-400"
                        title="Edit Student"
                      >
                        <FiEdit3 size={16} />
                      </button>
                      <button
                        onClick={() => handleEmailStudent(student)}
                        className="text-green-600 hover:text-green-900 dark:hover:text-green-400"
                        title="Send Email"
                      >
                        <FiMail size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredStudents.length === 0 && (
          <div className="text-center py-12">
            <FiUsers className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No students found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {searchTerm || departmentFilter !== 'all' || yearFilter !== 'all' || statusFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'No students have registered yet.'}
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {filteredStudents.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Showing {filteredStudents.length} of {students.length} students
          </div>
          <div className="flex items-center space-x-2">
            <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">
              Previous
            </button>
            <span className="px-3 py-1 text-sm">Page 1 of 1</span>
            <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">
              Next
            </button>
          </div>
        </div>
      )}

      {/* Add Student Modal */}
      {showAddStudentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Add New Student
              </h3>
              <button
                onClick={resetAddStudentForm}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <FiX size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddStudent} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={newStudent.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={newStudent.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Enter email address"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Password *
                </label>
                <input
                  type="password"
                  name="password"
                  value={newStudent.password}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Enter password (min 6 characters)"
                  required
                  minLength={6}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={newStudent.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Enter phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Department
                </label>
                <input
                  type="text"
                  name="department"
                  value={newStudent.department}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Enter department"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Year of Study
                </label>
                <select
                  name="year_of_study"
                  value={newStudent.year_of_study}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">Select year</option>
                  <option value="1">Year 1</option>
                  <option value="2">Year 2</option>
                  <option value="3">Year 3</option>
                  <option value="4">Year 4</option>
                  <option value="5">Year 5</option>
                  <option value="6">Year 6</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Roll Number
                </label>
                <input
                  type="text"
                  name="roll_number"
                  value={newStudent.roll_number}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Enter roll number"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={resetAddStudentForm}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addStudentLoading}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {addStudentLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Adding...
                    </>
                  ) : (
                    <>
                      <FiSave className="mr-2" size={16} />
                      Add Student
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentManagement;
