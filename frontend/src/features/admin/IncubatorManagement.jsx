import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  FiPlus, 
  FiEdit3, 
  FiTrash2, 
  FiEye, 
  FiSearch, 
  FiFilter, 
  FiDownload,
  FiRefreshCw,
  FiTarget,
  FiUsers,
  FiZap,
  FiX
} from 'react-icons/fi';
import { incubatorManagementAPI } from '../../services/api';

const IncubatorManagement = () => {
  const [incubators, setIncubators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedIncubator, setSelectedIncubator] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    state: '',
    country: 'India',
    address: '',
    phone: '',
    contact_email: '',
    website: '',
    established_year: '',
    description: '',
    focus_areas: [],
    funding_available: 0,
    capacity: 0,
    is_active: true
  });

  useEffect(() => {
    fetchIncubators();
  }, []);

  const fetchIncubators = async () => {
    try {
      setLoading(true);
      
      // Check if user is logged in
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please log in to access this page');
        return;
      }
      
      const response = await incubatorManagementAPI.getAll();
      if (response.data?.success && response.data?.data?.incubators) {
        setIncubators(response.data.data.incubators);
      } else {
        console.log('No incubators found or invalid response:', response.data);
        setIncubators([]);
      }
    } catch (error) {
      console.error('Error fetching incubators:', error);
      if (error.response?.status === 401) {
        toast.error('Authentication failed. Please log in again.');
      } else {
        toast.error('Failed to fetch incubators');
      }
      setIncubators([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddIncubator = async () => {
    try {
      if (!formData.name || !formData.city || !formData.state || !formData.contact_email) {
        toast.error('Please fill in all required fields');
        return;
      }

      const response = await incubatorManagementAPI.create(formData);
      if (response.data?.success) {
        toast.success('Incubator created successfully');
        setShowAddModal(false);
        resetForm();
        fetchIncubators();
      }
    } catch (error) {
      console.error('Error creating incubator:', error);
      toast.error(error.response?.data?.message || 'Failed to create incubator');
    }
  };

  const handleEditIncubator = async () => {
    try {
      if (!selectedIncubator) return;

      const response = await incubatorManagementAPI.update(selectedIncubator.id, formData);
      if (response.data?.success) {
        toast.success('Incubator updated successfully');
        setShowEditModal(false);
        resetForm();
        fetchIncubators();
      }
    } catch (error) {
      console.error('Error updating incubator:', error);
      toast.error(error.response?.data?.message || 'Failed to update incubator');
    }
  };

  const handleDeleteIncubator = async (incubatorId) => {
    if (!window.confirm('Are you sure you want to delete this incubator?')) return;

    try {
      const response = await incubatorManagementAPI.delete(incubatorId);
      if (response.data?.success) {
        toast.success('Incubator deleted successfully');
        fetchIncubators();
      }
    } catch (error) {
      console.error('Error deleting incubator:', error);
      toast.error(error.response?.data?.message || 'Failed to delete incubator');
    }
  };

  const handleViewIncubator = (incubator) => {
    setSelectedIncubator(incubator);
    setShowViewModal(true);
  };

  const handleEditClick = (incubator) => {
    setSelectedIncubator(incubator);
    setFormData({
      name: incubator.name,
      city: incubator.city,
      state: incubator.state,
      country: incubator.country,
      address: incubator.address || '',
      phone: incubator.phone || '',
      contact_email: incubator.contact_email,
      website: incubator.website || '',
      established_year: incubator.established_year || '',
      description: incubator.description || '',
      focus_areas: incubator.focus_areas || [],
      funding_available: incubator.funding_available || 0,
      capacity: incubator.capacity || 0,
      is_active: incubator.is_active
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      city: '',
      state: '',
      country: 'India',
      address: '',
      phone: '',
      contact_email: '',
      website: '',
      established_year: '',
      description: '',
      focus_areas: [],
      funding_available: 0,
      capacity: 0,
      is_active: true
    });
    setSelectedIncubator(null);
  };

  const filteredIncubators = incubators.filter(incubator => {
    const matchesSearch = incubator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         incubator.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         incubator.state.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && incubator.is_active) ||
                         (statusFilter === 'inactive' && !incubator.is_active);
    return matchesSearch && matchesStatus;
  });

  const exportData = () => {
    const csvContent = [
      ['Name', 'City', 'State', 'Email', 'Phone', 'Startups', 'Ideas', 'Funding', 'Status'],
      ...filteredIncubators.map(incubator => [
        incubator.name,
        incubator.city,
        incubator.state,
        incubator.email,
        incubator.phone || 'N/A',
        incubator.total_startups || 0,
        incubator.total_ideas || 0,
        incubator.funding_available || 0,
        incubator.is_active ? 'Active' : 'Inactive'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'incubators_export.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Data exported successfully');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900 dark:text-white">
            Incubator Management
          </h1>
          <p className="text-secondary-600 dark:text-secondary-400">
            Manage all incubators and their settings
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <FiPlus size={16} />
          <span>Add Incubator</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white dark:bg-secondary-800 rounded-lg p-6 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <FiTarget className="text-blue-600 dark:text-blue-400" size={20} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400">
                Total Incubators
              </p>
              <p className="text-2xl font-bold text-secondary-900 dark:text-white">
                {incubators.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-secondary-800 rounded-lg p-6 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <FiUsers className="text-green-600 dark:text-green-400" size={20} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400">
                Active Incubators
              </p>
              <p className="text-2xl font-bold text-secondary-900 dark:text-white">
                {incubators.filter(i => i.is_active).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-secondary-800 rounded-lg p-6 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <FiZap className="text-purple-600 dark:text-purple-400" size={20} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400">
                Total Ideas
              </p>
              <p className="text-2xl font-bold text-secondary-900 dark:text-white">
                {incubators.reduce((sum, i) => sum + (i.total_ideas || 0), 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-secondary-800 rounded-lg p-6 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
              <FiUsers className="text-orange-600 dark:text-orange-400" size={20} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400">
                Total Startups
              </p>
              <p className="text-2xl font-bold text-secondary-900 dark:text-white">
                {incubators.reduce((sum, i) => sum + (i.total_startups || 0), 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-secondary-800 rounded-lg p-4 mb-6 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400" size={16} />
              <input
                type="text"
                placeholder="Search incubators..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-secondary-700 dark:text-white"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-secondary-700 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <button
              onClick={exportData}
              className="btn-secondary flex items-center space-x-2"
            >
              <FiDownload size={16} />
              <span>Export</span>
            </button>
            <button
              onClick={fetchIncubators}
              className="btn-secondary flex items-center space-x-2"
            >
              <FiRefreshCw size={16} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Incubators Table */}
      <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-secondary-200 dark:divide-secondary-700">
            <thead className="bg-secondary-50 dark:bg-secondary-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-300 uppercase tracking-wider">
                  Incubator
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-300 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-300 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-300 uppercase tracking-wider">
                  Stats
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-secondary-800 divide-y divide-secondary-200 dark:divide-secondary-700">
              {filteredIncubators.map((incubator) => (
                <tr key={incubator.id} className="hover:bg-secondary-50 dark:hover:bg-secondary-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-secondary-900 dark:text-white">
                        {incubator.name}
                      </div>
                      {incubator.established_year && (
                        <div className="text-sm text-secondary-500 dark:text-secondary-400">
                          Est. {incubator.established_year}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-secondary-900 dark:text-white">
                      {incubator.city}, {incubator.state}
                    </div>
                    <div className="text-sm text-secondary-500 dark:text-secondary-400">
                      {incubator.country}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-secondary-900 dark:text-white">
                      {incubator.email}
                    </div>
                    {incubator.phone && (
                      <div className="text-sm text-secondary-500 dark:text-secondary-400">
                        {incubator.phone}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-secondary-900 dark:text-white">
                      {incubator.total_startups || 0} startups
                    </div>
                    <div className="text-sm text-secondary-500 dark:text-secondary-400">
                      {incubator.total_ideas || 0} ideas
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      incubator.is_active 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                    }`}>
                      {incubator.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewIncubator(incubator)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        <FiEye size={16} />
                      </button>
                      <button
                        onClick={() => handleEditClick(incubator)}
                        className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                      >
                        <FiEdit3 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteIncubator(incubator.id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
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
      </div>

      {/* Add Incubator Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-secondary-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-secondary-900 dark:text-white">
                  Add New Incubator
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
                    Incubator Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="input-field w-full"
                    placeholder="Enter incubator name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    className="input-field w-full"
                    placeholder="Enter city"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    State *
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({...formData, state: e.target.value})}
                    className="input-field w-full"
                    placeholder="Enter state"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    Country
                  </label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({...formData, country: e.target.value})}
                    className="input-field w-full"
                    placeholder="Enter country"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) => setFormData({...formData, contact_email: e.target.value})}
                    className="input-field w-full"
                    placeholder="Enter email address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    Phone
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
                    Website
                  </label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({...formData, website: e.target.value})}
                    className="input-field w-full"
                    placeholder="Enter website URL"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    Established Year
                  </label>
                  <input
                    type="number"
                    value={formData.established_year}
                    onChange={(e) => setFormData({...formData, established_year: e.target.value})}
                    className="input-field w-full"
                    placeholder="Enter year"
                    min="1900"
                    max={new Date().getFullYear()}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    Funding Available
                  </label>
                  <input
                    type="number"
                    value={formData.funding_available}
                    onChange={(e) => setFormData({...formData, funding_available: e.target.value})}
                    className="input-field w-full"
                    placeholder="Enter funding amount"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    Max Capacity
                  </label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                    className="input-field w-full"
                    placeholder="Enter max capacity"
                    min="0"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="input-field w-full"
                  rows="3"
                  placeholder="Enter incubator description"
                />
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  Focus Sectors
                </label>
                <input
                  type="text"
                  value={formData.focus_areas.join(', ')}
                  onChange={(e) => setFormData({...formData, focus_areas: e.target.value.split(',').map(s => s.trim()).filter(s => s)})}
                  className="input-field w-full"
                  placeholder="Enter focus sectors (comma-separated)"
                />
              </div>

              <div className="mt-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                    className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-secondary-700 dark:text-secondary-300">
                    Active
                  </span>
                </label>
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
                  onClick={handleAddIncubator}
                  className="btn-primary"
                >
                  Add Incubator
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Incubator Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-secondary-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-secondary-900 dark:text-white">
                  Edit Incubator
                </h2>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    resetForm();
                  }}
                  className="text-secondary-400 hover:text-secondary-600"
                >
                  <FiX size={24} />
                </button>
              </div>

              {/* Same form fields as Add Modal */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    Incubator Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="input-field w-full"
                    placeholder="Enter incubator name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    className="input-field w-full"
                    placeholder="Enter city"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    State *
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({...formData, state: e.target.value})}
                    className="input-field w-full"
                    placeholder="Enter state"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    Country
                  </label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({...formData, country: e.target.value})}
                    className="input-field w-full"
                    placeholder="Enter country"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) => setFormData({...formData, contact_email: e.target.value})}
                    className="input-field w-full"
                    placeholder="Enter email address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    Phone
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
                    Website
                  </label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({...formData, website: e.target.value})}
                    className="input-field w-full"
                    placeholder="Enter website URL"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    Established Year
                  </label>
                  <input
                    type="number"
                    value={formData.established_year}
                    onChange={(e) => setFormData({...formData, established_year: e.target.value})}
                    className="input-field w-full"
                    placeholder="Enter year"
                    min="1900"
                    max={new Date().getFullYear()}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    Funding Available
                  </label>
                  <input
                    type="number"
                    value={formData.funding_available}
                    onChange={(e) => setFormData({...formData, funding_available: e.target.value})}
                    className="input-field w-full"
                    placeholder="Enter funding amount"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    Max Capacity
                  </label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                    className="input-field w-full"
                    placeholder="Enter max capacity"
                    min="0"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="input-field w-full"
                  rows="3"
                  placeholder="Enter incubator description"
                />
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  Focus Sectors
                </label>
                <input
                  type="text"
                  value={formData.focus_areas.join(', ')}
                  onChange={(e) => setFormData({...formData, focus_areas: e.target.value.split(',').map(s => s.trim()).filter(s => s)})}
                  className="input-field w-full"
                  placeholder="Enter focus sectors (comma-separated)"
                />
              </div>

              <div className="mt-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                    className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-secondary-700 dark:text-secondary-300">
                    Active
                  </span>
                </label>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    resetForm();
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditIncubator}
                  className="btn-primary"
                >
                  Update Incubator
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Incubator Modal */}
      {showViewModal && selectedIncubator && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-secondary-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-secondary-900 dark:text-white">
                  Incubator Details
                </h2>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-secondary-400 hover:text-secondary-600"
                >
                  <FiX size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-secondary-900 dark:text-white mb-2">
                    {selectedIncubator.name}
                  </h3>
                  <p className="text-secondary-600 dark:text-secondary-400">
                    {selectedIncubator.description || 'No description available'}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300">
                      Location
                    </label>
                    <p className="text-secondary-900 dark:text-white">
                      {selectedIncubator.address && `${selectedIncubator.address}, `}
                      {selectedIncubator.city}, {selectedIncubator.state}, {selectedIncubator.country}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300">
                      Contact
                    </label>
                    <p className="text-secondary-900 dark:text-white">
                      {selectedIncubator.email}
                    </p>
                    {selectedIncubator.phone && (
                      <p className="text-secondary-900 dark:text-white">
                        {selectedIncubator.phone}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300">
                      Established
                    </label>
                    <p className="text-secondary-900 dark:text-white">
                      {selectedIncubator.established_year || 'Not specified'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300">
                      Website
                    </label>
                    <p className="text-secondary-900 dark:text-white">
                      {selectedIncubator.website ? (
                        <a href={selectedIncubator.website} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-500">
                          {selectedIncubator.website}
                        </a>
                      ) : 'Not specified'}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300">
                    Focus Sectors
                  </label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedIncubator.focus_sectors && selectedIncubator.focus_sectors.length > 0 ? (
                      selectedIncubator.focus_sectors.map((sector, index) => (
                        <span key={index} className="px-2 py-1 bg-secondary-100 dark:bg-secondary-700 text-secondary-800 dark:text-secondary-200 rounded-full text-xs">
                          {sector}
                        </span>
                      ))
                    ) : (
                      <span className="text-secondary-500 dark:text-secondary-400">No focus sectors specified</span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-secondary-50 dark:bg-secondary-700 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-secondary-900 dark:text-white">
                      {selectedIncubator.total_startups || 0}
                    </div>
                    <div className="text-sm text-secondary-600 dark:text-secondary-400">
                      Startups
                    </div>
                  </div>
                  <div className="bg-secondary-50 dark:bg-secondary-700 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-secondary-900 dark:text-white">
                      {selectedIncubator.total_ideas || 0}
                    </div>
                    <div className="text-sm text-secondary-600 dark:text-secondary-400">
                      Ideas
                    </div>
                  </div>
                  <div className="bg-secondary-50 dark:bg-secondary-700 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-secondary-900 dark:text-white">
                      {selectedIncubator.incubated_ideas || 0}
                    </div>
                    <div className="text-sm text-secondary-600 dark:text-secondary-400">
                      Incubated
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-secondary-50 dark:bg-secondary-700 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-secondary-900 dark:text-white">
                      ₹{selectedIncubator.funding_available?.toLocaleString() || 0}
                    </div>
                    <div className="text-sm text-secondary-600 dark:text-secondary-400">
                      Funding Available
                    </div>
                  </div>
                  <div className="bg-secondary-50 dark:bg-secondary-700 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-secondary-900 dark:text-white">
                      {selectedIncubator.max_capacity || 0}
                    </div>
                    <div className="text-sm text-secondary-600 dark:text-secondary-400">
                      Max Capacity
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="btn-secondary"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IncubatorManagement;
