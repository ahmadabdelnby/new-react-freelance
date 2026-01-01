import React, { useEffect, useState, useMemo, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getMessages, sendMessage, markAsRead, setCurrentConversation } from '../../Services/Chat/ChatSlice'
import socketService from '../../Services/socketService'
import { FaEllipsisV, FaInfoCircle, FaFileAlt, FaImage, FaFilePdf, FaFileWord, FaFileExcel, FaDownload, FaArrowDown, FaArrowLeft, FaExternalLinkAlt, FaFilePowerpoint, FaFileArchive, FaFileCode, FaFileVideo, FaFileAudio, FaFileCsv, FaShieldAlt } from 'react-icons/fa'
import MessageInput from './MessageInput'
import ConversationInfoModal from './ConversationInfoModal'
import { API_ENDPOINTS } from '../../Services/config'
import { formatLastSeen } from '../../utils/timeUtils'
import './ChatWindow.css'

function ChatWindow({ conversation, currentUserId, onBackClick }) {
  const dispatch = useDispatch()
  const allMessages = useSelector((state) => state.chat.messages)
  const onlineUsers = useSelector((state) => state.chat.onlineUsers)
  const userStatuses = useSelector((state) => state.chat.userStatuses)
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
  const isOtherUserOnline = otherUser && (onlineUsers.includes(otherUser._id) || userStatuses[otherUser._id]?.isOnline)

  // Get lastSeen from Redux state (real-time) or fallback to user data
  const otherUserLastSeen = useMemo(() => {
    if (!otherUser) return null;
    return userStatuses[otherUser._id]?.lastSeen || otherUser?.lastSeen;
  }, [otherUser, userStatuses]);

  // Force re-render every minute to update "X minutes ago" display
  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setTick(tick => tick + 1);
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

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
    if (fileType?.includes('word') || fileType === 'application/rtf') return <FaFileWord style={{ color: '#2b579a' }} />
    if (fileType?.includes('excel') || fileType?.includes('sheet')) return <FaFileExcel style={{ color: '#1d6f42' }} />
    if (fileType?.includes('powerpoint') || fileType?.includes('presentation')) return <FaFilePowerpoint style={{ color: '#d04423' }} />
    if (fileType?.includes('zip') || fileType?.includes('rar') || fileType?.includes('7z') || fileType?.includes('tar') || fileType?.includes('gzip')) return <FaFileArchive style={{ color: '#f39c12' }} />
    if (fileType?.includes('javascript') || fileType?.includes('html') || fileType?.includes('css') || fileType?.includes('json') || fileType?.includes('xml')) return <FaFileCode style={{ color: '#6c5ce7' }} />
    if (fileType?.startsWith('video/')) return <FaFileVideo style={{ color: '#e74c3c' }} />
    if (fileType?.startsWith('audio/')) return <FaFileAudio style={{ color: '#9b59b6' }} />
    if (fileType === 'text/csv') return <FaFileCsv style={{ color: '#27ae60' }} />
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
    <div className="cwn-container">
      {/* Header */}
      <div className="cwn-header">
        {/* Back Button for Mobile */}
        {onBackClick && (
          <button
            className="cwn-btn-back"
            onClick={onBackClick}
            aria-label="Back to conversations"
          >
            <FaArrowLeft />
          </button>
        )}
        <div className="cwn-header-avatar">
          <img
            src={getAvatarUrl(otherUser)}
            alt={otherUser?.first_name}
            onError={(e) => {
              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUser?.first_name || 'User')}&background=14a800&color=fff&size=100`
            }}
          />
          {isOtherUserOnline && <span className="cwn-header-online"></span>}
        </div>
        <div className="cwn-header-info">
          <h3 className="cwn-header-name" title={conversation.job?.title || 'Conversation'}>
            {conversation.job?.title || 'Conversation'}
          </h3>
          <span className={`cwn-header-status ${isOtherUserOnline ? 'online' : ''}`}>
            {otherUser?.first_name} {otherUser?.last_name} {isOtherUserOnline ? '• Active now' : `• ${formatLastSeen(otherUserLastSeen)}`}
          </span>
        </div>
        <button
          className="cwn-btn-info"
          onClick={() => setIsInfoModalOpen(true)}
          title="View conversation info"
        >
          <FaInfoCircle />
        </button>
      </div>

      {/* Messages */}
      <div className="cwn-messages" ref={messagesContainerRef} onScroll={handleScroll}>
        {/* Monitoring Notice */}
        <div className="cwn-monitoring-notice">
          <FaShieldAlt className="cwn-monitoring-icon" />
          <p>
            For your safety and to ensure a professional experience, all messages in this conversation are securely stored and may be reviewed by our support team if a dispute arises.
          </p>
        </div>

        {loading && conversationMessages.length === 0 ? (
          <div className="cwn-loading">
            <div className="spinner-border text-success" role="status">
              <span className="visually-hidden">Loading messages...</span>
            </div>
          </div>
        ) : conversationMessages.length === 0 ? (
          <div className="cwn-empty">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          Object.entries(messageGroups).map(([date, dateMessages], groupIndex) => {
            const isLastGroup = groupIndex === Object.entries(messageGroups).length - 1
            return (
              <div key={date} className="cwn-msg-group">
                <div className="cwn-date-separator">
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
                      className={`cwn-msg-wrapper ${isOwn ? 'own' : 'other'}`}
                    >
                      <img
                        src={getAvatarUrl(messageSender)}
                        alt={messageSender?.first_name}
                        className="cwn-msg-avatar"
                        onError={(e) => {
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(messageSender?.first_name || 'User')}&background=14a800&color=fff&size=100`
                        }}
                      />
                      <div className="cwn-msg-bubble">
                        {message.content && message.content.trim() && (
                          <div className="cwn-msg-content">
                            <p className="cwn-msg-text">{message.content}</p>
                          </div>
                        )}

                        {/* Message Attachments */}
                        {message.attachments && message.attachments.length > 0 && (
                          <div className="cwn-attachments" style={{ marginTop: message.content?.trim() ? '0.5rem' : '0' }}>
                            {message.attachments.map((file, index) => {
                              const fileUrl = file.url?.startsWith('http')
                                ? file.url
                                : `${API_ENDPOINTS.BASE_URL}${file.url?.replace(/^\/public/, '') || ''}`

                              const isImage = file.fileType?.startsWith('image/')

                              return (
                                <div key={index} className="cwn-attachment">
                                  {isImage ? (
                                    <div className="cwn-attach-image" style={{
                                      width: '220px',
                                      height: '165px',
                                      minWidth: '220px',
                                      minHeight: '165px',
                                      maxWidth: '220px',
                                      maxHeight: '165px',
                                      position: 'relative',
                                      borderRadius: '14px',
                                      overflow: 'hidden',
                                      boxShadow: '0 3px 12px rgba(0,0,0,0.1)',
                                      cursor: 'pointer'
                                    }}
                                      onMouseEnter={(e) => {
                                        const overlay = e.currentTarget.querySelector('.cwn-attach-image-overlay');
                                        if (overlay) overlay.style.opacity = '1';
                                      }}
                                      onMouseLeave={(e) => {
                                        const overlay = e.currentTarget.querySelector('.cwn-attach-image-overlay');
                                        if (overlay) overlay.style.opacity = '0';
                                      }}
                                    >
                                      <img
                                        src={fileUrl}
                                        alt={file.fileName}
                                        className="cwn-attach-img"
                                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.3s ease' }}
                                        onClick={() => window.open(fileUrl, '_blank')}
                                      />
                                      {/* Image Overlay with Actions */}
                                      <div className="cwn-attach-image-overlay" style={{
                                        position: 'absolute',
                                        bottom: 0,
                                        left: 0,
                                        right: 0,
                                        background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
                                        padding: '1.5rem 0.75rem 0.75rem',
                                        display: 'flex',
                                        justifyContent: 'flex-end',
                                        gap: '0.5rem',
                                        opacity: 0,
                                        transition: 'opacity 0.3s ease'
                                      }}>
                                        <button
                                          onClick={() => window.open(fileUrl, '_blank')}
                                          style={{
                                            width: '34px',
                                            height: '34px',
                                            borderRadius: '8px',
                                            border: 'none',
                                            background: 'rgba(255,255,255,0.9)',
                                            color: '#212529',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '0.9rem',
                                            transition: 'all 0.2s ease'
                                          }}
                                          title="Open in new tab"
                                          onMouseEnter={(e) => { e.currentTarget.style.background = '#14a800'; e.currentTarget.style.color = 'white'; }}
                                          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.9)'; e.currentTarget.style.color = '#212529'; }}
                                        >
                                          <FaExternalLinkAlt />
                                        </button>
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
                                            width: '34px',
                                            height: '34px',
                                            borderRadius: '8px',
                                            border: 'none',
                                            background: 'rgba(255,255,255,0.9)',
                                            color: '#212529',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '0.9rem',
                                            transition: 'all 0.2s ease'
                                          }}
                                          title="Download"
                                          onMouseEnter={(e) => { e.currentTarget.style.background = '#14a800'; e.currentTarget.style.color = 'white'; }}
                                          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.9)'; e.currentTarget.style.color = '#212529'; }}
                                        >
                                          <FaDownload />
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div
                                      className="cwn-attach-file"
                                      style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        padding: '0.75rem 1rem',
                                        borderRadius: '12px',
                                        minWidth: '240px',
                                        maxWidth: '280px',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                        transition: 'all 0.3s ease',
                                        background: 'white',
                                        border: '1px solid #e9ecef',
                                        color: '#212529'
                                      }}
                                      onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                        e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.12)';
                                      }}
                                      onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                                      }}
                                    >
                                      <div className="cwn-attach-file-icon" style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '10px',
                                        background: 'linear-gradient(135deg, #14a800 0%, #0d8a00 100%)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '1.25rem',
                                        flexShrink: 0,
                                        color: 'white'
                                      }}>
                                        {getFileIcon(file.fileType)}
                                      </div>
                                      <div className="cwn-attach-file-info" style={{
                                        flex: 1,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '0.125rem',
                                        minWidth: 0
                                      }}>
                                        <span className="cwn-attach-file-name" style={{
                                          fontSize: '0.85rem',
                                          fontWeight: 600,
                                          whiteSpace: 'nowrap',
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis',
                                          lineHeight: 1.3,
                                          color: '#212529'
                                        }}>{file.fileName}</span>
                                        <span className="cwn-attach-file-size" style={{
                                          fontSize: '0.72rem',
                                          color: '#6c757d',
                                          fontWeight: 500,
                                          lineHeight: 1.2
                                        }}>{formatFileSize(file.fileSize)}</span>
                                      </div>
                                      <div style={{ display: 'flex', gap: '0.375rem', flexShrink: 0 }}>
                                        <button
                                          onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            window.open(fileUrl, '_blank');
                                          }}
                                          style={{
                                            width: '32px',
                                            height: '32px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            borderRadius: '8px',
                                            border: 'none',
                                            background: '#e9ecef',
                                            color: '#495057',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                            fontSize: '0.85rem'
                                          }}
                                          onMouseEnter={(e) => {
                                            e.currentTarget.style.background = '#14a800';
                                            e.currentTarget.style.color = 'white';
                                            e.currentTarget.style.transform = 'scale(1.1)';
                                          }}
                                          onMouseLeave={(e) => {
                                            e.currentTarget.style.background = '#e9ecef';
                                            e.currentTarget.style.color = '#495057';
                                            e.currentTarget.style.transform = 'scale(1)';
                                          }}
                                          title="Open in new tab"
                                        >
                                          <FaExternalLinkAlt />
                                        </button>
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
                                            width: '32px',
                                            height: '32px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            borderRadius: '8px',
                                            border: 'none',
                                            background: '#e9ecef',
                                            color: '#495057',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                            fontSize: '0.85rem'
                                          }}
                                          onMouseEnter={(e) => {
                                            e.currentTarget.style.background = '#14a800';
                                            e.currentTarget.style.color = 'white';
                                            e.currentTarget.style.transform = 'scale(1.1)';
                                          }}
                                          onMouseLeave={(e) => {
                                            e.currentTarget.style.background = '#e9ecef';
                                            e.currentTarget.style.color = '#495057';
                                            e.currentTarget.style.transform = 'scale(1)';
                                          }}
                                          title="Download file"
                                        >
                                          <FaDownload />
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        )}

                        <div className="cwn-msg-time" style={{
                          color: '#6c757d',
                          fontSize: '0.7rem',
                          marginTop: '0.5rem',
                          textAlign: isOwn ? 'right' : 'left'
                        }}>
                          <span style={{ opacity: 1 }}>{formatMessageTime(message.createdAt)}</span>
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
          <div className="cwn-typing-container">
            <div className="cwn-typing">
              <span className="cwn-typing-text">typing</span>
              <div className="cwn-typing-dots">
                <span className="cwn-typing-dot"></span>
                <span className="cwn-typing-dot"></span>
                <span className="cwn-typing-dot"></span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* New Message Indicator */}
      {showNewMessageIndicator && (
        <div className="cwn-new-msg-indicator" onClick={scrollToLastMessage}>
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
