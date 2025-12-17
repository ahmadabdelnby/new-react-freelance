import React, { useEffect, useRef, useState, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getMessages, sendMessage, markAsRead, setCurrentConversation } from '../../Services/Chat/ChatSlice'
import socketService from '../../Services/socketService'
import { FaEllipsisV, FaInfoCircle } from 'react-icons/fa'
import MessageInput from './MessageInput'
import './ChatWindow.css'

function ChatWindow({ conversation, currentUserId, onToggleSidebar }) {
  const dispatch = useDispatch()
  const allMessages = useSelector((state) => state.chat.messages)
  const onlineUsers = useSelector((state) => state.chat.onlineUsers)
  const conversationMessages = useMemo(() =>
    allMessages[conversation._id] || [],
    [allMessages, conversation._id]
  )
  const loading = useSelector((state) => state.chat.loading)
  const messagesEndRef = useRef(null)
  const [isTyping, setIsTyping] = useState(false)

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
      // console.log('📥 ChatWindow - Opening conversation:', conversation._id)
      // console.log('🔌 Socket connected:', socketService.isConnected())

      // Set current conversation in Redux store
      dispatch(setCurrentConversation(conversation))

      dispatch(getMessages(conversation._id))

      // Join conversation room for real-time messages
      // console.log('🚺 Attempting to join conversation room...')
      socketService.emit('join_conversation', conversation._id)

      // Mark messages as read
      dispatch(markAsRead(conversation._id))

      // Listen for typing indicator
      const socket = socketService.getSocket()
      if (socket) {
        const handleTyping = ({ userId, isTyping: typing }) => {
          // Only show typing if it's the other user
          if (userId !== currentUserId) {
            setIsTyping(typing)
          }
        }

        socket.on('user_typing', handleTyping)

        return () => {
          // console.log('🚺 Leaving conversation room:', conversation._id)
          socket.off('user_typing', handleTyping)
          socketService.emit('leave_conversation', conversation._id)
          // Clear current conversation
          dispatch(setCurrentConversation(null))
        }
      }

      return () => {
        // console.log('🚺 Leaving conversation room:', conversation._id)
        socketService.emit('leave_conversation', conversation._id)
        // Clear current conversation
        dispatch(setCurrentConversation(null))
      }
    }
  }, [conversation._id, dispatch, currentUserId])

  useEffect(() => {
    scrollToBottom()
  }, [conversationMessages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async (content) => {
    if (!content.trim()) return

    await dispatch(sendMessage({
      conversationId: conversation._id,
      content: content.trim()
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

  const messageGroups = conversationMessages.length > 0 ? groupMessagesByDate(conversationMessages) : {}

  return (
    <div className="chat-window">
      {/* Header */}
      <div className="chat-window-header">
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
            <h3 className="chat-user-name">
              {otherUser?.first_name} {otherUser?.last_name}
            </h3>
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
          onClick={onToggleSidebar}
          title="View conversation info"
        >
          <FaInfoCircle />
        </button>
      </div>

      {/* Messages */}
      <div className="chat-messages">
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
          Object.entries(messageGroups).map(([date, dateMessages]) => (
            <div key={date} className="message-date-group">
              <div className="date-divider">
                <span>{date}</span>
              </div>
              {dateMessages.map((message) => {
                const isOwn = message.sender?._id === currentUserId || message.sender === currentUserId
                const messageSender = isOwn ? conversation.participants?.find(p => p._id === currentUserId) : message.sender

                return (
                  <div
                    key={message._id}
                    className={`message ${isOwn ? 'own-message' : 'other-message'}`}
                  >
                    <img
                      src={getAvatarUrl(messageSender)}
                      alt={messageSender?.first_name}
                      className="message-avatar"
                      style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(messageSender?.first_name || 'User')}&background=14a800&color=fff&size=100`
                      }}
                    />
                    <div className="message-bubble">
                      <p className="message-content">{message.content}</p>
                      <div className="message-footer">
                        <span className="message-time">
                          {formatMessageTime(message.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ))
        )}
        {isTyping && (
          <div className="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <MessageInput
        onSendMessage={handleSendMessage}
        conversationId={conversation._id}
      />
    </div>
  )
}

export default ChatWindow
