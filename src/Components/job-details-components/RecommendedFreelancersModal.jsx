import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { FaTimes, FaSpinner, FaStar, FaUserPlus, FaEye } from 'react-icons/fa'
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
            // TODO: Implement invite functionality
            console.log('Inviting freelancer:', freelancer)
            toast.success(`Invitation sent to ${freelancer.first_name} ${freelancer.last_name}!`)
            
            // Here you would call an API to send notification to freelancer
            // await dispatch(inviteFreelancerToJob({ jobId, freelancerId: freelancer._id }))
        } catch (error) {
            console.error('Failed to invite freelancer:', error)
            toast.error('Failed to send invitation')
        }
    }

    // Sort freelancers by average rating (highest first)
    const sortedFreelancers = [...recommendedFreelancers].sort((a, b) => {
        const ratingA = a.averageRating || 0
        const ratingB = b.averageRating || 0
        return ratingB - ratingA
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
                            {sortedFreelancers.map((freelancer) => (
                                <div key={freelancer._id} className="freelancer-card">
                                    <div className="freelancer-info">
                                        <div 
                                            className="freelancer-avatar"
                                            onClick={() => handleViewProfile(freelancer._id)}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <img 
                                                src={getImageUrl(freelancer.profile_picture)} 
                                                alt={`${freelancer.first_name} ${freelancer.last_name}`}
                                            />
                                        </div>
                                        <div className="freelancer-details">
                                            <h3 
                                                className="freelancer-name"
                                                onClick={() => handleViewProfile(freelancer._id)}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                {freelancer.first_name} {freelancer.last_name}
                                            </h3>
                                            <div className="freelancer-rating">
                                                <FaStar className="star-icon" />
                                                <span className="rating-value">
                                                    {freelancer.averageRating ? freelancer.averageRating.toFixed(1) : 'No rating'}
                                                </span>
                                                {freelancer.totalReviews > 0 && (
                                                    <span className="rating-count">
                                                        ({freelancer.totalReviews} {freelancer.totalReviews === 1 ? 'review' : 'reviews'})
                                                    </span>
                                                )}
                                            </div>
                                            {freelancer.specialty && (
                                                <p className="freelancer-specialty">
                                                    {typeof freelancer.specialty === 'object' 
                                                        ? freelancer.specialty.name 
                                                        : freelancer.specialty}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="freelancer-actions">
                                        <button 
                                            className="btn-view-profile"
                                            onClick={() => handleViewProfile(freelancer._id)}
                                            title="View Profile"
                                        >
                                            <FaEye /> View Profile
                                        </button>
                                        <button 
                                            className="btn-invite"
                                            onClick={() => handleInviteFreelancer(freelancer)}
                                            title="Invite to Job"
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
