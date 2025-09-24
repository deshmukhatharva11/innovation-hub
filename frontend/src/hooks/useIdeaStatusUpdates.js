import { useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-hot-toast';

const useIdeaStatusUpdates = () => {
  const dispatch = useDispatch();

  // Listen for custom events when idea status is updated
  useEffect(() => {
    const handleIdeaStatusUpdate = (event) => {
      const { ideaId, newStatus, oldStatus, ideaData } = event.detail;
      
      console.log('🔄 Idea status update received:', {
        ideaId,
        oldStatus,
        newStatus,
        ideaData
      });

      // Show success toast
      const statusMessages = {
        'new_submission': 'New submission created',
        'submitted': 'Idea submitted for review',
        'under_review': 'Idea moved to review',
        'endorsed': 'Idea endorsed successfully',
        'rejected': 'Idea rejected',
        'nurtured': 'Idea marked for nurturing',
        'incubated': 'Idea accepted for incubation'
      };

      const message = statusMessages[newStatus] || `Idea status updated to ${newStatus}`;
      toast.success(message);

      // Dispatch custom event to refresh dashboards
      window.dispatchEvent(new CustomEvent('ideaStatusChanged', {
        detail: { ideaId, newStatus, oldStatus, ideaData }
      }));
    };

    const handleIdeaCreated = (event) => {
      const { ideaData } = event.detail;
      
      console.log('✨ New idea created:', ideaData);
      toast.success('New idea submitted successfully!');
      
      // Dispatch event to refresh dashboards
      window.dispatchEvent(new CustomEvent('ideaCreated', {
        detail: { ideaData }
      }));
    };

    // Add event listeners
    window.addEventListener('ideaStatusUpdated', handleIdeaStatusUpdate);
    window.addEventListener('ideaCreated', handleIdeaCreated);

    return () => {
      window.removeEventListener('ideaStatusUpdated', handleIdeaStatusUpdate);
      window.removeEventListener('ideaCreated', handleIdeaCreated);
    };
  }, [dispatch]);

  // Function to update idea status
  const updateIdeaStatus = useCallback(async (ideaId, statusData, onSuccess, onError) => {
    try {
      const { ideasAPI } = await import('../services/api');
      
      const response = await ideasAPI.updateStatus(ideaId, statusData);
      
      if (response.data?.success) {
        const ideaData = response.data.data;
        
        // Dispatch custom event
        window.dispatchEvent(new CustomEvent('ideaStatusUpdated', {
          detail: {
            ideaId,
            newStatus: statusData.status,
            oldStatus: ideaData.previousStatus,
            ideaData
          }
        }));

        if (onSuccess) onSuccess(ideaData);
      } else {
        throw new Error(response.data?.message || 'Failed to update idea status');
      }
    } catch (error) {
      console.error('Error updating idea status:', error);
      toast.error(error.message || 'Failed to update idea status');
      if (onError) onError(error);
    }
  }, []);

  // Function to create new idea
  const createIdea = useCallback(async (ideaData, onSuccess, onError) => {
    try {
      const { ideasAPI } = await import('../services/api');
      
      const response = await ideasAPI.create(ideaData);
      
      if (response.data?.success) {
        const createdIdea = response.data.data;
        
        // Dispatch custom event
        window.dispatchEvent(new CustomEvent('ideaCreated', {
          detail: { ideaData: createdIdea }
        }));

        if (onSuccess) onSuccess(createdIdea);
      } else {
        throw new Error(response.data?.message || 'Failed to create idea');
      }
    } catch (error) {
      console.error('Error creating idea:', error);
      toast.error(error.message || 'Failed to create idea');
      if (onError) onError(error);
    }
  }, []);

  return {
    updateIdeaStatus,
    createIdea
  };
};

export default useIdeaStatusUpdates;
