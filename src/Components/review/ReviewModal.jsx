import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { submitReview } from '../../Services/Reviews/ReviewsSlice';
import { FaStar, FaTimes } from 'react-icons/fa';
import './ReviewModal.css';

const ReviewModal = ({ contract, revieweeId, revieweeName, onClose, onSuccess }) => {
    const dispatch = useDispatch();
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (rating === 0) {
            setError('Please select a rating');
            return;
        }

        if (comment.trim().length < 10) {
            setError('Comment must be at least 10 characters');
            return;
        }

        setSubmitting(true);
        setError('');

        try {
            await dispatch(submitReview({
                contract: contract._id,
                reviewer: contract.client === revieweeId ? contract.freelancer : contract.client,
                reviewee: revieweeId,
                rating,
                comment: comment.trim()
            })).unwrap();

            onSuccess();
            onClose();
        } catch (err) {
            setError(err || 'Failed to submit review');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="review-modal-overlay" onClick={onClose}>
            <div className="review-modal" onClick={(e) => e.stopPropagation()}>
                <div className="review-modal-header">
                    <h3>Review {revieweeName}</h3>
                    <button className="close-btn" onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="review-form">
                    {error && (
                        <div className="alert alert-danger">{error}</div>
                    )}

                    <div className="form-group">
                        <label>Rating *</label>
                        <div className="star-rating">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <FaStar
                                    key={star}
                                    className={`star ${star <= (hoverRating || rating) ? 'active' : ''}`}
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                />
                            ))}
                        </div>
                        <small className="rating-text">
                            {rating === 0 ? 'Select a rating' : `${rating} star${rating > 1 ? 's' : ''}`}
                        </small>
                    </div>

                    <div className="form-group">
                        <label>Comment *</label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Share your experience working with this person..."
                            rows="5"
                            className="form-control"
                            maxLength="500"
                            required
                        />
                        <small className="char-count">
                            {comment.length}/500 characters
                        </small>
                    </div>

                    <div className="form-actions">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={onClose}
                            disabled={submitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={submitting || rating === 0}
                        >
                            {submitting ? 'Submitting...' : 'Submit Review'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReviewModal;
