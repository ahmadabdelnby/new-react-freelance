import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { FaUser, FaClock, FaDollarSign, FaCheck, FaTimes, FaStar, FaMapMarkerAlt, FaComments, FaFileAlt, FaFilePdf, FaFileImage, FaFileWord, FaFileExcel, FaDownload } from 'react-icons/fa'
import { API_ENDPOINTS } from '../../Services/config'
import { getImageUrl } from '../../Services/imageUtils'
import storage from '../../Services/storage'
import { toast } from 'react-toastify'
import { useChatContext } from '../../context/ChatContext'
import './ProposalCard.css'

function ProposalCard({ proposal, jobId, job, isClient, currentUserId, onAccept, onReject, loading }) {
  const freelancer = proposal.freelancer_id
  const navigate = useNavigate()
  const [isCreatingChat, setIsCreatingChat] = useState(false)
  const { openChatDrawer } = useChatContext()

  // Ensure hooks are called at top-level (avoid calling useSelector conditionally)
  const storeJob = useSelector((state) => state.jobs.currentJob)
  const effectiveJob = job || storeJob
  const isJobDisabled = effectiveJob && effectiveJob.status && effectiveJob.status !== 'open'

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

  const getViewUrl = (url) => {
    // Direct view URL served by static middleware
    return getFileUrl(url)
  }

  const getDownloadUrl = (url, file) => {
    if (!url) return ''
    if (url.startsWith('http')) return url
    const cleanUrl = url.replace(/^\/public/, '')
    const serverBase = API_ENDPOINTS.BASE_URL
    const downloadPath = `/Freelancing/api/v1/upload/attachments/download`
    const originalName = encodeURIComponent(file?.fileName || file?.name || '')
    return `${serverBase}${downloadPath}?filePath=${encodeURIComponent(cleanUrl)}&originalName=${originalName}`
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

      // Open chat drawer with the conversation ID
      if (data.conversation?._id) {
        if (openChatDrawer) {
          openChatDrawer(data.conversation._id);
        } else {
          // Fallback to navigation if openChatDrawer is not provided
          navigate(`/chat?conversationId=${data.conversation._id}`);
        }
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
                <div key={index} className="pcard-attachment-item" onClick={() => {
                  const viewUrl = getViewUrl(fileUrl)
                  if (viewUrl) window.open(viewUrl, '_blank', 'noopener')
                }}>
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
                    href={getDownloadUrl(fileUrl, file)}
                    className="download-btn pcard-download-btn"
                    download={fileName}
                    onClick={(e) => e.stopPropagation()}
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
            onClick={() => !isJobDisabled && onAccept(proposal._id)}
            disabled={loading || isJobDisabled}
            title={isJobDisabled ? 'Job is not open' : 'Accept proposal'}
          >
            <FaCheck /> Accept
          </button>
          {isClient && (
            <button
              className="pcard-btn pcard-btn-chat"
              onClick={handleStartChat}
              disabled={loading || isCreatingChat || isJobDisabled}
              title={isJobDisabled ? 'Job is not open' : 'Start chat'}
            >
              <FaComments /> {isCreatingChat ? 'Starting...' : 'Chat'}
            </button>
          )}
          <button
            className="pcard-btn pcard-btn-reject"
            onClick={() => !isJobDisabled && onReject(proposal._id)}
            disabled={loading || isJobDisabled}
            title={isJobDisabled ? 'Job is not open' : 'Reject proposal'}
          >
            <FaTimes /> Reject
          </button>
        </div>
      )}
    </div>
  )
}

export default ProposalCard
