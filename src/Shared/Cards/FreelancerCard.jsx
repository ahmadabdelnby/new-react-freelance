import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { FaStar, FaBriefcase, FaMapMarkerAlt, FaDollarSign, FaFolderOpen, FaPaperPlane } from 'react-icons/fa'
import { getImageUrl } from '../../Services/imageUtils'
import InviteToJobModal from '../../Components/shared/InviteToJobModal'
import './FreelancerCard.css'

function FreelancerCard({ freelancer }) {
  const { user } = useSelector((state) => state.auth)
  const [showInviteModal, setShowInviteModal] = useState(false)

  // Get actual user data
  const actualUser = user?.user || user
  const isLoggedIn = !!actualUser
  const currentUserId = actualUser?._id || actualUser?.id

  const {
    _id,
    first_name,
    last_name,
    country,
    profile_picture_url,
    aboutMe,
    category,
    specialty,
    averageRating,
    totalReviews,
    hourlyRate
  } = freelancer

  const fullName = `${first_name} ${last_name}`

  // Same logic as ProfileHeader for profile picture
  const profileImage = getImageUrl(freelancer?.profile_picture)

  const handleInviteClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setShowInviteModal(true)
  }

  return (
    <div className="freelancer-card">
      <div className="freelancer-card-header">
        <img
          src={profileImage}
          alt={fullName}
          className="freelancer-avatar"
        />
        <div className="freelancer-info">
          <h3 className="freelancer-name">{fullName}</h3>
          <p className="freelancer-location">
            <FaMapMarkerAlt /> {country || 'Not specified'}
          </p>
        </div>
      </div>

      <div className="freelancer-stats">
        {specialty?.name && (
          <span className="freelancer-specialty">{specialty.name}</span>
        )}
        <div className="freelancer-rating">
          <FaStar className="rating-star" />
          <span className="rating-value">
            {averageRating?.toFixed(1) || '0.0'}
          </span>
          {totalReviews > 0 && (
            <span className="reviews-count">({totalReviews})</span>
          )}
        </div>
      </div>

      <p className="freelancer-description">
        {aboutMe
          ? aboutMe.length > 100
            ? aboutMe.substring(0, 100) + '...'
            : aboutMe
          : 'No description available'}
      </p>

      <div className="freelancer-meta">
        <div className="meta-item">
          <FaFolderOpen className="meta-icon" />
          <span className="meta-label">Category:</span>
          <span className="meta-value">{category?.name || 'Not specified'}</span>
        </div>
        <div className="meta-item">
          <FaStar className="meta-icon" />
          <span className="meta-label">Rating:</span>
          <span className="meta-value">
            {averageRating > 0 ? `${averageRating.toFixed(1)} ⭐ (${totalReviews} reviews)` : 'No reviews yet'}
          </span>
        </div>
      </div>

      <Link to={`/freelancer/${_id}`} className="see-profile-btn">
        See profile
      </Link>

      {/* Invite to Job Button - for any logged in user viewing others */}
      {isLoggedIn && String(currentUserId) !== String(_id) && (
        <button
          className="freelancer-card-invite-btn"
          onClick={handleInviteClick}
        >
          <FaPaperPlane />
          Invite to Job
        </button>
      )}

      {/* Invite Modal */}
      <InviteToJobModal
        show={showInviteModal}
        onHide={() => setShowInviteModal(false)}
        freelancerId={_id}
        freelancerName={fullName}
      />
    </div>
  )
}

export default FreelancerCard
