import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { BASE_URL } from '../config';
import socketService from '../socketService';
import storage from '../storage';

// Get all conversations for the logged-in user
export const getConversations = createAsyncThunk(
    'chat/getConversations',
    async (_, { rejectWithValue }) => {
        try {
            const token = storage.get('token');
            if (!token) {
                return rejectWithValue('Not authenticated');
            }

            const response = await fetch(`${BASE_URL}/chat/conversations`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (!response.ok) {
                // Don't log 401 errors to console
                if (response.status !== 401) {
                    console.error('Failed to fetch conversations:', data.message);
                }
                return rejectWithValue(data.message || 'Failed to fetch conversations');
            }

            return data.conversations;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch conversations');
        }
    }
);

// Get messages in a conversation
export const getMessages = createAsyncThunk(
    'chat/getMessages',
    async (conversationId, { rejectWithValue }) => {
        try {
            const token = storage.get('token');
            const response = await fetch(`${BASE_URL}/chat/conversation/${conversationId}/messages`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (!response.ok) {
                return rejectWithValue(data.message || 'Failed to fetch messages');
            }

            return {
                conversationId,
                messages: data.messages
            };
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch messages');
        }
    }
);

// Send a message
export const sendMessage = createAsyncThunk(
    'chat/sendMessage',
    async ({ conversationId, content }, { rejectWithValue }) => {
        try {
            // console.log('📤 [SEND] Sending message via REST API:', { conversationId, content });
            const token = storage.get('token');
            const response = await fetch(`${BASE_URL}/chat/message`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ conversationId, content })
            });

            const data = await response.json();
            // console.log('📥 [SEND] Response from server:', data);

            if (!response.ok) {
                console.error('❌ [SEND] Failed:', data.message);
                return rejectWithValue(data.message || 'Failed to send message');
            }

            // console.log('✅ [SEND] Message sent successfully');
            return data.message;
        } catch (error) {
            console.error('❌ [SEND] Error:', error);
            return rejectWithValue(error.message || 'Failed to send message');
        }
    }
);

// Create or get conversation with a user
export const createConversation = createAsyncThunk(
    'chat/createConversation',
    async (participantId, { rejectWithValue }) => {
        try {
            const token = storage.get('token');
            const response = await fetch(`${BASE_URL}/chat/conversation`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ participantId })
            });

            const data = await response.json();

            if (!response.ok) {
                return rejectWithValue(data.message || 'Failed to create conversation');
            }

            return data.conversation;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to create conversation');
        }
    }
);

// Mark messages as read
export const markAsRead = createAsyncThunk(
    'chat/markAsRead',
    async (conversationId, { rejectWithValue }) => {
        try {
            const token = storage.get('token');
            const response = await fetch(`${BASE_URL}/chat/conversation/${conversationId}/read-all`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const data = await response.json();
                return rejectWithValue(data.message || 'Failed to mark as read');
            }

            return conversationId;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to mark as read');
        }
    }
);

// Get unread count
export const getUnreadCount = createAsyncThunk(
    'chat/getUnreadCount',
    async (_, { rejectWithValue }) => {
        try {
            const token = storage.get('token');
            if (!token) {
                return rejectWithValue('Not authenticated');
            }

            const response = await fetch(`${BASE_URL}/chat/unread-count`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (!response.ok) {
                // Don't log 401 errors to console
                if (response.status !== 401) {
                    console.error('Failed to fetch unread count:', data.message);
                }
                return rejectWithValue(data.message || 'Failed to fetch unread count');
            }

            return data.unreadCount;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch unread count');
        }
    }
);

const chatSlice = createSlice({
    name: 'chat',
    initialState: {
        conversations: [],
        currentConversation: null,
        messages: {},
        typingUsers: {},
        onlineUsers: [],
        unreadCount: 0,
        loading: false,
        error: null,
        socketConnected: false
    },
    reducers: {
        setCurrentConversation: (state, action) => {
            state.currentConversation = action.payload;
        },
        addMessage: (state, action) => {
            const { conversationId, message } = action.payload;
            if (!state.messages[conversationId]) {
                state.messages[conversationId] = [];
            }

            // Check if message already exists to avoid duplicates
            const messageExists = state.messages[conversationId].some(
                m => m._id === message._id
            );

            if (!messageExists) {
                state.messages[conversationId].push(message);
            }

            // Update conversation's last message and reorder conversations
            const conversationIndex = state.conversations.findIndex(c => c._id === conversationId);
            if (conversationIndex !== -1) {
                const conversation = state.conversations[conversationIndex];
                conversation.lastMessage = message;
                conversation.lastMessageAt = message.createdAt || new Date().toISOString();

                // Move conversation to top of list
                if (conversationIndex !== 0) {
                    state.conversations.splice(conversationIndex, 1);
                    state.conversations.unshift(conversation);
                }
            }
        },
        setTyping: (state, action) => {
            const { conversationId, userId, isTyping } = action.payload;
            if (!state.typingUsers[conversationId]) {
                state.typingUsers[conversationId] = [];
            }
            if (isTyping) {
                if (!state.typingUsers[conversationId].includes(userId)) {
                    state.typingUsers[conversationId].push(userId);
                }
            } else {
                state.typingUsers[conversationId] = state.typingUsers[conversationId].filter(
                    id => id !== userId
                );
            }
        },
        setOnlineUsers: (state, action) => {
            state.onlineUsers = action.payload;
        },
        updateUnreadCount: (state, action) => {
            state.unreadCount = action.payload;
        },
        updateMessagesReadStatus: (state, action) => {
            const { conversationId, messages } = action.payload;
            if (state.messages[conversationId]) {
                state.messages[conversationId] = messages;
            }
        },
        decrementUnreadCount: (state, action) => {
            const conversationId = action.payload;
            const conversation = state.conversations.find(c => c._id === conversationId);
            if (conversation && conversation.unreadCount > 0) {
                state.unreadCount = Math.max(0, state.unreadCount - conversation.unreadCount);
                conversation.unreadCount = 0;
            }
        },
        setSocketConnected: (state, action) => {
            state.socketConnected = action.payload;
        },
        clearChatState: (state) => {
            state.conversations = [];
            state.currentConversation = null;
            state.messages = {};
            state.typingUsers = {};
            state.onlineUsers = [];
            state.unreadCount = 0;
            state.socketConnected = false;
        }
    },
    extraReducers: (builder) => {
        builder
            // Get conversations
            .addCase(getConversations.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getConversations.fulfilled, (state, action) => {
                state.loading = false;
                state.conversations = action.payload;
                // Calculate total unread count
                state.unreadCount = action.payload.reduce(
                    (sum, conv) => sum + (conv.unreadCount || 0),
                    0
                );
            })
            .addCase(getConversations.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Get messages
            .addCase(getMessages.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getMessages.fulfilled, (state, action) => {
                state.loading = false;
                const { conversationId, messages } = action.payload;
                state.messages[conversationId] = messages;
            })
            .addCase(getMessages.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Send message
            .addCase(sendMessage.pending, (state) => {
                state.error = null;
            })
            .addCase(sendMessage.fulfilled, (state, action) => {
                const message = action.payload;
                const conversationId = message.conversation;
                if (!state.messages[conversationId]) {
                    state.messages[conversationId] = [];
                }

                // Check if message already exists to avoid duplicates
                const messageExists = state.messages[conversationId].some(
                    m => m._id === message._id
                );

                if (!messageExists) {
                    state.messages[conversationId].push(message);
                }

                // Update conversation's last message
                const conversation = state.conversations.find(c => c._id === conversationId);
                if (conversation) {
                    conversation.lastMessage = message;
                    conversation.updatedAt = message.createdAt;
                }
            })
            .addCase(sendMessage.rejected, (state, action) => {
                state.error = action.payload;
            })
            // Create conversation
            .addCase(createConversation.fulfilled, (state, action) => {
                const newConversation = action.payload;
                const existingIndex = state.conversations.findIndex(c => c._id === newConversation._id);
                if (existingIndex === -1) {
                    state.conversations.unshift(newConversation);
                }
                state.currentConversation = newConversation;
            })
            // Mark as read
            .addCase(markAsRead.fulfilled, (state, action) => {
                const conversationId = action.payload;
                const conversation = state.conversations.find(c => c._id === conversationId);
                if (conversation && conversation.unreadCount > 0) {
                    state.unreadCount = Math.max(0, state.unreadCount - conversation.unreadCount);
                    conversation.unreadCount = 0;
                }

                // Mark all messages in this conversation as read
                if (state.messages[conversationId]) {
                    state.messages[conversationId] = state.messages[conversationId].map(msg => ({
                        ...msg,
                        isRead: true
                    }));
                }
            })
            // Get unread count
            .addCase(getUnreadCount.fulfilled, (state, action) => {
                state.unreadCount = action.payload;
            });
    }
});

export const {
    setCurrentConversation,
    addMessage,
    setTyping,
    setOnlineUsers,
    updateUnreadCount,
    updateMessagesReadStatus,
    decrementUnreadCount,
    setSocketConnected,
    clearChatState
} = chatSlice.actions;

export default chatSlice.reducer;
