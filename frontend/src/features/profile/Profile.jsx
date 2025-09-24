import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  FiEdit3,
  FiSave,
  FiX,
  FiCamera,
  FiBook,
  FiBriefcase,
  FiCalendar,
  FiGlobe,
  FiRefreshCw
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { usersAPI } from '../../services/api';
import { updateUser } from '../../store/slices/userSlice';

const Profile = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const reduxUser = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({});
  const [loading, setLoading] = useState(false);
  const [initialData, setInitialData] = useState({});
  const [mounted, setMounted] = useState(true);
  const [abortController, setAbortController] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    if (user?.id && isAuthenticated) {
      fetchUserProfile();
    }
    return () => {
      setMounted(false);
      // Cancel any pending request on unmount
      if (abortController) {
        abortController.abort();
      }
      // Clean up preview image URL
      if (previewImage) {
        URL.revokeObjectURL(previewImage);
      }
    };
  }, [user?.id, isAuthenticated]);

  const fetchUserProfile = async () => {
    if (!user?.id || !mounted) return;
    
    // Cancel any existing request
    if (abortController) {
      abortController.abort();
    }
    
    const controller = new AbortController();
    setAbortController(controller);
    
    try {
      setLoading(true);
      
      // Always fetch fresh data to ensure college name is updated
      // Clear any stale cache
      sessionStorage.removeItem(`user_profile_${user.id}`);
      sessionStorage.removeItem(`user_profile_timestamp_${user.id}`);
      
      const response = await usersAPI.getById(user.id, controller.signal);
      
      // Only update state if component is still mounted
      if (!mounted) return;
      
      if (response.data?.success && response.data?.data?.user) {
        const userData = response.data.data.user;
        console.log('Received user data:', userData);
        console.log('College data:', userData.college);
        console.log('College name from college object:', userData.college?.name);
        console.log('College name from userData:', userData.college_name);
        console.log('Final college name assignment:', userData.college?.name || userData.college_name || '');
        console.log('Profile image URL from backend:', userData.profile_image_url);
        
        // If college name is not available, try to get it from Redux store
        let collegeName = userData.college?.name || userData.college_name || '';
        if (!collegeName && userData.college_id) {
          console.log('College name not found, college_id available:', userData.college_id);
          // Try to get college name from Redux store user object
          if (reduxUser?.college?.name) {
            collegeName = reduxUser.college.name;
            console.log('Using college name from Redux store:', collegeName);
          }
        }
        
        const formattedData = {
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          department: userData.department || '',
          bio: userData.bio || '',
          date_of_birth: userData.date_of_birth || '',
          linkedin_url: userData.linkedin_url || '',
          github_url: userData.github_url || '',
          portfolio_url: userData.portfolio_url || '',
          skills: userData.skills || [],
          social_links: userData.social_links || {},
          profile_image_url: userData.profile_image_url || '',
          // College info (if available)
          college_name: collegeName,
         
          // Incubator info (if available)
          incubator_name: userData.incubator?.name || '',
          
          // Additional fields based on role
          year_of_study: userData.year_of_study || '',
          roll_number: userData.roll_number || '',
          gpa: userData.gpa || '',
          position: userData.position || '',
          experience_years: userData.experience_years || '',
          designation: userData.designation || '',
          expertise_areas: userData.expertise_areas || '',
          joined_date: userData.created_at || new Date().toISOString()
        };
        
        console.log('Formatted college_name:', formattedData.college_name);
        
        // Cache the profile data
        sessionStorage.setItem(`user_profile_${user.id}`, JSON.stringify(formattedData));
        sessionStorage.setItem(`user_profile_timestamp_${user.id}`, Date.now().toString());
        
        setProfileData(formattedData);
        setInitialData(formattedData);
      }
    } catch (error) {
      if (!mounted) return; // Don't show errors if component unmounted
      
      // Don't show error for cancelled/aborted requests
      if (error.name === 'CancelledError' || 
          error.code === 'ERR_CANCELED' || 
          error.name === 'AbortError' ||
          error.message?.includes('aborted')) {
        console.log('Profile request was cancelled or aborted');
        return;
      }
      
      console.error('Error fetching user profile:', error);
      toast.error('Failed to load profile data');
    } finally {
      if (mounted) {
        setLoading(false);
        setAbortController(null);
      }
    }
  };
const debouncedHandleInputChange = useCallback(
    (field, value) => {
      // Prevent unnecessary updates if value hasn't changed
      setProfileData(prev => {
        if (prev[field] === value) return prev;
        return {
          ...prev,
          [field]: value
        };
      });
    },
    []
  );

  const profileImageUrl = previewImage || (() => {
    if (!profileData.profile_image_url) return null;
    
    // If it's already a base64 data URL, use it directly
    if (profileData.profile_image_url.startsWith('data:image/')) {
      console.log('Using base64 image data');
      return profileData.profile_image_url;
    }
    
    // For file paths, try to fetch and convert to base64
    if (profileData.profile_image_url.startsWith('profile_image/')) {
      console.log('Converting file path to base64:', profileData.profile_image_url);
      // For now, return null to show default avatar until we upload a new image
      return null;
    }
    
    // For HTTP URLs, use them directly
    if (profileData.profile_image_url.startsWith('http')) {
      return profileData.profile_image_url;
    }
    
    // For now, return null to show default avatar
    console.log('Profile image not available, showing default avatar');
    return null;
  })();


  const handleSave = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      // Prepare data for API update - only send fields that have changed
      const updateData = {};
      const fieldsToCheck = [
        'name', 'phone', 'department', 'bio', 'date_of_birth', 
        'linkedin_url', 'github_url', 'portfolio_url', 'skills', 'social_links',
        'year_of_study', 'roll_number', 'gpa', 'position', 
        'experience_years', 'designation', 'expertise_areas'
      ];

      fieldsToCheck.forEach(field => {
        if (profileData[field] !== initialData[field]) {
          // Only include non-empty values or explicitly set empty strings
          if (profileData[field] !== null && profileData[field] !== undefined && profileData[field] !== '') {
            updateData[field] = profileData[field];
          } else if (profileData[field] === '') {
            // Allow empty strings for optional fields
            updateData[field] = profileData[field];
          }
        }
      });

      // Only make API call if there are changes
      if (Object.keys(updateData).length === 0) {
        toast.success('No changes to save');
        setIsEditing(false);
        setLoading(false);
        return;
      }

      console.log('Updating profile with data:', updateData);
      const response = await usersAPI.update(user.id, updateData);
      console.log('Profile update response:', response.data);
      
      if (response.data?.success && response.data?.data?.user) {
        const updatedUserData = response.data.data.user;
        console.log('Updated user data from server:', updatedUserData);
        console.log('Updated college data:', updatedUserData.college);
        
        // Update Redux store with new user data
        dispatch(updateUser(updatedUserData));
        
        // Update profile data with the new college information
        const updatedProfileData = {
          ...profileData,
          college_name: updatedUserData.college?.name || updatedUserData.college_name || profileData.college_name,
          incubator_name: updatedUserData.incubator?.name || updatedUserData.incubator_name || profileData.incubator_name,
        };
        
        // Update the cached profile data
        sessionStorage.setItem(`user_profile_${user.id}`, JSON.stringify(updatedProfileData));
        sessionStorage.setItem(`user_profile_timestamp_${user.id}`, Date.now().toString());
        
        // Update the state
        setProfileData(updatedProfileData);
        setInitialData(updatedProfileData);
        
        toast.success('Profile updated successfully!');
        setIsEditing(false);
      } else {
        toast.error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      if (error.response?.data?.errors) {
        const errorMessages = error.response.data.errors.map(err => err.msg).join(', ');
        toast.error(`Validation errors: ${errorMessages}`);
      } else {
        toast.error(error.response?.data?.message || 'Failed to update profile');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setProfileData(initialData);
    setIsEditing(false);
  };

  const refreshProfileData = async () => {
    if (user?.id) {
      // Clear cache to force fresh data
      sessionStorage.removeItem(`user_profile_${user.id}`);
      sessionStorage.removeItem(`user_profile_timestamp_${user.id}`);
      // Clear all profile-related cache
      sessionStorage.clear();
      await fetchUserProfile();
    }
  };

  const handleAvatarChange = async (event) => {
    const file = event.target.files[0];
    if (!file || !user?.id) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 2MB for base64)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size should be less than 2MB');
      return;
    }

    try {
      setLoading(true);

      // Convert image to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64String = e.target.result;
        
        // Update profile data with base64 image
        const updatedProfileData = {
          ...profileData,
          profile_image_url: base64String,
        };
        
        // Save to backend
        const response = await usersAPI.update(user.id, {
          profile_image_url: base64String
        });

        if (response.data?.success) {
          setProfileData(updatedProfileData);
          setInitialData(updatedProfileData);
          setPreviewImage(null);
          toast.success('Profile picture updated successfully!');
        } else {
          throw new Error(response.data?.message || 'Failed to save image');
        }
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading profile image:', error);
      toast.error('Failed to upload profile picture');
    } finally {
      setLoading(false);
    }
  };


  const renderStudentFields = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
            College
          </label>
          <p className="text-secondary-900 dark:text-white">
            {profileData.college_name || 'Not specified'}
          </p>
          {/* Debug info */}
          <p className="text-xs text-gray-500">
            Debug: {JSON.stringify({ college_name: profileData.college_name })}
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
            Department
          </label>
          {isEditing ? (
            <select
              value={profileData.department}
              onChange={(e) => debouncedHandleInputChange('department', e.target.value)}
              className="input-field"
            >
              <option value="">Select Department</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Electronics Engineering">Electronics Engineering</option>
              <option value="Mechanical Engineering">Mechanical Engineering</option>
              <option value="Civil Engineering">Civil Engineering</option>
              <option value="Electrical Engineering">Electrical Engineering</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Commerce">Commerce</option>
              <option value="Arts">Arts</option>
              <option value="Science">Science</option>
            </select>
          ) : (
            <p className="text-secondary-900 dark:text-white">{profileData.department || 'Not specified'}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
            Year of Study
          </label>
          {isEditing ? (
            <select
              value={profileData.year_of_study}
              onChange={(e) => debouncedHandleInputChange('year_of_study', e.target.value)}
              className="input-field"
            >
              <option value="">Select Year</option>
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
            </select>
          ) : (
            <p className="text-secondary-900 dark:text-white">
              {profileData.year_of_study ? `${profileData.year_of_study}${profileData.year_of_study === '1' ? 'st' : profileData.year_of_study === '2' ? 'nd' : profileData.year_of_study === '3' ? 'rd' : 'th'} Year` : 'Not specified'}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
            Roll Number
          </label>
          {isEditing ? (
            <input
              type="text"
              value={profileData.roll_number}
              onChange={(e) => debouncedHandleInputChange('roll_number', e.target.value)}
              className="input-field"
            />
          ) : (
            <p className="text-secondary-900 dark:text-white">{profileData.roll_number || 'Not specified'}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
            GPA
          </label>
          {isEditing ? (
            <input
              type="number"
              step="0.01"
              min="0"
              max="4"
              value={profileData.gpa}
              onChange={(e) => debouncedHandleInputChange('gpa', e.target.value)}
              className="input-field"
            />
          ) : (
            <p className="text-secondary-900 dark:text-white">{profileData.gpa || 'Not specified'}</p>
          )}
        </div>
      </div>
    </>
  );

  const renderCollegeFields = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
            College Name
          </label>
          <p className="text-secondary-900 dark:text-white">
            {profileData.college_name || 'Not specified'}
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
            Position
          </label>
          {isEditing ? (
            <input
              type="text"
              value={profileData.position}
              onChange={(e) => debouncedHandleInputChange('position', e.target.value)}
              className="input-field"
              placeholder="e.g., Innovation Director, Dean, Professor"
            />
          ) : (
            <p className="text-secondary-900 dark:text-white">{profileData.position || 'Not specified'}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
            Experience (Years)
          </label>
          {isEditing ? (
            <input
              type="number"
              min="0"
              value={profileData.experience_years}
              onChange={(e) => debouncedHandleInputChange('experience_years', e.target.value)}
              className="input-field"
            />
          ) : (
            <p className="text-secondary-900 dark:text-white">{profileData.experience_years ? `${profileData.experience_years} years` : 'Not specified'}</p>
          )}
        </div>
      </div>
    </>
  );

  const renderIncubatorFields = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
            Organization Name
          </label>
          <p className="text-secondary-900 dark:text-white">
            {profileData.incubator_name || 'Not specified'}
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
            Designation
          </label>
          {isEditing ? (
            <input
              type="text"
              value={profileData.designation}
              onChange={(e) => debouncedHandleInputChange('designation', e.target.value)}
              className="input-field"
              placeholder="e.g., Program Manager, Investment Director"
            />
          ) : (
            <p className="text-secondary-900 dark:text-white">{profileData.designation || 'Not specified'}</p>
          )}
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
            Areas of Expertise
          </label>
          {isEditing ? (
            <input
              type="text"
              value={profileData.expertise_areas}
              onChange={(e) => debouncedHandleInputChange('expertise_areas', e.target.value)}
              className="input-field"
              placeholder="e.g., Technology, Healthcare, Fintech, AI/ML"
            />
          ) : (
            <p className="text-secondary-900 dark:text-white">{profileData.expertise_areas || 'Not specified'}</p>
          )}
        </div>
      </div>
    </>
  );

  if (loading && !user) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <p className="text-gray-500">User not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-secondary-900 dark:text-white">
          Profile
        </h1>
        {!isEditing ? (
          <div className="flex space-x-3">
            <button
              onClick={refreshProfileData}
              className="btn-outline"
              disabled={loading}
            >
              <FiRefreshCw className="mr-2" size={16} />
              Refresh
            </button>
            <button
              onClick={() => setIsEditing(true)}
              className="btn-primary"
            >
              <FiEdit3 className="mr-2" size={16} />
              Edit Profile
            </button>
            <button
              onClick={() => document.getElementById('test-avatar-upload').click()}
              className="btn-success"
            >
              Test Upload (Base64)
            </button>
            <input
              id="test-avatar-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>
        ) : (
          <div className="flex space-x-3">
            <button
              onClick={handleCancel}
              className="btn-outline"
              disabled={loading}
            >
              <FiX className="mr-2" size={16} />
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="btn-primary"
              disabled={loading}
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <FiSave className="mr-2" size={16} />
              )}
              Save Changes
            </button>
          </div>
        )}
      </div>

      {/* Profile Card */}
      <div className="card">
        <div className="p-6">
          {/* Avatar and Basic Info */}
          <div className="flex flex-col md:flex-row md:items-start space-y-6 md:space-y-0 md:space-x-6 mb-8">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 relative">
                  {loading ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-8 h-8 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : profileImageUrl ? (
                    <img 
                      src={profileImageUrl} 
                      alt="Profile" 
                      className="absolute inset-0 w-full h-full object-cover"
                      onError={(e) => {
                        console.log('Image load error, showing default avatar');
                        e.target.style.display = 'none';
                        // Show the fallback div
                        const fallbackDiv = e.target.parentElement.querySelector('.fallback-avatar');
                        if (fallbackDiv) {
                          fallbackDiv.style.display = 'flex';
                        }
                      }}
                    />
                  ) : null}
                  <div className={`fallback-avatar absolute inset-0 flex items-center justify-center ${profileImageUrl ? 'hidden' : 'flex'}`}>
                    {user?.name ? (
                      <div className="w-full h-full flex items-center justify-center bg-primary-100 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 text-2xl font-bold">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    ) : (
                      <FiCamera size={48} className="text-gray-400 dark:text-gray-500" />
                    )}
                  </div>
                </div>
                {isEditing && (
                  <label className={`absolute bottom-0 right-0 p-2 rounded-full cursor-pointer transition-colors duration-200 shadow-lg ${
                    loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700 text-white'
                  }`}>
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <FiCamera size={16} />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                      disabled={loading}
                    />
                  </label>
                )}
              </div>
              <div className="text-center">
                <div className="inline-flex px-3 py-1 text-sm font-medium rounded-full bg-primary-100 text-primary-800 dark:bg-primary-900/20 dark:text-primary-300">
                  {user.role === 'student' ? 'Student' : user.role === 'college_admin' ? 'College Admin' : 'Incubator Manager'}
                </div>
              </div>
            </div>

            <div className="flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => debouncedHandleInputChange('name', e.target.value)}
                      className="input-field"
                    />
                  ) : (
                    <p className="text-xl font-semibold text-secondary-900 dark:text-white">{profileData.name}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    Email
                  </label>
                  <p className="text-secondary-900 dark:text-white">{profileData.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    Phone
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => debouncedHandleInputChange('phone', e.target.value)}
                      className="input-field"
                    />
                  ) : (
                    <p className="text-secondary-900 dark:text-white">{profileData.phone || 'Not specified'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    Date of Birth
                  </label>
                  {isEditing ? (
                    <input
                      type="date"
                      value={profileData.date_of_birth}
                      onChange={(e) => debouncedHandleInputChange('date_of_birth', e.target.value)}
                      className="input-field"
                    />
                  ) : (
                    <p className="text-secondary-900 dark:text-white">
                      {profileData.date_of_birth ? new Date(profileData.date_of_birth).toLocaleDateString() : 'Not specified'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
              Bio
            </label>
            {isEditing ? (
              <textarea
                value={profileData.bio}
                onChange={(e) => debouncedHandleInputChange('bio', e.target.value)}
                rows={4}
                className="input-field"
                placeholder="Tell us about yourself..."
              />
            ) : (
              <p className="text-secondary-900 dark:text-white">{profileData.bio || 'No bio added yet.'}</p>
            )}
          </div>

          {/* Role-specific Fields */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4 flex items-center">
              {user.role === 'student' && <><FiBook className="mr-2" /> Academic Information</>}
              {user.role === 'college_admin' && <><FiBriefcase className="mr-2" /> Professional Information</>}
              {user.role === 'incubator_manager' && <><FiBriefcase className="mr-2" /> Organization Information</>}
            </h3>
            {user.role === 'student' && renderStudentFields()}
            {user.role === 'college_admin' && renderCollegeFields()}
            {user.role === 'incubator_manager' && renderIncubatorFields()}
          </div>

          {/* Social Links */}
          <div>
            <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4 flex items-center">
              <FiGlobe className="mr-2" />
              Social Links
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  LinkedIn
                </label>
                {isEditing ? (
                  <input
                    type="url"
                    value={profileData.linkedin_url}
                    onChange={(e) => debouncedHandleInputChange('linkedin_url', e.target.value)}
                    className="input-field"
                    placeholder="https://linkedin.com/in/username"
                  />
                ) : (
                  <p className="text-secondary-900 dark:text-white">
                    {profileData.linkedin_url ? (
                      <a href={profileData.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700 dark:text-primary-400">
                        LinkedIn Profile
                      </a>
                    ) : (
                      'Not specified'
                    )}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  GitHub
                </label>
                {isEditing ? (
                  <input
                    type="url"
                    value={profileData.github_url}
                    onChange={(e) => debouncedHandleInputChange('github_url', e.target.value)}
                    className="input-field"
                    placeholder="https://github.com/username"
                  />
                ) : (
                  <p className="text-secondary-900 dark:text-white">
                    {profileData.github_url ? (
                      <a href={profileData.github_url} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700 dark:text-primary-400">
                        GitHub Profile
                      </a>
                    ) : (
                      'Not specified'
                    )}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  Portfolio
                </label>
                {isEditing ? (
                  <input
                    type="url"
                    value={profileData.portfolio_url}
                    onChange={(e) => debouncedHandleInputChange('portfolio_url', e.target.value)}
                    className="input-field"
                    placeholder="https://yourportfolio.com"
                  />
                ) : (
                  <p className="text-secondary-900 dark:text-white">
                    {profileData.portfolio_url ? (
                      <a href={profileData.portfolio_url} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700 dark:text-primary-400">
                        Portfolio Website
                      </a>
                    ) : (
                      'Not specified'
                    )}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Member Since */}
          <div className="mt-8 pt-6 border-t border-secondary-200 dark:border-secondary-700">
            <div className="flex items-center text-sm text-secondary-600 dark:text-secondary-400">
              <FiCalendar className="mr-2" size={16} />
              Member since {new Date(profileData.joined_date).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
