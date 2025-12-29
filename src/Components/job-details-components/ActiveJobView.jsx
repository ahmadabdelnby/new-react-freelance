import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaComments, FaFileUpload, FaEye } from 'react-icons/fa'
import { toast } from 'react-toastify'
import { API_ENDPOINTS } from '../../Services/config'
import storage from '../../Services/storage'
import { useChatContext } from '../../context/ChatContext'
import ContractCard from './ContractCard'
import JobSummary from './JobSummary'
import JobPricing from './JobPricing'
import JobSkills from './JobSkills'
import JobAttachments from './JobAttachments'
import './ActiveJobView.css'

function ActiveJobView({ job, contract, viewerRole }) {
    const navigate = useNavigate()
    const { openChatDrawer } = useChatContext()
    const [isLoadingChat, setIsLoadingChat] = useState(false)
    const [conversationId, setConversationId] = useState(null)
    const [isFetchingConversation, setIsFetchingConversation] = useState(false)
    const otherParty = viewerRole === 'client' ? contract?.freelancer : contract?.client
    const otherPartyRole = viewerRole === 'client' ? 'Freelancer' : 'Client'

    // Fetch or create conversation for this job (only once)
    useEffect(() => {
        const fetchConversation = async () => {
            if (!contract?.job?._id || !contract?.proposal?._id || !otherParty?._id) return
            if (isFetchingConversation) return // Prevent duplicate calls

            setIsFetchingConversation(true)
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
            } finally {
                setIsFetchingConversation(false)
            }
        }

        fetchConversation()
    }, [contract?.job?._id, contract?.proposal?._id, otherParty?._id])

    const handleStartChat = async () => {
        if (conversationId) {
            // Open chat drawer with existing conversation
            if (openChatDrawer) {
                openChatDrawer(conversationId)
            }
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
                if (data.conversation?._id && openChatDrawer) {
                    // Open chat drawer with new conversation
                    openChatDrawer(data.conversation._id)
                }
            } catch (error) {
                console.error('Start chat error:', error)
                toast.error(error.message || 'Failed to start conversation')
            } finally {
                setIsLoadingChat(false)
            }
        }
    }

    // Determine contract status and display
    const isCompleted = contract?.status === 'completed'
    const isTerminated = contract?.status === 'terminated'
    const isPaused = contract?.status === 'paused'
    const isOverdue = contract?.calculatedDeadline && new Date() > new Date(contract.calculatedDeadline)
    const hasDeliverables = contract?.deliverables?.length > 0

    // Get appropriate banner based on status
    const getBannerConfig = () => {
        if (isCompleted) {
            return {
                class: 'completed',
                color: '#108a00',
                bgColor: '#e8f5e9',
                text: '✅ Project Completed',
                description: viewerRole === 'client'
                    ? 'This project has been successfully completed'
                    : 'You have successfully completed this project'
            }
        }
        if (isTerminated) {
            return {
                class: 'terminated',
                color: '#dc3545',
                bgColor: '#fee',
                text: '❌ Contract Terminated',
                description: 'This contract has been terminated'
            }
        }
        if (isPaused) {
            return {
                class: 'paused',
                color: '#ff9800',
                bgColor: '#fff3e0',
                text: '⏸️ Project Paused',
                description: 'This project has been temporarily paused'
            }
        }
        if (isOverdue && !hasDeliverables) {
            return {
                class: 'overdue',
                color: '#f44336',
                bgColor: '#ffebee',
                text: '⚠️ Project Overdue',
                description: viewerRole === 'client'
                    ? 'The deadline has passed without work submission'
                    : 'You missed the deadline - please submit your work ASAP'
            }
        }
        return {
            class: 'active',
            color: '#108a00',
            bgColor: '#e8f5e9',
            text: 'Project In Progress',
            description: viewerRole === 'client'
                ? 'Your freelancer is working on this project'
                : 'You are working on this project'
        }
    }

    const bannerConfig = getBannerConfig()

    return (
        <div className="active-job-view">
            {/* Dynamic Status Banner */}
            <div className={`job-status-banner banner-${bannerConfig.class}`}
                style={{
                    background: `linear-gradient(135deg, ${bannerConfig.bgColor} 0%, ${bannerConfig.bgColor}dd 100%)`,
                    borderColor: bannerConfig.color
                }}>
                <div className="status-indicator">
                    {!isCompleted && !isTerminated && !isPaused && (
                        <span className="status-pulse" style={{ backgroundColor: bannerConfig.color }}></span>
                    )}
                    <span className="status-text" style={{ color: bannerConfig.color }}>
                        {bannerConfig.text}
                    </span>
                </div>
                <p className="status-description">
                    {bannerConfig.description}
                </p>
            </div>

            {/* Contract Card */}
            <ContractCard contract={contract} viewerRole={viewerRole} />

            {/* Quick Actions */}
            <div className="active-job-actions">
                {/* Message Button - Always available */}
                <button
                    className="action-btn action-btn-primary"
                    onClick={handleStartChat}
                    disabled={isLoadingChat}
                >
                    <FaComments /> {isLoadingChat ? 'Loading...' : `Message ${otherPartyRole}`}
                </button>

                {/* Submit Work - Freelancer only, not for completed/terminated */}
                {viewerRole === 'freelancer' && !isCompleted && !isTerminated && (
                    <Link
                        to={`/contracts/${contract?._id}/submit-work`}
                        className={`action-btn action-btn-secondary ${isOverdue ? 'btn-urgent' : ''}`}
                    >
                        <FaFileUpload /> {isOverdue ? 'Submit Work (Overdue!)' : 'Submit Work'}
                    </Link>
                )}

                {/* Review Deliverables - Client only, if deliverables exist */}
                {viewerRole === 'client' && hasDeliverables && (
                    <Link
                        to={`/contracts/${contract?._id}`}
                        className="action-btn action-btn-secondary"
                    >
                        <FaEye /> Review Deliverables ({contract.deliverables.length})
                    </Link>
                )}

                {/* View Contract - Always available */}
                {/* REMOVED: Duplicate button - View Full Contract link already at bottom of ContractCard */}
            </div>

            {/* Overdue Warning */}
            {isOverdue && !hasDeliverables && !isCompleted && !isTerminated && (
                <div className="overdue-warning-card">
                    <div className="warning-icon">⚠️</div>
                    <div className="warning-content">
                        <h4>Deadline Passed</h4>
                        <p>
                            {viewerRole === 'client'
                                ? 'The freelancer has not submitted work yet. Please contact them to discuss the situation.'
                                : 'You missed the submission deadline. Please submit your work as soon as possible.'}
                        </p>
                    </div>
                </div>
            )}

            {/* Completion Message */}
            {isCompleted && (
                <div className="completion-card">
                    <div className="completion-icon">🎉</div>
                    <div className="completion-content">
                        <h4>Project Successfully Completed!</h4>
                        <p>
                            {viewerRole === 'client'
                                ? 'Thank you for working with this freelancer. Payment has been released.'
                                : 'Congratulations! Payment has been released to your account.'}
                        </p>
                        {contract.completedAt && (
                            <span className="completion-date">
                                Completed on {new Date(contract.completedAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* Termination Message */}
            {isTerminated && (
                <div className="termination-card">
                    <div className="termination-icon">❌</div>
                    <div className="termination-content">
                        <h4>Contract Terminated</h4>
                        <p>This contract has been terminated. If you have any questions, please contact support.</p>
                    </div>
                </div>
            )}

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
