import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import {
  FiMessageCircle,
  FiSend,
  FiUser,
  FiClock,
  FiCheck,
  FiCheckCircle,
  FiArrowLeft,
  FiSearch,
  FiUsers,
  FiMoreVertical,
  FiX,
  FiUserCheck,
  FiBookOpen,
  FiSettings,
  FiArchive,
  FiStar,
  FiTrash2,
  FiEdit3,
  FiCopy,
  FiDownload,
  FiSmile,
  FiMic,
  FiPaperclip,
  FiChevronRight
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { mentorChatAPI } from '../../services/api';
// import useChatSocket from '../../hooks/useChatSocket';

const MentorChatModal = ({ isOpen, onClose, userRole }) => {
  const { user } = useSelector((state) => state.auth);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // WebSocket integration - temporarily disabled
  // const { sendMessage, handleTyping, isConnected: socketConnected } = useChatSocket(selectedConversation?.id);
  const sendMessage = () => {};
  const handleTyping = () => {};
  const socketConnected = false;

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      fetchConversations();
      // Simulate online status
      setOnlineUsers(new Set(['mentor1', 'student1', 'admin1']));
    }
  }, [isOpen, userRole]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await mentorChatAPI.getConversations();
      console.log('🔍 Mentor chat API response:', response.data);
      const chats = response.data.data.chats || [];
      console.log('🔍 Setting conversations:', chats);
      setConversations(chats);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast.error('Failed to fetch conversations');
      setConversations([]); // Ensure conversations is always an array
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      console.log('🔍 Fetching messages for conversation:', conversationId);
      const response = await mentorChatAPI.getMessages(conversationId);
      console.log('✅ Messages response:', response.data);
      setMessages(response.data.data.messages || []);
      
      // Mark messages as read (don't fail if this fails)
      try {
        await mentorChatAPI.markAsRead(conversationId);
        console.log('✅ Messages marked as read');
      } catch (markReadError) {
        console.warn('⚠️ Failed to mark messages as read:', markReadError);
        // Don't show error to user for this
      }
      
      // Update conversation unread count
      setConversations(prev => prev.map(conv => 
        conv.id === conversationId 
          ? { ...conv, unread_count: 0, student_unread_count: 0, mentor_unread_count: 0 }
          : conv
      ));
    } catch (error) {
      console.error('❌ Error fetching messages:', error);
      console.error('❌ Error details:', error.response?.data || error.message);
      toast.error(`Failed to fetch messages: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    const messageText = newMessage.trim();
    setNewMessage(''); // Clear input immediately for better UX

    try {
      console.log('📤 Sending message:', messageText);
      console.log('📤 To conversation:', selectedConversation.id);
      
      // Send via API (WebSocket is disabled)
      const response = await mentorChatAPI.sendMessage(selectedConversation.id, messageText);
      console.log('✅ Message sent successfully:', response.data);
      
      // Add message to local state immediately for better UX
      const newMessageObj = {
        id: response.data.data.message.id,
        chat_id: selectedConversation.id,
        sender_id: user.id,
        sender_type: 'student',
        message: messageText,
        message_type: 'text',
        is_read: false,
        created_at: new Date().toISOString(),
        sender: {
          id: user.id,
          name: user.name
        }
      };
      
      setMessages(prev => [...prev, newMessageObj]);
      
      // Update conversation last message
      setConversations(prev => prev.map(conv => 
        conv.id === selectedConversation.id 
          ? { ...conv, last_message: messageText, last_message_at: new Date().toISOString() }
          : conv
      ));
      
    } catch (error) {
      console.error('❌ Error sending message:', error);
      console.error('❌ Error details:', error.response?.data || error.message);
      
      // Restore message to input on error
      setNewMessage(messageText);
      toast.error(`Failed to send message: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleConversationSelect = (conversation) => {
    setSelectedConversation(conversation);
    fetchMessages(conversation.id);
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

  const getParticipantName = (conversation) => {
    if (userRole === 'student') {
      return conversation.mentor?.name || 'Mentor';
    } else {
      return conversation.student?.name || 'Student';
    }
  };

  const getParticipantEmail = (conversation) => {
    if (userRole === 'student') {
      return conversation.mentor?.email || '';
    } else {
      return conversation.student?.email || '';
    }
  };

  const getUnreadCount = (conversation) => {
    if (userRole === 'student') {
      return conversation.student_unread_count || 0;
    } else {
      return conversation.mentor_unread_count || 0;
    }
  };

  const filteredConversations = (conversations || []).filter(conversation => {
    const participantName = getParticipantName(conversation);
    const participantEmail = getParticipantEmail(conversation);
    const ideaTitle = conversation.idea?.title || '';
    const searchLower = searchTerm.toLowerCase();
    
    return participantName.toLowerCase().includes(searchLower) || 
           participantEmail.toLowerCase().includes(searchLower) ||
           ideaTitle.toLowerCase().includes(searchLower);
  });

  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading conversations...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-6xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="bg-blue-600 text-white p-4 rounded-t-lg">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <FiMessageCircle className="w-5 h-5" />
              Mentor Chat
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-blue-700 rounded-full transition-colors"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar - Conversations List */}
          <div className={`${selectedConversation ? 'w-1/3' : 'w-full'} bg-gray-50 dark:bg-gray-700 border-r border-gray-200 dark:border-gray-600 flex flex-col transition-all duration-300`}>
            {/* Search Bar */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-600">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.length === 0 ? (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                  <FiMessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No conversations found</p>
                </div>
              ) : (
                filteredConversations.map((conversation) => {
                  const unreadCount = getUnreadCount(conversation);
                  const isSelected = selectedConversation?.id === conversation.id;
                  
                  return (
                    <div
                      key={conversation.id}
                      onClick={() => handleConversationSelect(conversation)}
                      className={`p-4 border-b border-gray-200 dark:border-gray-600 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors ${
                        isSelected ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-500' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                            {getParticipantName(conversation).charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 dark:text-white truncate">
                              {getParticipantName(conversation)}
                              {conversation.idea?.title && (
                                <span className="text-blue-600 dark:text-blue-400 font-normal">
                                  {' '}- {conversation.idea.title}
                                </span>
                              )}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                              {getParticipantEmail(conversation)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {unreadCount > 0 && (
                            <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                              {unreadCount}
                            </span>
                          )}
                          <FiChevronRight className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                      {conversation.last_message && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 truncate">
                          {conversation.last_message}
                        </p>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Side - Chat Area */}
          {selectedConversation ? (
            <div className="flex-1 flex flex-col">
              {/* Chat Header */}
              <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-600 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {getParticipantName(selectedConversation).charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {getParticipantName(selectedConversation)}
                        {selectedConversation.idea?.title && (
                          <span className="text-blue-600 dark:text-blue-400 font-normal">
                            {' '}- {selectedConversation.idea.title}
                          </span>
                        )}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {getParticipantEmail(selectedConversation)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                      <FiMoreVertical className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                    <FiMessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No messages yet. Start the conversation!</p>
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
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                          }`}
                        >
                          <p className="text-sm">{message.message}</p>
                          <div className="flex items-center justify-end mt-1 space-x-1">
                            <span className="text-xs opacity-75">
                              {formatTime(message.created_at)}
                            </span>
                            {isOwnMessage && (
                              <FiCheck className="w-3 h-3" />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-600 p-4">
                <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                  <button
                    type="button"
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                  >
                    <FiPaperclip className="w-5 h-5 text-gray-500" />
                  </button>
                  <div className="flex-1 relative">
                    <input
                      ref={inputRef}
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-full transition-colors"
                    >
                      <FiSmile className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <FiSend className="w-5 h-5" />
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-700">
              <div className="text-center text-gray-500 dark:text-gray-400">
                <FiMessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
                <p>Choose a conversation from the list to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MentorChatModal;
