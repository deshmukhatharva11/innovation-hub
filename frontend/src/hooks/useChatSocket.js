import { useEffect, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import socketService from '../services/socketService';

const useChatSocket = (conversationId = null) => {
  const { user, token } = useSelector((state) => state.auth);
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);

  // Connect to socket when component mounts
  useEffect(() => {
    if (token && user) {
      socketService.connect();
    }

    return () => {
      // Don't disconnect on unmount, let it stay connected
      // socketService.disconnect();
    };
  }, [token, user]);

  // Join/leave conversation when conversationId changes
  useEffect(() => {
    if (conversationId && socketService.isConnected()) {
      socketService.joinConversation(conversationId);
      
      return () => {
        socketService.leaveConversation(conversationId);
      };
    }
  }, [conversationId]);

  // Send message
  const sendMessage = useCallback((message, messageType = 'text') => {
    if (conversationId && message.trim()) {
      socketService.sendMessage(conversationId, message.trim(), messageType);
    }
  }, [conversationId]);

  // Typing indicators
  const startTyping = useCallback(() => {
    if (conversationId && !isTypingRef.current) {
      isTypingRef.current = true;
      socketService.startTyping(conversationId);
    }
  }, [conversationId]);

  const stopTyping = useCallback(() => {
    if (conversationId && isTypingRef.current) {
      isTypingRef.current = false;
      socketService.stopTyping(conversationId);
    }
  }, [conversationId]);

  // Handle typing with timeout
  const handleTyping = useCallback(() => {
    startTyping();
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 1000);
  }, [startTyping, stopTyping]);

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return {
    sendMessage,
    startTyping,
    stopTyping,
    handleTyping,
    isConnected: socketService.isConnected(),
    socket: socketService.getSocket()
  };
};

export default useChatSocket;
