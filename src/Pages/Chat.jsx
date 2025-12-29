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
import { FaPaperPlane, FaCircle, FaArrowLeft, FaComments, FaArrowDown } from 'react-icons/fa';
import './Chat.css';

const Chat = () => {
    console.log('🚀🚀🚀 [CHAT.JSX] Component rendering/mounted! 🚀🚀🚀');

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
    const [showNewMessageIndicator, setShowNewMessageIndicator] = useState(false);
    const [userIsNearBottom, setUserIsNearBottom] = useState(true); // Track user scroll position

    const messagesContainerRef = useRef(null);
    const lastMessageRef = useRef(null);
    const isInitialLoadRef = useRef(true);
    const previousMessagesLengthRef = useRef(0);

    useEffect(() => {
        if (!user) {
            navigate('/');
            return;
        }

        // ✅ Socket is already connected and listeners registered in Layout.jsx
        // No need to register listeners here - just fetch conversations

        dispatch(getConversations());

        return () => {
            // No cleanup needed - socket stays connected for other features
        };
    }, [user, navigate, dispatch]);

    useEffect(() => {
        if (currentConversation) {
            console.log('\n🟢 [Conversation Change] New conversation selected:', currentConversation._id);

            dispatch(getMessages(currentConversation._id));
            dispatch(markAsRead(currentConversation._id));

            // Join conversation room
            socketService.emit('joinConversation', { conversationId: currentConversation._id });

            // Reset state for new conversation
            console.log('🔄 [Reset] Resetting state for new conversation');
            isInitialLoadRef.current = true;
            previousMessagesLengthRef.current = 0;
            setShowNewMessageIndicator(false);
            setUserIsNearBottom(true); // Assume user starts at bottom
            console.log('✅ [Reset] State reset complete\n');
        }
    }, [currentConversation, dispatch]);

    // Check if user is near bottom of chat - used for state updates
    const checkAndUpdateScrollPosition = () => {
        const container = messagesContainerRef.current;
        if (!container) {
            console.log('❌ [Scroll Check] Container ref is null');
            return;
        }

        const threshold = 150; // pixels from bottom
        const { scrollHeight, scrollTop, clientHeight } = container;
        const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
        const isNearBottom = distanceFromBottom < threshold;

        console.log('📊 [Scroll Position]', {
            scrollHeight,
            scrollTop,
            clientHeight,
            distanceFromBottom,
            threshold,
            isNearBottom,
            previousState: userIsNearBottom
        });

        // Update persistent state
        setUserIsNearBottom(isNearBottom);

        // Hide indicator if user scrolled back to bottom
        if (isNearBottom) {
            console.log('✅ [Scroll] User near bottom - hiding indicator');
            setShowNewMessageIndicator(false);
        } else {
            console.log('⚠️ [Scroll] User scrolled up');
        }
    };

    // Handle scroll event - updates state based on user's scroll position
    const handleScroll = () => {
        console.log('🔄 [handleScroll] Scroll event triggered');
        checkAndUpdateScrollPosition();
    };

    // Scroll to last message
    const scrollToLastMessage = () => {
        console.log('⬇️ [Click] User clicked new message indicator');
        if (lastMessageRef.current) {
            console.log('✅ [Click] lastMessageRef exists, scrolling...');
            lastMessageRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
            setShowNewMessageIndicator(false);
        } else {
            console.log('❌ [Click] lastMessageRef is null!');
        }
    };

    // Handle auto-scroll behavior for all 3 scenarios
    useEffect(() => {
        console.log('\n🔵 [useEffect] Auto-scroll effect triggered', {
            hasConversation: !!currentConversation,
            conversationId: currentConversation?._id,
            loading
        });

        if (!currentConversation) {
            console.log('⚠️ [useEffect] No current conversation, exiting');
            return;
        }

        const currentMessages = messages[currentConversation._id] || [];
        const previousLength = previousMessagesLengthRef.current;
        const currentLength = currentMessages.length;

        console.log('📝 [Messages]', {
            previousLength,
            currentLength,
            isInitialLoad: isInitialLoadRef.current,
            userIsNearBottom,
            showNewMessageIndicator
        });

        // Scenario 1: Initial load - scroll once without animation
        if (isInitialLoadRef.current && currentLength > 0 && !loading) {
            console.log('🆕 [Scenario 1] Initial load detected - scrolling to bottom');

            // Use requestAnimationFrame to ensure DOM is ready
            requestAnimationFrame(() => {
                if (lastMessageRef.current) {
                    console.log('✅ [Scenario 1] lastMessageRef exists, scrolling...');
                    lastMessageRef.current.scrollIntoView({ block: 'end' });
                    isInitialLoadRef.current = false;
                    // After initial scroll, update state to reflect we're at bottom
                    setUserIsNearBottom(true);
                    console.log('✅ [Scenario 1] Initial scroll complete, isInitialLoad = false');
                } else {
                    console.log('❌ [Scenario 1] lastMessageRef is null!');
                }
            });
            previousMessagesLengthRef.current = currentLength;
            return;
        }

        // Scenario 2 & 3: New message arrived
        if (currentLength > previousLength && !isInitialLoadRef.current) {
            console.log('🆕 [New Message] Detected!', {
                newMessagesCount: currentLength - previousLength,
                userIsNearBottom
            });

            // Use the PERSISTENT state that was updated by scroll events
            if (userIsNearBottom) {
                console.log('✅ [Scenario 2] User at bottom - auto scrolling smoothly');
                // Scenario 2: User was at bottom - auto scroll smoothly
                requestAnimationFrame(() => {
                    if (lastMessageRef.current) {
                        console.log('✅ [Scenario 2] Executing smooth scroll');
                        lastMessageRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
                    } else {
                        console.log('❌ [Scenario 2] lastMessageRef is null!');
                    }
                });
            } else {
                console.log('📢 [Scenario 3] User scrolled up - showing indicator');
                // Scenario 3: User was scrolled up - show indicator
                setShowNewMessageIndicator(true);
            }
        }

        previousMessagesLengthRef.current = currentLength;
        console.log('🔵 [useEffect] Effect complete\n');
    }, [messages, currentConversation, loading, userIsNearBottom]);

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
                        <div
                            className="chat-messages"
                            ref={messagesContainerRef}
                            onScroll={handleScroll}
                        >
                            {currentMessages.length === 0 ? (
                                <div className="empty-state">
                                    <p>No messages yet. Start the conversation!</p>
                                </div>
                            ) : (
                                currentMessages.map((message, index) => {
                                    const isSent = message.sender === user.id;
                                    console.log('📨 Message:', { isSent, sender: message.sender, userId: user.id });

                                    return (
                                        <div
                                            key={message._id || index}
                                            ref={index === currentMessages.length - 1 ? lastMessageRef : null}
                                            className={`message ${isSent ? 'message-sent' : 'message-received'}`}
                                            style={{
                                                border: isSent ? '3px solid red' : '3px solid blue',
                                                background: isSent ? 'rgba(255,0,0,0.1)' : 'rgba(0,0,255,0.1)'
                                            }}
                                        >
                                            <div className="message-content">
                                                {message.content}
                                            </div>
                                            <div className="message-time">
                                                {formatTime(message.createdAt)}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* New Message Indicator */}
                        {showNewMessageIndicator && (
                            <div className="new-message-indicator" onClick={scrollToLastMessage}>
                                <span>New message</span>
                                <FaArrowDown />
                            </div>
                        )}

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
