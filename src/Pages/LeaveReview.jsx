import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { FaStar, FaPaperPlane, FaArrowLeft } from 'react-icons/fa';
import { API_ENDPOINTS } from '../Services/config';
import './LeaveReview.css';

function LeaveReview() {
    const { contractId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user, token } = useSelector((state) => state.auth);

    // Handle nested user object structure from Redux
    const actualUser = user?.user || user;
    const userId = actualUser?._id || actualUser?.id || actualUser?.userId;

    const [loading, setLoading] = useState(false);
    const [contract, setContract] = useState(null);
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');

    useEffect(() => {
        if (contractId) {
            fetchContractDetails();
        }
    }, [contractId]);

    const fetchContractDetails = async () => {
        try {
            const response = await fetch(API_ENDPOINTS.CONTRACT_BY_ID(contractId), {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();

                // Validate contract status
                if (data.status !== 'completed') {
                    toast.error('You can only review completed contracts');
                    navigate('/contracts');
                    return;
                }

                // Validate user is part of this contract
                const clientId = data.client?._id || data.client;
                const freelancerId = data.freelancer?._id || data.freelancer;
                const isContractParty =
                    String(clientId) === String(userId) ||
                    String(freelancerId) === String(userId);

                if (!isContractParty) {
                    toast.error('You are not authorized to review this contract');
                    navigate('/contracts');
                    return;
                }

                setContract(data);
            } else {
                toast.error('Contract not found');
                navigate('/contracts');
            }
        } catch (error) {
            console.error('Error fetching contract:', error);
            toast.error('Failed to load contract details');
            navigate('/contracts');
        }
    };

    const isClient = userId && contract?.client && String(userId) === String(contract.client._id || contract.client);
    const otherParty = isClient ? contract?.freelancer : contract?.client;
    const otherPartyRole = isClient ? 'Freelancer' : 'Client';

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (rating === 0) {
            toast.error('Please select a rating');
            return;
        }

        if (comment.trim().length < 10) {
            toast.error('Comment must be at least 10 characters');
            return;
        }

        if (!contract || !otherParty) {
            toast.error('Contract data not loaded. Please wait...');
            return;
        }

        if (!otherParty._id) {
            toast.error('Unable to identify the other party. Please try again.');
            return;
        }

        setLoading(true);

        const reviewData = {
            contract: contractId,
            reviewer: userId,
            reviewee: otherParty._id,
            rating,
            comment: comment.trim()
        };

        console.log('Submitting review data:', reviewData);

        try {
            const response = await fetch(API_ENDPOINTS.CREATE_REVIEW, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(reviewData)
            });

            const data = await response.json();
            console.log('Review response:', data);
            console.log('Review response:', data);

            if (response.ok) {
                toast.success('Review submitted successfully! Thank you for your feedback.');

                // Redirect based on where user came from
                if (location.state?.from) {
                    navigate(location.state.from);
                } else {
                    navigate(`/contracts/${contractId}`);
                }
            } else {
                toast.error(data.message || 'Failed to submit review');
                console.error('Review submission failed:', data);
            }
        } catch (error) {
            console.error('Error submitting review:', error);
            toast.error('Failed to submit review. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!contract) {
        return (
            <div className="leave-review-page">
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading contract details...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="leave-review-page">
            <div className="container">
                <button className="back-button" onClick={() => navigate(-1)}>
                    <FaArrowLeft /> Back
                </button>

                <div className="review-card">
                    <div className="review-header">
                        <h1>Leave a Review</h1>
                        <p>Share your experience working with {otherParty?.first_name}</p>
                    </div>

                    <div className="reviewee-info">
                        <div className="reviewee-avatar">
                            {otherParty?.profile_picture ? (
                                <img src={otherParty.profile_picture} alt={otherParty.first_name} />
                            ) : (
                                <div className="avatar-placeholder">
                                    {otherParty?.first_name?.charAt(0)}
                                </div>
                            )}
                        </div>
                        <div className="reviewee-details">
                            <h2>{otherParty?.first_name} {otherParty?.last_name}</h2>
                            <p className="reviewee-role">{otherPartyRole}</p>
                            <p className="project-title">{contract?.job?.title}</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="review-form">
                        {/* Rating */}
                        <div className="form-group rating-group">
                            <label>Rating *</label>
                            <div className="stars-container">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        className={`star-button ${star <= (hoverRating || rating) ? 'active' : ''}`}
                                        onClick={() => setRating(star)}
                                        onMouseEnter={() => setHoverRating(star)}
                                        onMouseLeave={() => setHoverRating(0)}
                                    >
                                        <FaStar />
                                    </button>
                                ))}
                            </div>
                            <div className="rating-labels">
                                {rating === 0 && <span className="rating-label">Select a rating</span>}
                                {rating === 1 && <span className="rating-label poor">Poor</span>}
                                {rating === 2 && <span className="rating-label fair">Fair</span>}
                                {rating === 3 && <span className="rating-label good">Good</span>}
                                {rating === 4 && <span className="rating-label very-good">Very Good</span>}
                                {rating === 5 && <span className="rating-label excellent">Excellent</span>}
                            </div>
                        </div>

                        {/* Comment */}
                        <div className="form-group">
                            <label htmlFor="comment">
                                Your Review * <span className="char-count">{comment.length}/500</span>
                            </label>
                            <textarea
                                id="comment"
                                value={comment}
                                onChange={(e) => setComment(e.target.value.slice(0, 500))}
                                placeholder={`Describe your experience working with ${otherParty?.first_name}. What went well? What could be improved?`}
                                rows="6"
                                required
                                minLength="10"
                            />
                            <small className="form-help">Minimum 10 characters</small>
                        </div>

                        {/* Review Guidelines */}
                        <div className="review-guidelines">
                            <h4>Review Guidelines:</h4>
                            <ul>
                                <li>Be honest and constructive</li>
                                <li>Focus on specific aspects of the collaboration</li>
                                <li>Avoid personal attacks or offensive language</li>
                                <li>Your review will be publicly visible</li>
                            </ul>
                        </div>

                        {/* Submit Button */}
                        <div className="form-actions">
                            <button
                                type="button"
                                className="btn-cancel"
                                onClick={() => navigate(-1)}
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn-submit"
                                disabled={loading || !contract || !otherParty || rating === 0 || comment.trim().length < 10}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner"></span>
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <FaPaperPlane />
                                        Submit Review
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default LeaveReview;
