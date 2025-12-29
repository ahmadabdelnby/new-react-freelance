import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom'
import { FaTimes, FaBriefcase, FaDollarSign, FaClock, FaUser, FaFileAlt, FaCalendar, FaMapMarkerAlt, FaDownload, FaFileContract, FaCheckCircle, FaHourglassHalf } from 'react-icons/fa'
import { API_ENDPOINTS } from '../../Services/config'
import storage from '../../Services/storage'
import './ConversationInfoModal.css'

function ConversationInfoModal({ conversation, isOpen, onClose }) {
  const [jobDetails, setJobDetails] = useState(null)
  const [proposalDetails, setProposalDetails] = useState(null)
  const [contractDetails, setContractDetails] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isOpen || !conversation) return

    const fetchDetails = async () => {
      try {
        setLoading(true)
        const token = storage.get('token')

        console.log('📋 Conversation data:', conversation)

        // Fetch job details - Use populated data first if available
        if (conversation.job) {
          const jobId = conversation.job?._id || conversation.job
          console.log('🔍 Fetching job with ID:', jobId)

          // If job is already populated, use it directly
          if (conversation.job.title) {
            console.log('✅ Using populated job data')
            setJobDetails(conversation.job)
          } else {
            // Otherwise fetch it
            const jobResponse = await fetch(`${API_ENDPOINTS.JOB_BY_ID(jobId)}`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            })
            if (jobResponse.ok) {
              const jobData = await jobResponse.json()
              setJobDetails(jobData.job)
            }
          }
        }

        // Fetch proposal details - Use populated data first if available
        if (conversation.proposal) {
          const proposalId = conversation.proposal?._id || conversation.proposal
          console.log('🔍 Fetching proposal with ID:', proposalId)

          // If proposal is already populated, use it directly
          if (conversation.proposal.bid_amount) {
            console.log('✅ Using populated proposal data')
            setProposalDetails(conversation.proposal)
          } else {
            // Otherwise fetch it
            const proposalResponse = await fetch(`${API_ENDPOINTS.PROPOSAL_BY_ID(proposalId)}`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            })
            if (proposalResponse.ok) {
              const proposalData = await proposalResponse.json()
              setProposalDetails(proposalData.proposal)
            } else {
              console.error('❌ Failed to fetch proposal:', proposalResponse.status)
            }
          }
        }

        // Fetch contract details - Try to fetch if job has contract
        // Contract will only exist if job is in_progress or completed
        if (conversation.job) {
          const jobId = conversation.job?._id || conversation.job
          const contractUrl = `${API_ENDPOINTS.BASE_URL}/Freelancing/api/v1/jobs/${jobId}/contract`
          console.log('🔍 [FRONTEND] Attempting to fetch contract for job:', jobId)
          console.log('📋 [FRONTEND] Full URL:', contractUrl)
          console.log('🔐 [FRONTEND] Token exists:', !!token)

          try {
            const contractResponse = await fetch(contractUrl, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            })

            console.log('📋 [FRONTEND] Contract response status:', contractResponse.status)
            console.log('📋 [FRONTEND] Contract response ok:', contractResponse.ok)

            if (contractResponse.ok) {
              const contractData = await contractResponse.json()
              console.log('✅ [FRONTEND] Contract details fetched successfully:', contractData)
              console.log('✅ [FRONTEND] Contract object:', contractData.contract)
              console.log('💰 [FRONTEND] Contract amount:', contractData.contract?.amount)
              console.log('💰 [FRONTEND] Contract budget:', contractData.contract?.budget)
              console.log('💰 [FRONTEND] Contract proposal amount:', contractData.contract?.proposal?.bidAmount)
              setContractDetails(contractData.contract)
            } else if (contractResponse.status === 404) {
              const errorData = await contractResponse.json()
              console.log('❌ [FRONTEND] 404 - Contract not found:', errorData)
            } else if (contractResponse.status === 400) {
              const errorData = await contractResponse.json()
              console.log('⚠️ [FRONTEND] 400 - No active contract:', errorData)
            } else {
              const errorData = await contractResponse.json()
              console.log('⚠️ [FRONTEND] Unexpected response:', contractResponse.status, errorData)
            }
          } catch (error) {
            console.log('❌ [FRONTEND] Error fetching contract:', error.message)
            console.error('[FRONTEND] Full error:', error)
          }
        } else {
          console.log('⚠️ [FRONTEND] No job ID in conversation')
        }
      } catch (error) {
        console.error('Error fetching details:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDetails()
  }, [isOpen, conversation])

  if (!isOpen) return null

  return ReactDOM.createPortal(
    <>
      <div className="modal-backdrop" onClick={onClose}></div>
      <div className="conversation-info-modal">
        {/* Header */}
        <div className="modal-header">
          <h2>Conversation Details</h2>
          <button className="btn-close-modal" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        {/* Content */}
        <div className="modal-content">
          {loading ? (
            <div className="modal-loading">
              <div className="spinner-border text-success" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <>
              {/* Job Details Section */}
              {jobDetails && (
                <div className="info-section">
                  <div className="section-header">
                    <FaBriefcase className="section-icon" />
                    <h3>Job Details</h3>
                  </div>
                  <div className="section-content">
                    {/* Job Title */}
                    <div className="job-title-card">
                      <h4>{jobDetails.title}</h4>
                    </div>

                    {/* Quick Stats Row */}
                    <div className="quick-stats-row">
                      <div className="stat-card">
                        <FaUser className="stat-icon" />
                        <div className="stat-content">
                          <span className="stat-label">Client</span>
                          <span className="stat-value">
                            {jobDetails.client?.first_name && jobDetails.client?.last_name
                              ? `${jobDetails.client.first_name} ${jobDetails.client.last_name}`
                              : 'Not specified'}
                          </span>
                        </div>
                      </div>

                      <div className="stat-card">
                        <FaFileAlt className="stat-icon" />
                        <div className="stat-content">
                          <span className="stat-label">Proposals</span>
                          <span className="stat-value">{jobDetails.proposalsCount || 0} proposals submitted</span>
                        </div>
                      </div>

                      <div className="stat-card highlight">
                        <FaDollarSign className="stat-icon" />
                        <div className="stat-content">
                          <span className="stat-label">Budget</span>
                          <span className="stat-value">
                            {jobDetails.budget && jobDetails.budget.amount
                              ? `$${jobDetails.budget.amount.toLocaleString()}`
                              : 'Not specified'}
                          </span>
                          {jobDetails.budget?.type && (
                            <span className="stat-subtext">({jobDetails.budget.type})</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="details-grid">
                      <div className="detail-card">
                        <FaClock className="detail-icon" />
                        <div className="detail-info">
                          <span className="detail-label">Duration</span>
                          <span className="detail-value">
                            {typeof jobDetails.duration === 'object' && jobDetails.duration?.value
                              ? `${jobDetails.duration.value} ${jobDetails.duration.value === 1 ? jobDetails.duration.unit?.replace(/s$/, '') : jobDetails.duration.unit}`
                              : jobDetails.deadline
                                ? `Deadline: ${new Date(jobDetails.deadline).toLocaleDateString()}`
                                : 'Not specified'}
                          </span>
                        </div>
                      </div>

                      <div className="detail-card">
                        <FaMapMarkerAlt className="detail-icon" />
                        <div className="detail-info">
                          <span className="detail-label">Specialty</span>
                          <span className="detail-value">
                            {typeof jobDetails.specialty === 'object' ? jobDetails.specialty?.name : jobDetails.specialty || 'Not specified'}
                          </span>
                        </div>
                      </div>

                      <div className="detail-card">
                        <FaCalendar className="detail-icon" />
                        <div className="detail-info">
                          <span className="detail-label">Posted</span>
                          <span className="detail-value">
                            {jobDetails.createdAt ? new Date(jobDetails.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Not specified'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="description-card">
                      <h5>Description</h5>
                      <p className="description-text">{jobDetails.description}</p>
                    </div>

                    {/* Skills */}
                    {jobDetails.skills && jobDetails.skills.length > 0 && (
                      <div className="skills-card">
                        <h5>Required Skills</h5>
                        <div className="skills-list">
                          {jobDetails.skills.map((skill, index) => (
                            <span key={index} className="skill-badge">
                              {skill.name || skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Attachments */}
                    {jobDetails.attachments && jobDetails.attachments.length > 0 && (
                      <div className="attachments-card">
                        <h5>Job Attachments</h5>
                        <div className="attachments-list">
                          {jobDetails.attachments.map((file, index) => {
                            const fileUrl = file.url?.startsWith('http') ? file.url : `${API_ENDPOINTS.BASE_URL}${file.url?.replace(/^\/public/, '') || ''}`
                            return (
                              <div
                                key={index}
                                className="attachment-link"
                                onClick={() => window.open(fileUrl, '_blank')}
                                style={{ cursor: 'pointer' }}
                                title="Click to open in browser"
                              >
                                <FaFileAlt /> {file.fileName || `Job Attachment ${index + 1}`}
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    fetch(fileUrl)
                                      .then(response => response.blob())
                                      .then(blob => {
                                        const url = window.URL.createObjectURL(blob);
                                        const a = document.createElement('a');
                                        a.href = url;
                                        a.download = file.fileName || `Job-Attachment-${index + 1}`;
                                        document.body.appendChild(a);
                                        a.click();
                                        document.body.removeChild(a);
                                        window.URL.revokeObjectURL(url);
                                      })
                                      .catch(err => console.error('Download error:', err));
                                  }}
                                  style={{
                                    marginLeft: 'auto',
                                    background: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: '4px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    color: 'inherit',
                                    fontSize: '0.9rem'
                                  }}
                                  title="Download file"
                                >
                                  <FaDownload />
                                </button>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Proposal Details Section */}
              {proposalDetails && (
                <div className="info-section">
                  <div className="section-header">
                    <FaFileAlt className="section-icon" />
                    <h3>Proposal Details</h3>
                  </div>
                  <div className="section-content">
                    {/* Quick Stats Row */}
                    <div className="quick-stats-row">
                      <div className="stat-card">
                        <FaUser className="stat-icon" />
                        <div className="stat-content">
                          <span className="stat-label">Freelancer</span>
                          <span className="stat-value">
                            {proposalDetails.freelancer_id?.first_name} {proposalDetails.freelancer_id?.last_name}
                          </span>
                        </div>
                      </div>

                      <div className="stat-card highlight">
                        <FaDollarSign className="stat-icon" />
                        <div className="stat-content">
                          <span className="stat-label">Bid Amount</span>
                          <span className="stat-value bid-amount">
                            ${(proposalDetails.bidAmount)?.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div className="stat-card">
                        <FaClock className="stat-icon" />
                        <div className="stat-content">
                          <span className="stat-label">Delivery Time</span>
                          <span className="stat-value">
                            {proposalDetails.deliveryTime} {proposalDetails.deliveryTime === 1 ? 'day' : 'days'}
                          </span>
                        </div>
                      </div>

                      <div className="stat-card status-card">
                        <div className="stat-content">
                          <span className="stat-label">Status</span>
                          <div style={{ marginTop: '0.4rem' }}>
                            <span className={`status-badge status-${proposalDetails.status}`}>
                              {proposalDetails.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Submitted Date */}
                    <div className="detail-card" style={{ marginBottom: '1.25rem' }}>
                      <FaCalendar className="detail-icon" />
                      <div className="detail-info">
                        <span className="detail-label">Submitted</span>
                        <span className="detail-value">
                          {proposalDetails.createdAt ? new Date(proposalDetails.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Not specified'}
                        </span>
                      </div>
                    </div>

                    {/* Cover Letter Card */}
                    <div className="description-card">
                      <h5>Cover Letter</h5>
                      <p className="cover-letter">{proposalDetails.coverLetter}</p>
                    </div>

                    {/* Attachments */}
                    {proposalDetails.attachments && proposalDetails.attachments.length > 0 && (
                      <div className="attachments-card">
                        <h5>Proposal Attachments</h5>
                        <div className="attachments-list">
                          {proposalDetails.attachments.map((file, index) => {
                            const fileUrl = file.url?.startsWith('http')
                              ? file.url
                              : `${API_ENDPOINTS.BASE_URL}${file.url?.replace(/^\/public/, '') || ''}`
                            return (
                              <div
                                key={index}
                                className="attachment-link"
                                onClick={() => window.open(fileUrl, '_blank')}
                                style={{ cursor: 'pointer' }}
                                title="Click to open in browser"
                              >
                                <FaFileAlt /> {file.fileName || file.name || `Attachment ${index + 1}`}
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    fetch(fileUrl)
                                      .then(response => response.blob())
                                      .then(blob => {
                                        const url = window.URL.createObjectURL(blob);
                                        const a = document.createElement('a');
                                        a.href = url;
                                        a.download = file.fileName || file.name || `Proposal-Attachment-${index + 1}`;
                                        document.body.appendChild(a);
                                        a.click();
                                        document.body.removeChild(a);
                                        window.URL.revokeObjectURL(url);
                                      })
                                      .catch(err => console.error('Download error:', err));
                                  }}
                                  style={{
                                    marginLeft: 'auto',
                                    background: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: '4px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    color: 'inherit',
                                    fontSize: '0.9rem'
                                  }}
                                  title="Download file"
                                >
                                  <FaDownload />
                                </button>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Contract Details Section */}
              {contractDetails && (
                <div className="info-section">
                  <div className="section-header">
                    <FaFileContract className="section-icon" />
                    <h3>Contract Details</h3>
                  </div>
                  <div className="section-content">
                    {/* Quick Stats Row */}
                    <div className="quick-stats-row">
                      <div className="stat-card">
                        <FaUser className="stat-icon" />
                        <div className="stat-content">
                          <span className="stat-label">Client</span>
                          <span className="stat-value">
                            {contractDetails.client?.first_name} {contractDetails.client?.last_name}
                          </span>
                        </div>
                      </div>

                      <div className="stat-card">
                        <FaUser className="stat-icon" />
                        <div className="stat-content">
                          <span className="stat-label">Freelancer</span>
                          <span className="stat-value">
                            {contractDetails.freelancer?.first_name} {contractDetails.freelancer?.last_name}
                          </span>
                        </div>
                      </div>

                      <div className="stat-card highlight">
                        <FaDollarSign className="stat-icon" />
                        <div className="stat-content">
                          <span className="stat-label">Contract Amount</span>
                          <span className="stat-value">
                            ${contractDetails.agreedAmount?.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div className="stat-card status-card">
                        <div className="stat-content">
                          <span className="stat-label">Status</span>
                          <div style={{ marginTop: '0.4rem' }}>
                            <span className={`status-badge status-${contractDetails.status}`}>
                              {contractDetails.status === 'in_progress' ? 'In Progress' : contractDetails.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Financial Details Grid */}
                    <div className="details-grid">
                      <div className="detail-card">
                        <FaDollarSign className="detail-icon" />
                        <div className="detail-info">
                          <span className="detail-label">Budget Type</span>
                          <span className="detail-value">
                            {contractDetails.budgetType === 'fixed' ? 'Fixed Price' : 'Hourly Rate'}
                          </span>
                        </div>
                      </div>

                      <div className="detail-card">
                        <FaDollarSign className="detail-icon" />
                        <div className="detail-info">
                          <span className="detail-label">Platform Fee (10%)</span>
                          <span className="detail-value">
                            ${((contractDetails.agreedAmount || 0) * 0.10).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>

                      <div className="detail-card">
                        <FaDollarSign className="detail-icon" />
                        <div className="detail-info">
                          <span className="detail-label">Freelancer Receives</span>
                          <span className="detail-value" style={{ color: '#10b981', fontWeight: '600' }}>
                            ${((contractDetails.agreedAmount || 0) * 0.90).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>

                      {contractDetails.proposal?.deliveryTime && (
                        <div className="detail-card">
                          <FaHourglassHalf className="detail-icon" />
                          <div className="detail-info">
                            <span className="detail-label">Delivery Time</span>
                            <span className="detail-value">
                              {contractDetails.proposal.deliveryTime} days
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Timeline Grid */}
                    <div className="details-grid">
                      <div className="detail-card">
                        <FaCalendar className="detail-icon" />
                        <div className="detail-info">
                          <span className="detail-label">Start Date</span>
                          <span className="detail-value">
                            {contractDetails.startDate
                              ? new Date(contractDetails.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                              : 'Not specified'}
                          </span>
                        </div>
                      </div>

                      <div className="detail-card">
                        <FaHourglassHalf className="detail-icon" />
                        <div className="detail-info">
                          <span className="detail-label">Deadline</span>
                          <span className="detail-value">
                            {contractDetails.deadline
                              ? new Date(contractDetails.deadline).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                              : 'Not specified'}
                          </span>
                        </div>
                      </div>

                      {contractDetails.completedAt && (
                        <div className="detail-card">
                          <FaCheckCircle className="detail-icon" />
                          <div className="detail-info">
                            <span className="detail-label">Completed At</span>
                            <span className="detail-value">
                              {new Date(contractDetails.completedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="detail-card">
                        <FaCalendar className="detail-icon" />
                        <div className="detail-info">
                          <span className="stat-label">Created</span>
                          <span className="detail-value">
                            {contractDetails.createdAt
                              ? new Date(contractDetails.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                              : 'Not specified'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Terms & Conditions */}
                    {contractDetails.terms && (
                      <div className="description-card">
                        <h5>Terms & Conditions</h5>
                        <p className="description-text">{contractDetails.terms}</p>
                      </div>
                    )}

                    {/* Milestones or Payment Schedule */}
                    {contractDetails.milestones && contractDetails.milestones.length > 0 && (
                      <div className="skills-card">
                        <h5>Milestones</h5>
                        <div className="milestones-list">
                          {contractDetails.milestones.map((milestone, index) => (
                            <div key={index} className="milestone-item">
                              <div className="milestone-header">
                                <span className="milestone-title">{milestone.title}</span>
                                <span className="milestone-amount">${milestone.amount?.toLocaleString()}</span>
                              </div>
                              {milestone.description && (
                                <p className="milestone-description">{milestone.description}</p>
                              )}
                              <span className={`status-badge status-${milestone.status}`}>
                                {milestone.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>,
    document.body
  )
}

export default ConversationInfoModal
