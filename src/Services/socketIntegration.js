// Socket.io Integration with Redux
import { store } from './store';
import { 
    addMessage, 
    setTyping, 
    setOnlineUsers, 
    updateUnreadCount,
    setSocketConnected 
} from './Chat/ChatSlice';
import socketService from './socketService';
import logger from './logger';

let isSocketInitialized = false;

export const initializeSocketListeners = () => {
    if (isSocketInitialized) {
        logger.log('Socket listeners already initialized');
        return;
    }

    const socket = socketService.getSocket();
    if (!socket) {
        logger.error('Socket not connected. Call socketService.connect() first.');
        return;
    }

    // Connection events
    socket.on('connect', () => {
        logger.log('✅ Socket connected:', socket.id);
        store.dispatch(setSocketConnected(true));
    });

    socket.on('disconnect', () => {
        logger.log('❌ Socket disconnected');
        store.dispatch(setSocketConnected(false));
    });

    // Chat events
    socket.on('newMessage', (message) => {
        logger.log('📨 New message received:', message);
        store.dispatch(addMessage({
            conversationId: message.conversation,
            message
        }));
    });

    socket.on('messageSent', (message) => {
        logger.log('✅ Message sent successfully:', message);
    });

    socket.on('messageDelivered', (data) => {
        logger.log('✅ Message delivered:', data);
    });

    socket.on('messageRead', (data) => {
        logger.log('👁️ Message read:', data);
    });

    // Typing indicators
    socket.on('userTyping', ({ conversationId, userId }) => {
        logger.log('⌨️ User typing:', userId);
        store.dispatch(setTyping({ 
            conversationId, 
            userId, 
            isTyping: true 
        }));
    });

    socket.on('stopTyping', ({ conversationId, userId }) => {
        logger.log('🛑 User stopped typing:', userId);
        store.dispatch(setTyping({ 
            conversationId, 
            userId, 
            isTyping: false 
        }));
    });

    // Online status
    socket.on('userOnline', ({ userId }) => {
        logger.log('🟢 User online:', userId);
        const state = store.getState();
        const onlineUsers = [...state.chat.onlineUsers, userId];
        store.dispatch(setOnlineUsers(onlineUsers));
    });

    socket.on('userOffline', ({ userId }) => {
        logger.log('⚫ User offline:', userId);
        const state = store.getState();
        const onlineUsers = state.chat.onlineUsers.filter(id => id !== userId);
        store.dispatch(setOnlineUsers(onlineUsers));
    });

    socket.on('onlineUsers', (users) => {
        logger.log('👥 Online users:', users);
        store.dispatch(setOnlineUsers(users));
    });

    // Notifications
    socket.on('notification', (notification) => {
        logger.log('🔔 New notification:', notification);
        // You can dispatch to a notifications slice here
        // For now, we'll just log it
    });

    // Unread count
    socket.on('unreadCount', (count) => {
        logger.log('📬 Unread count:', count);
        store.dispatch(updateUnreadCount(count));
    });

    // Error handling
    socket.on('error', (error) => {
        logger.error('❌ Socket error:', error);
    });

    isSocketInitialized = true;
    logger.log('✅ Socket listeners initialized');
};

export const disconnectSocket = () => {
    if (socketService.isConnected()) {
        socketService.disconnect();
        isSocketInitialized = false;
        store.dispatch(setSocketConnected(false));
        logger.log('Socket disconnected and listeners cleared');
    }
};

// Helper functions for emitting events
export const emitTyping = (conversationId) => {
    socketService.emit('typing', { conversationId });
};

export const emitStopTyping = (conversationId) => {
    socketService.emit('stopTyping', { conversationId });
};

export const emitJoinConversation = (conversationId) => {
    socketService.emit('joinConversation', { conversationId });
};

export const emitLeaveConversation = (conversationId) => {
    socketService.emit('leaveConversation', { conversationId });
};

export const emitMarkAsRead = (conversationId) => {
    socketService.emit('markAsRead', { conversationId });
};

export default {
    initializeSocketListeners,
    disconnectSocket,
    emitTyping,
    emitStopTyping,
    emitJoinConversation,
    emitLeaveConversation,
    emitMarkAsRead
};
