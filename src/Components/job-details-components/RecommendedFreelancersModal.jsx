import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { FaTimes, FaSpinner, FaStar, FaUserPlus, FaEye, FaCheckCircle, FaPercent } from 'react-icons/fa'
import { getImageUrl } from '../../Services/imageUtils'
import './RecommendedFreelancersModal.css'

const RecommendedFreelancersModal = ({ isOpen, onClose, jobId, jobTitle }) => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { recommendedFreelancers, loadingRecommendations, error } = useSelector((state) => state.jobs)

    // Debug: Log all state values
    useEffect(() => {
        console.log('=== Recommended Freelancers Modal State ===')
        console.log('jobId:', jobId)
        console.log('jobTitle:', jobTitle)
        console.log('isOpen:', isOpen)
        console.log('loadingRecommendations:', loadingRecommendations)
        console.log('error:', error)
        console.log('recommendedFreelancers:', recommendedFreelancers)
        console.log('recommendedFreelancers length:', recommendedFreelancers?.length)
        console.log('recommendedFreelancers array:', JSON.stringify(recommendedFreelancers, null, 2))
        console.log('==========================================')
    }, [jobId, jobTitle, isOpen, loadingRecommendations, error, recommendedFreelancers])

    const handleViewProfile = (freelancerId) => {
        navigate(`/freelancer/${freelancerId}`)
        onClose()
    }

    const handleInviteFreelancer = async (freelancer) => {
        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`${import.meta.env.VITE_API_URL}/job-invitations/send`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ 
                    freelancerId: freelancer._id,
                    jobIds: [jobId],
                    message: `You've been invited to submit a proposal for "${jobTitle}"`
                })
            })
            
            const data = await response.json()
            
            if (response.ok) {
                const freelancerName = `${freelancer.first_name || freelancer.username} ${freelancer.last_name || ''}`.trim()
                toast.success(`Invitation sent to ${freelancerName}!`, {
                    icon: '📧',
                    autoClose: 3000
                })
            } else {
                toast.error(data.message || 'Failed to send invitation')
            }
        } catch (error) {
            console.error('Failed to invite freelancer:', error)
            toast.error('Failed to send invitation. Please try again.')
        }
    }

    // Sort freelancers by rating (highest first), then by match score
    const sortedFreelancers = [...recommendedFreelancers].sort((a, b) => {
        const ratingA = parseFloat(a.rating) || a.freelancerProfile?.rating || 0
        const ratingB = parseFloat(b.rating) || b.freelancerProfile?.rating || 0
        if (ratingB !== ratingA) return ratingB - ratingA
        // If same rating, sort by match score
        const scoreA = parseFloat(a.matchScore) || 0
        const scoreB = parseFloat(b.matchScore) || 0
        return scoreB - scoreA
    })

    console.log('sortedFreelancers:', sortedFreelancers)
    console.log('sortedFreelancers length:', sortedFreelancers.length)

    if (!isOpen) return null

    return (
        <div className="recommended-modal-overlay" onClick={onClose}>
            <div className="recommended-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="recommended-modal-header">
                    <div>
                        <h2>Recommended Freelancers</h2>
                        <p className="job-title-hint">For: {jobTitle}</p>
                    </div>
                    <button className="recommended-modal-close" onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>

                <div className="recommended-modal-body">
                    {loadingRecommendations ? (
                        <div className="loading-state">
                            <FaSpinner className="loading-spinner" />
                            <p>Finding the best freelancers for your job...</p>
                        </div>
                    ) : error ? (
                        <div className="error-state">
                            <p>❌ {error}</p>
                        </div>
                    ) : sortedFreelancers.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">🔍</div>
                            <h3>No Recommendations Yet</h3>
                            <p>We couldn't find any freelancers matching this job at the moment.</p>
                            <p className="empty-hint">Try again later or browse all freelancers.</p>
                        </div>
                    ) : (
                        <div className="freelancers-list">
                            {sortedFreelancers.map((freelancer, index) => (
                                <div key={freelancer._id} className="freelancer-recommendation-card">
                                    {/* Rank Badge */}
                                    <div className="rank-badge">#{index + 1}</div>
                                    
                                    {/* Match Score */}
                                    {freelancer.matchScore && (
                                        <div className="match-score-badge">
                                            <FaCheckCircle />
                                            <span>{freelancer.matchScore}% Match</span>
                                        </div>
                                    )}
                                    
                                    <div className="freelancer-main-info">
                                        <div 
                                            className="freelancer-avatar-wrapper"
                                            onClick={() => handleViewProfile(freelancer._id)}
                                        >
                                            <img 
                                                src={getImageUrl(freelancer.profile_picture || freelancer.profilePicture)} 
                                                alt={`${freelancer.first_name || freelancer.username} ${freelancer.last_name || ''}`}
                                                onError={(e) => { e.target.src = '/user-default-img.png'; }}
                                            />
                                        </div>
                                        
                                        <div className="freelancer-text-info">
                                            <h3 
                                                className="freelancer-name-link"
                                                onClick={() => handleViewProfile(freelancer._id)}
                                            >
                                                {freelancer.first_name || freelancer.username} {freelancer.last_name || ''}
                                            </h3>
                                            
                                            <div className="freelancer-stats-row">
                                                <div className="stat-item-rec">
                                                    <FaStar className="star-gold" />
                                                    <span className="stat-value">{freelancer.rating || freelancer.freelancerProfile?.rating || '0'}</span>
                                                    <span className="stat-label">Rating</span>
                                                </div>
                                                
                                                {freelancer.similarity && (
                                                    <div className="stat-item-rec">
                                                        <FaPercent className="percent-icon" />
                                                        <span className="stat-value">{freelancer.similarity}%</span>
                                                        <span className="stat-label">Similarity</span>
                                                    </div>
                                                )}
                                                
                                                {freelancer.freelancerProfile?.completedJobs > 0 && (
                                                    <div className="stat-item-rec">
                                                        <FaCheckCircle className="check-icon" />
                                                        <span className="stat-value">{freelancer.freelancerProfile.completedJobs}</span>
                                                        <span className="stat-label">Jobs Done</span>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            {freelancer.matchedJob && (
                                                <p className="matched-job-hint">
                                                    Matched based on: "{freelancer.matchedJob.substring(0, 40)}..."
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="freelancer-card-actions">
                                        <button 
                                            className="btn-view-profile-rec"
                                            onClick={() => handleViewProfile(freelancer._id)}
                                        >
                                            <FaEye /> View Profile
                                        </button>
                                        <button 
                                            className="btn-invite-rec"
                                            onClick={() => handleInviteFreelancer(freelancer)}
                                        >
                                            <FaUserPlus /> Invite
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="recommended-modal-footer">
                    <button className="btn-close-modal" onClick={onClose}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    )
}

export default RecommendedFreelancersModal
