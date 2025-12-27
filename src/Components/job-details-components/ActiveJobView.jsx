import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaComments, FaFileUpload, FaEye } from 'react-icons/fa'
import { toast } from 'react-toastify'
import { API_ENDPOINTS } from '../../Services/config'
import storage from '../../Services/storage'
import ContractCard from './ContractCard'
import JobSummary from './JobSummary'
import JobPricing from './JobPricing'
import JobSkills from './JobSkills'
import JobAttachments from './JobAttachments'
import './ActiveJobView.css'

function ActiveJobView({ job, contract, viewerRole }) {
    const navigate = useNavigate()
    const [isLoadingChat, setIsLoadingChat] = useState(false)
    const [conversationId, setConversationId] = useState(null)
    const otherParty = viewerRole === 'client' ? contract?.freelancer : contract?.client
    const otherPartyRole = viewerRole === 'client' ? 'Freelancer' : 'Client'

    // Fetch or create conversation for this job
    useEffect(() => {
        const fetchConversation = async () => {
            if (!contract?.job?._id || !contract?.proposal?._id || !otherParty?._id) return

            try {
                const token = storage.get('token')
                const response = await fetch(API_ENDPOINTS.CHAT_CREATE_CONVERSATION, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        participantId: otherParty._id,
                        jobId: contract.job._id,
                        proposalId: contract.proposal._id
                    })
                })

                if (response.ok) {
                    const data = await response.json()
                    setConversationId(data.conversation?._id)
                }
            } catch (error) {
                console.error('Error fetching conversation:', error)
            }
        }

        fetchConversation()
    }, [contract, otherParty])

    const handleStartChat = async () => {
        if (conversationId) {
            navigate(`/chat?conversationId=${conversationId}`)
        } else {
            setIsLoadingChat(true)
            try {
                const token = storage.get('token')
                const response = await fetch(API_ENDPOINTS.CHAT_CREATE_CONVERSATION, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        participantId: otherParty._id,
                        jobId: contract.job._id,
                        proposalId: contract.proposal._id
                    })
                })

                if (!response.ok) {
                    const error = await response.json()
                    throw new Error(error.message || 'Failed to start conversation')
                }

                const data = await response.json()
                if (data.conversation?._id) {
                    navigate(`/chat?conversationId=${data.conversation._id}`)
                }
            } catch (error) {
                console.error('Start chat error:', error)
                toast.error(error.message || 'Failed to start conversation')
            } finally {
                setIsLoadingChat(false)
            }
        }
    }

    return (
        <div className="active-job-view">
            {/* Status Banner */}
            <div className="job-status-banner">
                <div className="status-indicator">
                    <span className="status-pulse"></span>
                    <span className="status-text">Project In Progress</span>
                </div>
                <p className="status-description">
                    {viewerRole === 'client'
                        ? 'Your freelancer is working on this project'
                        : 'You are working on this project'}
                </p>
            </div>

            {/* Contract Card */}
            <ContractCard contract={contract} viewerRole={viewerRole} />

            {/* Quick Actions */}
            <div className="active-job-actions">
                <button
                    className="action-btn action-btn-primary"
                    onClick={handleStartChat}
                    disabled={isLoadingChat}
                >
                    <FaComments /> {isLoadingChat ? 'Loading...' : `Message ${otherPartyRole}`}
                </button>

                {viewerRole === 'freelancer' && (
                    <Link
                        to={`/contracts/${contract?._id}/submit-work`}
                        className="action-btn action-btn-secondary"
                    >
                        <FaFileUpload /> Submit Work
                    </Link>
                )}

                {viewerRole === 'client' && contract?.deliverables?.length > 0 && (
                    <Link
                        to={`/contracts/${contract?._id}/review-work`}
                        className="action-btn action-btn-secondary"
                    >
                        <FaEye /> Review Deliverables
                    </Link>
                )}
            </div>

            {/* Job Details */}
            <div className="active-job-details">
                <h3 className="section-title">Original Job Requirements</h3>
                <JobSummary job={job} />
                <JobPricing job={job} />
                <JobSkills skills={job.skills || []} />

                {job.attachments && job.attachments.length > 0 && (
                    <JobAttachments attachments={job.attachments} />
                )}
            </div>
        </div>
    )
}

export default ActiveJobView
