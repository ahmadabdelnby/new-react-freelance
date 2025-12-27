import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaStar, FaTimes, FaClock } from 'react-icons/fa';
import './ReviewPromptModal.css';

function ReviewPromptModal({ isOpen, onClose, contractId, otherPartyName, isClient }) {
    const navigate = useNavigate();

    if (!isOpen) return null;

    const handleReviewNow = () => {
        navigate(`/contracts/${contractId}/review`, {
            state: { from: `/contracts/${contractId}` }
        });
    };

    const handleReviewLater = () => {
        onClose();
    };

    return (
        <div className="review-prompt-overlay" onClick={handleReviewLater}>
            <div className="review-prompt-modal" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={handleReviewLater}>
                    <FaTimes />
                </button>

                <div className="modal-icon-success">
                    <svg viewBox="0 0 100 100" className="success-checkmark">
                        <circle cx="50" cy="50" r="45" fill="none" stroke="#28a745" strokeWidth="5" />
                        <path d="M30 50 L45 65 L70 35" fill="none" stroke="#28a745" strokeWidth="5" strokeLinecap="round" />
                    </svg>
                </div>

                <h2>Contract Completed Successfully!</h2>
                <p className="modal-subtitle">
                    {isClient ? `Payment has been released to ${otherPartyName}` : `You have received payment for this contract`}
                </p>

                <div className="review-prompt-content">
                    <FaStar className="star-icon" />
                    <h3>Would you like to leave a review?</h3>
                    <p>
                        Share your experience working with {otherPartyName}.
                        Your feedback helps build trust in our community.
                    </p>
                </div>

                <div className="modal-actions">
                    <button className="btn-review-now" onClick={handleReviewNow}>
                        <FaStar />
                        Review Now
                    </button>
                    <button className="btn-review-later" onClick={handleReviewLater}>
                        <FaClock />
                        Review Later
                    </button>
                </div>

                <p className="modal-note">
                    You can always review this contract later from the contract details page.
                </p>
            </div>
        </div>
    );
}

export default ReviewPromptModal;
