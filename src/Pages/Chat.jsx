import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import storage from '../Services/storage';
import {
    getConversations,
    getMessages,
    sendMessage,
    setCurrentConversation,
    addMessage,
    setTyping,
    setOnlineUsers,
    markAsRead,
    setSocketConnected
} from '../Services/Chat/ChatSlice';
import socketService from '../Services/socketService';
import { FaPaperPlane, FaCircle, FaArrowLeft, FaComments } from 'react-icons/fa';
import './Chat.css';

const Chat = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const {
        conversations,
        currentConversation,
        messages,
        typingUsers,
        onlineUsers,
        loading,
        socketConnected
    } = useSelector((state) => state.chat);
    const { user } = useSelector((state) => state.auth);

    const [messageInput, setMessageInput] = useState('');
    const [typingTimeout, setTypingTimeout] = useState(null);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (!user) {
            navigate('/');
            return;
        }

        // Connect socket
        const token = storage.get('token');
        socketService.connect(token);

        // Socket event listeners
        socketService.on('connect', () => {
            dispatch(setSocketConnected(true));
        });

        socketService.on('newMessage', (message) => {
            dispatch(addMessage({
                conversationId: message.conversation,
                message
            }));
        });

        socketService.on('userTyping', ({ conversationId, userId }) => {
            dispatch(setTyping({ conversationId, userId, isTyping: true }));
        });

        socketService.on('userStoppedTyping', ({ conversationId, userId }) => {
            dispatch(setTyping({ conversationId, userId, isTyping: false }));
        });

        socketService.on('onlineUsers', (users) => {
            dispatch(setOnlineUsers(users));
        });

        // Fetch conversations
        dispatch(getConversations());

        return () => {
            socketService.off('connect');
            socketService.off('newMessage');
            socketService.off('userTyping');
            socketService.off('userStoppedTyping');
            socketService.off('onlineUsers');
        };
    }, [user, navigate, dispatch]);

    useEffect(() => {
        if (currentConversation) {
            dispatch(getMessages(currentConversation._id));
            dispatch(markAsRead(currentConversation._id));

            // Join conversation room
            socketService.emit('joinConversation', { conversationId: currentConversation._id });
        }
    }, [currentConversation, dispatch]);

    useEffect(() => {
        scrollToBottom();
    }, [messages, currentConversation]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSelectConversation = (conversation) => {
        dispatch(setCurrentConversation(conversation));
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!messageInput.trim() || !currentConversation) return;

        const content = messageInput.trim();
        setMessageInput('');

        // Stop typing indicator
        socketService.emit('stopTyping', { conversationId: currentConversation._id });

        // Send message
        await dispatch(sendMessage({
            conversationId: currentConversation._id,
            content
        }));
    };

    const handleTyping = (e) => {
        setMessageInput(e.target.value);

        if (!currentConversation) return;

        // Clear existing timeout
        if (typingTimeout) {
            clearTimeout(typingTimeout);
        }

        // Emit typing event
        socketService.emit('typing', { conversationId: currentConversation._id });

        // Set new timeout to stop typing
        const timeout = setTimeout(() => {
            socketService.emit('stopTyping', { conversationId: currentConversation._id });
        }, 2000);

        setTypingTimeout(timeout);
    };

    const getOtherParticipant = (conversation) => {
        return conversation.participants.find(p => p._id !== user.id);
    };

    const isUserOnline = (userId) => {
        return onlineUsers.includes(userId);
    };

    const formatTime = (date) => {
        const messageDate = new Date(date);
        const now = new Date();
        const diffMs = now - messageDate;
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;

        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}h ago`;

        return messageDate.toLocaleDateString();
    };

    const currentMessages = currentConversation ? messages[currentConversation._id] || [] : [];
    const currentTypingUsers = currentConversation ? typingUsers[currentConversation._id] || [] : [];

    return (
        <div className="chat-container">
            {/* Conversations List */}
            <div className={`conversations-sidebar ${currentConversation ? 'mobile-hidden' : ''}`}>
                <div className="conversations-header">
                    <h4><FaComments /> Messages</h4>
                    <div className="socket-status">
                        <FaCircle className={socketConnected ? 'online' : 'offline'} />
                    </div>
                </div>

                <div className="conversations-list">
                    {loading && conversations.length === 0 ? (
                        <div className="text-center py-4">
                            <div className="spinner-border spinner-border-sm" role="status"></div>
                        </div>
                    ) : conversations.length === 0 ? (
                        <div className="empty-state">
                            <FaComments size={50} />
                            <p>No conversations yet</p>
                        </div>
                    ) : (
                        conversations.map(conversation => {
                            const otherUser = getOtherParticipant(conversation);
                            const isOnline = isUserOnline(otherUser?._id);

                            return (
                                <div
                                    key={conversation._id}
                                    className={`conversation-item ${currentConversation?._id === conversation._id ? 'active' : ''}`}
                                    onClick={() => handleSelectConversation(conversation)}
                                >
                                    <div className="conversation-avatar">
                                        <img
                                            src={otherUser?.profile_picture_url || '/default-avatar.png'}
                                            alt={otherUser?.first_name}
                                        />
                                        {isOnline && <div className="online-indicator"></div>}
                                    </div>
                                    <div className="conversation-info">
                                        <div className="conversation-name">
                                            {otherUser?.first_name} {otherUser?.last_name}
                                        </div>
                                        <div className="conversation-last-message">
                                            {conversation.lastMessage?.content || 'No messages yet'}
                                        </div>
                                    </div>
                                    <div className="conversation-meta">
                                        {conversation.lastMessage && (
                                            <div className="conversation-time">
                                                {formatTime(conversation.lastMessage.createdAt)}
                                            </div>
                                        )}
                                        {conversation.unreadCount > 0 && (
                                            <div className="unread-badge">{conversation.unreadCount}</div>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Chat Window */}
            <div className={`chat-window ${!currentConversation ? 'mobile-hidden' : ''}`}>
                {currentConversation ? (
                    <>
                        {/* Chat Header */}
                        <div className="chat-header">
                            <button
                                className="btn-back mobile-only"
                                onClick={() => dispatch(setCurrentConversation(null))}
                            >
                                <FaArrowLeft />
                            </button>
                            <div className="chat-user-info">
                                <img
                                    src={getOtherParticipant(currentConversation)?.profile_picture_url || '/default-avatar.png'}
                                    alt="User"
                                    className="chat-avatar"
                                />
                                <div>
                                    <div className="chat-user-name">
                                        {getOtherParticipant(currentConversation)?.first_name}{' '}
                                        {getOtherParticipant(currentConversation)?.last_name}
                                    </div>
                                    <div className="chat-user-status">
                                        {isUserOnline(getOtherParticipant(currentConversation)?._id) ? (
                                            <><FaCircle className="online" /> Online</>
                                        ) : (
                                            <><FaCircle className="offline" /> Offline</>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="chat-messages">
                            {currentMessages.length === 0 ? (
                                <div className="empty-state">
                                    <p>No messages yet. Start the conversation!</p>
                                </div>
                            ) : (
                                currentMessages.map((message, index) => (
                                    <div
                                        key={message._id || index}
                                        className={`message ${message.sender === user.id ? 'message-sent' : 'message-received'}`}
                                    >
                                        <div className="message-content">
                                            {message.content}
                                        </div>
                                        <div className="message-time">
                                            {formatTime(message.createdAt)}
                                        </div>
                                    </div>
                                ))
                            )}

                            {/* Typing Indicator */}
                            {currentTypingUsers.length > 0 && currentTypingUsers[0] !== user.id && (
                                <div className="typing-indicator">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Message Input */}
                        <form className="chat-input-form" onSubmit={handleSendMessage}>
                            <input
                                type="text"
                                className="chat-input"
                                placeholder="Type a message..."
                                value={messageInput}
                                onChange={handleTyping}
                            />
                            <button type="submit" className="btn-send" disabled={!messageInput.trim()}>
                                <FaPaperPlane />
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="empty-state">
                        <FaComments size={80} />
                        <h4>Select a conversation</h4>
                        <p>Choose a conversation from the list to start messaging</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Chat;
