import React, { useState, useEffect } from 'react';
import { FiSearch, FiFilter, FiEdit, FiTrash2, FiEye, FiPlus, FiRefreshCw } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { collegeManagementAPI } from '../../services/api';

const CollegeManagement = () => {
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalColleges, setTotalColleges] = useState(0);

  const districts = ['Akola', 'Amravati', 'Buldhana', 'Washim', 'Yavatmal'];

  useEffect(() => {
    fetchColleges();
  }, [currentPage, searchTerm, districtFilter]);

  const fetchColleges = async () => {
    try {
      setLoading(true);
      const response = await collegeManagementAPI.getAll({
        page: currentPage,
        limit: 10,
        search: searchTerm,
        district: districtFilter
      });

      if (response.data?.success) {
        setColleges(response.data.data.colleges);
        setTotalPages(response.data.data.pagination.totalPages);
        setTotalColleges(response.data.data.pagination.totalColleges);
      } else {
        toast.error('Failed to fetch colleges');
      }
    } catch (error) {
      console.error('Error fetching colleges:', error);
      toast.error('Error fetching colleges');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleDistrictFilter = (e) => {
    setDistrictFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleRefresh = () => {
    fetchColleges();
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleDeleteCollege = async (collegeId) => {
    if (window.confirm('Are you sure you want to delete this college?')) {
      try {
        const response = await collegeManagementAPI.delete(collegeId);
        if (response.data?.success) {
          toast.success('College deleted successfully');
          fetchColleges();
        } else {
          toast.error('Failed to delete college');
        }
      } catch (error) {
        console.error('Error deleting college:', error);
        toast.error('Error deleting college');
      }
    }
  };

  const handleToggleActive = async (collegeId, isActive) => {
    try {
      const response = await collegeManagementAPI.update(collegeId, {
        is_active: !isActive
      });
      if (response.data?.success) {
        toast.success(`College ${!isActive ? 'activated' : 'deactivated'} successfully`);
        fetchColleges();
      } else {
        toast.error('Failed to update college status');
      }
    } catch (error) {
      console.error('Error updating college:', error);
      toast.error('Error updating college status');
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              College Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage registered colleges in the SGBAU Pre-Incubation Centre network
            </p>
          </div>
          <button
            onClick={handleRefresh}
            className="btn-secondary flex items-center"
          >
            <FiRefreshCw className="mr-2" size={16} />
            Refresh
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="card p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search colleges..."
              className="input-field pl-10"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          
          <div className="relative">
            <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              className="input-field pl-10"
              value={districtFilter}
              onChange={handleDistrictFilter}
            >
              <option value="">All Districts</option>
              {districts.map(district => (
                <option key={district} value={district}>{district}</option>
              ))}
            </select>
          </div>

          <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
            Total: {totalColleges} colleges
          </div>
        </div>
      </div>

      {/* Colleges Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Loading colleges...</p>
          </div>
        ) : colleges.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      College Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      District
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {colleges.map((college) => (
                    <tr key={college.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {college.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Est. {college.established_year}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {college.city}, {college.state}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                          {college.district}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {college.contact_email}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {college.contact_phone}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          college.is_active 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {college.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleToggleActive(college.id, college.is_active)}
                            className={`p-2 rounded-lg transition-colors ${
                              college.is_active
                                ? 'text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30'
                                : 'text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30'
                            }`}
                            title={college.is_active ? 'Deactivate' : 'Activate'}
                          >
                            {college.is_active ? <FiTrash2 size={16} /> : <FiPlus size={16} />}
                          </button>
                          <button
                            className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <FiEye size={16} />
                          </button>
                          <button
                            className="p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                            title="Edit College"
                          >
                            <FiEdit size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white dark:bg-gray-900 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Showing page <span className="font-medium">{currentPage}</span> of{' '}
                      <span className="font-medium">{totalPages}</span>
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            page === currentPage
                              ? 'z-10 bg-primary-50 border-primary-500 text-primary-600 dark:bg-primary-900/30 dark:border-primary-400 dark:text-primary-400'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="p-8 text-center">
            <FiSearch className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No colleges found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm || districtFilter
                ? 'Try adjusting your search or filter criteria.'
                : 'No colleges have been registered yet.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CollegeManagement;