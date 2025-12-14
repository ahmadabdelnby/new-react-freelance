import React from 'react'
import { Link } from 'react-router-dom'
import { FaDollarSign, FaStar, FaMapMarkerAlt } from 'react-icons/fa'
import './SuggestedJobCard.css'

function SuggestedJobCard({ job }) {
  const {
    id,
    title,
    budget,
    priceType,
    skills = [],
    clientRating,
    clientCountry,
    postedTime
  } = job

  return (
    <div className="suggested-job-card">
      <Link to={`/jobs/${id}`} className="suggested-job-link">
        <div className="suggested-job-header">
          <span className="suggested-job-posted">{postedTime}</span>
        </div>

        <h4 className="suggested-job-title">{title}</h4>

        <div className="suggested-job-meta">
          <div className="suggested-job-budget">
            <FaDollarSign className="meta-icon" />
            <span>${budget}</span>
          </div>
          <span className="meta-separator">•</span>
          <span className="suggested-job-type">{priceType}</span>
        </div>

        {skills.length > 0 && (
          <div className="suggested-job-skills">
            {skills.slice(0, 3).map((skill, index) => (
              <span key={skill._id || skill.name || skill || `skill-${index}`} className="suggested-skill-tag">
                {skill}
              </span>
            ))}
            {skills.length > 3 && (
              <span className="suggested-skill-more">+{skills.length - 3}</span>
            )}
          </div>
        )}

        <div className="suggested-job-footer">
          {clientRating > 0 && (
            <div className="suggested-client-rating">
              <FaStar className="star-icon" />
              <span>{clientRating}</span>
            </div>
          )}
          {clientCountry && (
            <div className="suggested-client-location">
              <FaMapMarkerAlt className="location-icon" />
              <span>{clientCountry}</span>
            </div>
          )}
        </div>
      </Link>
    </div>
  )
}

export default SuggestedJobCard
