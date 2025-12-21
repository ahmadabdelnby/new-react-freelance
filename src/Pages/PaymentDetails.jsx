import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getPaymentById } from '../Services/Payments/PaymentsSlice';
import { 
  FaDollarSign, 
  FaArrowLeft,
  FaArrowUp,
  FaArrowDown,
  FaUser,
  FaClock,
  FaCheckCircle,
  FaExclamationCircle,
  FaSpinner,
  FaFileContract,
  FaCalendarAlt,
  FaLock,
  FaUnlock,
  FaReceipt
} from 'react-icons/fa';
import './PaymentDetails.css';

const PaymentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentPayment, loading } = useSelector((state) => state.payments);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (id) {
      dispatch(getPaymentById(id));
    }
  }, [id, dispatch]);

  if (loading && !currentPayment) {
    return (
      <div className="payment-details-page">
        <div className="payment-loading">
          <FaSpinner className="spinner" />
          <p>Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (!currentPayment) {
    return (
      <div className="payment-details-page">
        <div className="payment-not-found">
          <FaExclamationCircle size={64} />
          <h2>Payment Not Found</h2>
          <p>The payment you're looking for doesn't exist or you don't have access to it.</p>
          <Link to="/payments" className="btn-back">
            <FaArrowLeft /> Back to Payments
          </Link>
        </div>
      </div>
    );
  }

  const payment = currentPayment;
  const isSent = user && payment.payer && String(user._id) === String(payment.payer._id);
  const isReceived = user && payment.payee && String(user._id) === String(payment.payee._id);

  const getStatusInfo = (status) => {
    const statuses = {
      pending: { class: 'status-pending', label: 'Pending', icon: FaClock, color: '#f59e0b' },
      processing: { class: 'status-processing', label: 'Processing', icon: FaSpinner, color: '#3b82f6' },
      held: { class: 'status-held', label: 'In Escrow', icon: FaLock, color: '#f59e0b' },
      released: { class: 'status-released', label: 'Released', icon: FaUnlock, color: '#06b6d4' },
      completed: { class: 'status-completed', label: 'Completed', icon: FaCheckCircle, color: '#10b981' },
      failed: { class: 'status-failed', label: 'Failed', icon: FaExclamationCircle, color: '#ef4444' },
      refunded: { class: 'status-refunded', label: 'Refunded', icon: FaExclamationCircle, color: '#ef4444' },
      cancelled: { class: 'status-cancelled', label: 'Cancelled', icon: FaExclamationCircle, color: '#ef4444' }
    };
    return statuses[status] || { class: 'status-default', label: status, icon: FaClock, color: '#9ca3af' };
  };

  const statusInfo = getStatusInfo(payment.status);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="payment-details-page">
      <div className="payment-details-container">
        {/* Header */}
        <div className="payment-header" style={{ background: `linear-gradient(135deg, ${statusInfo.color} 0%, ${statusInfo.color}dd 100%)` }}>
          <div className="payment-header-top">
            <Link to="/payments" className="back-link">
              <FaArrowLeft /> My Payments
            </Link>
            <div className="payment-direction-badge">
              {isSent ? (
                <>
                  <FaArrowUp /> Payment Sent
                </>
              ) : (
                <>
                  <FaArrowDown /> Payment Received
                </>
              )}
            </div>
          </div>
          
          <div className="payment-header-content">
            <div className="payment-amount-large">
              <span className="currency">$</span>
              <span className="amount">{payment.amount?.toLocaleString()}</span>
            </div>
            <div className={`payment-status-badge ${statusInfo.class}`}>
              <StatusIcon />
              <span>{statusInfo.label}</span>
            </div>
          </div>

          {payment.transactionId && (
            <div className="transaction-id-large">
              <FaReceipt /> Transaction ID: {payment.transactionId}
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="payment-content">
          {/* Parties Information */}
          <div className="payment-parties">
            {/* Payer */}
            <div className="payment-section party-section">
              <div className="section-header">
                <FaUser className="section-icon" />
                <h2>Payer</h2>
              </div>
              <div className="section-content">
                {payment.payer ? (
                  <div className="party-info">
                    <div className="party-avatar">
                      {payment.payer.profile_picture ? (
                        <img src={payment.payer.profile_picture} alt={payment.payer.first_name} />
                      ) : (
                        <FaUser />
                      )}
                    </div>
                    <div className="party-details">
                      <Link to={`/freelancer/${payment.payer._id}`} className="party-name">
                        {payment.payer.first_name} {payment.payer.last_name}
                      </Link>
                      <p className="party-email">{payment.payer.email}</p>
                      {isSent && <span className="you-badge">You</span>}
                    </div>
                  </div>
                ) : (
                  <p className="no-data">Payer information not available</p>
                )}
              </div>
            </div>

            {/* Payee */}
            <div className="payment-section party-section">
              <div className="section-header">
                <FaUser className="section-icon" />
                <h2>Payee</h2>
              </div>
              <div className="section-content">
                {payment.payee ? (
                  <div className="party-info">
                    <div className="party-avatar">
                      {payment.payee.profile_picture ? (
                        <img src={payment.payee.profile_picture} alt={payment.payee.first_name} />
                      ) : (
                        <FaUser />
                      )}
                    </div>
                    <div className="party-details">
                      <Link to={`/freelancer/${payment.payee._id}`} className="party-name">
                        {payment.payee.first_name} {payment.payee.last_name}
                      </Link>
                      <p className="party-email">{payment.payee.email}</p>
                      {isReceived && <span className="you-badge">You</span>}
                    </div>
                  </div>
                ) : (
                  <p className="no-data">Payee information not available</p>
                )}
              </div>
            </div>
          </div>

          {/* Financial Details */}
          <div className="payment-section financial-section">
            <div className="section-header">
              <FaDollarSign className="section-icon" />
              <h2>Financial Breakdown</h2>
            </div>
            <div className="section-content">
              <div className="financial-grid">
                <div className="financial-item">
                  <span className="financial-label">Total Amount</span>
                  <span className="financial-value primary">${payment.amount?.toLocaleString()}</span>
                </div>
                {payment.platformFee > 0 && (
                  <>
                    <div className="financial-item">
                      <span className="financial-label">Platform Fee (10%)</span>
                      <span className="financial-value">${payment.platformFee?.toFixed(2)}</span>
                    </div>
                    <div className="financial-item">
                      <span className="financial-label">Net Amount</span>
                      <span className="financial-value success">${payment.netAmount?.toFixed(2)}</span>
                    </div>
                  </>
                )}
                <div className="financial-item">
                  <span className="financial-label">Payment Method</span>
                  <span className="financial-value method">
                    {payment.paymentMethod?.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>

              {payment.isEscrow && payment.status === 'held' && (
                <div className="escrow-notice">
                  <FaLock />
                  <p>This payment is securely held in escrow and will be released when the contract is completed.</p>
                </div>
              )}

              {payment.status === 'completed' && (
                <div className="success-notice">
                  <FaCheckCircle />
                  <p>This payment has been successfully completed and processed.</p>
                </div>
              )}

              {payment.failureReason && (
                <div className="error-notice">
                  <FaExclamationCircle />
                  <p><strong>Failure Reason:</strong> {payment.failureReason}</p>
                </div>
              )}
            </div>
          </div>

          {/* Contract Link */}
          {payment.contract && (
            <div className="payment-section">
              <div className="section-header">
                <FaFileContract className="section-icon" />
                <h2>Related Contract</h2>
              </div>
              <div className="section-content">
                <Link to={`/contracts/${payment.contract._id || payment.contract}`} className="contract-link-card">
                  <FaFileContract />
                  <div className="contract-link-info">
                    <span className="contract-link-label">View Contract Details</span>
                    <span className="contract-link-id">
                      Contract ID: {payment.contract._id || payment.contract}
                    </span>
                  </div>
                  <span className="contract-link-arrow">→</span>
                </Link>
              </div>
            </div>
          )}

          {/* Description */}
          {payment.description && (
            <div className="payment-section">
              <div className="section-header">
                <FaReceipt className="section-icon" />
                <h2>Description</h2>
              </div>
              <div className="section-content">
                <p className="payment-description">{payment.description}</p>
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="payment-section">
            <div className="section-header">
              <FaCalendarAlt className="section-icon" />
              <h2>Timeline</h2>
            </div>
            <div className="section-content">
              <div className="timeline-grid">
                <div className="timeline-item">
                  <span className="timeline-label">Created</span>
                  <span className="timeline-value">
                    {new Date(payment.createdAt).toLocaleString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                {payment.processedAt && (
                  <div className="timeline-item">
                    <span className="timeline-label">Processed</span>
                    <span className="timeline-value">
                      {new Date(payment.processedAt).toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                )}
                {payment.releasedAt && (
                  <div className="timeline-item">
                    <span className="timeline-label">Released from Escrow</span>
                    <span className="timeline-value">
                      {new Date(payment.releasedAt).toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                )}
                {payment.completedAt && (
                  <div className="timeline-item">
                    <span className="timeline-label">Completed</span>
                    <span className="timeline-value">
                      {new Date(payment.completedAt).toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'long',
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
        </div>
      </div>
    </div>
  );
};

export default PaymentDetails;
