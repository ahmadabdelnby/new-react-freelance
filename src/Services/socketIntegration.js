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
import { toast } from 'react-toastify';

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
    socket.on('new_message', (message) => {
        // logger.log('📨 New message received:', {
        //     id: message._id,
        //     content: message.content?.substring(0, 50),
        //     sender: message.sender,
        //     isRead: message.isRead,
        //     isDelivered: message.isDelivered
        // });

        store.dispatch(addMessage({
            conversationId: message.conversation,
            message
        }));


    });
    logger.log('✅ Registered listener: new_message');

    socket.on('new_message_notification', ({ conversationId, message }) => {
        // logger.log('🔔 New message notification:', conversationId);
        store.dispatch(addMessage({
            conversationId,
            message
        }));

        // Show toast notification
        const senderName = message.sender?.first_name || 'Someone';
        toast.info(`💬 ${senderName}: ${message.content.substring(0, 50)}${message.content.length > 50 ? '...' : ''}`, {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
        });

        // Play notification sound
        try {
            const audio = new Audio('/notification.mp3');
            audio.volume = 0.3;
            audio.play().catch(err => logger.log('Could not play sound:', err));
        } catch (error) {
            logger.log('Sound error:', error);
        }

        // Increment unread count
        const state = store.getState();
        store.dispatch(updateUnreadCount(state.chat.unreadCount + 1));
    });
    logger.log('✅ Registered listener: new_message_notification');
    socket.on('messageSent', (message) => {
        logger.log('✅ Message sent successfully:', message);
    });





    // Typing indicators
    socket.on('user_typing', ({ userId, isTyping, conversationId }) => {
        logger.log('⌨️ User typing:', userId, isTyping);
        store.dispatch(setTyping({
            conversationId,
            userId,
            isTyping
        }));
    });

    // Online status
    socket.on('user_online', ({ userId }) => {
        logger.log('🟢 User online:', userId);
        const state = store.getState();
        const onlineUsers = [...state.chat.onlineUsers, userId];
        store.dispatch(setOnlineUsers(onlineUsers));
    });

    socket.on('user_offline', ({ userId }) => {
        logger.log('⚫ User offline:', userId);
        const state = store.getState();
        const onlineUsers = state.chat.onlineUsers.filter(id => id !== userId);
        store.dispatch(setOnlineUsers(onlineUsers));
    });

    socket.on('online_users', (users) => {
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
