import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
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
  FiMapPin,
  FiUsers,
  FiZap,
  FiX
} from 'react-icons/fi';
import { usersAPI, collegeManagementAPI, incubatorManagementAPI } from '../../services/api';
import { toast } from 'react-hot-toast';

const UserManagement = () => {
  const { user } = useSelector((state) => state.auth);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'student',
    college_id: '',
    incubator_id: '',
    password: '',
    confirmPassword: ''
  });
  const [colleges, setColleges] = useState([]);
  const [incubators, setIncubators] = useState([]);

  useEffect(() => {
    fetchUsers();
    fetchColleges();
    fetchIncubators();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Check if user is logged in
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please log in to access this page');
        return;
      }
      
      // Fetch all users for admin management
      const response = await usersAPI.getAll({
        limit: 1000,
        sort: 'created_at',
        order: 'desc'
      });

      if (response.data?.success && response.data?.data?.users) {
        const fetchedUsers = response.data.data.users.map(user => ({
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          status: user.is_active ? 'active' : 'inactive',
          college: user.college?.name || 'N/A',
          area: user.college?.city || user.incubator?.city || 'N/A',
          joinedDate: user.createdAt || user.created_at,
          lastLogin: user.last_login || user.createdAt || user.created_at,
          ideasCount: 0, // Will be calculated separately if needed
          managedStudents: 0, // Will be calculated separately if needed
          managedColleges: 0, // Will be calculated separately if needed
          avatar: user.profile_image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`
        }));
        
        setUsers(fetchedUsers);
        setFilteredUsers(fetchedUsers);
      } else {
        console.log('No users found or invalid response:', response.data);
        setUsers([]);
        setFilteredUsers([]);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      if (error.response?.status === 401) {
        toast.error('Authentication failed. Please log in again.');
      } else {
        toast.error('Failed to load users');
      }
      setUsers([]);
      setFilteredUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchColleges = async () => {
    try {
      const response = await collegeManagementAPI.getAll();
      if (response.data?.success && response.data?.data?.colleges) {
        setColleges(response.data.data.colleges);
      } else {
        console.log('No colleges found or invalid response:', response.data);
        setColleges([]);
      }
    } catch (error) {
      console.error('Error fetching colleges:', error);
      setColleges([]);
    }
  };

  const fetchIncubators = async () => {
    try {
      const response = await incubatorManagementAPI.getAll();
      if (response.data?.success && response.data?.data?.incubators) {
        setIncubators(response.data.data.incubators);
      } else {
        console.log('No incubators found or invalid response:', response.data);
        setIncubators([]);
      }
    } catch (error) {
      console.error('Error fetching incubators:', error);
      setIncubators([]);
    }
  };

  useEffect(() => {
    let filtered = users;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.college?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.organization?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by role
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.status === statusFilter);
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, roleFilter, statusFilter]);

  const handleUserAction = (action, userId) => {
    switch (action) {
      case 'activate':
        setUsers(prev => prev.map(user => 
          user.id === userId ? { ...user, status: 'active' } : user
        ));
        toast.success('User activated successfully');
        break;
      case 'suspend':
        setUsers(prev => prev.map(user => 
          user.id === userId ? { ...user, status: 'suspended' } : user
        ));
        toast.success('User suspended successfully');
        break;
      case 'delete':
        if (window.confirm('Are you sure you want to delete this user?')) {
          setUsers(prev => prev.filter(user => user.id !== userId));
          toast.success('User deleted successfully');
        }
        break;
      default:
        break;
    }
  };

  const handleBulkAction = (action) => {
    if (selectedUsers.length === 0) {
      toast.error('Please select users first');
      return;
    }

    switch (action) {
      case 'activate':
        setUsers(prev => prev.map(user => 
          selectedUsers.includes(user.id) ? { ...user, status: 'active' } : user
        ));
        toast.success(`${selectedUsers.length} users activated`);
        break;
      case 'suspend':
        setUsers(prev => prev.map(user => 
          selectedUsers.includes(user.id) ? { ...user, status: 'suspended' } : user
        ));
        toast.success(`${selectedUsers.length} users suspended`);
        break;
      case 'delete':
        if (window.confirm(`Are you sure you want to delete ${selectedUsers.length} users?`)) {
          setUsers(prev => prev.filter(user => !selectedUsers.includes(user.id)));
          toast.success(`${selectedUsers.length} users deleted`);
        }
        break;
      default:
        break;
    }
    setSelectedUsers([]);
  };

  const toggleUserSelection = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const toggleSelectAll = () => {
    setSelectedUsers(
      selectedUsers.length === filteredUsers.length 
        ? [] 
        : filteredUsers.map(user => user.id)
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'pending': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'suspended': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      default: return 'text-secondary-600 bg-secondary-100 dark:bg-secondary-900/20';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'student': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      case 'college': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'incubator': return 'text-purple-600 bg-purple-100 dark:bg-purple-900/20';
      case 'admin': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
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

  const exportUsers = () => {
    const csvContent = [
      ['Name', 'Email', 'Role', 'Status', 'College/Organization', 'Area', 'Joined Date'],
      ...filteredUsers.map(user => [
        user.name,
        user.email,
        user.role,
        user.status,
        user.college || user.organization || '',
        user.area,
        formatDate(user.joinedDate)
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'users_export.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Users exported successfully');
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'student',
      college_id: '',
      incubator_id: '',
      password: '',
      confirmPassword: ''
    });
  };

  const handleAddUser = async () => {
    try {
      // Validate form data
      if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
        toast.error('Please fill in all required fields');
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }

      if (formData.role === 'student' && !formData.college_id) {
        toast.error('Please select a college for students');
        return;
      }

      if (formData.role === 'college_admin' && !formData.college_id) {
        toast.error('Please select a college for college admins');
        return;
      }

      if (formData.role === 'incubator_manager' && !formData.incubator_id) {
        toast.error('Please select an incubator for incubator managers');
        return;
      }

      // Mock API call - replace with actual API
      const newUser = {
        id: Date.now(),
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        status: 'active',
        college: formData.college_id ? colleges.find(c => c.id === formData.college_id)?.name : 'N/A',
        area: formData.college_id ? colleges.find(c => c.id === formData.college_id)?.city : 'N/A',
        joinedDate: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        ideasCount: 0,
        managedStudents: 0,
        managedColleges: 0,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=random`
      };

      setUsers(prev => [newUser, ...prev]);
      setShowAddModal(false);
      resetForm();
      toast.success('User added successfully!');
    } catch (error) {
      console.error('Error adding user:', error);
      toast.error('Failed to add user');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900 dark:text-white">
            User Management
          </h1>
          <p className="text-secondary-600 dark:text-secondary-400">
            Manage all users across the platform
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={exportUsers}
            className="btn-outline"
          >
            <FiZap className="mr-2" size={16} />
            Export
          </button>
          <button className="btn-outline">
            <FiUsers className="mr-2" size={16} />
            Import
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="btn-primary"
          >
            <FiUserCheck className="mr-2" size={16} />
            Add User
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="card">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="h-5 w-5 text-secondary-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-10"
                />
              </div>
            </div>

            {/* Role Filter */}
            <div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="input-field"
              >
                <option value="all">All Roles</option>
                <option value="student">Students</option>
                <option value="college_admin">College Admins</option>
                <option value="incubator_manager">Incubator Managers</option>
                <option value="admin">Super Admins</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input-field"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedUsers.length > 0 && (
            <div className="mt-4 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
                  {selectedUsers.length} user(s) selected
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleBulkAction('activate')}
                    className="btn-sm bg-green-600 text-white hover:bg-green-700"
                  >
                    <FiUserCheck className="mr-1" size={14} />
                    Activate
                  </button>
                  <button
                    onClick={() => handleBulkAction('suspend')}
                    className="btn-sm bg-yellow-600 text-white hover:bg-yellow-700"
                  >
                    <FiUserX className="mr-1" size={14} />
                    Suspend
                  </button>
                  <button
                    onClick={() => handleBulkAction('delete')}
                    className="btn-sm bg-red-600 text-white hover:bg-red-700"
                  >
                    <FiTrash2 className="mr-1" size={14} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Users Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-secondary-200 dark:divide-secondary-700">
            <thead className="bg-secondary-50 dark:bg-secondary-800">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                  Institution
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-secondary-800 divide-y divide-secondary-200 dark:divide-secondary-700">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-secondary-50 dark:hover:bg-secondary-700">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => toggleUserSelection(user.id)}
                      className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <div className="font-medium text-secondary-900 dark:text-white">
                          {user.name}
                        </div>
                        <div className="text-sm text-secondary-500 dark:text-secondary-400">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.status)}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-secondary-900 dark:text-white">
                      {user.college || user.organization}
                    </div>
                    <div className="text-sm text-secondary-500 dark:text-secondary-400">
                      {user.area}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-secondary-500 dark:text-secondary-400">
                    {formatDate(user.lastLogin)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
                        title="View Details"
                      >
                        <FiEye size={16} />
                      </button>
                      <button
                        className="text-green-600 hover:text-green-700 dark:text-green-400"
                        title="Edit User"
                      >
                        <FiEdit3 size={16} />
                      </button>
                      {user.status === 'active' ? (
                        <button
                          onClick={() => handleUserAction('suspend', user.id)}
                          className="text-yellow-600 hover:text-yellow-700 dark:text-yellow-400"
                          title="Suspend User"
                        >
                          <FiUserX size={16} />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUserAction('activate', user.id)}
                          className="text-green-600 hover:text-green-700 dark:text-green-400"
                          title="Activate User"
                        >
                          <FiUserCheck size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => handleUserAction('delete', user.id)}
                        className="text-red-600 hover:text-red-700 dark:text-red-400"
                        title="Delete User"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <FiUsers className="mx-auto text-secondary-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-secondary-900 dark:text-white mb-2">
              No users found
            </h3>
            <p className="text-secondary-600 dark:text-secondary-400">
              {searchTerm || roleFilter !== 'all' || statusFilter !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'No users have been added yet'
              }
            </p>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-secondary-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-secondary-900 dark:text-white">
                  Add New User
                </h2>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="text-secondary-400 hover:text-secondary-600"
                >
                  <FiX size={24} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="input-field w-full"
                    placeholder="Enter full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="input-field w-full"
                    placeholder="Enter email address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="input-field w-full"
                    placeholder="Enter phone number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    Role *
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    className="input-field w-full"
                  >
                    <option value="student">Student</option>
                    <option value="college_admin">College Admin</option>
                    <option value="incubator_manager">Incubator Manager</option>
                    <option value="admin">Super Admin</option>
                  </select>
                </div>

                {formData.role === 'student' && (
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                      College *
                    </label>
                    <select
                      value={formData.college_id}
                      onChange={(e) => setFormData({...formData, college_id: e.target.value})}
                      className="input-field w-full"
                    >
                      <option value="">Select College</option>
                      {colleges.map(college => (
                        <option key={college.id} value={college.id}>{college.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {formData.role === 'college_admin' && (
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                      College *
                    </label>
                    <select
                      value={formData.college_id}
                      onChange={(e) => setFormData({...formData, college_id: e.target.value})}
                      className="input-field w-full"
                    >
                      <option value="">Select College</option>
                      {colleges.map(college => (
                        <option key={college.id} value={college.id}>{college.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {formData.role === 'incubator_manager' && (
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                      Incubator *
                    </label>
                    <select
                      value={formData.incubator_id}
                      onChange={(e) => setFormData({...formData, incubator_id: e.target.value})}
                      className="input-field w-full"
                    >
                      <option value="">Select Incubator</option>
                      {incubators.map(incubator => (
                        <option key={incubator.id} value={incubator.id}>{incubator.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    Password *
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="input-field w-full"
                    placeholder="Enter password"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    className="input-field w-full"
                    placeholder="Confirm password"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddUser}
                  className="btn-primary"
                >
                  Add User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
