import React, { useEffect, useState, useMemo, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getMessages, sendMessage, markAsRead, setCurrentConversation } from '../../Services/Chat/ChatSlice'
import socketService from '../../Services/socketService'
import { FaEllipsisV, FaInfoCircle, FaFileAlt, FaImage, FaFilePdf, FaFileWord, FaFileExcel, FaDownload, FaArrowDown, FaArrowLeft } from 'react-icons/fa'
import MessageInput from './MessageInput'
import ConversationInfoModal from './ConversationInfoModal'
import { API_ENDPOINTS } from '../../Services/config'
import './ChatWindow.css'

function ChatWindow({ conversation, currentUserId, onBackClick }) {
  const dispatch = useDispatch()
  const allMessages = useSelector((state) => state.chat.messages)
  const onlineUsers = useSelector((state) => state.chat.onlineUsers)
  const typingUsers = useSelector((state) => state.chat.typingUsers) // Get typing from Redux

  const conversationMessages = useMemo(() =>
    allMessages[conversation._id] || [],
    [allMessages, conversation._id]
  )
  const loading = useSelector((state) => state.chat.loading)

  // Check if other user is typing
  const isTyping = useMemo(() => {
    const conversationTyping = typingUsers[conversation._id] || {};
    return Object.entries(conversationTyping).some(([userId, typing]) =>
      userId !== currentUserId && typing
    );
  }, [typingUsers, conversation._id, currentUserId]);

  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false)
  const [showNewMessageIndicator, setShowNewMessageIndicator] = useState(false)
  const [userIsNearBottom, setUserIsNearBottom] = useState(true)

  const messagesContainerRef = useRef(null)
  const lastMessageRef = useRef(null)
  const isInitialLoadRef = useRef(true)
  const previousMessagesLengthRef = useRef(0)

  const otherUser = conversation.participants?.find(p => p._id !== currentUserId)
  const isOtherUserOnline = otherUser && onlineUsers.includes(otherUser._id)

  const getAvatarUrl = (user) => {
    // Try multiple sources for avatar - prioritize full URL
    if (user?.profile_picture_url) return user.profile_picture_url
    if (user?.profilePicture) return user.profilePicture
    if (user?.profile_picture) return user.profile_picture

    // Return placeholder with user initials
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.first_name || 'User')}+${encodeURIComponent(user?.last_name || '')}&background=14a800&color=fff&size=100`
  }

  useEffect(() => {
    if (conversation._id) {
      // Set current conversation in Redux store
      dispatch(setCurrentConversation(conversation))

      dispatch(getMessages(conversation._id))

      // Join conversation room for real-time messages
      socketService.emit('join_conversation', conversation._id)

      // Mark messages as read
      dispatch(markAsRead(conversation._id))

      // Reset scroll state for new conversation
      isInitialLoadRef.current = true
      previousMessagesLengthRef.current = 0
      setShowNewMessageIndicator(false)
      setUserIsNearBottom(true)

      // ✅ Typing indicators are already handled in socketIntegration.js
      // Just emit leave conversation on cleanup
      return () => {
        socketService.emit('leave_conversation', conversation._id)
        dispatch(setCurrentConversation(null))
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation._id, dispatch, currentUserId])

  // Check and update scroll position
  const checkAndUpdateScrollPosition = () => {
    const container = messagesContainerRef.current
    if (!container) return

    const threshold = 150
    const { scrollHeight, scrollTop, clientHeight } = container
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight
    const isNearBottom = distanceFromBottom < threshold

    setUserIsNearBottom(isNearBottom)

    if (isNearBottom) {
      setShowNewMessageIndicator(false)
    }
  }

  // Handle scroll event
  const handleScroll = () => {
    checkAndUpdateScrollPosition()
  }

  // Scroll to last message
  const scrollToLastMessage = () => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
      setShowNewMessageIndicator(false)
    }
  }

  // Auto-scroll logic for all 3 scenarios
  useEffect(() => {
    const currentLength = conversationMessages.length
    const previousLength = previousMessagesLengthRef.current

    // Scenario 1: Initial load
    if (isInitialLoadRef.current && currentLength > 0 && !loading) {
      requestAnimationFrame(() => {
        if (lastMessageRef.current) {
          lastMessageRef.current.scrollIntoView({ block: 'end' })
          isInitialLoadRef.current = false
          setUserIsNearBottom(true)
        }
      })
      previousMessagesLengthRef.current = currentLength
      return
    }

    // Scenario 2 & 3: New message arrived
    if (currentLength > previousLength && !isInitialLoadRef.current) {
      if (userIsNearBottom) {
        requestAnimationFrame(() => {
          if (lastMessageRef.current) {
            lastMessageRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
          }
        })
      } else {
        setShowNewMessageIndicator(true)
      }
    }

    previousMessagesLengthRef.current = currentLength
  }, [conversationMessages, loading, userIsNearBottom, conversation._id])

  // Mark messages as read when new messages arrive and user is viewing
  useEffect(() => {
    if (conversation._id && conversationMessages.length > 0 && conversation.unreadCount > 0) {
      // Mark as read if user is near bottom (actively viewing)
      if (userIsNearBottom) {
        dispatch(markAsRead(conversation._id))
      }
    }
  }, [conversationMessages.length, conversation._id, conversation.unreadCount, userIsNearBottom, dispatch])

  const handleSendMessage = async (content, attachments = []) => {
    if (!content.trim() && attachments.length === 0) return

    await dispatch(sendMessage({
      conversationId: conversation._id,
      content: content.trim(),
      attachments: attachments
    }))
  }

  const formatMessageTime = (date) => {
    const messageDate = new Date(date)
    return messageDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const groupMessagesByDate = (messages) => {
    const groups = {}
    messages.forEach(message => {
      const date = new Date(message.createdAt).toLocaleDateString()
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(message)
    })
    return groups
  }

  const getFileIcon = (fileType) => {
    if (fileType?.startsWith('image/')) return <FaImage style={{ color: '#14a800' }} />
    if (fileType === 'application/pdf') return <FaFilePdf style={{ color: '#dc3545' }} />
    if (fileType?.includes('word')) return <FaFileWord style={{ color: '#2b579a' }} />
    if (fileType?.includes('excel') || fileType?.includes('sheet')) return <FaFileExcel style={{ color: '#1d6f42' }} />
    return <FaFileAlt style={{ color: '#666' }} />
  }

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const messageGroups = conversationMessages.length > 0 ? groupMessagesByDate(conversationMessages) : {}

  return (
    <div className="chat-window">
      {/* Header */}
      <div className="chat-window-header">
        {/* Back Button for Mobile */}
        {onBackClick && (
          <button
            className="chat-back-button"
            onClick={onBackClick}
            aria-label="Back to conversations"
          >
            <FaArrowLeft />
          </button>
        )}
        <div className="chat-user-info">
          <img
            src={getAvatarUrl(otherUser)}
            alt={otherUser?.first_name}
            className="chat-user-avatar"
            onError={(e) => {
              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUser?.first_name || 'User')}&background=14a800&color=fff&size=100`
            }}
          />
          <div>
            <div className="chat-header-title">
              <h3 className="chat-user-name">
                {otherUser?.first_name} {otherUser?.last_name}
              </h3>
              {conversation.job?.title && (
                <span className="chat-job-title">{conversation.job.title}</span>
              )}
            </div>
            <span className="chat-user-status">
              {isOtherUserOnline ? (
                <>
                  <span className="online-indicator"></span>
                  Active now
                </>
              ) : (
                `Last seen ${otherUser?.lastSeen ? new Date(otherUser.lastSeen).toLocaleString() : 'recently'}`
              )}
            </span>
          </div>
        </div>
        <button
          className="btn-info"
          onClick={() => setIsInfoModalOpen(true)}
          title="View conversation info"
        >
          <FaInfoCircle />
        </button>
      </div>

      {/* Messages */}
      <div className="chat-messages" ref={messagesContainerRef} onScroll={handleScroll}>
        {loading && conversationMessages.length === 0 ? (
          <div className="messages-loading">
            <div className="spinner-border text-success" role="status">
              <span className="visually-hidden">Loading messages...</span>
            </div>
          </div>
        ) : conversationMessages.length === 0 ? (
          <div className="no-messages">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          Object.entries(messageGroups).map(([date, dateMessages], groupIndex) => {
            const isLastGroup = groupIndex === Object.entries(messageGroups).length - 1
            return (
              <div key={date} className="message-date-group">
                <div className="date-divider">
                  <span>{date}</span>
                </div>
                {dateMessages.map((message, messageIndex) => {
                  const isOwn = message.sender?._id === currentUserId || message.sender === currentUserId
                  const messageSender = isOwn ? conversation.participants?.find(p => p._id === currentUserId) : message.sender
                  const isLastMessage = isLastGroup && messageIndex === dateMessages.length - 1

                  return (
                    <div
                      key={message._id}
                      ref={isLastMessage ? lastMessageRef : null}
                      className={`message ${isOwn ? 'chatwindow-own-msg' : 'chatwindow-other-msg'}`}
                    >
                      <img
                        src={getAvatarUrl(messageSender)}
                        alt={messageSender?.first_name}
                        className="message-avatar"
                        style={{
                          width: '36px',
                          height: '36px',
                          minWidth: '36px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          flexShrink: 0,
                          marginTop: '4px'
                        }}
                        onError={(e) => {
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(messageSender?.first_name || 'User')}&background=14a800&color=fff&size=100`
                        }}
                      />
                      <div className="message-bubble">
                        {message.content && message.content.trim() && (
                          <p className="message-content">{message.content}</p>
                        )}

                        {/* Message Attachments */}
                        {message.attachments && message.attachments.length > 0 && (
                          <div className="message-attachments" style={{ marginTop: message.content?.trim() ? '0.5rem' : '0' }}>
                            {message.attachments.map((file, index) => {
                              const fileUrl = file.url?.startsWith('http')
                                ? file.url
                                : `${API_ENDPOINTS.BASE_URL}${file.url?.replace(/^\/public/, '') || ''}`

                              const isImage = file.fileType?.startsWith('image/')

                              return (
                                <div key={index} className="message-attachment">
                                  {isImage ? (
                                    <div className="message-attachment-image-container" style={{
                                      width: '150px',
                                      height: '150px',
                                      minWidth: '150px',
                                      minHeight: '150px',
                                      maxWidth: '150px',
                                      maxHeight: '150px',
                                      position: 'relative',
                                      borderRadius: '12px',
                                      overflow: 'hidden',
                                      boxShadow: '0 2px 8px rgba(0,0,0,0.12)'
                                    }}>
                                      <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="message-attachment-image-link" style={{ width: '100%', height: '100%', display: 'block' }}>
                                        <img
                                          src={fileUrl}
                                          alt={file.fileName}
                                          className="message-attachment-image"
                                          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                        />
                                      </a>
                                      <a
                                        href={fileUrl}
                                        download={file.fileName}
                                        className="message-attachment-image-download"
                                        title="Download image"
                                        onClick={(e) => {
                                          e.preventDefault();
                                          fetch(fileUrl)
                                            .then(response => response.blob())
                                            .then(blob => {
                                              const url = window.URL.createObjectURL(blob);
                                              const a = document.createElement('a');
                                              a.href = url;
                                              a.download = file.fileName;
                                              document.body.appendChild(a);
                                              a.click();
                                              document.body.removeChild(a);
                                              window.URL.revokeObjectURL(url);
                                            })
                                            .catch(err => console.error('Download error:', err));
                                        }}
                                        style={{
                                          width: '36px',
                                          height: '36px',
                                          fontSize: '0.95rem',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          position: 'absolute',
                                          top: '6px',
                                          right: '6px',
                                          background: '#14a800',
                                          borderRadius: '50%',
                                          color: 'white',
                                          border: '2px solid white',
                                          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                                          cursor: 'pointer',
                                          zIndex: 10,
                                          transition: 'all 0.3s ease'
                                        }}
                                        onMouseEnter={(e) => {
                                          e.currentTarget.style.transform = 'scale(1.1)';
                                          e.currentTarget.style.background = '#0c7a00';
                                        }}
                                        onMouseLeave={(e) => {
                                          e.currentTarget.style.transform = 'scale(1)';
                                          e.currentTarget.style.background = '#14a800';
                                        }}
                                      >
                                        <FaDownload />
                                      </a>
                                    </div>
                                  ) : (
                                    <div
                                      className="message-attachment-file"
                                      style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.6rem',
                                        padding: '0.65rem 0.8rem',
                                        borderRadius: '10px',
                                        width: '200px',
                                        minHeight: '50px',
                                        boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                                        transition: 'all 0.3s ease',
                                        background: isOwn ? 'rgba(255, 255, 255, 0.18)' : 'white',
                                        border: isOwn ? '1.5px solid rgba(255, 255, 255, 0.3)' : '1.5px solid #e8e8e8',
                                        color: isOwn ? 'white' : '#333',
                                        backdropFilter: isOwn ? 'blur(10px)' : 'none',
                                        cursor: 'pointer'
                                      }}
                                      onClick={() => window.open(fileUrl, '_blank')}
                                      onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-1px)';
                                        e.currentTarget.style.boxShadow = '0 3px 10px rgba(0,0,0,0.12)';
                                      }}
                                      onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.08)';
                                      }}
                                      title="Click to open in browser"
                                    >
                                      <div className="message-attachment-icon" style={{
                                        fontSize: '1.4rem',
                                        flexShrink: 0,
                                        width: '28px',
                                        height: '28px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        opacity: 0.9,
                                        color: isOwn ? 'rgba(255, 255, 255, 0.95)' : '#14a800'
                                      }}>
                                        {getFileIcon(file.fileType)}
                                      </div>
                                      <div className="message-attachment-info" style={{
                                        flex: 1,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '0.15rem',
                                        minWidth: 0
                                      }}>
                                        <span className="message-attachment-name" style={{
                                          fontSize: '0.8rem',
                                          fontWeight: 600,
                                          whiteSpace: 'nowrap',
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis',
                                          lineHeight: 1.3
                                        }}>{file.fileName}</span>
                                        <span className="message-attachment-size" style={{
                                          fontSize: '0.68rem',
                                          opacity: 0.7,
                                          fontWeight: 500,
                                          lineHeight: 1.2
                                        }}>{formatFileSize(file.fileSize)}</span>
                                      </div>
                                      <button
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          fetch(fileUrl)
                                            .then(response => response.blob())
                                            .then(blob => {
                                              const url = window.URL.createObjectURL(blob);
                                              const a = document.createElement('a');
                                              a.href = url;
                                              a.download = file.fileName;
                                              document.body.appendChild(a);
                                              a.click();
                                              document.body.removeChild(a);
                                              window.URL.revokeObjectURL(url);
                                            })
                                            .catch(err => console.error('Download error:', err));
                                        }}
                                        style={{
                                          flexShrink: 0,
                                          width: '28px',
                                          height: '28px',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          borderRadius: '6px',
                                          border: 'none',
                                          background: 'transparent',
                                          color: isOwn ? 'white' : '#14a800',
                                          cursor: 'pointer',
                                          transition: 'all 0.3s ease',
                                          fontSize: '0.9rem',
                                          opacity: 0.75
                                        }}
                                        onMouseEnter={(e) => {
                                          e.currentTarget.style.opacity = '1';
                                          e.currentTarget.style.background = isOwn ? 'rgba(255, 255, 255, 0.2)' : 'rgba(20, 168, 0, 0.1)';
                                          e.currentTarget.style.transform = 'scale(1.15)';
                                        }}
                                        onMouseLeave={(e) => {
                                          e.currentTarget.style.opacity = '0.75';
                                          e.currentTarget.style.background = 'transparent';
                                          e.currentTarget.style.transform = 'scale(1)';
                                        }}
                                        title="Download file"
                                      >
                                        <FaDownload />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        )}

                        <div className="message-footer" style={{
                          display: 'flex',
                          justifyContent: 'flex-end',
                          alignItems: 'center',
                          marginTop: '0.5rem',
                          paddingTop: '0.3rem'
                        }}>
                          <span className="message-time" style={{
                            fontSize: '0.7rem',
                            opacity: 0.8,
                            whiteSpace: 'nowrap'
                          }}>
                            {formatMessageTime(message.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          })
        )}
        {isTyping && (
          <div className="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        )}
      </div>

      {/* New Message Indicator */}
      {showNewMessageIndicator && (
        <div className="new-message-indicator" onClick={scrollToLastMessage}>
          <span>New message</span>
          <FaArrowDown />
        </div>
      )}

      {/* Input */}
      <MessageInput
        onSendMessage={handleSendMessage}
        conversationId={conversation._id}
      />

      {/* Info Modal */}
      <ConversationInfoModal
        conversation={conversation}
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
      />
    </div>
  )
}

export default ChatWindow
