/**
 * ========================================
 * SOCKET INTEGRATION - CLEAN REBUILD
 * ========================================
 * 
 * This is the ONLY place where socket.io event listeners should be registered.
 * 
 * Architecture:
 * 1. Backend emits events → socketIntegration listens → updates Redux store
 * 2. Redux store updates → Components re-render automatically
 * 3. Components should NEVER register their own socket listeners
 * 
 * Event Flow:
 * - Backend emits 'new_message' → socketIntegration updates ChatSlice → Chat components re-render
 * - Backend emits 'notification' → socketIntegration updates NotificationsSlice → Notifications component re-renders
 * 
 * ========================================
 */

import { store } from './store';
import {
    addMessage,
    setTyping,
    setOnlineUsers,
    updateUnreadCount,
    handleConversationReadStatus,
    setSocketConnected
} from './Chat/ChatSlice';
import { getUserNotifications } from './Notifications/NotificationsSlice';
import socketService from './socketService';
import logger from './logger';
import { toast } from 'react-toastify';

// Initialization flag to prevent multiple initializations
let isSocketInitialized = false;

/**
 * Initialize all socket listeners
 * Should be called once from Layout.jsx when user logs in
 */
export const initializeSocketListeners = () => {
    if (isSocketInitialized) {
        logger.warn('⚠️ Socket listeners already initialized, skipping...');
        return;
    }

    const socket = socketService.getSocket();
    if (!socket) {
        logger.error('❌ Socket not connected. Call socketService.connect() first.');
        return;
    }

    logger.log('🚀 Initializing socket listeners...');

    // ========================================
    // 1. CONNECTION EVENTS
    // ========================================
    socket.on('connect', () => {
        logger.log('✅ Socket connected:', socket.id);
        store.dispatch(setSocketConnected(true));
    });

    socket.on('disconnect', () => {
        logger.warn('❌ Socket disconnected');
        store.dispatch(setSocketConnected(false));
        // Don't reset isSocketInitialized here - let manual disconnectSocket() handle it
    });

    socket.on('error', (error) => {
        logger.error('❌ Socket error:', error);
    });

    // ========================================
    // 2. CHAT MESSAGES
    // ========================================

    /**
     * new_message - Real-time message received
     * Dispatched when: Another user sends a message in a conversation
     */
    socket.on('new_message', (message) => {
        logger.log('📨 New message received:', message);

        store.dispatch(addMessage({
            conversationId: message.conversation,
            message
        }));
    });

    /**
     * new_message_notification - Message notification with toast
     * Dispatched when: Message is sent and recipient should be notified
     */
    socket.on('new_message_notification', ({ conversationId, message, senderId }) => {
        logger.log('🔔 New message notification:', conversationId);

        const state = store.getState();
        const currentUserId = state.auth?.user?._id || state.auth?.user?.id;

        // Add message to store
        store.dispatch(addMessage({
            conversationId,
            message
        }));

        // Show toast ONLY if sender is not current user
        if (senderId && currentUserId && senderId !== currentUserId) {
            const senderName = message.sender?.first_name || 'Someone';
            const messagePreview = message.content.substring(0, 50) + (message.content.length > 50 ? '...' : '');

            toast.info(`💬 ${senderName}: ${messagePreview}`, {
                autoClose: 3000,
                position: "top-right"
            });

            // Play notification sound
            try {
                const audio = new Audio('/notification.mp3');
                audio.volume = 0.3;
                audio.play().catch(() => { });
            } catch {
                // Silent fail
            }
        }
    });

    /**
     * messageSent - Confirmation that message was sent successfully
     * Dispatched when: Current user sends a message
     */
    socket.on('messageSent', (message) => {
        logger.log('✅ Message sent successfully:', message);
    });

    // ========================================
    // 3. TYPING INDICATORS
    // ========================================

    /**
     * user_typing - User is typing in a conversation
     */
    socket.on('user_typing', ({ userId, isTyping, conversationId }) => {
        logger.log('⌨️ User typing:', { userId, isTyping, conversationId });

        store.dispatch(setTyping({
            conversationId,
            userId,
            isTyping
        }));
    });

    // ========================================
    // 4. ONLINE STATUS
    // ========================================

    /**
     * online_users - List of currently online users
     */
    socket.on('online_users', (users) => {
        logger.log('👥 Online users:', users);
        store.dispatch(setOnlineUsers(users));
    });

    /**
     * user_online - A user came online
     */
    socket.on('user_online', ({ userId }) => {
        logger.log('🟢 User online:', userId);
        const state = store.getState();
        const onlineUsers = [...state.chat.onlineUsers, userId];
        store.dispatch(setOnlineUsers(onlineUsers));
    });

    /**
     * user_offline - A user went offline
     */
    socket.on('user_offline', ({ userId }) => {
        logger.log('⚫ User offline:', userId);
        const state = store.getState();
        const onlineUsers = state.chat.onlineUsers.filter(id => id !== userId);
        store.dispatch(setOnlineUsers(onlineUsers));
    });

    // ========================================
    // 5. MESSAGE READ STATUS
    // ========================================

    /**
     * unreadCount - Total unread message count
     */
    socket.on('unreadCount', (count) => {
        logger.log('📬 Unread count:', count);
        store.dispatch(updateUnreadCount(count));
    });

    /**
     * messageRead - Messages were marked as read
     */
    socket.on('messageRead', ({ conversationId, readBy }) => {
        logger.log('✅ Messages marked as read:', { conversationId, readBy });

        const state = store.getState();
        const conversation = state.chat.conversations.find(c => c._id === conversationId);

        if (conversation && conversation.unreadCount > 0) {
            const currentUnreadCount = parseInt(state.chat.unreadCount) || 0;
            const conversationUnreadCount = parseInt(conversation.unreadCount) || 0;
            const newUnreadCount = Math.max(0, currentUnreadCount - conversationUnreadCount);

            store.dispatch(updateUnreadCount(newUnreadCount));
            store.dispatch(handleConversationReadStatus({ conversationId }));
        }
    });

    // ========================================
    // 6. NOTIFICATIONS
    // ========================================

    /**
     * notification - Generic notification event
     * Always refresh notifications list when this is received
     */
    socket.on('notification', (notification) => {
        logger.log('🔔 Generic notification received:', notification);
        store.dispatch(getUserNotifications());
    });

    // ========================================
    // 7. JOB NOTIFICATIONS
    // ========================================

    /**
     * job_posted - New job posted
     */
    socket.on('job_posted', (data) => {
        logger.log('✅ Job posted:', data);
        store.dispatch(getUserNotifications());
        // No toast - user already sees success message
    });

    /**
     * job_closed - Job was closed
     */
    socket.on('job_closed', (data) => {
        logger.log('📪 Job closed:', data);
        store.dispatch(getUserNotifications());

        toast.info(`Job "${data.jobTitle}" has been closed`, {
            autoClose: 4000
        });
    });

    /**
     * job_updated - Job was updated
     */
    socket.on('job_updated', (data) => {
        logger.log('📝 Job updated:', data);
        store.dispatch(getUserNotifications());

        toast.info(`Job "${data.jobTitle}" was updated`, {
            autoClose: 3000
        });
    });

    /**
     * job_status_changed - Job status changed (e.g., to in_progress when proposal accepted)
     */
    socket.on('job_status_changed', (data) => {
        logger.log('🔄 Job status changed:', data);

        // If on job details page, reload the job
        const currentPath = window.location.pathname;

        if (currentPath.includes(`/jobs/${data.jobId}`)) {
            // Import and dispatch fetchJobById
            import('../Services/Jobs/JobsSlice').then(({ fetchJobById }) => {
                store.dispatch(fetchJobById(data.jobId));
            });
        }

        // Show notification if status is in_progress
        if (data.status === 'in_progress') {
            toast.success('🎉 Contract created! Job is now in progress.', {
                autoClose: 5000
            });
        }
    });

    // ========================================
    // 8. PROPOSAL NOTIFICATIONS
    // ========================================

    /**
     * new_proposal - New proposal received on your job
     */
    socket.on('new_proposal', (data) => {
        logger.log('📨 New proposal received:', data);
        store.dispatch(getUserNotifications());

        toast.info(`New proposal received for "${data.jobTitle}"`, {
            autoClose: 5000
        });
    });

    /**
     * proposal_accepted - Your proposal was accepted
     */
    socket.on('proposal_accepted', (data) => {
        logger.log('✅ Proposal accepted:', data);
        store.dispatch(getUserNotifications());

        // If on job details page for this job, reload it
        const currentPath = window.location.pathname;
        if (data.jobId && currentPath.includes(`/jobs/${data.jobId}`)) {
            import('../Services/Jobs/JobsSlice').then(({ fetchJobById }) => {
                store.dispatch(fetchJobById(data.jobId));
            });
        }

        toast.success(`Your proposal for "${data.jobTitle}" was accepted!`, {
            autoClose: 5000
        });
    });

    /**
     * proposal_rejected - Your proposal was not selected
     */
    socket.on('proposal_rejected', (data) => {
        logger.log('❌ Proposal rejected:', data);
        store.dispatch(getUserNotifications());

        toast.info(`Your proposal for "${data.jobTitle}" was not selected`, {
            autoClose: 4000
        });
    });

    // ========================================
    // 9. CONTRACT NOTIFICATIONS
    // ========================================

    /**
     * contract_created - New contract created
     */
    socket.on('contract_created', (data) => {
        logger.log('📄 Contract created:', data);
        store.dispatch(getUserNotifications());
    });

    /**
     * contract_completed - Contract completed
     */
    socket.on('contract_completed', (data) => {
        logger.log('✅ Contract completed:', data);
        store.dispatch(getUserNotifications());

        toast.success('Contract completed successfully!', {
            autoClose: 5000
        });
    });

    /**
     * deliverable_submitted - Freelancer submitted work
     */
    socket.on('deliverable_submitted', (data) => {
        logger.log('📤 Work submitted:', data);
        store.dispatch(getUserNotifications());

        // If on contract details page, reload it
        const currentPath = window.location.pathname;
        if (data.contractId && currentPath.includes(`/contracts/${data.contractId}`)) {
            // Reload contract details
            window.location.reload();
        }

        // If on job details page with this contract, reload it
        if (currentPath.includes('/jobs/')) {
            import('../Services/Jobs/JobsSlice').then(({ fetchJobById }) => {
                const jobId = currentPath.split('/jobs/')[1]?.split('/')[0];
                if (jobId) {
                    store.dispatch(fetchJobById(jobId));
                }
            });
        }

        toast.info(`${data.freelancerName} submitted work for "${data.jobTitle}"`, {
            autoClose: 5000,
            onClick: () => {
                window.location.href = `/contracts/${data.contractId}`;
            }
        });
    });

    /**
     * contract_updated - Contract data updated (e.g., new deliverable added)
     */
    socket.on('contract_updated', (data) => {
        logger.log('🔄 Contract updated:', data);

        // If on job details page, reload the job to show updated contract
        const currentPath = window.location.pathname;
        const jobIdMatch = currentPath.match(/\/jobs\/([^/]+)/);

        if (jobIdMatch) {
            import('../Services/Jobs/JobsSlice').then(({ fetchJobById }) => {
                store.dispatch(fetchJobById(jobIdMatch[1]));
            });
        }

        // If on contract details page, reload
        if (data.contractId && currentPath.includes(`/contracts/${data.contractId}`)) {
            window.location.reload();
        }
    });

    // ========================================
    // 10. PAYMENT NOTIFICATIONS
    // ========================================

    /**
     * payment_released - Payment released to freelancer
     */
    socket.on('payment_released', (data) => {
        logger.log('💰 Payment released:', data);
        store.dispatch(getUserNotifications());

        toast.success(`Payment of $${data.amount} released!`, {
            autoClose: 6000
        });
    });

    /**
     * withdrawal_completed - Withdrawal completed
     */
    socket.on('withdrawal_completed', (data) => {
        logger.log('💸 Withdrawal completed:', data);
        store.dispatch(getUserNotifications());

        toast.success(`Withdrawal of $${data.amount} completed!`, {
            autoClose: 5000
        });
    });

    // ========================================
    // 11. REVIEW NOTIFICATIONS
    // ========================================

    /**
     * review_received - Received a new review
     */
    socket.on('review_received', (data) => {
        logger.log('⭐ Review received:', data);
        store.dispatch(getUserNotifications());

        toast.info('You received a new review', {
            autoClose: 4000
        });
    });

    isSocketInitialized = true;
    logger.log('✅ Socket listeners initialized successfully');
};

/**
 * Disconnect socket and cleanup all listeners
 * Should be called when user logs out
 */
export const disconnectSocket = () => {
    const socket = socketService.getSocket();

    if (socket) {
        logger.log('🧹 Removing all socket listeners...');
        socket.removeAllListeners();
        logger.log('✅ All socket listeners removed');
    }

    if (socketService.isConnected()) {
        socketService.disconnect();
        store.dispatch(setSocketConnected(false));
        logger.log('✅ Socket disconnected');
    }

    isSocketInitialized = false;
};

// ========================================
// EMIT HELPERS
// ========================================

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
