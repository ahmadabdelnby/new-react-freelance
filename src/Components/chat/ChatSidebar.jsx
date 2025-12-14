import React from 'react'
import { FaTimes, FaBriefcase, FaMapMarkerAlt, FaEnvelope } from 'react-icons/fa'
import './ChatSidebar.css'

function ChatSidebar({ conversation, currentUserId, onClose }) {
  const otherUser = conversation.participants?.find(p => p._id !== currentUserId)

  if (!otherUser) return null

  return (
    <div className="chat-sidebar">
      {/* Close Button */}
      <button className="btn-close-sidebar" onClick={onClose}>
        <FaTimes />
      </button>

      {/* User Profile */}
      <div className="sidebar-user-profile">
        <img
          src={otherUser.profile_picture_url || '/default-avatar.png'}
          alt={otherUser.first_name}
          className="sidebar-user-avatar"
        />
        <h3 className="sidebar-user-name">
          {otherUser.first_name} {otherUser.last_name}
        </h3>
        <p className="sidebar-user-role">{otherUser.role || 'User'}</p>
      </div>

      {/* User Details */}
      <div className="sidebar-user-details">
        {otherUser.country && (
          <div className="sidebar-detail-item">
            <FaMapMarkerAlt className="detail-icon" />
            <span>{otherUser.country}</span>
          </div>
        )}

        {otherUser.email && (
          <div className="sidebar-detail-item">
            <FaEnvelope className="detail-icon" />
            <span>{otherUser.email}</span>
          </div>
        )}

        {otherUser.specialty && (
          <div className="sidebar-detail-item">
            <FaBriefcase className="detail-icon" />
            <span>{otherUser.specialty.name || otherUser.specialty}</span>
          </div>
        )}
      </div>

      {/* About */}
      {otherUser.aboutMe && (
        <div className="sidebar-section">
          <h4 className="sidebar-section-title">About</h4>
          <p className="sidebar-about-text">{otherUser.aboutMe}</p>
        </div>
      )}

      {/* Skills */}
      {otherUser.skills && otherUser.skills.length > 0 && (
        <div className="sidebar-section">
          <h4 className="sidebar-section-title">Skills</h4>
          <div className="sidebar-skills">
            {otherUser.skills.map((skill, index) => (
              <span key={skill._id || skill.skillId?._id || skill.name || `skill-${index}`} className="sidebar-skill-tag">
                {typeof skill === 'string' ? skill : skill.name || skill.skillId?.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="sidebar-actions">
        <button className="btn-view-profile">
          View Full Profile
        </button>
      </div>
    </div>
  )
}

export default ChatSidebar
