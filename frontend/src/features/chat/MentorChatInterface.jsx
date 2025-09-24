import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import {
  FiMessageCircle,
  FiSend,
  FiUser,
  FiClock,
  FiArrowLeft,
  FiSearch,
  FiUsers,
  FiBookOpen,
  FiWifi,
  FiWifiOff
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { mentorChatAPI } from '../../services/api';
// import useChatSocket from '../../hooks/useChatSocket';
// import socketService from '../../services/socketService';

const MentorChatInterface = () => {
  const { user } = useSelector((state) => state.auth);
  
  // Determine the appropriate title and search placeholder based on user role
  const getRoleBasedContent = () => {
    switch (user?.role) {
      case 'student':
        return {
          title: 'My Mentors',
          placeholder: 'Search mentors...',
          emptyMessage: 'No mentor conversations yet',
          emptySubMessage: 'Mentors assigned to you will appear here'
        };
      case 'college_admin':
        return {
          title: 'Student Conversations',
          placeholder: 'Search students...',
          emptyMessage: 'No student conversations yet',
          emptySubMessage: 'Students from your college will appear here'
        };
      case 'incubator_manager':
        return {
          title: 'Mentor & Student Conversations',
          placeholder: 'Search conversations...',
          emptyMessage: 'No conversations yet',
          emptySubMessage: 'Mentor and student conversations will appear here'
        };
      default:
        return {
          title: 'My Students',
          placeholder: 'Search students...',
          emptyMessage: 'No student conversations yet',
          emptySubMessage: 'Students assigned to you will appear here'
        };
    }
  };
  
  const roleContent = getRoleBasedContent();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [isConnected, setIsConnected] = useState(false);

  // WebSocket integration
  // const { sendMessage, handleTyping, isConnected: socketConnected } = useChatSocket(selectedConversation?.id);
  const sendMessage = () => {}; // Placeholder
  const handleTyping = () => {}; // Placeholder
  const socketConnected = false; // Placeholder

  useEffect(() => {
    fetchConversations();
  }, []);

  // WebSocket event listeners - DISABLED
  // useEffect(() => {
  //   const socket = socketService.getSocket();
  //   if (!socket) return;

  //   const handleNewMessage = (message) => {
  //     if (message.chat_id === selectedConversation?.id) {
  //       setMessages(prev => [...prev, message]);
  //     }
  //   };

  //   const handleConversationUpdate = (data) => {
  //     if (data.conversationId === selectedConversation?.id) {
  //       setConversations(prev => 
  //         prev.map(conv => 
  //           conv.id === data.conversationId 
  //             ? { ...conv, last_message: data.last_message, last_message_at: data.last_message_at }
  //             : conv
  //         )
  //       );
  //     }
  //   };

  //   const handleTypingIndicator = (data) => {
  //     if (data.conversationId === selectedConversation?.id) {
  //       setTypingUsers(prev => {
  //         const newSet = new Set(prev);
  //         if (data.isTyping) {
  //           newSet.add(data.userId);
  //         } else {
  //           newSet.delete(data.userId);
  //         }
  //         return newSet;
  //       });
  //     }
  //   };

  //   // Set up global handlers
  //   window.dispatchNewMessage = handleNewMessage;
  //   window.dispatchConversationUpdate = handleConversationUpdate;
  //   window.dispatchTypingIndicator = handleTypingIndicator;

  //   return () => {
  //     window.dispatchNewMessage = null;
  //     window.dispatchConversationUpdate = null;
  //     window.dispatchTypingIndicator = null;
  //   };
  // }, [selectedConversation?.id]);

  // Update connection status - DISABLED
  // useEffect(() => {
  //   setIsConnected(socketConnected);
  // }, [socketConnected]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await mentorChatAPI.getConversations();
      console.log('Conversations response:', response.data);
      const conversationsData = response.data?.data?.chats || response.data?.data || [];
      setConversations(Array.isArray(conversationsData) ? conversationsData : []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast.error('Failed to fetch conversations');
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const response = await mentorChatAPI.getMessages(conversationId);
      setMessages(response.data.data.messages || []);
      
      // Mark messages as read
      await mentorChatAPI.markAsRead(conversationId);
      
      // Update conversation unread count
      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversationId 
            ? { ...conv, unread_count: 0 }
            : conv
        )
      );
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to fetch messages');
    }
  };

  const handleConversationSelect = (conversation) => {
    setSelectedConversation(conversation);
    fetchMessages(conversation.id);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      // Use WebSocket to send message
      sendMessage(newMessage.trim());
      setNewMessage('');
      
      // Also send via API as backup
      try {
        await mentorChatAPI.sendMessage(selectedConversation.id, newMessage.trim());
      } catch (apiError) {
        console.warn('API send failed, but WebSocket succeeded:', apiError);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'No date';
    
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString();
    }
  };

  const filteredConversations = Array.isArray(conversations) ? conversations.filter(conversation =>
    conversation.student?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conversation.student?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex bg-gray-50">
      {/* Conversations Sidebar */}
      <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FiBookOpen className="w-5 h-5" />
            {roleContent.title}
          </h2>
          <div className="mt-3 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder={roleContent.placeholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <FiUsers className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>{roleContent.emptyMessage}</p>
              <p className="text-sm">{roleContent.emptySubMessage}</p>
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => handleConversationSelect(conversation)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedConversation?.id === conversation.id
                      ? 'bg-blue-50 border border-blue-200'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <FiUser className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">
                        {conversation.student?.name}
                      </h3>
                      <p className="text-sm text-gray-600 truncate">
                        {conversation.student?.email}
                      </p>
                      {conversation.messages?.[0] && (
                        <p className="text-xs text-gray-500 truncate mt-1">
                          {conversation.messages[0].message}
                        </p>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      {conversation.last_message_at && formatTime(conversation.last_message_at)}
                    </div>
                  </div>
                  {(conversation.mentor_unread_count > 0 || conversation.unread_count > 0) && (
                    <div className="flex justify-end mt-1">
                      <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                        {conversation.unread_count || conversation.mentor_unread_count}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-white">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedConversation(null)}
                  className="md:hidden p-1 hover:bg-gray-100 rounded"
                >
                  <FiArrowLeft className="w-5 h-5" />
                </button>
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <FiUser className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">
                    {user?.role === 'student' 
                      ? selectedConversation.mentor?.name 
                      : selectedConversation.student?.name
                    }
                  </h3>
                  <p className="text-sm text-gray-600">
                    {user?.role === 'student' 
                      ? selectedConversation.mentor?.email 
                      : selectedConversation.student?.email
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <FiMessageCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No messages yet</p>
                  <p className="text-sm">
                    {user?.role === 'student' 
                      ? 'Start a conversation with your mentor' 
                      : 'Start a conversation with your student'
                    }
                  </p>
                </div>
              ) : (
                messages.map((message) => {
                  const isOwnMessage = message.sender_id === user?.id;
                  const isMentor = message.sender_type === 'mentor';
                  
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          isOwnMessage
                            ? 'bg-blue-500 text-white'
                            : isMentor
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-200 text-gray-900'
                        }`}
                      >
                        <p className="text-sm">{message.message}</p>
                        <div className="flex items-center justify-end mt-1 space-x-1">
                          <span className={`text-xs ${
                            isOwnMessage ? 'text-blue-100' : isMentor ? 'text-green-100' : 'text-gray-500'
                          }`}>
                            {formatTime(message.created_at)}
                          </span>
                          {isOwnMessage && (
                            <span className="text-xs text-blue-100">✓</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 bg-white">
              {/* Connection Status */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {isConnected ? (
                    <div className="flex items-center text-green-600">
                      <FiWifi className="w-4 h-4" />
                      <span className="text-xs">Connected</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-red-600">
                      <FiWifiOff className="w-4 h-4" />
                      <span className="text-xs">Disconnected</span>
                    </div>
                  )}
                </div>
                
                {/* Typing Indicators */}
                {typingUsers.size > 0 && (
                  <div className="text-sm text-gray-500">
                    {Array.from(typingUsers).map((userId, index) => (
                      <span key={userId}>
                        {index > 0 && ', '}
                        User {userId} is typing...
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value);
                    handleTyping();
                  }}
                  placeholder="Type your message..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  disabled={!isConnected}
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || !isConnected}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <FiSend className="w-4 h-4" />
                  Send
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <FiBookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">
                {user?.role === 'student' 
                  ? 'Select a mentor to start chatting' 
                  : 'Select a student to start mentoring'
                }
              </h3>
              <p className="text-sm">Choose a conversation from the sidebar to begin</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MentorChatInterface;
