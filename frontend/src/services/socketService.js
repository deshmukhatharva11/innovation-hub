import { store } from '../store';
import { toast } from 'react-hot-toast';

// Import socket.io-client with proper ES6 syntax
import io from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
  }

  connect() {
    if (this.socket && this.connected) {
      return this.socket;
    }

    const state = store.getState();
    const token = state.auth.token;

    if (!token) {
      console.warn('No auth token available for socket connection');
      return null;
    }

    try {
      this.socket = io(process.env.REACT_APP_API_URL || 'http://localhost:3001', {
        auth: {
          token: token
        },
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: true
      });

      this.setupEventListeners();
      return this.socket;
    } catch (error) {
      console.error('Failed to connect to socket server:', error);
      return null;
    }
  }

  setupEventListeners() {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('🔌 Connected to chat server');
      this.connected = true;
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('🔌 Disconnected from chat server:', reason);
      this.connected = false;
      
      if (reason === 'io server disconnect') {
        // Server disconnected, try to reconnect
        this.handleReconnect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('🔌 Connection error:', error);
      this.connected = false;
      this.handleReconnect();
    });

    // Chat events
    this.socket.on('new_message', (message) => {
      console.log('💬 New message received:', message);
      this.handleNewMessage(message);
    });

    this.socket.on('conversation_updated', (data) => {
      console.log('📝 Conversation updated:', data);
      this.handleConversationUpdate(data);
    });

    this.socket.on('user_typing', (data) => {
      console.log('⌨️ User typing:', data);
      this.handleTypingIndicator(data);
    });

    this.socket.on('user_status_update', (data) => {
      console.log('👤 User status update:', data);
      this.handleUserStatusUpdate(data);
    });

    this.socket.on('user_offline', (data) => {
      console.log('👤 User offline:', data);
      this.handleUserOffline(data);
    });

    this.socket.on('error', (error) => {
      console.error('🔌 Socket error:', error);
      toast.error(error.message || 'Chat connection error');
    });
  }

  handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('🔌 Max reconnection attempts reached');
      toast.error('Chat connection lost. Please refresh the page.');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`🔌 Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    setTimeout(() => {
      this.connect();
    }, delay);
  }

  handleNewMessage(message) {
    // Dispatch to Redux store or call callback
    if (window.dispatchNewMessage) {
      window.dispatchNewMessage(message);
    }
  }

  handleConversationUpdate(data) {
    // Dispatch to Redux store or call callback
    if (window.dispatchConversationUpdate) {
      window.dispatchConversationUpdate(data);
    }
  }

  handleTypingIndicator(data) {
    // Dispatch to Redux store or call callback
    if (window.dispatchTypingIndicator) {
      window.dispatchTypingIndicator(data);
    }
  }

  handleUserStatusUpdate(data) {
    // Dispatch to Redux store or call callback
    if (window.dispatchUserStatusUpdate) {
      window.dispatchUserStatusUpdate(data);
    }
  }

  handleUserOffline(data) {
    // Dispatch to Redux store or call callback
    if (window.dispatchUserOffline) {
      window.dispatchUserOffline(data);
    }
  }

  // Chat methods
  joinConversation(conversationId) {
    if (this.socket && this.connected) {
      this.socket.emit('join_conversation', conversationId);
    }
  }

  leaveConversation(conversationId) {
    if (this.socket && this.connected) {
      this.socket.emit('leave_conversation', conversationId);
    }
  }

  sendMessage(conversationId, message, messageType = 'text') {
    if (this.socket && this.connected) {
      this.socket.emit('send_message', {
        conversationId,
        message,
        messageType
      });
    } else {
      console.error('Socket not connected');
      toast.error('Not connected to chat server');
    }
  }

  startTyping(conversationId) {
    if (this.socket && this.connected) {
      this.socket.emit('typing_start', { conversationId });
    }
  }

  stopTyping(conversationId) {
    if (this.socket && this.connected) {
      this.socket.emit('typing_stop', { conversationId });
    }
  }

  updateStatus(status) {
    if (this.socket && this.connected) {
      this.socket.emit('update_status', status);
    }
  }

  // Utility methods
  isConnected() {
    return this.connected && this.socket && this.socket.connected;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  // Get socket instance
  getSocket() {
    return this.socket;
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;
