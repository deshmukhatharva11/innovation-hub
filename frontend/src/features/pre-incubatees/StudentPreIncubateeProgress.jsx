import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import {
  FiActivity,
  FiEdit3,
  FiCheckCircle,
  FiClock,
  FiTarget,
  FiTrendingUp,
  FiRefreshCw,
  FiSave,
  FiX,
  FiUser,
  FiMapPin,
  FiAward,
  FiDollarSign,
  FiCalendar,
  FiMessageSquare
} from 'react-icons/fi';
import { preIncubateesAPI } from '../../services/api';

const StudentPreIncubateeProgress = () => {
  const { user } = useSelector((state) => state.auth);
  const [preIncubatees, setPreIncubatees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedPreIncubatee, setSelectedPreIncubatee] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [formData, setFormData] = useState({
    progress_percentage: 0,
    phase_description: '',
    notes: ''
  });

  useEffect(() => {
    fetchMyPreIncubatees();
  }, []);

  const fetchMyPreIncubatees = async () => {
    try {
      setLoading(true);
      const response = await preIncubateesAPI.getMyPreIncubatees();
      
      if (response.data?.success && response.data?.data?.preIncubatees) {
        setPreIncubatees(response.data.data.preIncubatees);
      } else {
        setPreIncubatees([]);
      }
    } catch (error) {
      console.error('Error fetching pre-incubatees:', error);
      toast.error('Failed to fetch your pre-incubatee projects');
      setPreIncubatees([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateClick = (preIncubatee) => {
    setSelectedPreIncubatee(preIncubatee);
    setFormData({
      progress_percentage: preIncubatee.progress_percentage || 0,
      phase_description: preIncubatee.phase_description || '',
      notes: preIncubatee.notes || ''
    });
    setShowUpdateModal(true);
  };

  const handleUpdateProgress = async () => {
    try {
      if (!selectedPreIncubatee) return;

      setUpdateLoading(true);
      const response = await preIncubateesAPI.updateStudentProgress(selectedPreIncubatee.id, formData);
      
      if (response.data?.success) {
        toast.success('Progress updated successfully!');
        setShowUpdateModal(false);
        fetchMyPreIncubatees(); // Refresh the list
      }
    } catch (error) {
      console.error('Error updating progress:', error);
      toast.error(error.response?.data?.message || 'Failed to update progress');
    } finally {
      setUpdateLoading(false);
    }
  };

  const getPhaseColor = (phase) => {
    switch (phase) {
      case 'research': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200';
      case 'development': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200';
      case 'testing': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200';
      case 'market_validation': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-200';
      case 'scaling': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200';
      case 'completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200';
      case 'paused': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200';
      case 'terminated': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200';
    }
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            My Pre-Incubation Projects
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track and update your incubated project progress
          </p>
        </div>
        <button
          onClick={fetchMyPreIncubatees}
          className="btn-secondary flex items-center space-x-2"
        >
          <FiRefreshCw size={16} />
          <span>Refresh</span>
        </button>
      </div>

      {preIncubatees.length === 0 ? (
        <div className="text-center py-12">
          <FiActivity className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No Pre-Incubation Projects
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            You don't have any incubated ideas yet. Once your ideas are incubated, they will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {preIncubatees.map((preIncubatee) => (
            <div key={preIncubatee.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {preIncubatee.idea?.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {preIncubatee.idea?.description}
                    </p>
                    <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                      <FiMapPin size={14} />
                      <span>{preIncubatee.college?.name}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPhaseColor(preIncubatee.current_phase)}`}>
                      {preIncubatee.current_phase?.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(preIncubatee.status)}`}>
                      {preIncubatee.status?.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Progress
                    </span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      {preIncubatee.progress_percentage}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div 
                      className="bg-primary-600 h-3 rounded-full transition-all duration-300" 
                      style={{width: `${preIncubatee.progress_percentage}%`}}
                    ></div>
                  </div>
                </div>

                {/* Project Details */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    <FiAward size={16} />
                    <span>{preIncubatee.incubator?.name}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    <FiCalendar size={16} />
                    <span>
                      {preIncubatee.start_date ? new Date(preIncubatee.start_date).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Phase Description */}
                {preIncubatee.phase_description && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Current Phase Description
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {preIncubatee.phase_description}
                    </p>
                  </div>
                )}

                {/* Notes */}
                {preIncubatee.notes && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Notes
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {preIncubatee.notes}
                    </p>
                  </div>
                )}

                {/* Action Button */}
                <div className="flex justify-end">
                  <button
                    onClick={() => handleUpdateClick(preIncubatee)}
                    className="btn-primary flex items-center space-x-2"
                  >
                    <FiEdit3 size={16} />
                    <span>Update Progress</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Update Progress Modal */}
      {showUpdateModal && selectedPreIncubatee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Update Progress
                </h2>
                <button
                  onClick={() => setShowUpdateModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <FiX size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    {selectedPreIncubatee.idea?.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Current Phase: {selectedPreIncubatee.current_phase?.replace('_', ' ').toUpperCase()}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Progress Percentage *
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.progress_percentage}
                    onChange={(e) => setFormData({...formData, progress_percentage: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Enter progress percentage (0-100)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phase Description
                  </label>
                  <textarea
                    value={formData.phase_description}
                    onChange={(e) => setFormData({...formData, phase_description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    rows="3"
                    placeholder="Describe what you've accomplished in this phase"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    rows="3"
                    placeholder="Any additional notes or updates"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowUpdateModal(false)}
                  className="btn-secondary"
                  disabled={updateLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateProgress}
                  className="btn-primary flex items-center space-x-2"
                  disabled={updateLoading}
                >
                  {updateLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <FiSave size={16} />
                  )}
                  <span>{updateLoading ? 'Updating...' : 'Update Progress'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentPreIncubateeProgress;
