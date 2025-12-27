import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getContractById, completeContract } from '../Services/Contracts/ContractsSlice.js';
import { getMyPayments } from '../Services/Payments/PaymentsSlice.js';
import { useBalanceSync } from '../hooks/useBalanceSync';
import ReviewWork from './ReviewWork';
import ReviewPromptModal from '../Components/common/ReviewPromptModal';
import { getImageUrl } from '../Services/imageUtils';
import TimeProgressBar from '../Components/common/TimeProgressBar';
import { API_ENDPOINTS } from '../Services/config';
import {
  FaFileContract,
  FaBriefcase,
  FaUser,
  FaDollarSign,
  FaCalendarAlt,
  FaCheckCircle,
  FaClock,
  FaExclamationCircle,
  FaSpinner,
  FaArrowLeft,
  FaReceipt,
  FaPaperPlane
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import './ContractDetails.css';

const ContractDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentContract, loading } = useSelector((state) => state.contracts);
  const { payments } = useSelector((state) => state.payments);
  const { user, token } = useSelector((state) => state.auth);
  const [isCompleting, setIsCompleting] = useState(false);
  const [contractPayment, setContractPayment] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [checkingReview, setCheckingReview] = useState(true);
  const { refreshBalance } = useBalanceSync();

  useEffect(() => {
    if (id) {
      dispatch(getContractById(id));
      dispatch(getMyPayments());
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (currentContract && payments) {
      const paymentsArray = Array.isArray(payments) ? payments : (payments?.payments || []);
      const payment = paymentsArray.find(p =>
        String(p.contract?._id || p.contract) === String(currentContract._id)
      );
      setContractPayment(payment);
    }
  }, [currentContract, payments]);

  // Check if user has already reviewed this contract
  useEffect(() => {
    const checkExistingReview = async () => {
      if (!currentContract || !user || !token) {
        setCheckingReview(false);
        return;
      }

      try {
        const response = await fetch(
          API_ENDPOINTS.REVIEWS_BY_CONTRACT(currentContract._id),
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        if (response.ok) {
          const reviews = await response.json();
          // Check if current user has already reviewed
          const actualUser = user?.user || user;
          const userId = actualUser._id || actualUser.id || actualUser.userId;
          const userReview = reviews.find(
            (review) => String(review.reviewer?._id || review.reviewer) === String(userId)
          );
          setHasReviewed(!!userReview);
        }
      } catch (error) {
        console.error('Error checking review:', error);
      } finally {
        setCheckingReview(false);
      }
    };

    checkExistingReview();
  }, [currentContract, user, token]);

  const handleCompleteContract = async () => {
    if (!window.confirm('Are you sure you want to complete this contract? This will release the payment to the freelancer.')) {
      return;
    }

    setIsCompleting(true);
    try {
      await dispatch(completeContract(id)).unwrap();

      // Scroll to top to show success message
      window.scrollTo({ top: 0, behavior: 'smooth' });

      toast.success('Contract completed successfully! Payment has been released to the freelancer.');

      // Refresh balance (freelancer received payment)
      await refreshBalance();

      // Refresh contract data
      dispatch(getContractById(id));

      // Show review prompt modal instead of auto-redirect
      setShowReviewModal(true);
    } catch (error) {
      toast.error(error || 'Failed to complete contract');
    } finally {
      setIsCompleting(false);
    }
  };

  if (loading && !currentContract) {
    return (
      <div className="contract-details-page">
        <div className="contract-loading">
          <FaSpinner className="spinner" />
          <p>Loading contract details...</p>
        </div>
      </div>
    );
  }

  if (!currentContract) {
    return (
      <div className="contract-details-page">
        <div className="contract-not-found">
          <FaExclamationCircle size={64} />
          <h2>Contract Not Found</h2>
          <p>The contract you're looking for doesn't exist or you don't have access to it.</p>
          <Link to="/contracts" className="btn-back">
            <FaArrowLeft /> Back to My Contracts
          </Link>
        </div>
      </div>
    );
  }

  const contract = currentContract;
  // Handle nested user object structure from Redux
  const actualUser = user?.user || user;
  const userId = actualUser?._id || actualUser?.id || actualUser?.userId;
  const isClient = userId && contract.client && String(userId) === String(contract.client._id || contract.client);
  const isFreelancer = userId && contract.freelancer && String(userId) === String(contract.freelancer._id || contract.freelancer);
  const canComplete = isClient && contract.status === 'active';

  const getStatusBadge = (status) => {
    const badges = {
      active: { class: 'status-active', label: 'Active', icon: FaClock },
      completed: { class: 'status-completed', label: 'Completed', icon: FaCheckCircle },
      cancelled: { class: 'status-cancelled', label: 'Cancelled', icon: FaExclamationCircle },
      disputed: { class: 'status-disputed', label: 'Disputed', icon: FaExclamationCircle }
    };
    return badges[status] || { class: 'status-default', label: status, icon: FaClock };
  };

  const statusBadge = getStatusBadge(contract.status);
  const StatusIcon = statusBadge.icon;

  return (
    <div className="contract-details-page">
      <div className="contract-details-container">
        <div className="container">
          {/* Header */}
          <div className="contract-header">
            <div className="contract-header-top">
              <Link to="/contracts" className="back-link">
                <FaArrowLeft /> My Contracts
              </Link>
              <div className={`contract-status-badge ${statusBadge.class}`}>
                <StatusIcon />
                <span>{statusBadge.label}</span>
              </div>
            </div>

            <h1 className="contract-title">
              <FaFileContract /> Contract Details
            </h1>
            <p className="contract-id">Contract ID: {contract._id}</p>
          </div>

          {/* Time Progress Section */}
          {contract.startDate && (
            <TimeProgressBar
              startDate={contract.startDate}
              deadline={contract.deadline}
              duration={contract.job?.duration}
              deliveryTime={contract.proposal?.deliveryTime}
              compact={false}
            />
          )}

          {/* Main Content */}
          {/* Job Information */}
          <div className="contract-section">
            <div className="section-header">
              <FaBriefcase className="section-icon" />
              <h2>Job Information</h2>
            </div>
            <div className="section-content">
              {contract.job ? (
                <>
                  <Link to={`/job/${contract.job._id}`} className="job-title-link">
                    {contract.job.title}
                  </Link>
                  <p className="job-description">{contract.job.description}</p>
                  <div className="job-meta">
                    {contract.job.category?.name && (
                      <span className="job-category">
                        {contract.job.category.name}
                      </span>
                    )}
                    {contract.job.budget?.amount && (
                      <span className="job-budget">
                        Budget: ${contract.job.budget.amount} ({contract.job.budget.type})
                      </span>
                    )}
                  </div>
                </>
              ) : (
                <p className="no-data">Job information not available</p>
              )}
            </div>
          </div>

          {/* Parties Information */}
          <div className="contract-parties">
            {/* Client */}
            <div className="contract-section party-section">
              <div className="section-header">
                <FaUser className="section-icon" />
                <h2>Client</h2>
              </div>
              <div className="section-content">
                {contract.client ? (
                  <div className="party-info">
                    <div className="party-avatar">
                      <img
                        src={getImageUrl(contract.client.profile_picture)}
                        alt={contract.client.first_name}
                      />
                    </div>
                    <div className="party-details">
                      <Link to={`/freelancer/${contract.client._id}`} className="party-name">
                        {contract.client.first_name} {contract.client.last_name}
                      </Link>
                      <p className="party-email">{contract.client.email}</p>
                      {isClient && <span className="you-badge">You</span>}
                    </div>
                  </div>
                ) : (
                  <p className="no-data">Client information not available</p>
                )}
              </div>
            </div>

            {/* Freelancer */}
            <div className="contract-section party-section">
              <div className="section-header">
                <FaUser className="section-icon" />
                <h2>Freelancer</h2>
              </div>
              <div className="section-content">
                {contract.freelancer ? (
                  <div className="party-info">
                    <div className="party-avatar">
                      <img
                        src={getImageUrl(contract.freelancer.profile_picture)}
                        alt={contract.freelancer.first_name}
                      />
                    </div>
                    <div className="party-details">
                      <Link to={`/freelancer/${contract.freelancer._id}`} className="party-name">
                        {contract.freelancer.first_name} {contract.freelancer.last_name}
                      </Link>
                      <p className="party-email">{contract.freelancer.email}</p>
                      {isFreelancer && <span className="you-badge">You</span>}
                    </div>
                  </div>
                ) : (
                  <p className="no-data">Freelancer information not available</p>
                )}
              </div>
            </div>
          </div>

          {/* Financial Details */}
          <div className="contract-section financial-section">
            <div className="section-header">
              <FaDollarSign className="section-icon" />
              <h2>Financial Details</h2>
            </div>
            <div className="section-content">
              <div className="financial-grid">
                <div className="financial-item">
                  <span className="financial-label">Contract Amount</span>
                  <span className="financial-value primary">${contract.agreedAmount?.toLocaleString()}</span>
                </div>
                <div className="financial-item">
                  <span className="financial-label">Platform Fee (10%)</span>
                  <span className="financial-value">${((contract.agreedAmount || 0) * 0.10).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="financial-item">
                  <span className="financial-label">Freelancer Receives</span>
                  <span className="financial-value success">${((contract.agreedAmount || 0) * 0.90).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="financial-item">
                  <span className="financial-label">Budget Type</span>
                  <span className="financial-value">{contract.budgetType === 'fixed' ? 'Fixed Price' : 'Hourly Rate'}</span>
                </div>
                <div className="financial-item">
                  <span className="financial-label">Payment Status</span>
                  <span className="financial-value">
                    {contract.status === 'completed' ? (
                      <span className="payment-released">✓ Released</span>
                    ) : (
                      <span className="payment-escrow">🔒 In Escrow</span>
                    )}
                  </span>
                </div>
              </div>

              {contract.status === 'active' && (
                <div className="escrow-notice">
                  <FaExclamationCircle />
                  <p>Payment is securely held in escrow and will be released when the contract is completed.</p>
                </div>
              )}

              {contractPayment && (
                <div className="payment-link-section">
                  <Link to={`/payments/${contractPayment._id}`} className="payment-link-card">
                    <FaReceipt />
                    <div className="payment-link-info">
                      <span className="payment-link-label">View Payment Details</span>
                      <span className="payment-link-status">
                        Status: {contractPayment.status?.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <span className="payment-link-arrow">→</span>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="contract-section">
            <div className="section-header">
              <FaCalendarAlt className="section-icon" />
              <h2>Timeline</h2>
            </div>
            <div className="section-content">
              <div className="timeline-grid">
                <div className="timeline-item">
                  <span className="timeline-label">Start Date</span>
                  <span className="timeline-value">
                    {new Date(contract.startDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                {contract.endDate && (
                  <div className="timeline-item">
                    <span className="timeline-label">Completion Date</span>
                    <span className="timeline-value">
                      {new Date(contract.endDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                )}
                {contract.status === 'active' && (
                  <div className="timeline-item">
                    <span className="timeline-label">Days Active</span>
                    <span className="timeline-value">
                      {Math.floor((new Date() - new Date(contract.startDate)) / (1000 * 60 * 60 * 24))} days
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          {contract.description && (
            <div className="contract-section">
              <div className="section-header">
                <FaFileContract className="section-icon" />
                <h2>Contract Description</h2>
              </div>
              <div className="section-content">
                <p className="contract-description">{contract.description}</p>
              </div>
            </div>
          )}

          {/* Actions */}
          {canComplete && (
            <div className="contract-actions">
              <button
                onClick={handleCompleteContract}
                disabled={isCompleting}
                className="btn-complete-contract"
              >
                {isCompleting ? (
                  <>
                    <FaSpinner className="spinner" /> Completing...
                  </>
                ) : (
                  <>
                    <FaCheckCircle /> Complete Contract
                  </>
                )}
              </button>
              <p className="complete-notice">
                This will mark the contract as completed and release the payment to the freelancer.
              </p>
            </div>
          )}

          {/* Submit Work Button - Freelancer Only */}
          {!isClient && contract.status === 'active' && (
            <div className="contract-actions">
              <Link to={`/contracts/${contract._id}/submit-work`} className="btn-submit-work">
                <FaPaperPlane /> Submit Work
              </Link>
              <p className="submit-notice">
                Upload your deliverables and submit your work for review
              </p>
            </div>
          )}

          {/* Deliverables Section */}
          {contract.deliverables && contract.deliverables.length > 0 && (
            <div className="contract-section deliverables-section">
              <div className="section-header">
                <FaPaperPlane className="section-icon" />
                <h2>Work Submissions</h2>
              </div>
              <div className="section-content">
                {contract.deliverables.map((deliverable, index) => (
                  <div key={deliverable._id || index}>
                    {isClient ? (
                      <ReviewWork
                        deliverable={deliverable}
                        contractId={contract._id}
                        onReviewComplete={() => dispatch(getContractById(id))}
                      />
                    ) : (
                      <div className="deliverable-card">
                        <div className="deliverable-header">
                          <div className="deliverable-info-header">
                            <FaPaperPlane className="deliverable-icon" />
                            <span className="deliverable-number">Submission #{index + 1}</span>
                          </div>
                          <div className="deliverable-status-badge">
                            {deliverable.status === 'pending_review' && (
                              <span className="status-badge status-pending">
                                <span className="status-icon">⏳</span>
                                Pending Review
                              </span>
                            )}
                            {deliverable.status === 'accepted' && (
                              <span className="status-badge status-accepted">
                                <span className="status-icon">✅</span>
                                Accepted
                              </span>
                            )}
                            {deliverable.status === 'revision_requested' && (
                              <span className="status-badge status-revision">
                                <span className="status-icon">⚠️</span>
                                Revision Requested
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="deliverable-body">
                          <div className="deliverable-description">
                            <strong>Description:</strong>
                            <p>{deliverable.description}</p>
                          </div>

                          {deliverable.files && deliverable.files.length > 0 && (
                            <div className="deliverable-files">
                              <strong>Files:</strong>
                              <ul className="files-list">
                                {deliverable.files.map((file, fileIndex) => (
                                  <li key={fileIndex}>
                                    <a href={file.url} target="_blank" rel="noopener noreferrer">
                                      {file.name || `File ${fileIndex + 1}`}
                                    </a>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {deliverable.revisionNote && (
                            <div className="revision-note-card">
                              <div className="revision-note-header">
                                <FaExclamationCircle />
                                <strong>Client Feedback:</strong>
                              </div>
                              <p>{deliverable.revisionNote}</p>
                            </div>
                          )}

                          <div className="deliverable-timeline">
                            <div className="timeline-item">
                              <FaClock className="timeline-icon" />
                              <span>
                                Submitted: {new Date(deliverable.submittedAt).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                            {deliverable.reviewedAt && (
                              <div className="timeline-item">
                                <FaCheckCircle className="timeline-icon" />
                                <span>
                                  Reviewed: {new Date(deliverable.reviewedAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {contract.status === 'completed' && isClient && !checkingReview && (
            <div className="contract-completed-notice">
              <FaCheckCircle />
              <div>
                <h3>Contract Completed</h3>
                <p>This contract has been successfully completed and the payment has been released.</p>

                {!hasReviewed ? (
                  <Link
                    to={`/contracts/${contract._id}/review`}
                    className="btn btn-primary mt-3"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                  >
                    <FaCheckCircle />
                    Leave a Review for {isClient ? contract.freelancer?.first_name : contract.client?.first_name}
                  </Link>
                ) : (
                  <div className="review-completed-notice">
                    <FaCheckCircle style={{ color: '#28a745', marginRight: '8px' }} />
                    <span style={{ color: '#28a745', fontWeight: '500' }}>You have already reviewed this contract</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Review Prompt Modal */}
          <ReviewPromptModal
            isOpen={showReviewModal}
            onClose={() => setShowReviewModal(false)}
            contractId={contract._id}
            otherPartyName={isClient ? (contract.freelancer?.first_name || 'the freelancer') : (contract.client?.first_name || 'the client')}
            isClient={isClient}
          />
        </div>
      </div>
    </div>
  );
};

export default ContractDetails;
