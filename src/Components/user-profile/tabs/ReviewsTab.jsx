import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getUserReviews, addReviewReply, updateReviewReply, deleteReviewReply } from '../../../Services/Reviews/ReviewsSlice';
import { FaStar, FaUserCircle, FaReply, FaEdit, FaTrash, FaTimes, FaCheck } from 'react-icons/fa';
import { toast } from 'react-toastify';
import './ReviewsTab.css';

const ReviewsTab = ({ userId, isOwn }) => {
    const dispatch = useDispatch();
    const { reviews, loading, error } = useSelector((state) => state.reviews);
    const currentUser = useSelector((state) => state.auth.user);

    // Reply state
    const [replyingTo, setReplyingTo] = useState(null);
    const [editingReply, setEditingReply] = useState(null);
    const [replyContent, setReplyContent] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (userId) {
            dispatch(getUserReviews(userId));
        }
    }, [dispatch, userId]);

    const renderStars = (rating) => {
        return [...Array(5)].map((_, i) => (
            <FaStar key={`star-${i}`} className={i < rating ? 'userprofile-reviews-star-filled' : 'userprofile-reviews-star-empty'} />
        ));
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    };

    // Check if current user can reply to a review (must be the reviewee)
    const canReply = (review) => {
        return isOwn && currentUser && String(review.reviewee?._id || review.reviewee) === String(currentUser._id);
    };

    // Handle starting a reply
    const handleStartReply = (reviewId) => {
        setReplyingTo(reviewId);
        setEditingReply(null);
        setReplyContent('');
    };

    // Handle starting edit
    const handleStartEdit = (review) => {
        setEditingReply(review._id);
        setReplyingTo(null);
        setReplyContent(review.freelancerReply?.content || '');
    };

    // Handle cancel
    const handleCancel = () => {
        setReplyingTo(null);
        setEditingReply(null);
        setReplyContent('');
    };

    // Handle submit reply
    const handleSubmitReply = async (reviewId) => {
        if (!replyContent.trim()) {
            toast.error('Please enter a reply');
            return;
        }

        if (replyContent.length > 500) {
            toast.error('Reply cannot exceed 500 characters');
            return;
        }

        setSubmitting(true);
        try {
            await dispatch(addReviewReply({ reviewId, content: replyContent.trim() })).unwrap();
            toast.success('Reply added successfully');
            handleCancel();
            // Refresh reviews
            dispatch(getUserReviews(userId));
        } catch (err) {
            toast.error(err.message || 'Failed to add reply');
        } finally {
            setSubmitting(false);
        }
    };

    // Handle update reply
    const handleUpdateReply = async (reviewId) => {
        if (!replyContent.trim()) {
            toast.error('Please enter a reply');
            return;
        }

        if (replyContent.length > 500) {
            toast.error('Reply cannot exceed 500 characters');
            return;
        }

        setSubmitting(true);
        try {
            await dispatch(updateReviewReply({ reviewId, content: replyContent.trim() })).unwrap();
            toast.success('Reply updated successfully');
            handleCancel();
            // Refresh reviews
            dispatch(getUserReviews(userId));
        } catch (err) {
            toast.error(err.message || 'Failed to update reply');
        } finally {
            setSubmitting(false);
        }
    };

    // Handle delete reply
    const handleDeleteReply = async (reviewId) => {
        if (!window.confirm('Are you sure you want to delete your reply?')) return;

        setSubmitting(true);
        try {
            await dispatch(deleteReviewReply(reviewId)).unwrap();
            toast.success('Reply deleted successfully');
            // Refresh reviews
            dispatch(getUserReviews(userId));
        } catch (err) {
            toast.error(err.message || 'Failed to delete reply');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="userprofile-reviews-container">
                <div className="userprofile-reviews-loading">
                    <div className="userprofile-reviews-spinner"></div>
                    <p>Loading reviews...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="userprofile-reviews-container">
                <div className="userprofile-reviews-error">
                    <p>Error loading reviews: {error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="userprofile-reviews-container">
            <div className="userprofile-reviews-header">
                <h3 className="userprofile-reviews-title">Reviews</h3>
                <p className="userprofile-reviews-count">{reviews?.length || 0} review{reviews?.length !== 1 ? 's' : ''}</p>
            </div>

            {!reviews || reviews.length === 0 ? (
                <div className="userprofile-reviews-empty">
                    <p>No reviews yet</p>
                </div>
            ) : (
                <div className="userprofile-reviews-list">
                    {reviews.map((review) => (
                        <div key={review._id} className="userprofile-reviews-card">
                            <div className="userprofile-reviews-card-header">
                                <div className="userprofile-reviews-reviewer-info">
                                    {review.reviewer?.profile_picture_url ? (
                                        <img
                                            src={review.reviewer.profile_picture_url}
                                            alt={`${review.reviewer?.first_name} ${review.reviewer?.last_name}`}
                                            className="userprofile-reviews-reviewer-avatar"
                                            style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <FaUserCircle className="userprofile-reviews-reviewer-avatar" />
                                    )}
                                    <div>
                                        <h4 className="userprofile-reviews-reviewer-name">
                                            {review.reviewer?.first_name} {review.reviewer?.last_name}
                                        </h4>
                                        <p className="userprofile-reviews-date">{formatDate(review.createdAt)}</p>
                                    </div>
                                </div>
                                <div className="userprofile-reviews-rating">
                                    {renderStars(review.rating)}
                                </div>
                            </div>

                            <div className="userprofile-reviews-content">
                                {review.contract?.title && (
                                    <h5 className="userprofile-reviews-project-title">{review.contract.title}</h5>
                                )}
                                <p className="userprofile-reviews-text">{review.comment}</p>
                            </div>

                            {/* Freelancer Reply Section */}
                            {review.freelancerReply?.content && (
                                <div className="userprofile-reviews-reply">
                                    <div className="userprofile-reviews-reply-header">
                                        <FaReply className="userprofile-reviews-reply-icon" />
                                        <span className="userprofile-reviews-reply-label">Freelancer's Response</span>
                                        <span className="userprofile-reviews-reply-date">
                                            {formatDate(review.freelancerReply.updatedAt || review.freelancerReply.createdAt)}
                                        </span>
                                        {canReply(review) && editingReply !== review._id && (
                                            <div className="userprofile-reviews-reply-actions">
                                                <button
                                                    className="userprofile-reviews-reply-action-btn edit"
                                                    onClick={() => handleStartEdit(review)}
                                                    title="Edit reply"
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button
                                                    className="userprofile-reviews-reply-action-btn delete"
                                                    onClick={() => handleDeleteReply(review._id)}
                                                    title="Delete reply"
                                                    disabled={submitting}
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    {editingReply === review._id ? (
                                        <div className="userprofile-reviews-reply-form">
                                            <textarea
                                                value={replyContent}
                                                onChange={(e) => setReplyContent(e.target.value)}
                                                placeholder="Edit your reply..."
                                                maxLength={500}
                                                className="userprofile-reviews-reply-textarea"
                                            />
                                            <div className="userprofile-reviews-reply-form-footer">
                                                <span className="userprofile-reviews-char-count">
                                                    {replyContent.length}/500
                                                </span>
                                                <div className="userprofile-reviews-reply-form-actions">
                                                    <button
                                                        className="userprofile-reviews-reply-btn cancel"
                                                        onClick={handleCancel}
                                                        disabled={submitting}
                                                    >
                                                        <FaTimes /> Cancel
                                                    </button>
                                                    <button
                                                        className="userprofile-reviews-reply-btn submit"
                                                        onClick={() => handleUpdateReply(review._id)}
                                                        disabled={submitting || !replyContent.trim()}
                                                    >
                                                        <FaCheck /> {submitting ? 'Saving...' : 'Save'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="userprofile-reviews-reply-text">{review.freelancerReply.content}</p>
                                    )}
                                </div>
                            )}

                            {/* Reply Form (for new replies) */}
                            {replyingTo === review._id && (
                                <div className="userprofile-reviews-reply-form">
                                    <textarea
                                        value={replyContent}
                                        onChange={(e) => setReplyContent(e.target.value)}
                                        placeholder="Write your response to this review..."
                                        maxLength={500}
                                        className="userprofile-reviews-reply-textarea"
                                        autoFocus
                                    />
                                    <div className="userprofile-reviews-reply-form-footer">
                                        <span className="userprofile-reviews-char-count">
                                            {replyContent.length}/500
                                        </span>
                                        <div className="userprofile-reviews-reply-form-actions">
                                            <button
                                                className="userprofile-reviews-reply-btn cancel"
                                                onClick={handleCancel}
                                                disabled={submitting}
                                            >
                                                <FaTimes /> Cancel
                                            </button>
                                            <button
                                                className="userprofile-reviews-reply-btn submit"
                                                onClick={() => handleSubmitReply(review._id)}
                                                disabled={submitting || !replyContent.trim()}
                                            >
                                                <FaCheck /> {submitting ? 'Posting...' : 'Post Reply'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Reply Button */}
                            {canReply(review) && !review.freelancerReply?.content && replyingTo !== review._id && (
                                <button
                                    className="userprofile-reviews-add-reply-btn"
                                    onClick={() => handleStartReply(review._id)}
                                >
                                    <FaReply /> Reply to this review
                                </button>
                            )}

                            {review.contract && (
                                <div className="userprofile-reviews-footer">
                                    {review.contract.budget && (
                                        <span className="userprofile-reviews-budget">${review.contract.budget}</span>
                                    )}
                                    {review.contract.duration && (
                                        <span className="userprofile-reviews-duration">{review.contract.duration}</span>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ReviewsTab;
