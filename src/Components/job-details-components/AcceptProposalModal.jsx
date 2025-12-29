import React from 'react';
import { createPortal } from 'react-dom';
import { getImageUrl } from '../../Services/imageUtils';
import './AcceptProposalModal.css';

function AcceptProposalModal({ proposal, userBalance, onConfirm, onCancel, loading, job }) {
    const bidAmount = proposal?.bidAmount || 0;
    const platformFee = bidAmount * 0.10;
    const freelancerReceives = bidAmount - platformFee;
    const hasEnoughBalance = userBalance >= bidAmount;

    // 🔥 Check if bid amount differs from job budget
    const jobBudgetAmount = job?.budget?.amount || 0;
    const budgetDiffers = jobBudgetAmount > 0 && bidAmount !== jobBudgetAmount;
    const budgetDifference = bidAmount - jobBudgetAmount;
    const budgetDifferencePercent = jobBudgetAmount > 0
        ? ((budgetDifference / jobBudgetAmount) * 100).toFixed(1)
        : 0;

    // 🔥 Check if delivery time differs from job duration
    const proposalDeliveryTime = proposal?.deliveryTime;
    const jobDuration = job?.duration;
    let deliveryTimeDiffers = false;
    let jobDurationInDays = null;

    if (proposalDeliveryTime && jobDuration) {
        // Convert job duration to days
        if (typeof jobDuration === 'number') {
            jobDurationInDays = jobDuration;
        } else if (jobDuration.value) {
            const value = jobDuration.value;
            const unit = jobDuration.unit || 'days';

            switch (unit) {
                case 'days':
                    jobDurationInDays = value;
                    break;
                case 'weeks':
                    jobDurationInDays = value * 7;
                    break;
                case 'months':
                    jobDurationInDays = value * 30;
                    break;
                default:
                    jobDurationInDays = value;
            }
        }

        deliveryTimeDiffers = jobDurationInDays && proposalDeliveryTime !== jobDurationInDays;
    }

    const modalContent = (
        <div className="accept-proposal-overlay" onClick={onCancel}>
            <div className="accept-modal" onClick={(e) => e.stopPropagation()}>
                <button className="accept-modal-close-btn" onClick={onCancel}>
                    ×
                </button>

                <div className="accept-modal-header">
                    <h2>Accept Proposal & Create Contract</h2>
                </div>

                <div className="accept-modal-body">
                    <div className="accept-freelancer-info">
                        <div className="accept-freelancer-avatar">
                            {proposal?.freelancer_id?.profile_picture ? (
                                <img src={getImageUrl(proposal.freelancer_id.profile_picture)} alt="Freelancer" />
                            ) : (
                                <div className="avatar-placeholder">
                                    {proposal?.freelancer_id?.first_name?.charAt(0)}
                                </div>
                            )}
                        </div>
                        <div className="accept-freelancer-details">
                            <h3>{proposal?.freelancer_id?.first_name} {proposal?.freelancer_id?.last_name}</h3>
                            <p className="accept-freelancer-email">{proposal?.freelancer_id?.email}</p>
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
                            <div>
                                <strong>Insufficient Balance</strong>
                                <p>You need ${(bidAmount - userBalance).toLocaleString()} more to accept this proposal.</p>
                            </div>
                        </div>
                    )}

                    {budgetDiffers && (
                        <div className={`budget-difference-warning ${budgetDifference > 0 ? 'higher' : 'lower'}`}>
                            <div className="warning-icon">{budgetDifference > 0 ? '💰' : '💵'}</div>
                            <div>
                                <strong>{budgetDifference > 0 ? 'Higher Bid Amount' : 'Lower Bid Amount'}</strong>
                                <p>
                                    The freelancer's bid of <strong>${bidAmount.toLocaleString()}</strong> is{' '}
                                    {budgetDifference > 0 ? (
                                        <>
                                            <strong>${Math.abs(budgetDifference).toLocaleString()}</strong> higher
                                        </>
                                    ) : (
                                        <>
                                            <strong>${Math.abs(budgetDifference).toLocaleString()}</strong> lower
                                        </>
                                    )}{' '}
                                    ({budgetDifference > 0 ? '+' : ''}{budgetDifferencePercent}%)
                                    than your specified budget of <strong>${jobBudgetAmount.toLocaleString()}</strong>.
                                    {budgetDifference > 0 ? ' This will cost you more than expected.' : ' This is within your budget!'}
                                </p>
                            </div>
                        </div>
                    )}

                    {deliveryTimeDiffers && (
                        <div className="delivery-time-warning">
                            <div className="warning-icon">⚠️</div>
                            <div>
                                <strong>Different Delivery Time</strong>
                                <p>
                                    The freelancer proposed <strong>{proposalDeliveryTime} days</strong> delivery time,
                                    which differs from your specified duration of <strong>{jobDurationInDays} days</strong>.
                                    The contract will use the freelancer's proposed delivery time.
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="contract-details-info">
                        <h4>What happens next:</h4>
                        <ul>
                            <li>A contract will be created automatically</li>
                            <li>Payment will be held in escrow</li>
                            <li>Freelancer will be notified to start work</li>
                            <li>Other proposals will be marked as "Not Selected"</li>
                            {deliveryTimeDiffers && (
                                <li><strong>Deadline: {proposalDeliveryTime} days from contract start</strong></li>
                            )}
                        </ul>
                    </div>
                </div>

                <div className="accept-modal-footer">
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
                            'Confirm & Create Contract'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );

    // Render modal using React Portal to attach it to document.body
    return createPortal(modalContent, document.body);
}

export default AcceptProposalModal;
