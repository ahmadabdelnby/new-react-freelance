import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getUserReviews } from '../../../Services/Reviews/ReviewsSlice';
import { FaStar } from 'react-icons/fa';
import './ReviewsTab.css';

const ReviewsTab = ({ userId }) => {
    const dispatch = useDispatch();
    const { reviews, loading, error } = useSelector((state) => state.reviews);

    useEffect(() => {
        if (userId) {
            dispatch(getUserReviews(userId));
        }
    }, [dispatch, userId]);

    const renderStars = (rating) => {
        return [...Array(5)].map((_, i) => (
            <FaStar key={`star-${i}`} className={i < rating ? 'star-filled' : 'star-empty'} />
        ));
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    };

    if (loading) {
        return (
            <div className="reviews-tab">
                <div className="reviews-loading">
                    <div className="spinner"></div>
                    <p>Loading reviews...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="reviews-tab">
                <div className="reviews-error">
                    <p>Error loading reviews: {error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="reviews-tab">
            <div className="reviews-header">
                <h3 className="reviews-title">Reviews</h3>
                <p className="reviews-count">{reviews?.length || 0} review{reviews?.length !== 1 ? 's' : ''}</p>
            </div>

            {!reviews || reviews.length === 0 ? (
                <div className="reviews-empty">
                    <p>No reviews yet</p>
                </div>
            ) : (
                <div className="reviews-list">
                    {reviews.map((review) => (
                        <div key={review._id} className="review-card">
                            <div className="review-header">
                                <div className="reviewer-info">
                                    <img
                                        src={review.reviewer?.profile_picture_url || '/default-avatar.png'}
                                        alt={`${review.reviewer?.first_name} ${review.reviewer?.last_name}`}
                                        className="reviewer-avatar"
                                    />
                                    <div>
                                        <h4 className="reviewer-name">
                                            {review.reviewer?.first_name} {review.reviewer?.last_name}
                                        </h4>
                                        <p className="review-date">{formatDate(review.createdAt)}</p>
                                    </div>
                                </div>
                                <div className="review-rating">
                                    {renderStars(review.rating)}
                                </div>
                            </div>

                            <div className="review-content">
                                <p className="review-text">{review.comment}</p>
                            </div>

                            {review.contract && (
                                <div className="review-footer">
                                    <small>Related to: {review.contract.title || 'Contract'}</small>
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
