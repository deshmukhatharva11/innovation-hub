import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  FiMessageCircle,
  FiSend,
  FiUser,
  FiClock,
  FiCheck,
  FiX,
  FiTrash2,
  FiMoreVertical,
  FiSearch,
  FiPlus,
  FiUserPlus
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { chatAPI, collegeCoordinatorAPI } from '../../services/api';

const ChatSystem = () => {
  const { user } = useSelector((state) => state.auth);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedIdea, setSelectedIdea] = useState(null);

  useEffect(() => {
    fetchConversations();
    if (user?.role === 'college_admin') {
      fetchStudents();
    }
  }, [user]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching conversations...');
      
      const response = await chatAPI.getConversations();
      console.log('✅ Conversations fetched:', response.data);
      
      if (response.data.success) {
        setConversations(response.data.data);
        
        // Auto-select first conversation
        if (response.data.data.length > 0) {
          setSelectedConversation(response.data.data[0]);
          fetchMessages(response.data.data[0].id);
        }
      } else {
        throw new Error(response.data.error || 'Failed to fetch conversations');
      }
      
    } catch (error) {
      console.error('❌ Error fetching conversations:', error);
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      console.log('🔄 Fetching students...');
      const response = await collegeCoordinatorAPI.getChatStudents();
      console.log('✅ Students fetched:', response.data);
      
      if (response.data.success) {
        setStudents(response.data.data.students || response.data.data);
      }
    } catch (error) {
      console.error('❌ Error fetching students:', error);
      toast.error('Failed to load students');
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      console.log('🔄 Fetching messages for conversation:', conversationId);
      
      const response = await chatAPI.getMessages(conversationId);
      console.log('✅ Messages fetched:', response.data);
      
      if (response.data.success) {
        setMessages(response.data.data);
      } else {
        throw new Error(response.data.error || 'Failed to fetch messages');
      }
    } catch (error) {
      console.error('❌ Error fetching messages:', error);
      toast.error('Failed to load messages');
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;
    
    try {
      console.log('🔄 Sending message:', newMessage);
      
      const response = await chatAPI.sendMessage(selectedConversation.id, {
        content: newMessage.trim(),
        messageType: 'text'
      });
      
      console.log('✅ Message sent:', response.data);
      
      if (response.data.success) {
        // Add message to local state
        setMessages(prev => [...prev, response.data.data]);
        setNewMessage('');
        
        // Update conversation with new last message
        setConversations(prev => 
          prev.map(conv => 
            conv.id === selectedConversation.id 
              ? { ...conv, lastMessage: response.data.data.content, timestamp: response.data.data.timestamp }
              : conv
          )
        );
        
        toast.success('Message sent!');
      } else {
        throw new Error(response.data.error || 'Failed to send message');
      }
      
    } catch (error) {
      console.error('❌ Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const markAsRead = async (conversationId) => {
    try {
      console.log('🔄 Marking conversation as read:', conversationId);
      
      const response = await chatAPI.markAsRead(conversationId);
      console.log('✅ Conversation marked as read:', response.data);
      
      if (response.data.success) {
        setConversations(prev => 
          prev.map(conv => 
            conv.id === conversationId 
              ? { ...conv, unreadCount: 0 }
              : conv
          )
        );
        toast.success('Marked as read');
      } else {
        throw new Error(response.data.error || 'Failed to mark as read');
      }
    } catch (error) {
      console.error('❌ Error marking as read:', error);
      toast.error('Failed to mark as read');
    }
  };

  const deleteConversation = async (conversationId) => {
    try {
      console.log('🔄 Deleting conversation:', conversationId);
      
      const response = await chatAPI.deleteConversation(conversationId);
      console.log('✅ Conversation deleted:', response.data);
      
      if (response.data.success) {
        setConversations(prev => prev.filter(conv => conv.id !== conversationId));
        
        if (selectedConversation?.id === conversationId) {
          setSelectedConversation(null);
          setMessages([]);
        }
        
        toast.success('Conversation deleted');
      } else {
        throw new Error(response.data.error || 'Failed to delete conversation');
      }
    } catch (error) {
      console.error('❌ Error deleting conversation:', error);
      toast.error('Failed to delete conversation');
    }
  };

  const createNewConversation = async () => {
    if (!selectedStudent) {
      toast.error('Please select a student');
      return;
    }

    try {
      console.log('🔄 Creating new conversation with student:', selectedStudent.id);
      
      const response = await chatAPI.createConversation({
        student_id: selectedStudent.id,
        subject: selectedIdea ? `Discussion about: ${selectedIdea.title}` : 'General Discussion'
      });
      
      console.log('✅ Conversation created:', response.data);
      
      if (response.data.success) {
        // Add new conversation to the list
        setConversations(prev => [response.data.data, ...prev]);
        setSelectedConversation(response.data.data);
        setMessages([]);
        setShowNewChatModal(false);
        setSelectedStudent(null);
        setSelectedIdea(null);
        toast.success('Conversation started!');
      } else {
        throw new Error(response.data.error || 'Failed to create conversation');
      }
    } catch (error) {
      console.error('❌ Error creating conversation:', error);
      toast.error('Failed to create conversation');
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const filteredConversations = (conversations || []).filter(conv =>
    conv.participant?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.lastMessage?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex">
      {/* Conversations List */}
      <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Chat & Query System
            </h2>
            {user?.role === 'college_admin' && (
              <button
                onClick={() => setShowNewChatModal(true)}
                className="flex items-center px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200"
              >
                <FiUserPlus size={16} className="mr-2" />
                New Chat
              </button>
            )}
          </div>
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              <FiMessageCircle className="mx-auto h-12 w-12 mb-2" />
              <p>No conversations found</p>
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors duration-200 ${
                    selectedConversation?.id === conversation.id
                      ? 'bg-primary-100 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                  onClick={() => {
                    setSelectedConversation(conversation);
                    fetchMessages(conversation.id);
                  }}
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {conversation.participant?.avatar || conversation.participant?.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-gray-900 dark:text-white truncate">
                          {conversation.participant?.name || 'Unknown User'}
                        </h3>
                        {conversation.unreadCount > 0 && (
                          <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {conversation.lastMessage}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        {formatTime(conversation.timestamp)}
                      </p>
                    </div>
                    <div className="flex flex-col space-y-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(conversation.id);
                        }}
                        className="p-1 text-gray-400 hover:text-green-500 transition-colors duration-200"
                        title="Mark as read"
                      >
                        <FiCheck size={14} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteConversation(conversation.id);
                        }}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors duration-200"
                        title="Delete conversation"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation && selectedConversation.participant ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {selectedConversation.participant?.avatar || selectedConversation.participant?.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {selectedConversation.participant?.name || 'Unknown User'}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedConversation.participant?.role || 'Unknown Role'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  selectedConversation.participant?.role?.includes('Coordinator') 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                }`}>
                  {selectedConversation.participant?.role?.includes('Coordinator') ? 'Assigned' : 'Available'}
                </span>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.senderId === user.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.senderId === user.id
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      message.senderId === user.id
                        ? 'text-primary-100'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  <FiSend size={16} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <FiMessageCircle className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Select a conversation
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Choose a chat from the list to start messaging
              </p>
            </div>
          </div>
        )}
      </div>

      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Start New Conversation
              </h3>
              <button
                onClick={() => setShowNewChatModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <FiX size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Student
                </label>
                <select
                  value={selectedStudent?.id || ''}
                  onChange={(e) => {
                    const student = students.find(s => s.id === parseInt(e.target.value));
                    setSelectedStudent(student);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Choose a student...</option>
                  {students.map(student => (
                    <option key={student.id} value={student.id}>
                      {student.name} - {student.email}
                    </option>
                  ))}
                </select>
              </div>
              
              {selectedStudent && (
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {selectedStudent.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {selectedStudent.name}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {selectedStudent.email}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        Student
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowNewChatModal(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={createNewConversation}
                disabled={!selectedStudent}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                Start Conversation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatSystem;