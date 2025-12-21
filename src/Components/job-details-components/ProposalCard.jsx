import React from 'react'
import { Link } from 'react-router-dom'
import { FaUser, FaClock, FaDollarSign, FaCheck, FaTimes, FaStar, FaMapMarkerAlt } from 'react-icons/fa'
import './ProposalCard.css'

function ProposalCard({ proposal, onAccept, onReject, loading }) {
  const freelancer = proposal.freelancer_id

  const renderStars = (rating) => {
    const stars = []
    const roundedRating = Math.round(rating)
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FaStar 
          key={i} 
          className={i <= roundedRating ? 'pcard-star-filled' : 'pcard-star-empty'}
        />
      )
    }
    return stars
  }

  const getStatusBadge = (status) => {
    const badges = {
      submitted: { class: 'pcard-badge-new', label: 'New' },
      viewed: { class: 'pcard-badge-viewed', label: 'Viewed' },
      accepted: { class: 'pcard-badge-accepted', label: 'Accepted' },
      rejected: { class: 'pcard-badge-rejected', label: 'Rejected' },
      excluded: { class: 'pcard-badge-excluded', label: 'Not Selected' }
    }
    return badges[status] || { class: 'pcard-badge-default', label: status }
  }

  const statusBadge = getStatusBadge(proposal.status)

  return (
    <div className="pcard-container">
      <div className={`pcard-status ${statusBadge.class}`}>
        {statusBadge.label}
      </div>

      <div className="pcard-header">
        <div className="pcard-avatar">
          {freelancer?.profile_picture ? (
            <img src={freelancer.profile_picture} alt={`${freelancer.first_name}`} />
          ) : (
            <FaUser size={20} />
          )}
        </div>

        <div className="pcard-freelancer">
          <Link to={`/freelancer/${freelancer?._id}`} className="pcard-name">
            {freelancer?.first_name} {freelancer?.last_name}
          </Link>
          
          {freelancer?.averageRating > 0 && (
            <div className="pcard-rating">
              <div className="pcard-stars">
                {renderStars(freelancer.averageRating)}
              </div>
              <span className="pcard-rating-value">{freelancer.averageRating.toFixed(1)}</span>
            </div>
          )}

          <div className="pcard-details">
            {freelancer?.country && (
              <span className="pcard-location">
                <FaMapMarkerAlt /> {freelancer.country}
              </span>
            )}
            {freelancer?.completedJobs !== undefined && (
              <span className="pcard-jobs">
                {freelancer.completedJobs} jobs
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="pcard-meta">
        <div className="pcard-meta-item">
          <FaDollarSign className="pcard-icon" />
          <div>
            <div className="pcard-label">Bid</div>
            <div className="pcard-value">${proposal.bidAmount?.toLocaleString()}</div>
          </div>
        </div>

        <div className="pcard-meta-item">
          <FaClock className="pcard-icon" />
          <div>
            <div className="pcard-label">Delivery</div>
            <div className="pcard-value">{proposal.deliveryTime} days</div>
          </div>
        </div>
      </div>

      <div className="pcard-cover">
        <h4>Cover Letter</h4>
        <p>{proposal.coverLetter}</p>
      </div>

      {(proposal.status === 'submitted' || proposal.status === 'viewed') && (
        <div className="pcard-actions">
          <button
            className="pcard-btn pcard-btn-accept"
            onClick={() => onAccept(proposal._id)}
            disabled={loading}
          >
            <FaCheck /> Accept
          </button>
          <button
            className="pcard-btn pcard-btn-reject"
            onClick={() => onReject(proposal._id)}
            disabled={loading}
          >
            <FaTimes /> Reject
          </button>
        </div>
      )}
    </div>
  )
}

export default ProposalCard
