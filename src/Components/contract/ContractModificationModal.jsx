import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { API_ENDPOINTS } from '../../Services/config';
import {
    FaEdit,
    FaDollarSign,
    FaCalendarAlt,
    FaSpinner,
    FaTimes
} from 'react-icons/fa';
import './ContractModificationModal.css';

const ContractModificationModal = ({ isOpen, onClose, contract, onRequestSubmitted }) => {
    const { token } = useSelector((state) => state.auth);
    const [modificationType, setModificationType] = useState('');
    const [requestedBudget, setRequestedBudget] = useState(contract?.agreedAmount || '');
    const [requestedDeliveryTime, setRequestedDeliveryTime] = useState(contract?.agreedDeliveryTime || '');
    const [reason, setReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen || !contract) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!modificationType) {
            toast.error('Please select a modification type');
            return;
        }

        if (!reason.trim()) {
            toast.error('Please provide a reason for the modification');
            return;
        }

        if ((modificationType === 'budget' || modificationType === 'both') && (!requestedBudget || requestedBudget <= 0)) {
            toast.error('Please enter a valid budget amount');
            return;
        }

        if ((modificationType === 'deadline' || modificationType === 'both') && (!requestedDeliveryTime || requestedDeliveryTime < 1)) {
            toast.error('Please enter a valid delivery time (at least 1 day)');
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch(API_ENDPOINTS.CONTRACT_MODIFICATIONS, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    contractId: contract._id,
                    modificationType,
                    requestedBudget: (modificationType === 'budget' || modificationType === 'both') ? Number(requestedBudget) : undefined,
                    requestedDeliveryTime: (modificationType === 'deadline' || modificationType === 'both') ? Number(requestedDeliveryTime) : undefined,
                    reason
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to submit modification request');
            }

            toast.success('Modification request submitted successfully!');
            onRequestSubmitted && onRequestSubmitted(data.data);
            onClose();
        } catch (error) {
            toast.error(error.message || 'Failed to submit modification request');
        } finally {
            setIsSubmitting(false);
        }
    };

    const budgetDifference = requestedBudget ? Number(requestedBudget) - contract.agreedAmount : 0;

    return (
        <div className="modification-modal-overlay" onClick={onClose}>
            <div className="modification-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modification-modal-header">
                    <h2><FaEdit /> Request Contract Modification</h2>
                    <button className="close-btn" onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>

                <div className="modification-modal-body">
                    <div className="current-values-section">
                        <h4>Current Contract Values</h4>
                        <div className="current-values-grid">
                            <div className="current-value-item">
                                <FaDollarSign />
                                <span className="label">Budget:</span>
                                <span className="value">${contract.agreedAmount?.toLocaleString()}</span>
                            </div>
                            <div className="current-value-item">
                                <FaCalendarAlt />
                                <span className="label">Delivery Time:</span>
                                <span className="value">{contract.agreedDeliveryTime} days</span>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Modification Type *</label>
                            <div className="modification-type-options">
                                <label className={`type-option ${modificationType === 'budget' ? 'selected' : ''}`}>
                                    <input
                                        type="radio"
                                        name="modificationType"
                                        value="budget"
                                        checked={modificationType === 'budget'}
                                        onChange={(e) => setModificationType(e.target.value)}
                                    />
                                    <FaDollarSign />
                                    <span>Budget Only</span>
                                </label>
                                <label className={`type-option ${modificationType === 'deadline' ? 'selected' : ''}`}>
                                    <input
                                        type="radio"
                                        name="modificationType"
                                        value="deadline"
                                        checked={modificationType === 'deadline'}
                                        onChange={(e) => setModificationType(e.target.value)}
                                    />
                                    <FaCalendarAlt />
                                    <span>Deadline Only</span>
                                </label>
                                <label className={`type-option ${modificationType === 'both' ? 'selected' : ''}`}>
                                    <input
                                        type="radio"
                                        name="modificationType"
                                        value="both"
                                        checked={modificationType === 'both'}
                                        onChange={(e) => setModificationType(e.target.value)}
                                    />
                                    <FaEdit />
                                    <span>Both</span>
                                </label>
                            </div>
                        </div>

                        {(modificationType === 'budget' || modificationType === 'both') && (
                            <div className="form-group">
                                <label>New Budget Amount ($) *</label>
                                <div className="input-with-icon">
                                    <FaDollarSign />
                                    <input
                                        type="number"
                                        min="1"
                                        step="0.01"
                                        value={requestedBudget}
                                        onChange={(e) => setRequestedBudget(e.target.value)}
                                        placeholder="Enter new budget amount"
                                    />
                                </div>
                                {budgetDifference !== 0 && (
                                    <div className={`budget-difference ${budgetDifference > 0 ? 'increase' : 'decrease'}`}>
                                        {budgetDifference > 0 ? (
                                            <span>📈 Budget increase: +${budgetDifference.toFixed(2)} (Client will pay the difference)</span>
                                        ) : (
                                            <span>📉 Budget decrease: -${Math.abs(budgetDifference).toFixed(2)} (Client will be refunded)</span>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {(modificationType === 'deadline' || modificationType === 'both') && (
                            <div className="form-group">
                                <label>New Delivery Time (days) *</label>
                                <div className="input-with-icon">
                                    <FaCalendarAlt />
                                    <input
                                        type="number"
                                        min="1"
                                        value={requestedDeliveryTime}
                                        onChange={(e) => setRequestedDeliveryTime(e.target.value)}
                                        placeholder="Enter new delivery time in days"
                                    />
                                </div>
                                {requestedDeliveryTime && requestedDeliveryTime !== contract.agreedDeliveryTime && (
                                    <div className="delivery-difference">
                                        {requestedDeliveryTime > contract.agreedDeliveryTime ? (
                                            <span>📅 Extension: +{requestedDeliveryTime - contract.agreedDeliveryTime} days</span>
                                        ) : (
                                            <span>📅 Reduction: -{contract.agreedDeliveryTime - requestedDeliveryTime} days</span>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="form-group">
                            <label>Reason for Modification *</label>
                            <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Please explain why you need this modification..."
                                maxLength={1000}
                                rows={4}
                            />
                            <span className="char-count">{reason.length}/1000</span>
                        </div>

                        <div className="modification-modal-actions">
                            <button type="button" className="btn-cancel" onClick={onClose}>
                                Cancel
                            </button>
                            <button type="submit" className="btn-submit" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <FaSpinner className="spinner" /> Submitting...
                                    </>
                                ) : (
                                    'Submit Request'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ContractModificationModal;
