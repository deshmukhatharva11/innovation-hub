import { chatAPI, mentorChatAPI } from './api';

class ChatService {
  constructor() {
    this.activeConnections = new Map();
    this.messageHandlers = new Map();
    this.typingHandlers = new Map();
    this.onlineStatusHandlers = new Map();
    this.isConnected = false;
  }

  // Initialize WebSocket connection for real-time messaging
  initializeWebSocket(userId, userRole) {
    try {
      const wsUrl = `ws://localhost:3001/ws/chat/${userId}`;
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log('WebSocket connected');
        this.isConnected = true;
        this.activeConnections.set(userId, ws);
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        this.handleWebSocketMessage(data);
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.isConnected = false;
        this.activeConnections.delete(userId);
        // Attempt to reconnect after 3 seconds
        setTimeout(() => {
          if (!this.isConnected) {
            this.initializeWebSocket(userId, userRole);
          }
        }, 3000);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      return ws;
    } catch (error) {
      console.error('Failed to initialize WebSocket:', error);
      return null;
    }
  }

  // Handle incoming WebSocket messages
  handleWebSocketMessage(data) {
    switch (data.type) {
      case 'new_message':
        this.notifyMessageHandlers(data);
        break;
      case 'typing':
        this.notifyTypingHandlers(data);
        break;
      case 'online_status':
        this.notifyOnlineStatusHandlers(data);
        break;
      case 'message_status':
        this.notifyMessageStatusHandlers(data);
        break;
      default:
        console.log('Unknown message type:', data.type);
    }
  }

  // Register message handler
  onMessage(conversationId, handler) {
    if (!this.messageHandlers.has(conversationId)) {
      this.messageHandlers.set(conversationId, new Set());
    }
    this.messageHandlers.get(conversationId).add(handler);
  }

  // Unregister message handler
  offMessage(conversationId, handler) {
    if (this.messageHandlers.has(conversationId)) {
      this.messageHandlers.get(conversationId).delete(handler);
    }
  }

  // Notify message handlers
  notifyMessageHandlers(data) {
    const handlers = this.messageHandlers.get(data.conversationId);
    if (handlers) {
      handlers.forEach(handler => handler(data));
    }
  }

  // Register typing handler
  onTyping(conversationId, handler) {
    if (!this.typingHandlers.has(conversationId)) {
      this.typingHandlers.set(conversationId, new Set());
    }
    this.typingHandlers.get(conversationId).add(handler);
  }

  // Unregister typing handler
  offTyping(conversationId, handler) {
    if (this.typingHandlers.has(conversationId)) {
      this.typingHandlers.get(conversationId).delete(handler);
    }
  }

  // Notify typing handlers
  notifyTypingHandlers(data) {
    const handlers = this.typingHandlers.get(data.conversationId);
    if (handlers) {
      handlers.forEach(handler => handler(data));
    }
  }

  // Register online status handler
  onOnlineStatus(handler) {
    this.onlineStatusHandlers.add(handler);
  }

  // Unregister online status handler
  offOnlineStatus(handler) {
    this.onlineStatusHandlers.delete(handler);
  }

  // Notify online status handlers
  notifyOnlineStatusHandlers(data) {
    this.onlineStatusHandlers.forEach(handler => handler(data));
  }

  // Send typing indicator
  sendTypingIndicator(conversationId, isTyping) {
    const ws = Array.from(this.activeConnections.values())[0];
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'typing',
        conversationId,
        isTyping
      }));
    }
  }

  // Send message status update
  sendMessageStatus(conversationId, messageId, status) {
    const ws = Array.from(this.activeConnections.values())[0];
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'message_status',
        conversationId,
        messageId,
        status
      }));
    }
  }

  // Get conversations for mentor chat
  async getMentorConversations() {
    try {
      const response = await mentorChatAPI.getConversations();
      return response.data;
    } catch (error) {
      console.error('Error fetching mentor conversations:', error);
      throw error;
    }
  }

  // Get conversations for general chat
  async getGeneralConversations() {
    try {
      const response = await chatAPI.getConversations();
      return response.data;
    } catch (error) {
      console.error('Error fetching general conversations:', error);
      throw error;
    }
  }

  // Get messages for a conversation
  async getMessages(conversationId, chatType = 'mentor') {
    try {
      let response;
      if (chatType === 'mentor') {
        response = await mentorChatAPI.getMessages(conversationId);
      } else {
        response = await chatAPI.getMessages(conversationId);
      }
      return response.data;
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  }

  // Send message
  async sendMessage(conversationId, message, chatType = 'mentor') {
    try {
      let response;
      if (chatType === 'mentor') {
        response = await mentorChatAPI.sendMessage(conversationId, message);
      } else {
        response = await chatAPI.sendMessage(conversationId, { message });
      }
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  // Mark messages as read
  async markAsRead(conversationId, chatType = 'mentor') {
    try {
      if (chatType === 'mentor') {
        await mentorChatAPI.markAsRead(conversationId);
      }
      // General chat doesn't have mark as read functionality yet
    } catch (error) {
      console.error('Error marking messages as read:', error);
      throw error;
    }
  }

  // Create new conversation (for general chat)
  async createConversation(participantId, initialMessage = '') {
    try {
      const response = await chatAPI.createConversation({
        participant_id: participantId,
        message: initialMessage
      });
      return response.data;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  }

  // Get online users
  async getOnlineUsers() {
    try {
      // This would typically come from a WebSocket or API call
      // For now, return a mock list
      return {
        success: true,
        data: ['user1', 'user2', 'user3']
      };
    } catch (error) {
      console.error('Error fetching online users:', error);
      throw error;
    }
  }

  // Search conversations
  async searchConversations(query, chatType = 'mentor') {
    try {
      let response;
      if (chatType === 'mentor') {
        response = await mentorChatAPI.getConversations();
      } else {
        response = await chatAPI.getConversations();
      }
      
      const conversations = response.data.data || [];
      const filtered = (conversations || []).filter(conv => {
        const participantName = chatType === 'mentor' 
          ? conv.mentor?.name?.toLowerCase() || ''
          : conv.participant?.name?.toLowerCase() || '';
        return participantName.includes(query.toLowerCase());
      });
      
      return {
        success: true,
        data: filtered
      };
    } catch (error) {
      console.error('Error searching conversations:', error);
      throw error;
    }
  }

  // Archive conversation
  async archiveConversation(conversationId, chatType = 'mentor') {
    try {
      // This would typically be an API call
      console.log(`Archiving conversation ${conversationId} in ${chatType} chat`);
      return { success: true };
    } catch (error) {
      console.error('Error archiving conversation:', error);
      throw error;
    }
  }

  // Delete conversation
  async deleteConversation(conversationId, chatType = 'mentor') {
    try {
      // This would typically be an API call
      console.log(`Deleting conversation ${conversationId} in ${chatType} chat`);
      return { success: true };
    } catch (error) {
      console.error('Error deleting conversation:', error);
      throw error;
    }
  }

  // Get conversation info
  async getConversationInfo(conversationId, chatType = 'mentor') {
    try {
      const messagesResponse = await this.getMessages(conversationId, chatType);
      return {
        success: true,
        data: {
          conversation: messagesResponse.data.conversation,
          messages: messagesResponse.data.messages
        }
      };
    } catch (error) {
      console.error('Error getting conversation info:', error);
      throw error;
    }
  }

  // Cleanup
  cleanup() {
    this.activeConnections.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    });
    this.activeConnections.clear();
    this.messageHandlers.clear();
    this.typingHandlers.clear();
    this.onlineStatusHandlers.clear();
  }
}

// Create singleton instance
const chatService = new ChatService();

export default chatService;
