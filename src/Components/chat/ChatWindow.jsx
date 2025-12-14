import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getMessages, sendMessage } from '../../Services/Chat/ChatSlice'
import { FaEllipsisV, FaInfoCircle } from 'react-icons/fa'
import MessageInput from './MessageInput'
import './ChatWindow.css'

function ChatWindow({ conversation, currentUserId, onToggleSidebar }) {
  const dispatch = useDispatch()
  const { messages, loading } = useSelector((state) => state.chat)
  const messagesEndRef = useRef(null)
  const [isTyping, setIsTyping] = useState(false)

  const otherUser = conversation.participants?.find(p => p._id !== currentUserId)

  useEffect(() => {
    if (conversation._id) {
      dispatch(getMessages(conversation._id))
    }
  }, [conversation._id, dispatch])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

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

  const messageGroups = messages.length > 0 ? groupMessagesByDate(messages) : {}

  return (
    <div className="chat-window">
      {/* Header */}
      <div className="chat-window-header">
        <div className="chat-user-info">
          <img
            src={otherUser?.profile_picture_url || '/default-avatar.png'}
            alt={otherUser?.first_name}
            className="chat-user-avatar"
          />
          <div>
            <h3 className="chat-user-name">
              {otherUser?.first_name} {otherUser?.last_name}
            </h3>
            <span className="chat-user-status">
              {otherUser?.isOnline ? 'Active now' : `Last seen ${otherUser?.lastSeen ? new Date(otherUser.lastSeen).toLocaleString() : 'recently'}`}
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
        {loading && messages.length === 0 ? (
          <div className="messages-loading">
            <div className="spinner-border text-success" role="status">
              <span className="visually-hidden">Loading messages...</span>
            </div>
          </div>
        ) : messages.length === 0 ? (
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
                return (
                  <div
                    key={message._id}
                    className={`message ${isOwn ? 'own-message' : 'other-message'}`}
                  >
                    {!isOwn && (
                      <img
                        src={otherUser?.profile_picture_url || '/default-avatar.png'}
                        alt={otherUser?.first_name}
                        className="message-avatar"
                      />
                    )}
                    <div className="message-bubble">
                      <p className="message-content">{message.content}</p>
                      <span className="message-time">
                        {formatMessageTime(message.createdAt)}
                      </span>
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
      <MessageInput onSendMessage={handleSendMessage} />
    </div>
  )
}

export default ChatWindow
