import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import {
  FiMessageCircle,
  FiSend,
  FiUser,
  FiClock,
  FiCheck,
  FiArrowLeft,
  FiSearch,
  FiUsers,
  FiPaperclip,
  FiSmile,
  FiMoreVertical,
  FiEdit3,
  FiTrash2,
  FiArchive,
  FiVideo,
  FiPhone
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { mentorChatAPI } from '../../services/api';
import io from 'socket.io-client';

const MentorChat = () => {
  const { user } = useSelector((state) => state.auth);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null);
  const [showMessageOptions, setShowMessageOptions] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    fetchConversations();
    initializeSocket();
    
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeSocket = () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.error('No authentication token found');
      setConnectionStatus('error');
      return;
    }

    try {
      socketRef.current = io('http://localhost:3001', {
        auth: { token },
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: true,
        autoConnect: true
      });

      socketRef.current.on('connect', () => {
        console.log('✅ Connected to chat server');
        setConnectionStatus('connected');
        toast.success('Connected to chat server');
      });

      socketRef.current.on('disconnect', (reason) => {
        console.log('❌ Disconnected from chat server:', reason);
        setConnectionStatus('disconnected');
        if (reason === 'io server disconnect') {
          // Server disconnected, try to reconnect
          setTimeout(() => {
            if (socketRef.current) {
              socketRef.current.connect();
            }
          }, 1000);
        }
      });

      socketRef.current.on('connect_error', (error) => {
        console.error('❌ Connection error:', error);
        setConnectionStatus('error');
        toast.error('Failed to connect to chat server');
      });

      socketRef.current.on('reconnect', (attemptNumber) => {
        console.log('✅ Reconnected after', attemptNumber, 'attempts');
        setConnectionStatus('connected');
        toast.success('Reconnected to chat server');
      });

      socketRef.current.on('reconnect_attempt', (attemptNumber) => {
        console.log('🔄 Reconnection attempt:', attemptNumber);
        setConnectionStatus('connecting');
      });

      socketRef.current.on('reconnect_error', (error) => {
        console.error('❌ Reconnection error:', error);
        setConnectionStatus('error');
      });

    socketRef.current.on('newMessage', (message) => {
      if (selectedConversation && message.chat_id === selectedConversation.id) {
        setMessages(prev => [...prev, message]);
        // Mark as read if it's not from current user
        if (message.sender_id !== user.id) {
          markAsRead(selectedConversation.id);
        }
      }
      // Update conversation list
      fetchConversations();
    });

    socketRef.current.on('messageEdited', (message) => {
      setMessages(prev => prev.map(msg => 
        msg.id === message.id ? message : msg
      ));
    });

    socketRef.current.on('messageDeleted', (messageId) => {
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
    });

    socketRef.current.on('typing', (data) => {
      if (data.chatId === selectedConversation?.id && data.userId !== user.id) {
        setTypingUsers(prev => {
          const filtered = prev.filter(u => u.userId !== data.userId);
          return [...filtered, { userId: data.userId, userName: data.userName }];
        });
        
        // Clear typing indicator after 3 seconds
        setTimeout(() => {
          setTypingUsers(prev => prev.filter(u => u.userId !== data.userId));
        }, 3000);
      }
    });

    socketRef.current.on('stopTyping', (data) => {
      if (data.chatId === selectedConversation?.id) {
        setTypingUsers(prev => prev.filter(u => u.userId !== data.userId));
      }
    });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await mentorChatAPI.getConversations();
      setConversations(response.data.data || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast.error('Failed to fetch conversations');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const response = await mentorChatAPI.getMessages(conversationId);
      setMessages(response.data.data.messages || []);
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
      const messageText = newMessage.trim();
      setNewMessage('');
      
      // Send message via API
      const response = await mentorChatAPI.sendMessage(selectedConversation.id, messageText);
      
      // Emit typing stop
      if (socketRef.current) {
        socketRef.current.emit('stopTyping', {
          chatId: selectedConversation.id,
          userId: user.id
        });
      }
      
      // Refresh conversations to update last message
      fetchConversations();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const handleTyping = (e) => {
    const message = e.target.value;
    setNewMessage(message);

    if (socketRef.current && selectedConversation) {
      if (message.length > 0 && !isTyping) {
        setIsTyping(true);
        socketRef.current.emit('typing', {
          chatId: selectedConversation.id,
          userId: user.id,
          userName: user.name
        });
      } else if (message.length === 0 && isTyping) {
        setIsTyping(false);
        socketRef.current.emit('stopTyping', {
          chatId: selectedConversation.id,
          userId: user.id
        });
      }
    }
  };

  const handleEditMessage = async (messageId, newText) => {
    try {
      await mentorChatAPI.editMessage(messageId, newText);
      setEditingMessage(null);
      toast.success('Message updated');
    } catch (error) {
      console.error('Error editing message:', error);
      toast.error('Failed to edit message');
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      await mentorChatAPI.deleteMessage(messageId);
      toast.success('Message deleted');
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('Failed to delete message');
    }
  };

  const markAsRead = async (conversationId) => {
    try {
      await mentorChatAPI.markAsRead(conversationId);
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleFileUpload = async (file) => {
    if (!selectedConversation) return;

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('message', `📎 ${file.name}`);
      formData.append('message_type', 'file');

      await mentorChatAPI.sendMessage(selectedConversation.id, formData);
      setShowFileUpload(false);
      toast.success('File sent successfully');
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to send file');
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString();
    }
  };

  const filteredConversations = (conversations || []).filter(conversation =>
    conversation.mentor?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conversation.mentor?.specialization.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <FiUsers className="w-5 h-5" />
            Mentor Chats
          </h2>
          <div className="mt-3 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search mentors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <FiMessageCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No mentor conversations yet</p>
              <p className="text-sm">Your assigned mentors will appear here</p>
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
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <FiUser className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">
                        {conversation.mentor?.name}
                      </h3>
                      <p className="text-sm text-gray-600 truncate">
                        {conversation.mentor?.specialization}
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
                  {conversation.student_unread_count > 0 && (
                    <div className="flex justify-end mt-1">
                      <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                        {conversation.student_unread_count}
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
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <FiUser className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">
                    {selectedConversation.mentor?.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {selectedConversation.mentor?.specialization}
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
                  <p className="text-sm">Start a conversation with your mentor</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender_type === 'student' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div className="relative group">
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.sender_type === 'student'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-900'
                        }`}
                      >
                        {editingMessage === message.id ? (
                          <div className="flex gap-2">
                            <input
                              type="text"
                              defaultValue={message.message}
                              className="flex-1 px-2 py-1 bg-white text-gray-900 rounded border"
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  handleEditMessage(message.id, e.target.value);
                                }
                              }}
                              autoFocus
                            />
                            <button
                              onClick={() => setEditingMessage(null)}
                              className="px-2 py-1 bg-gray-500 text-white rounded text-xs"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <>
                            <p className="text-sm">{message.message}</p>
                            <div className="flex items-center justify-between mt-1">
                              <p className={`text-xs ${
                                message.sender_type === 'student' ? 'text-blue-100' : 'text-gray-500'
                              }`}>
                                {formatTime(message.created_at)}
                                {message.is_edited && (
                                  <span className="ml-1">(edited)</span>
                                )}
                              </p>
                              {message.sender_type === 'student' && (
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={() => setShowMessageOptions(
                                      showMessageOptions === message.id ? null : message.id
                                    )}
                                    className="p-1 hover:bg-blue-700 rounded"
                                  >
                                    <FiMoreVertical className="w-3 h-3" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>

                      {/* Message Options Dropdown */}
                      {showMessageOptions === message.id && (
                        <div className="absolute right-0 top-0 mt-8 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                          <button
                            onClick={() => {
                              setEditingMessage(message.id);
                              setShowMessageOptions(null);
                            }}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                          >
                            <FiEdit3 className="w-4 h-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              handleDeleteMessage(message.id);
                              setShowMessageOptions(null);
                            }}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 text-red-600 flex items-center gap-2"
                          >
                            <FiTrash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Connection Status */}
            <div className="px-4 py-2 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    connectionStatus === 'connected' ? 'bg-green-500' :
                    connectionStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' :
                    connectionStatus === 'error' ? 'bg-red-500' :
                    'bg-gray-400'
                  }`}></div>
                  <span className="text-sm text-gray-600">
                    {connectionStatus === 'connected' ? 'Connected' :
                     connectionStatus === 'connecting' ? 'Connecting...' :
                     connectionStatus === 'error' ? 'Connection Error' :
                     'Disconnected'}
                  </span>
                </div>
                {connectionStatus === 'disconnected' || connectionStatus === 'error' ? (
                  <button
                    onClick={() => {
                      console.log('🔄 Manual reconnection attempt...');
                      if (socketRef.current) {
                        socketRef.current.disconnect();
                      }
                      setTimeout(() => {
                        console.log('🔄 Reinitializing socket...');
                        initializeSocket();
                      }, 1000);
                    }}
                    className="text-sm text-blue-600 hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-50"
                  >
                    Reconnect
                  </button>
                ) : connectionStatus === 'connected' ? (
                  <span className="text-sm text-green-600">✓ Connected</span>
                ) : null}
              </div>
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 bg-white">
              {/* Typing Indicator */}
              {typingUsers.length > 0 && (
                <div className="mb-2 text-sm text-gray-500 italic">
                  {typingUsers.map((user, index) => (
                    <span key={user.userId}>
                      {user.userName} is typing...
                      {index < typingUsers.length - 1 && ', '}
                    </span>
                  ))}
                </div>
              )}

              <form onSubmit={handleSendMessage} className="flex gap-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={handleTyping}
                    placeholder="Type your message..."
                    className="w-full px-3 py-2 pr-20 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  
                  {/* Message Actions */}
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <FiSmile className="w-4 h-4 text-gray-500" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowFileUpload(!showFileUpload)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <FiPaperclip className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <FiSend className="w-4 h-4" />
                  Send
                </button>
              </form>

              {/* File Upload */}
              {showFileUpload && (
                <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                  <input
                    type="file"
                    onChange={(e) => {
                      if (e.target.files[0]) {
                        handleFileUpload(e.target.files[0]);
                      }
                    }}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
              )}

              {/* Emoji Picker */}
              {showEmojiPicker && (
                <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-8 gap-1">
                    {['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰'].map(emoji => (
                      <button
                        key={emoji}
                        onClick={() => {
                          setNewMessage(prev => prev + emoji);
                          setShowEmojiPicker(false);
                        }}
                        className="p-2 hover:bg-gray-200 rounded text-lg"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <FiMessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">Select a mentor to start chatting</h3>
              <p className="text-sm">Choose a conversation from the sidebar to begin</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MentorChat;
