const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { User, Mentor, MentorChat, MentorChatMessage } = require('../models');

class SocketService {
  constructor() {
    this.io = null;
    this.connectedUsers = new Map(); // userId -> socketId
    this.userSockets = new Map(); // socketId -> userId
  }

  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: [
          process.env.FRONTEND_URL || "http://localhost:3000",
          "http://localhost:3000",
          "http://127.0.0.1:3000"
        ],
        methods: ["GET", "POST"],
        credentials: true,
        allowedHeaders: ["Authorization", "Content-Type"]
      },
      transports: ['websocket', 'polling'],
      allowEIO3: true
    });

    this.io.use(this.authenticateSocket.bind(this));
    this.io.on('connection', this.handleConnection.bind(this));
    
    console.log('🔌 WebSocket server initialized');
  }

  async authenticateSocket(socket, next) {
    try {
      console.log('🔐 Socket authentication attempt:', {
        auth: socket.handshake.auth,
        headers: socket.handshake.headers
      });

      const token = socket.handshake.auth.token || 
                   socket.handshake.headers.authorization?.split(' ')[1] ||
                   socket.handshake.query.token;
      
      if (!token) {
        console.error('❌ No authentication token provided');
        return next(new Error('Authentication error: No token provided'));
      }

      console.log('🔑 Token found, verifying...');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('✅ Token verified for user:', decoded.id);

      const user = await User.findByPk(decoded.id, {
        include: [
          {
            model: Mentor,
            as: 'mentor',
            attributes: ['id', 'name', 'email', 'specialization']
          }
        ]
      });

      if (!user) {
        console.error('❌ User not found:', decoded.id);
        return next(new Error('Authentication error: User not found'));
      }

      console.log('✅ User authenticated:', user.name, user.role);
      socket.userId = user.id;
      socket.userRole = user.role;
      socket.user = user;
      next();
    } catch (error) {
      console.error('❌ Socket authentication error:', error.message);
      next(new Error('Authentication error: Invalid token'));
    }
  }

  handleConnection(socket) {
    const userId = socket.userId;
    const userRole = socket.userRole;
    
    console.log(`🔌 User ${userId} (${userRole}) connected with socket ${socket.id}`);
    
    // Store user connection
    this.connectedUsers.set(userId, socket.id);
    this.userSockets.set(socket.id, userId);

    // Join user to their personal room
    socket.join(`user_${userId}`);

    // Join user to role-based rooms
    socket.join(`role_${userRole}`);

    // Handle joining conversation rooms
    socket.on('join_conversation', (conversationId) => {
      socket.join(`conversation_${conversationId}`);
      console.log(`👥 User ${userId} joined conversation ${conversationId}`);
    });

    // Handle leaving conversation rooms
    socket.on('leave_conversation', (conversationId) => {
      socket.leave(`conversation_${conversationId}`);
      console.log(`👋 User ${userId} left conversation ${conversationId}`);
    });

    // Handle sending messages
    socket.on('send_message', async (data) => {
      await this.handleSendMessage(socket, data);
    });

    // Handle typing indicators
    socket.on('typing_start', (data) => {
      this.handleTypingStart(socket, data);
    });

    socket.on('typing_stop', (data) => {
      this.handleTypingStop(socket, data);
    });

    // Handle online status
    socket.on('update_status', (status) => {
      this.handleStatusUpdate(socket, status);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      this.handleDisconnection(socket);
    });
  }

  async handleSendMessage(socket, data) {
    try {
      const { conversationId, message, messageType = 'text' } = data;
      const userId = socket.userId;
      const userRole = socket.userRole;

      // Verify conversation access
      const conversation = await MentorChat.findOne({
        where: { id: conversationId },
        include: [
          {
            model: User,
            as: 'student',
            attributes: ['id', 'name', 'email']
          },
          {
            model: Mentor,
            as: 'mentor',
            attributes: ['id', 'name', 'email']
          }
        ]
      });

      if (!conversation) {
        socket.emit('error', { message: 'Conversation not found' });
        return;
      }

      // Check access permissions
      if (userRole === 'student' && conversation.student_id !== userId) {
        socket.emit('error', { message: 'Access denied' });
        return;
      }

      if (userRole === 'mentor') {
        const mentor = await Mentor.findOne({ where: { email: socket.user.email } });
        if (!mentor || conversation.mentor_id !== mentor.id) {
          socket.emit('error', { message: 'Access denied' });
          return;
        }
      }

      // Determine sender type
      let senderType;
      if (userRole === 'student') {
        senderType = 'student';
      } else if (userRole === 'college_admin') {
        senderType = 'mentor';
      } else if (userRole === 'mentor') {
        senderType = 'mentor';
      } else {
        socket.emit('error', { message: 'Access denied' });
        return;
      }

      // Create message in database
      const newMessage = await MentorChatMessage.create({
        chat_id: conversationId,
        sender_id: userId,
        sender_type: senderType,
        message: message,
        message_type: messageType,
        is_read: false
      });

      // Update conversation last message
      await MentorChat.update(
        { 
          last_message_at: new Date(),
          last_message: message.length > 100 ? message.substring(0, 100) + '...' : message
        },
        { where: { id: conversationId } }
      );

      // Update unread counts
      if (userRole === 'student') {
        await MentorChat.increment('mentor_unread_count', { where: { id: conversationId } });
      } else {
        await MentorChat.increment('student_unread_count', { where: { id: conversationId } });
      }

      // Emit message to conversation room
      this.io.to(`conversation_${conversationId}`).emit('new_message', {
        id: newMessage.id,
        chat_id: conversationId,
        sender_id: userId,
        sender_type: senderType,
        message: message,
        message_type: messageType,
        created_at: newMessage.created_at,
        is_read: false
      });

      // Emit conversation update to all participants
      this.io.to(`conversation_${conversationId}`).emit('conversation_updated', {
        conversationId,
        last_message: message,
        last_message_at: newMessage.created_at
      });

      console.log(`💬 Message sent in conversation ${conversationId} by user ${userId}`);

    } catch (error) {
      console.error('Error handling send message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  }

  handleTypingStart(socket, data) {
    const { conversationId } = data;
    const userId = socket.userId;
    
    socket.to(`conversation_${conversationId}`).emit('user_typing', {
      userId,
      conversationId,
      isTyping: true
    });
  }

  handleTypingStop(socket, data) {
    const { conversationId } = data;
    const userId = socket.userId;
    
    socket.to(`conversation_${conversationId}`).emit('user_typing', {
      userId,
      conversationId,
      isTyping: false
    });
  }

  handleStatusUpdate(socket, status) {
    const userId = socket.userId;
    
    // Broadcast status update to all connected users
    this.io.emit('user_status_update', {
      userId,
      status,
      timestamp: new Date()
    });
  }

  handleDisconnection(socket) {
    const userId = socket.userId;
    
    console.log(`🔌 User ${userId} disconnected`);
    
    // Remove user from maps
    this.connectedUsers.delete(userId);
    this.userSockets.delete(socket.id);

    // Broadcast user offline status
    this.io.emit('user_offline', { userId });
  }

  // Utility methods
  isUserOnline(userId) {
    return this.connectedUsers.has(userId);
  }

  getOnlineUsers() {
    return Array.from(this.connectedUsers.keys());
  }

  sendToUser(userId, event, data) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.io.to(socketId).emit(event, data);
    }
  }

  sendToConversation(conversationId, event, data) {
    this.io.to(`conversation_${conversationId}`).emit(event, data);
  }

  broadcastToRole(role, event, data) {
    this.io.to(`role_${role}`).emit(event, data);
  }
}

module.exports = new SocketService();
