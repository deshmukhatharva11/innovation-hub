import React from 'react';
import { useSelector } from 'react-redux';
import MentorChatInterface from '../../features/chat/MentorChatInterface';
import MentorChatModal from './MentorChatModal';
import useMentorChatModal from '../../hooks/useMentorChatModal';

const RoleBasedMentorChat = () => {
  const { user } = useSelector((state) => state.auth);
  const { isOpen, openModal, closeModal } = useMentorChatModal();

  // For students, show the modal interface
  if (user?.role === 'student') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Mentor Chat
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Chat with your assigned mentors for guidance and support.
            </p>
            <button
              onClick={openModal}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center mx-auto"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Open Mentor Chat
            </button>
          </div>
        </div>
        
        {/* Mentor Chat Modal */}
        <MentorChatModal 
          isOpen={isOpen} 
          onClose={closeModal} 
          userRole="student"
        />
      </div>
    );
  }

  // For mentors, college admins, and incubator managers, show the full interface
  return <MentorChatInterface />;
};

export default RoleBasedMentorChat;
