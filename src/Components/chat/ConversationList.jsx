import React, { useState } from 'react'
import { FaSearch, FaEllipsisV, FaTimes } from 'react-icons/fa'
import './ConversationList.css'

function ConversationList({ conversations, selectedConversation, onSelectConversation, currentUserId }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [isFocused, setIsFocused] = useState(false)

  const getOtherParticipant = (conversation) => {
    return conversation.participants?.find(p => p._id !== currentUserId)
  }

  const getAvatarUrl = (user) => {
    // Try multiple sources for avatar - prioritize full URL
    if (user?.profile_picture_url) return user.profile_picture_url
    if (user?.profilePicture) return user.profilePicture
    if (user?.profile_picture) return user.profile_picture

    // Return placeholder
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.first_name || 'User')}+${encodeURIComponent(user?.last_name || '')}&background=14a800&color=fff&size=100`
  }

  const formatTime = (date) => {
    const messageDate = new Date(date)
    const now = new Date()
    const diff = now - messageDate

    if (diff < 60000) return 'Just now'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`
    return messageDate.toLocaleDateString()
  }

  const filteredConversations = conversations.filter(conv => {
    if (!searchTerm.trim()) return true

    const otherUser = getOtherParticipant(conv)
    const fullName = `${otherUser?.first_name || ''} ${otherUser?.last_name || ''}`.toLowerCase()
    const jobTitle = conv.job?.title?.toLowerCase() || ''
    const lastMessage = conv.lastMessage?.content?.toLowerCase() || ''
    const searchLower = searchTerm.toLowerCase().trim()

    return fullName.includes(searchLower) || jobTitle.includes(searchLower) || lastMessage.includes(searchLower)
  })

  const handleClearSearch = () => {
    setSearchTerm('')
  }

  return (
    <div className="conversation-list">
      {/* Header */}
      <div className="conversation-list-header">
        <h2>Messages</h2>
        <button className="btn-options">
          <FaEllipsisV />
        </button>
      </div>

      {/* Search */}
      <div className={`conversation-search ${isFocused ? 'focused' : ''}`}>
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder="Search conversations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="search-input"
        />
        {searchTerm && (
          <button
            className="search-clear-btn"
            onClick={handleClearSearch}
            type="button"
            aria-label="Clear search"
          >
            <FaTimes />
          </button>
        )}
      </div>

      {/* Conversations */}
      <div className="conversations-container">
        {filteredConversations.length === 0 ? (
          <div className="no-conversations">
            <p>{searchTerm ? 'No conversations found' : 'No conversations yet'}</p>
          </div>
        ) : (
          filteredConversations.map((conversation) => {
            const otherUser = getOtherParticipant(conversation)
            const isSelected = selectedConversation?._id === conversation._id
            const hasUnread = conversation.unreadCount > 0

            return (
              <div
                key={conversation._id}
                className={`conversation-item ${isSelected ? 'selected' : ''} ${hasUnread ? 'unread' : ''}`}
                onClick={() => onSelectConversation(conversation)}
              >
                {/* Avatar */}
                <div className="conversation-avatar">
                  <img
                    src={getAvatarUrl(otherUser)}
                    alt={otherUser?.first_name}
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUser?.first_name || 'User')}&background=14a800&color=fff&size=100`
                    }}
                  />
                  {otherUser?.isOnline && <span className="online-indicator"></span>}
                </div>

                {/* Info */}
                <div className="conversation-info">
                  <div className="conversation-header">
                    <div className="conversation-name-container">
                      <h4 className="conversation-name">
                        {conversation.job?.title || 'Conversation'}
                      </h4>
                      <p className="conversation-job-title">
                        {otherUser?.first_name} {otherUser?.last_name}
                      </p>
                    </div>
                    <span className="conversation-time">
                      {conversation.lastMessage?.createdAt && formatTime(conversation.lastMessage.createdAt)}
                    </span>
                  </div>
                  <div className="conversation-preview">
                    <p className="last-message">
                      {conversation.lastMessage?.content || 'No messages yet'}
                    </p>
                    {hasUnread && (
                      <span className="unread-badge">{conversation.unreadCount}</span>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default ConversationList
