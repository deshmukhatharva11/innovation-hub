import { toast } from 'react-hot-toast';

class NotificationService {
  constructor() {
    this.notifications = [];
    this.listeners = [];
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
  }

  // Initialize Socket.IO connection for real-time notifications
  initialize() {
    try {
      // For now, disable WebSocket and use polling instead
      // This will be implemented with Socket.IO later
      console.log('🔌 Notification service initialized (polling mode)');
      this.isConnected = true;
      this.notifyListeners('connected');
      return;
      
      this.ws.onopen = () => {
        console.log('🔌 WebSocket connected for notifications');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.notifyListeners('connected');
      };

      this.ws.onmessage = (event) => {
        try {
          const notification = JSON.parse(event.data);
          this.handleNotification(notification);
        } catch (error) {
          console.error('Error parsing notification:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('🔌 WebSocket disconnected');
        this.isConnected = false;
        this.notifyListeners('disconnected');
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.notifyListeners('error', error);
      };

    } catch (error) {
      console.error('Failed to initialize notification service:', error);
    }
  }

  // Attempt to reconnect with exponential backoff
  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      
      console.log(`🔄 Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
      
      setTimeout(() => {
        this.initialize();
      }, delay);
    } else {
      console.error('❌ Max reconnection attempts reached');
    }
  }

  // Handle incoming notifications
  handleNotification(notification) {
    console.log('📨 Received notification:', notification);
    
    // Add to notifications list
    this.notifications.unshift({
      ...notification,
      id: notification.id || Date.now(),
      timestamp: new Date(),
      read: false
    });

    // Keep only last 100 notifications
    if (this.notifications.length > 100) {
      this.notifications = this.notifications.slice(0, 100);
    }

    // Show toast notification
    this.showToastNotification(notification);

    // Notify listeners
    this.notifyListeners('notification', notification);
  }

  // Show toast notification based on type
  showToastNotification(notification) {
    const { type, title, message, data } = notification;

    const toastConfig = {
      duration: 5000,
      position: 'top-right',
    };

    switch (type) {
      case 'idea_submission':
        toast.success(`📝 ${title}`, {
          ...toastConfig,
          description: message,
        });
        break;

      case 'idea_review':
        toast.info(`🔍 ${title}`, {
          ...toastConfig,
          description: message,
        });
        break;

      case 'idea_development':
        toast.warning(`⚠️ ${title}`, {
          ...toastConfig,
          description: message,
        });
        break;

      case 'idea_endorsed':
        toast.success(`🎉 ${title}`, {
          ...toastConfig,
          description: message,
        });
        break;

      case 'idea_forwarded':
        toast.success(`🚀 ${title}`, {
          ...toastConfig,
          description: message,
        });
        break;

      case 'idea_incubated':
        toast.success(`🌟 ${title}`, {
          ...toastConfig,
          description: message,
        });
        break;

      case 'idea_rejected':
        toast.error(`❌ ${title}`, {
          ...toastConfig,
          description: message,
        });
        break;

      case 'mentor_assignment':
        toast.info(`👨‍🏫 ${title}`, {
          ...toastConfig,
          description: message,
        });
        break;

      case 'mentor_assigned':
        toast.success(`👨‍🏫 ${title}`, {
          ...toastConfig,
          description: message,
        });
        break;

      default:
        toast(message, {
          ...toastConfig,
          description: title,
        });
    }
  }

  // Add event listener
  addListener(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  // Notify all listeners
  notifyListeners(event, data) {
    this.listeners.forEach(listener => {
      try {
        listener(event, data);
      } catch (error) {
        console.error('Error in notification listener:', error);
      }
    });
  }

  // Get all notifications
  getNotifications() {
    return this.notifications;
  }

  // Get unread notifications
  getUnreadNotifications() {
    return this.notifications.filter(notification => !notification.read);
  }

  // Mark notification as read
  markAsRead(notificationId) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      this.notifyListeners('notificationRead', notification);
    }
  }

  // Mark all notifications as read
  markAllAsRead() {
    this.notifications.forEach(notification => {
      notification.read = true;
    });
    this.notifyListeners('allNotificationsRead');
  }

  // Clear all notifications
  clearAll() {
    this.notifications = [];
    this.notifyListeners('notificationsCleared');
  }

  // Send notification (for testing)
  sendNotification(notification) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(notification));
    } else {
      console.warn('WebSocket not connected, cannot send notification');
    }
  }

  // Disconnect
  disconnect() {
    if (this.ws) {
      this.ws.close();
    }
  }
}

// Create singleton instance
const notificationService = new NotificationService();

export default notificationService;
