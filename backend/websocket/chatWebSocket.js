const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const { User, Mentor } = require('../models');

class ChatWebSocket {
  constructor(server) {
    this.wss = new WebSocket.Server({ 
      server,
      path: '/ws/chat'
    });
    this.clients = new Map(); // userId -> WebSocket
    this.typingUsers = new Map(); // conversationId -> Set of userIds
    this.onlineUsers = new Set();
    
    this.initializeWebSocket();
  }

  initializeWebSocket() {
    this.wss.on('connection', (ws, req) => {
      console.log('New WebSocket connection attempt');
      
      // Extract user ID from URL path
      const url = new URL(req.url, `http://${req.headers.host}`);
      const pathParts = url.pathname.split('/');
      const userId = pathParts[pathParts.length - 1];
      
      if (!userId || userId === 'chat') {
        ws.close(1008, 'Invalid user ID');
        return;
      }

      // Authenticate user
      this.authenticateUser(ws, userId);
    });
  }

  async authenticateUser(ws, userId) {
    try {
      // Verify user exists
      const user = await User.findByPk(userId);
      if (!user) {
        ws.close(1008, 'User not found');
        return;
      }

      // Store client connection
      this.clients.set(userId, ws);
      this.onlineUsers.add(userId);
      
      console.log(`User ${userId} connected to WebSocket`);
      
      // Send welcome message
      ws.send(JSON.stringify({
        type: 'connection',
        message: 'Connected to chat server',
        userId: userId
      }));

      // Notify other users that this user is online
      this.broadcastOnlineStatus(userId, true);

      // Handle messages
      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data);
          this.handleMessage(ws, userId, message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      });

      // Handle disconnection
      ws.on('close', () => {
        console.log(`User ${userId} disconnected from WebSocket`);
        this.clients.delete(userId);
        this.onlineUsers.delete(userId);
        
        // Remove from typing indicators
        this.typingUsers.forEach((users, conversationId) => {
          users.delete(userId);
          if (users.size === 0) {
            this.typingUsers.delete(conversationId);
          }
        });
        
        // Notify other users that this user is offline
        this.broadcastOnlineStatus(userId, false);
      });

      // Handle errors
      ws.on('error', (error) => {
        console.error(`WebSocket error for user ${userId}:`, error);
      });

    } catch (error) {
      console.error('Authentication error:', error);
      ws.close(1008, 'Authentication failed');
    }
  }

  handleMessage(ws, userId, message) {
    switch (message.type) {
      case 'typing':
        this.handleTypingIndicator(userId, message);
        break;
      case 'message_status':
        this.handleMessageStatus(userId, message);
        break;
      case 'ping':
        ws.send(JSON.stringify({ type: 'pong' }));
        break;
      default:
        console.log('Unknown message type:', message.type);
    }
  }

  handleTypingIndicator(userId, message) {
    const { conversationId, isTyping } = message;
    
    if (!this.typingUsers.has(conversationId)) {
      this.typingUsers.set(conversationId, new Set());
    }
    
    const typingUsers = this.typingUsers.get(conversationId);
    
    if (isTyping) {
      typingUsers.add(userId);
    } else {
      typingUsers.delete(userId);
    }
    
    // Broadcast typing indicator to other participants
    this.broadcastTypingIndicator(conversationId, userId, isTyping);
  }

  handleMessageStatus(userId, message) {
    const { conversationId, messageId, status } = message;
    
    // Broadcast message status update
    this.broadcastMessageStatus(conversationId, messageId, status, userId);
  }

  broadcastTypingIndicator(conversationId, userId, isTyping) {
    const typingUsers = this.typingUsers.get(conversationId);
    if (!typingUsers) return;

    const message = JSON.stringify({
      type: 'typing',
      conversationId,
      userId,
      isTyping,
      typingUsers: Array.from(typingUsers)
    });

    // Send to all participants in the conversation
    // In a real implementation, you'd need to determine who the participants are
    this.clients.forEach((ws, clientUserId) => {
      if (clientUserId !== userId && ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    });
  }

  broadcastMessageStatus(conversationId, messageId, status, userId) {
    const message = JSON.stringify({
      type: 'message_status',
      conversationId,
      messageId,
      status,
      userId
    });

    this.clients.forEach((ws, clientUserId) => {
      if (clientUserId !== userId && ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    });
  }

  broadcastOnlineStatus(userId, isOnline) {
    const message = JSON.stringify({
      type: 'online_status',
      userId,
      isOnline
    });

    this.clients.forEach((ws, clientUserId) => {
      if (clientUserId !== userId && ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    });
  }

  // Send new message to conversation participants
  sendNewMessage(conversationId, message, senderId) {
    const messageData = JSON.stringify({
      type: 'new_message',
      conversationId,
      message,
      senderId
    });

    // Send to all participants except sender
    this.clients.forEach((ws, userId) => {
      if (userId !== senderId && ws.readyState === WebSocket.OPEN) {
        ws.send(messageData);
      }
    });
  }

  // Get online users
  getOnlineUsers() {
    return Array.from(this.onlineUsers);
  }

  // Check if user is online
  isUserOnline(userId) {
    return this.onlineUsers.has(userId);
  }

  // Send message to specific user
  sendToUser(userId, message) {
    const ws = this.clients.get(userId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
      return true;
    }
    return false;
  }

  // Broadcast to all connected users
  broadcast(message) {
    const messageData = JSON.stringify(message);
    this.clients.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(messageData);
      }
    });
  }

  // Get connection statistics
  getStats() {
    return {
      totalConnections: this.clients.size,
      onlineUsers: this.onlineUsers.size,
      typingConversations: this.typingUsers.size
    };
  }
}

module.exports = ChatWebSocket;
