import React from 'react';
import { FaExclamationTriangle, FaLock, FaDollarSign, FaFileContract, FaTimes } from 'react-icons/fa';
import './AcceptProposalModal.css';

function AcceptProposalModal({ proposal, userBalance, onConfirm, onCancel, loading }) {
    const bidAmount = proposal?.bidAmount || 0;
    const platformFee = bidAmount * 0.10;
    const freelancerReceives = bidAmount - platformFee;
    const hasEnoughBalance = userBalance >= bidAmount;

    return (
        <div className="modal-overlay" onClick={onCancel}>
            <div className="accept-modal" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={onCancel}>
                    <FaTimes />
                </button>

                <div className="modal-header">
                    <FaFileContract className="modal-icon" />
                    <h2>Accept Proposal & Create Contract</h2>
                </div>

                <div className="modal-body">
                    <div className="freelancer-info">
                        <div className="freelancer-avatar">
                            {proposal?.freelancer_id?.profile_picture ? (
                                <img src={proposal.freelancer_id.profile_picture} alt="Freelancer" />
                            ) : (
                                <div className="avatar-placeholder">
                                    {proposal?.freelancer_id?.first_name?.charAt(0)}
                                </div>
                            )}
                        </div>
                        <div className="freelancer-details">
                            <h3>{proposal?.freelancer_id?.first_name} {proposal?.freelancer_id?.last_name}</h3>
                            <p className="freelancer-email">{proposal?.freelancer_id?.email}</p>
                        </div>
                    </div>

                    <div className="payment-breakdown">
                        <h4>Payment Breakdown</h4>
                        <div className="breakdown-row">
                            <span>Contract Amount:</span>
                            <strong>${bidAmount.toLocaleString()}</strong>
                        </div>
                        <div className="breakdown-row">
                            <span>Platform Fee (10%):</span>
                            <span className="fee-amount">-${platformFee.toFixed(2)}</span>
                        </div>
                        <div className="breakdown-divider"></div>
                        <div className="breakdown-row total">
                            <span>Freelancer Receives:</span>
                            <strong className="amount-highlight">${freelancerReceives.toFixed(2)}</strong>
                        </div>
                    </div>

                    <div className="escrow-notice">
                        <div className="notice-header">
                            <FaLock className="notice-icon" />
                            <h4>Escrow Protection</h4>
                        </div>
                        <p>
                            <strong>${bidAmount.toLocaleString()}</strong> will be deducted from your balance and held securely in escrow.
                            The payment will be released to the freelancer only when you mark the project as complete.
                        </p>
                    </div>

                    <div className="balance-info">
                        <div className="balance-row">
                            <span>Current Balance:</span>
                            <strong>${userBalance.toLocaleString()}</strong>
                        </div>
                        <div className="balance-row">
                            <span>After Escrow:</span>
                            <strong className={hasEnoughBalance ? 'balance-after' : 'balance-insufficient'}>
                                ${(userBalance - bidAmount).toLocaleString()}
                            </strong>
                        </div>
                    </div>

                    {!hasEnoughBalance && (
                        <div className="insufficient-balance-warning">
                            <FaExclamationTriangle />
                            <div>
                                <strong>Insufficient Balance</strong>
                                <p>You need ${(bidAmount - userBalance).toLocaleString()} more to accept this proposal.</p>
                            </div>
                        </div>
                    )}

                    <div className="contract-details-info">
                        <h4>What happens next:</h4>
                        <ul>
                            <li><FaFileContract /> A contract will be created automatically</li>
                            <li><FaDollarSign /> Payment will be held in escrow</li>
                            <li>✓ Freelancer will be notified to start work</li>
                            <li>✓ Other proposals will be marked as "Not Selected"</li>
                        </ul>
                    </div>
                </div>

                <div className="modal-footer">
                    <button
                        className="btn-cancel"
                        onClick={onCancel}
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        className="btn-confirm"
                        onClick={onConfirm}
                        disabled={loading || !hasEnoughBalance}
                    >
                        {loading ? (
                            <>
                                <span className="spinner"></span>
                                Processing...
                            </>
                        ) : (
                            <>
                                <FaFileContract />
                                Confirm & Create Contract
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AcceptProposalModal;
