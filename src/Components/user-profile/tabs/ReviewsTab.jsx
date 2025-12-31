import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getUserReviews } from '../../../Services/Reviews/ReviewsSlice';
import { FaStar, FaUserCircle } from 'react-icons/fa';
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
            <FaStar key={`star-${i}`} className={i < rating ? 'userprofile-reviews-star-filled' : 'userprofile-reviews-star-empty'} />
        ));
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
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
