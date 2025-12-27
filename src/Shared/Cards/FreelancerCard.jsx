import React from 'react'
import { Link } from 'react-router-dom'
import { FaStar, FaBriefcase, FaMapMarkerAlt } from 'react-icons/fa'
import { getImageUrl } from '../../Services/imageUtils'
import './FreelancerCard.css'

function FreelancerCard({ freelancer }) {
  const {
    _id,
    first_name,
    last_name,
    country,
    profile_picture_url,
    aboutMe,
    skills,
    category,
    specialty,
    averageRating,
    reviewsCount
  } = freelancer

  console.log('🔍 FreelancerCard skills:', skills)

  const fullName = `${first_name} ${last_name}`
  const displaySkills = skills?.slice(0, 5) || []

  // Same logic as ProfileHeader for profile picture
  const profileImage = getImageUrl(freelancer?.profile_picture)

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
            {averageRating?.toFixed(1) || 'New'}
          </span>
          {reviewsCount > 0 && (
            <span className="reviews-count">({reviewsCount})</span>
          )}
        </div>
      </div>

      <p className="freelancer-description">
        {aboutMe
          ? aboutMe.length > 120
            ? aboutMe.substring(0, 120) + '...'
            : aboutMe
          : 'No description available'}
      </p>

      <div className="freelancer-skills">
        {displaySkills.map((skill, index) => (
          <span
            key={skill._id || skill.name || `skill-${index}`}
            className="skill-tag"
          >
            {skill.name || skill}
          </span>
        ))}
        {skills?.length > 5 && (
          <span className="skill-tag more">
            +{skills.length - 5} more
          </span>
        )}
      </div>

      <Link to={`/freelancer/${_id}`} className="see-profile-btn">
        See profile
      </Link>
    </div>
  )
}

export default FreelancerCard
