import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaUser, FaClock, FaDollarSign, FaCheck, FaTimes, FaStar, FaMapMarkerAlt, FaComments, FaFileAlt, FaFilePdf, FaFileImage, FaFileWord, FaFileExcel, FaDownload } from 'react-icons/fa'
import { API_ENDPOINTS } from '../../Services/config'
import { getImageUrl } from '../../Services/imageUtils'
import storage from '../../Services/storage'
import { toast } from 'react-toastify'
import './ProposalCard.css'

function ProposalCard({ proposal, jobId, isClient, currentUserId, onAccept, onReject, loading }) {
  const freelancer = proposal.freelancer_id
  const navigate = useNavigate()
  const [isCreatingChat, setIsCreatingChat] = useState(false)

  const getFileIcon = (fileType, fileName) => {
    // Try to determine file type from fileName if fileType is not available
    const type = fileType?.toLowerCase() || fileName?.toLowerCase() || ''

    if (type.includes('pdf')) return <FaFilePdf className="pcard-file-icon pdf" />
    if (type.includes('image') || type.includes('png') || type.includes('jpg') || type.includes('jpeg') || type.includes('.png') || type.includes('.jpg')) {
      return <FaFileImage className="pcard-file-icon image" />
    }
    if (type.includes('word') || type.includes('doc')) return <FaFileWord className="pcard-file-icon word" />
    if (type.includes('excel') || type.includes('xls')) return <FaFileExcel className="pcard-file-icon excel" />

    return <FaFileAlt className="pcard-file-icon" />
  }

  const getFileUrl = (url) => {
    if (!url) return ''
    if (url.startsWith('http')) return url
    // Remove /public prefix if exists
    const cleanUrl = url.replace(/^\/public/, '')
    return `${API_ENDPOINTS.BASE_URL}${cleanUrl}`
  }

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

  const handleStartChat = async () => {
    if (!freelancer?._id || !jobId || !proposal._id) {
      toast.error('Missing required information to start chat')
      return
    }

    setIsCreatingChat(true)
    try {
      const token = storage.get('token')
      const response = await fetch(API_ENDPOINTS.CHAT_CREATE_CONVERSATION, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          participantId: freelancer._id,
          jobId: jobId,
          proposalId: proposal._id
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create conversation')
      }

      const data = await response.json()

      // Navigate to chat with the conversation ID
      if (data.conversation?._id) {
        navigate(`/chat?conversationId=${data.conversation._id}`)
      } else {
        toast.error('Failed to get conversation ID')
      }
    } catch (error) {
      console.error('Start chat error:', error)
      toast.error(error.message || 'Failed to start conversation')
    } finally {
      setIsCreatingChat(false)
    }
  }

  return (
    <div className="pcard-container">
      <div className={`pcard-status ${statusBadge.class}`}>
        {statusBadge.label}
      </div>

      <div className="pcard-header">
        <div className="pcard-avatar">
          {freelancer?.profile_picture ? (
            <img src={getImageUrl(freelancer.profile_picture)} alt={`${freelancer.first_name}`} />
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

      {proposal.attachments && proposal.attachments.length > 0 && (
        <div className="pcard-attachments">
          <h4 className="pcard-attachments-heading">
            Attachments ({proposal.attachments.length})
          </h4>
          <div className="pcard-attachments-list">
            {proposal.attachments.map((file, index) => {
              const fileUrl = file.url || file
              const fileName = file.name || file.fileName || `Attachment ${index + 1}`
              const fileType = file.fileType || file.type
              const fileSize = file.fileSize || file.size

              return (
                <div key={index} className="pcard-attachment-item">
                  <div className="pcard-attachment-info">
                    {getFileIcon(fileType, fileName)}
                    <div className="pcard-attachment-details">
                      <span className="pcard-attachment-name">{fileName}</span>
                      {fileSize && (
                        <span className="pcard-attachment-size">
                          {(fileSize / 1024).toFixed(1)} KB
                        </span>
                      )}
                    </div>
                  </div>
                  <a
                    href={getFileUrl(fileUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="pcard-download-btn"
                    download
                    title="Download"
                  >
                    <FaDownload />
                  </a>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {(proposal.status === 'submitted' || proposal.status === 'viewed') && (
        <div className="pcard-actions">
          <button
            className="pcard-btn pcard-btn-accept"
            onClick={() => onAccept(proposal._id)}
            disabled={loading}
          >
            <FaCheck /> Accept
          </button>
          {isClient && (
            <button
              className="pcard-btn pcard-btn-chat"
              onClick={handleStartChat}
              disabled={loading || isCreatingChat}
            >
              <FaComments /> {isCreatingChat ? 'Starting...' : 'Chat'}
            </button>
          )}
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
