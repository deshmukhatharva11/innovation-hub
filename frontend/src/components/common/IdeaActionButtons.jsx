import React, { useState } from 'react';
import { FiCheck, FiX, FiTarget, FiEye, FiEdit3, FiClock } from 'react-icons/fi';
import useIdeaStatusUpdates from '../../hooks/useIdeaStatusUpdates';

const IdeaActionButtons = ({ 
  idea, 
  userRole, 
  onStatusUpdate, 
  onView, 
  onEdit,
  showView = true,
  showEdit = true,
  showActions = true
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const { updateIdeaStatus } = useIdeaStatusUpdates();

  const handleStatusUpdate = async (newStatus, actionName) => {
    if (isUpdating) return;
    
    console.log('🔄 Button clicked:', actionName, 'for idea:', idea.id, 'new status:', newStatus);
    
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      alert('❌ You must be logged in to perform this action. Please log in first.');
      return;
    }
    
    console.log('🔑 Token found:', token.substring(0, 20) + '...');
    
    setIsUpdating(true);
    try {
      // Direct API call instead of using the hook
      const { ideasAPI } = await import('../../services/api');
      
      const response = await ideasAPI.updateStatus(idea.id, {
        status: newStatus,
        feedback: `Status updated to ${actionName.toLowerCase()}`,
        reviewed_by: idea.reviewer?.id,
        reviewed_at: new Date().toISOString()
      });
      
      if (response.data?.success) {
        const updatedIdea = response.data.data;
        console.log('✅ Status update successful:', updatedIdea);
        
        // Show success message
        alert(`✅ Idea ${actionName.toLowerCase()} successfully!`);
        
        // Update local state
        if (onStatusUpdate) {
          onStatusUpdate(updatedIdea);
        }
        
        // Dispatch custom event for real-time updates
        window.dispatchEvent(new CustomEvent('ideaStatusChanged', {
          detail: {
            ideaId: idea.id,
            newStatus: newStatus,
            oldStatus: idea.status,
            ideaData: updatedIdea
          }
        }));
        
        // Show notification to student
        if (newStatus === 'under_review') {
          alert('📧 Notification sent to student: Your idea is now under review');
        } else if (newStatus === 'endorsed') {
          alert('📧 Notification sent to student: Congratulations! Your idea has been endorsed');
        } else if (newStatus === 'rejected') {
          alert('📧 Notification sent to student: Your idea has been rejected with feedback');
        }
        
      } else {
        throw new Error(response.data?.message || 'Failed to update idea status');
      }
    } catch (error) {
      console.error('❌ Error updating idea status:', error);
      
      let errorMessage = 'Failed to update idea status.';
      
      if (error.response?.status === 401) {
        errorMessage = 'Authentication failed. Please log in again.';
      } else if (error.response?.status === 403) {
        errorMessage = 'Access denied. You do not have permission to perform this action.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Idea not found.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(`❌ Error: ${errorMessage}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const getAvailableActions = () => {
    const currentStatus = idea.status?.toLowerCase();
    const actions = [];

    // View action (always available)
    if (showView) {
      actions.push({
        key: 'view',
        label: 'View',
        icon: FiEye,
        onClick: () => onView && onView(idea),
        className: 'text-blue-600 hover:text-blue-700 border-blue-300 hover:border-blue-400'
      });
    }

    // Edit action (only for draft/submitted/nurture ideas that are NOT upgraded)
    if (showEdit && (currentStatus === 'draft' || currentStatus === 'submitted' || currentStatus === 'new_submission' || currentStatus === 'nurture')) {
      // Don't show edit button if idea is upgraded (moved from nurture to under_review)
      if (!idea.is_upgraded) {
        actions.push({
          key: 'edit',
          label: 'Edit',
          icon: FiEdit3,
          onClick: () => onEdit && onEdit(idea),
          className: 'text-gray-600 hover:text-gray-700 border-gray-300 hover:border-gray-400'
        });
      }
    }

    // Role-based actions
    if (showActions && userRole) {
      switch (userRole) {
        case 'college_admin':
        case 'coordinator':
          if (currentStatus === 'submitted' || currentStatus === 'new_submission' || currentStatus === 'nurture') {
            actions.push(
              {
                key: 'under_review',
                label: 'Mark Under Review',
                icon: FiClock,
                onClick: () => {
                  console.log('🔄 Mark Under Review clicked for idea:', idea.id);
                  handleStatusUpdate('under_review', 'Under Review');
                },
                className: 'text-blue-600 hover:text-blue-700 border-blue-300 hover:border-blue-400',
                disabled: isUpdating
              },
              {
                key: 'endorse',
                label: 'Endorse',
                icon: FiCheck,
                onClick: () => {
                  console.log('🔄 Endorse clicked for idea:', idea.id);
                  handleStatusUpdate('endorsed', 'Endorsed');
                },
                className: 'text-green-600 hover:text-green-700 border-green-300 hover:border-green-400',
                disabled: isUpdating
              },
              {
                key: 'nurture',
                label: 'Nurture',
                icon: FiTarget,
                onClick: () => {
                  console.log('🔄 Nurture clicked for idea:', idea.id);
                  handleStatusUpdate('nurture', 'Nurture');
                },
                className: 'text-yellow-600 hover:text-yellow-700 border-yellow-300 hover:border-yellow-400',
                disabled: isUpdating
              },
              {
                key: 'reject',
                label: 'Reject',
                icon: FiX,
                onClick: () => {
                  console.log('🔄 Reject clicked for idea:', idea.id);
                  handleStatusUpdate('rejected', 'Rejected');
                },
                className: 'text-red-600 hover:text-red-700 border-red-300 hover:border-red-400',
                disabled: isUpdating
              }
            );
          }
          // For ideas under review - can endorse or reject
          else if (currentStatus === 'under_review') {
            actions.push(
              {
                key: 'endorse',
                label: 'Endorse',
                icon: FiCheck,
                onClick: () => {
                  console.log('🔄 Endorse clicked for idea:', idea.id);
                  handleStatusUpdate('endorsed', 'Endorsed');
                },
                className: 'text-green-600 hover:text-green-700 border-green-300 hover:border-green-400',
                disabled: isUpdating
              },
              {
                key: 'reject',
                label: 'Reject',
                icon: FiX,
                onClick: () => {
                  console.log('🔄 Reject clicked for idea:', idea.id);
                  handleStatusUpdate('rejected', 'Rejected');
                },
                className: 'text-red-600 hover:text-red-700 border-red-300 hover:border-red-400',
                disabled: isUpdating
              }
            );
          }
          // For pending review ideas - can endorse, reject, or nurture again
          else if (currentStatus === 'pending_review') {
            actions.push(
              {
                key: 'endorse',
                label: 'Endorse',
                icon: FiCheck,
                onClick: () => {
                  console.log('🔄 Endorse clicked for pending review idea:', idea.id);
                  handleStatusUpdate('endorsed', 'Endorsed');
                },
                className: 'text-green-600 hover:text-green-700 border-green-300 hover:border-green-400',
                disabled: isUpdating
              },
              {
                key: 'nurture',
                label: 'Nurture Again',
                icon: FiTarget,
                onClick: () => {
                  console.log('🔄 Nurture Again clicked for pending review idea:', idea.id);
                  handleStatusUpdate('nurture', 'Nurture');
                },
                className: 'text-yellow-600 hover:text-yellow-700 border-yellow-300 hover:border-yellow-400',
                disabled: isUpdating
              },
              {
                key: 'reject',
                label: 'Reject',
                icon: FiX,
                onClick: () => {
                  console.log('🔄 Reject clicked for pending review idea:', idea.id);
                  handleStatusUpdate('rejected', 'Rejected');
                },
                className: 'text-red-600 hover:text-red-700 border-red-300 hover:border-red-400',
                disabled: isUpdating
              }
            );
          }
          // For endorsed ideas - can forward to incubator or reject
          else if (currentStatus === 'endorsed') {
            actions.push(
              {
                key: 'forward',
                label: 'Forward to Incubator',
                icon: FiTarget,
                onClick: () => handleStatusUpdate('forwarded', 'Forwarded'),
                className: 'text-purple-600 hover:text-purple-700 border-purple-300 hover:border-purple-400',
                disabled: isUpdating
              },
              {
                key: 'reject',
                label: 'Reject',
                icon: FiX,
                onClick: () => {
                  console.log('🔄 Reject clicked for idea:', idea.id);
                  handleStatusUpdate('rejected', 'Rejected');
                },
                className: 'text-red-600 hover:text-red-700 border-red-300 hover:border-red-400',
                disabled: isUpdating
              }
            );
          }
          break;

        case 'incubator_manager':
          if (currentStatus === 'endorsed') {
            actions.push(
              {
                key: 'incubate',
                label: 'Incubate',
                icon: FiCheck,
                onClick: () => handleStatusUpdate('incubated', 'Incubated'),
                className: 'text-emerald-600 hover:text-emerald-700 border-emerald-300 hover:border-emerald-400',
                disabled: isUpdating
              },
              {
                key: 'reject',
                label: 'Reject',
                icon: FiX,
                onClick: () => {
                  console.log('🔄 Reject clicked for idea:', idea.id);
                  handleStatusUpdate('rejected', 'Rejected');
                },
                className: 'text-red-600 hover:text-red-700 border-red-300 hover:border-red-400',
                disabled: isUpdating
              }
            );
          }
          break;

        case 'student':
          if (currentStatus === 'draft' || currentStatus === 'new_submission') {
            actions.push({
              key: 'submit',
              label: 'Submit',
              icon: FiClock,
              onClick: () => handleStatusUpdate('submitted', 'Submitted'),
              className: 'text-blue-600 hover:text-blue-700 border-blue-300 hover:border-blue-400',
              disabled: isUpdating
            });
          }
          break;
        
        default:
          // No actions for unknown roles
          break;
      }
    }

    return actions;
  };

  const actions = getAvailableActions();

  if (actions.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <button
            key={action.key}
            onClick={action.onClick}
            disabled={action.disabled || isUpdating}
            className={`
              inline-flex items-center px-3 py-1.5 border text-xs font-medium rounded-md
              transition-colors duration-200
              ${action.className}
              ${action.disabled || isUpdating ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}
            `}
          >
            <Icon className="w-3 h-3 mr-1" />
            {action.label}
            {isUpdating && action.disabled && (
              <div className="ml-1 w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
            )}
          </button>
        );
      })}
    </div>
  );
};

export default IdeaActionButtons;
