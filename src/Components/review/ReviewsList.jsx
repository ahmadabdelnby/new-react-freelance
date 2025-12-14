import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getUserReviews } from '../../Services/Reviews/ReviewsSlice';
import { FaStar } from 'react-icons/fa';
import './ReviewsList.css';

const ReviewsList = ({ userId }) => {
    const dispatch = useDispatch();
    const { reviews, loading, error } = useSelector((state) => state.reviews);

    useEffect(() => {
        if (userId) {
            dispatch(getUserReviews(userId));
        }
    }, [dispatch, userId]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    };

    const renderStars = (rating) => {
        return (
            <div className="stars">
                {[1, 2, 3, 4, 5].map((star) => (
                    <FaStar
                        key={star}
                        className={star <= rating ? 'star-filled' : 'star-empty'}
                    />
                ))}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="reviews-list-loading">
                <div className="spinner"></div>
                <p>Loading reviews...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="reviews-list-error">
                <p>Error loading reviews: {error}</p>
            </div>
        );
    }

    if (!reviews || reviews.length === 0) {
        return (
            <div className="reviews-list-empty">
                <p>No reviews yet</p>
            </div>
        );
    }

    return (
        <div className="reviews-list">
            <div className="reviews-header">
                <h3>{reviews.length} Review{reviews.length !== 1 ? 's' : ''}</h3>
            </div>

            <div className="reviews-container">
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
                            {renderStars(review.rating)}
                        </div>

                        <div className="review-body">
                            <p className="review-comment">{review.comment}</p>
                        </div>

                        {review.contract && (
                            <div className="review-contract-info">
                                <small>Related to contract: {review.contract.title || 'Untitled'}</small>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ReviewsList;
