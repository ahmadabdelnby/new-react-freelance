import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { getMyPayments } from '../Services/Payments/PaymentsSlice';
import {
  FaDollarSign,
  FaArrowUp,
  FaArrowDown,
  FaClock,
  FaCheckCircle,
  FaExclamationCircle,
  FaSpinner,
  FaFilter,
  FaSearch,
  FaLock,
  FaUnlock
} from 'react-icons/fa';
import './MyPayments.css';

const MyPayments = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { payments, loading } = useSelector((state) => state.payments);
  const { user } = useSelector((state) => state.auth);
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(getMyPayments());
  }, [dispatch]);

  const getStatusBadge = (status) => {
    const badges = {
      pending: { class: 'status-pending', label: 'Pending', icon: FaClock },
      processing: { class: 'status-processing', label: 'Processing', icon: FaSpinner },
      held: { class: 'status-held', label: 'In Escrow', icon: FaLock },
      released: { class: 'status-released', label: 'Released', icon: FaUnlock },
      completed: { class: 'status-completed', label: 'Completed', icon: FaCheckCircle },
      failed: { class: 'status-failed', label: 'Failed', icon: FaExclamationCircle },
      refunded: { class: 'status-refunded', label: 'Refunded', icon: FaExclamationCircle },
      cancelled: { class: 'status-cancelled', label: 'Cancelled', icon: FaExclamationCircle }
    };
    return badges[status] || { class: 'status-default', label: status, icon: FaClock };
  };

  const filterPayments = (paymentsList) => {
    if (!Array.isArray(paymentsList)) {
      paymentsList = paymentsList?.payments || [];
    }

    let filtered = paymentsList;

    // Filter by type (sent/received)
    if (typeFilter === 'sent') {
      filtered = filtered.filter(p => String(p.payer?._id) === String(user?._id));
    } else if (typeFilter === 'received') {
      filtered = filtered.filter(p => String(p.payee?._id) === String(user?._id));
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => p.status === statusFilter);
    }

    // Search filter
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(p => {
        const description = p.description?.toLowerCase() || '';
        const transactionId = p.transactionId?.toLowerCase() || '';
        const payerName = p.payer ? `${p.payer.first_name} ${p.payer.last_name}`.toLowerCase() : '';
        const payeeName = p.payee ? `${p.payee.first_name} ${p.payee.last_name}`.toLowerCase() : '';

        return description.includes(search) ||
          transactionId.includes(search) ||
          payerName.includes(search) ||
          payeeName.includes(search);
      });
    }

    return filtered;
  };

  const paymentsArray = Array.isArray(payments) ? payments : (payments?.payments || []);
  const filteredPayments = filterPayments(paymentsArray);

  // Calculate stats
  const sentPayments = paymentsArray.filter(p => String(p.payer?._id) === String(user?._id));
  const receivedPayments = paymentsArray.filter(p => String(p.payee?._id) === String(user?._id));
  const heldPayments = paymentsArray.filter(p => p.status === 'held');
  const completedPayments = paymentsArray.filter(p => p.status === 'completed');

  const totalSent = sentPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalReceived = receivedPayments.reduce((sum, p) => sum + (p.netAmount || 0), 0);
  const totalHeld = heldPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

  if (loading && paymentsArray.length === 0) {
    return (
      <div className="my-payments-page">
        <div className="payments-loading">
          <FaSpinner className="spinner" />
          <p>Loading payments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="my-payments-page">
      <div className="container">
        <div className="payments-container">
          {/* Header */}
          <div className="payments-header">
            <div className="header-content">
              <h1>
                <FaDollarSign /> My Payments
              </h1>
              <p className="header-subtitle">
                Track all your payment transactions
              </p>
            </div>
            <div className="header-stats">
              <div className="stat-card sent">
                <FaArrowUp className="stat-icon" />
                <div className="stat-info">
                  <span className="stat-value">${totalSent.toLocaleString()}</span>
                  <span className="stat-label">Total Sent</span>
                  <span className="stat-count">{sentPayments.length} payments</span>
                </div>
              </div>
              <div className="stat-card received">
                <FaArrowDown className="stat-icon" />
                <div className="stat-info">
                  <span className="stat-value">${totalReceived.toLocaleString()}</span>
                  <span className="stat-label">Total Received</span>
                  <span className="stat-count">{receivedPayments.length} payments</span>
                </div>
              </div>
              <div className="stat-card held">
                <FaLock className="stat-icon" />
                <div className="stat-info">
                  <span className="stat-value">${totalHeld.toLocaleString()}</span>
                  <span className="stat-label">In Escrow</span>
                  <span className="stat-count">{heldPayments.length} payments</span>
                </div>
              </div>
              <div className="stat-card completed">
                <FaCheckCircle className="stat-icon" />
                <div className="stat-info">
                  <span className="stat-value">{completedPayments.length}</span>
                  <span className="stat-label">Completed</span>
                  <span className="stat-count">Successful</span>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="payments-filters">
            <div className="filter-section">
              <label>Type:</label>
              <div className="filter-tabs">
                <button
                  className={`filter-tab ${typeFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setTypeFilter('all')}
                >
                  All
                </button>
                <button
                  className={`filter-tab ${typeFilter === 'sent' ? 'active' : ''}`}
                  onClick={() => setTypeFilter('sent')}
                >
                  <FaArrowUp /> Sent
                </button>
                <button
                  className={`filter-tab ${typeFilter === 'received' ? 'active' : ''}`}
                  onClick={() => setTypeFilter('received')}
                >
                  <FaArrowDown /> Received
                </button>
              </div>
            </div>

            <div className="filter-section">
              <label>Status:</label>
              <div className="filter-tabs">
                <button
                  className={`filter-tab ${statusFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setStatusFilter('all')}
                >
                  All
                </button>
                <button
                  className={`filter-tab ${statusFilter === 'held' ? 'active' : ''}`}
                  onClick={() => setStatusFilter('held')}
                >
                  <FaLock /> Escrow
                </button>
                <button
                  className={`filter-tab ${statusFilter === 'completed' ? 'active' : ''}`}
                  onClick={() => setStatusFilter('completed')}
                >
                  <FaCheckCircle /> Completed
                </button>
                <button
                  className={`filter-tab ${statusFilter === 'failed' ? 'active' : ''}`}
                  onClick={() => setStatusFilter('failed')}
                >
                  <FaExclamationCircle /> Failed
                </button>
              </div>
            </div>

            <div className="search-box">
              <FaSearch />
              <input
                type="text"
                placeholder="Search payments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Payments List */}
          <div className="payments-list">
            {filteredPayments.length === 0 ? (
              <div className="no-payments">
                <FaDollarSign size={64} />
                <h3>No Payments Found</h3>
                <p>
                  {searchTerm ?
                    'Try adjusting your search terms' :
                    statusFilter !== 'all' || typeFilter !== 'all' ?
                      'No payments match the selected filters' :
                      'You don\'t have any payment transactions yet'
                  }
                </p>
              </div>
            ) : (
              filteredPayments.map((payment) => {
                const statusBadge = getStatusBadge(payment.status);
                const StatusIcon = statusBadge.icon;
                const isSent = String(payment.payer?._id) === String(user?._id);
                const otherParty = isSent ? payment.payee : payment.payer;

                return (
                  <div
                    key={payment._id}
                    className={`payment-card ${payment.status} ${isSent ? 'sent' : 'received'}`}
                    onClick={() => navigate(`/payments/${payment._id}`)}
                  >
                    <div className="payment-card-header">
                      <div className="payment-direction">
                        {isSent ? (
                          <div className="direction-badge sent">
                            <FaArrowUp /> Sent
                          </div>
                        ) : (
                          <div className="direction-badge received">
                            <FaArrowDown /> Received
                          </div>
                        )}
                      </div>
                      <div className={`status-badge ${statusBadge.class}`}>
                        <StatusIcon />
                        <span>{statusBadge.label}</span>
                      </div>
                    </div>

                    <div className="payment-card-body">
                      <div className="payment-amount">
                        <span className="amount-label">Amount</span>
                        <span className={`amount-value ${isSent ? 'negative' : 'positive'}`}>
                          {isSent ? '-' : '+'}${payment.amount?.toLocaleString()}
                        </span>
                        {!isSent && payment.platformFee > 0 && (
                          <span className="net-amount">
                            Net: ${payment.netAmount?.toLocaleString()}
                          </span>
                        )}
                      </div>

                      {otherParty && (
                        <div className="payment-party">
                          <span className="party-label">
                            {isSent ? 'To' : 'From'}:
                          </span>
                          <span className="party-name">
                            {otherParty.first_name} {otherParty.last_name}
                          </span>
                        </div>
                      )}

                      {payment.description && (
                        <p className="payment-description">{payment.description}</p>
                      )}

                      <div className="payment-meta">
                        {payment.transactionId && (
                          <span className="transaction-id">
                            ID: {payment.transactionId}
                          </span>
                        )}
                        <span className="payment-date">
                          {new Date(payment.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="payment-card-footer">
                      <button className="btn-view-payment">
                        View Details →
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyPayments;
