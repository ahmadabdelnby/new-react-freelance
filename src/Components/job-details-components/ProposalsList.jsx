import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { acceptProposal, rejectProposal } from '../../Services/Proposals/ProposalsSlice'
import { FaUser, FaClock, FaDollarSign, FaFileAlt, FaCheck, FaTimes, FaStar, FaBriefcase } from 'react-icons/fa'
import './ProposalsList.css'

function ProposalsList({ proposals, jobId }) {
  const dispatch = useDispatch()
  const { loading } = useSelector((state) => state.proposals)

  // Ensure proposals is always an array
  const proposalsList = Array.isArray(proposals) ? proposals : []

  const handleAccept = (proposalId) => {
    if (window.confirm('Are you sure you want to accept this proposal?')) {
      dispatch(acceptProposal(proposalId))
    }
  }

  const handleReject = (proposalId) => {
    if (window.confirm('Are you sure you want to reject this proposal?')) {
      dispatch(rejectProposal(proposalId))
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'badge-warning',
      accepted: 'badge-success',
      rejected: 'badge-danger',
      submitted: 'badge-warning',
      viewed: 'badge-info'
    }
    return badges[status] || 'badge-secondary'
  }

  const renderStars = (rating) => {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FaStar 
          key={i} 
          className={i <= rating ? 'star-filled' : 'star-empty'}
        />
      )
    }
    return stars
  }

  if (proposalsList.length === 0) {
    return (
      <div className="no-proposals">
        <FaFileAlt className="no-proposals-icon" />
        <h3>No Proposals Yet</h3>
        <p>No freelancers have submitted proposals for this job yet.</p>
      </div>
    )
  }

  return (
    <div className="proposals-list-container">
      <h2 className="proposals-title">Proposals ({proposalsList.length})</h2>
      
      <div className="proposals-list">
        {proposalsList.map((proposal) => (
          <div key={proposal._id} className="proposal-card">
            {/* Freelancer Info */}
            <div className="proposal-header">
              <div className="freelancer-info">
                <div className="freelancer-avatar">
                  {proposal.freelancer_id?.profile_picture ? (
                    <img 
                      src={proposal.freelancer_id.profile_picture} 
                      alt={proposal.freelancer_id.first_name}
                    />
                  ) : (
                    <FaUser />
                  )}
                </div>
                <div className="freelancer-details">
                  <Link 
                    to={`/freelancer/${proposal.freelancer_id?._id}`} 
                    className="freelancer-name-link"
                  >
                    <h3 className="freelancer-name">
                      {proposal.freelancer_id?.first_name} {proposal.freelancer_id?.last_name}
                    </h3>
                  </Link>
                  <p className="freelancer-username">@{proposal.freelancer_id?.username}</p>
                  
                  {/* Rating */}
                  {proposal.freelancer_id?.averageRating > 0 && (
                    <div className="freelancer-rating">
                      <div className="stars">
                        {renderStars(Math.round(proposal.freelancer_id.averageRating))}
                      </div>
                      <span className="rating-value">
                        {proposal.freelancer_id.averageRating.toFixed(1)}
                      </span>
                      {proposal.freelancer_id?.reviewsCount > 0 && (
                        <span className="reviews-count">
                          ({proposal.freelancer_id.reviewsCount} reviews)
                        </span>
                      )}
                    </div>
                  )}
                  
                  <p className="freelancer-location">
                    {proposal.freelancer_id?.country || 'Location not specified'}
                  </p>
                </div>
              </div>
              
              <div className="proposal-status">
                <span className={`status-badge ${getStatusBadge(proposal.status)}`}>
                  {proposal.status}
                </span>
              </div>
            </div>

            {/* Freelancer Portfolio Preview */}
            {proposal.freelancer_id?.portfolio && proposal.freelancer_id.portfolio.length > 0 && (
              <div className="freelancer-portfolio-preview">
                <h4 className="portfolio-title">
                  <FaBriefcase /> Portfolio Samples
                </h4>
                <div className="portfolio-items">
                  {proposal.freelancer_id.portfolio.slice(0, 3).map((item, index) => (
                    <div key={item._id || item.id || `portfolio-${index}`} className="portfolio-item-preview">
                      {item.image && (
                        <img src={item.image} alt={item.title} />
                      )}
                      <p className="portfolio-item-title">{item.title}</p>
                    </div>
                  ))}
                </div>
                <Link 
                  to={`/freelancer/${proposal.freelancer_id._id}`} 
                  className="view-full-portfolio"
                >
                  View Full Portfolio →
                </Link>
              </div>
            )}

            {/* Proposal Details */}
            <div className="proposal-details">
              <div className="proposal-meta">
                <div className="meta-item">
                  <FaDollarSign className="meta-icon" />
                  <div>
                    <span className="meta-label">Bid Amount</span>
                    <span className="meta-value">${proposal.bidAmount}</span>
                  </div>
                </div>
                
                <div className="meta-item">
                  <FaClock className="meta-icon" />
                  <div>
                    <span className="meta-label">Delivery Time</span>
                    <span className="meta-value">{proposal.deliveryTime} days</span>
                  </div>
                </div>
              </div>

              {/* Cover Letter */}
              <div className="proposal-cover-letter">
                <h4>Cover Letter</h4>
                <p>{proposal.coverLetter}</p>
              </div>

              {/* Attachments */}
              {proposal.attachments && proposal.attachments.length > 0 && (
                <div className="proposal-attachments">
                  <h4>Attachments</h4>
                  <div className="attachments-list">
                    {proposal.attachments.map((attachment, index) => (
                      <a 
                        key={`attachment-${index}`}
                        href={attachment}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="attachment-link"
                      >
                        <FaFileAlt /> Attachment {index + 1}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Submitted Date */}
              <div className="proposal-footer">
                <span className="submitted-date">
                  Submitted: {new Date(proposal.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Actions */}
            {proposal.status === 'pending' && (
              <div className="proposal-actions">
                <button
                  className="btn-accept"
                  onClick={() => handleAccept(proposal._id)}
                  disabled={loading}
                >
                  <FaCheck /> Accept
                </button>
                <button
                  className="btn-reject"
                  onClick={() => handleReject(proposal._id)}
                  disabled={loading}
                >
                  <FaTimes /> Reject
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default ProposalsList
