import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getContractById, completeContract } from '../Services/Contracts/ContractsSlice.js';
import { getMyPayments } from '../Services/Payments/PaymentsSlice.js';
import ReviewWork from './ReviewWork';
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
  const { user } = useSelector((state) => state.auth);
  const [isCompleting, setIsCompleting] = useState(false);
  const [contractPayment, setContractPayment] = useState(null);

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

  const handleCompleteContract = async () => {
    if (!window.confirm('Are you sure you want to complete this contract? This will release the payment to the freelancer.')) {
      return;
    }

    setIsCompleting(true);
    try {
      await dispatch(completeContract(id)).unwrap();
      toast.success('Contract completed successfully! Payment has been released to the freelancer.');
      // Refresh contract data
      dispatch(getContractById(id));
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
  const isClient = user && contract.client && String(user._id) === String(contract.client._id);
  const isFreelancer = user && contract.freelancer && String(user._id) === String(contract.freelancer._id);
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

        {/* Main Content */}
        <div className="contract-content">
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
                    <span className="job-category">
                      {contract.job.category?.name || 'General'}
                    </span>
                    {contract.job.budget && (
                      <span className="job-budget">
                        Budget: ${contract.job.budget.min} - ${contract.job.budget.max}
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
                      {contract.client.profile_picture ? (
                        <img src={contract.client.profile_picture} alt={contract.client.first_name} />
                      ) : (
                        <FaUser />
                      )}
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
                      {contract.freelancer.profile_picture ? (
                        <img src={contract.freelancer.profile_picture} alt={contract.freelancer.first_name} />
                      ) : (
                        <FaUser />
                      )}
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
                  <span className="financial-label">Agreed Amount</span>
                  <span className="financial-value primary">${contract.agreedAmount?.toLocaleString()}</span>
                </div>
                <div className="financial-item">
                  <span className="financial-label">Platform Fee (10%)</span>
                  <span className="financial-value">${(contract.agreedAmount * 0.10).toFixed(2)}</span>
                </div>
                <div className="financial-item">
                  <span className="financial-label">Freelancer Receives</span>
                  <span className="financial-value success">${(contract.agreedAmount * 0.90).toFixed(2)}</span>
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
                        Status: {contractPayment.status.replace('_', ' ').toUpperCase()}
                        {contractPayment.transactionId && ` | ID: ${contractPayment.transactionId}`}
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
                      <div className="deliverable-info">
                        <div className="deliverable-status">
                          {deliverable.status === 'pending_review' && (
                            <span className="status-badge status-pending">⏳ Pending Review</span>
                          )}
                          {deliverable.status === 'accepted' && (
                            <span className="status-badge status-accepted">✅ Accepted</span>
                          )}
                          {deliverable.status === 'revision_requested' && (
                            <span className="status-badge status-revision">🔄 Revision Requested</span>
                          )}
                        </div>
                        <p className="deliverable-desc">{deliverable.description}</p>
                        {deliverable.revisionNote && (
                          <div className="revision-note">
                            <strong>Revision Note:</strong> {deliverable.revisionNote}
                          </div>
                        )}
                        <small className="deliverable-date">
                          Submitted: {new Date(deliverable.submittedAt).toLocaleDateString()}
                        </small>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {contract.status === 'completed' && (
            <div className="contract-completed-notice">
              <FaCheckCircle />
              <div>
                <h3>Contract Completed</h3>
                <p>This contract has been successfully completed and the payment has been released.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContractDetails;
