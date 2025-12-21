import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { getMyPayments } from '../Services/Payments/PaymentsSlice.js';
import { FaMoneyBillWave, FaArrowRight, FaArrowDown, FaArrowUp, FaClock, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import './PaymentHistoryTab.css';

const PaymentHistoryTab = () => {
  const dispatch = useDispatch();
  const { payments, loading } = useSelector((state) => state.payments);
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getMyPayments());
  }, [dispatch]);

  // Get recent 5 payments - payments is the array inside the payments state
  const paymentsArray = Array.isArray(payments) ? payments : [];
  const recentPayments = paymentsArray.slice(0, 5);

  // Calculate stats
  const totalSent = paymentsArray.filter(p => p.payer?._id === userInfo?._id).reduce((sum, p) => sum + p.amount, 0);
  const totalReceived = paymentsArray.filter(p => p.payee?._id === userInfo?._id).reduce((sum, p) => sum + p.netAmount, 0);

  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed':
        return <FaCheckCircle />;
      case 'failed':
        return <FaTimesCircle />;
      case 'held':
      case 'pending':
        return <FaClock />;
      default:
        return <FaClock />;
    }
  };

  const getStatusClass = (status) => {
    switch(status) {
      case 'completed':
        return 'phist-status-completed';
      case 'failed':
        return 'phist-status-failed';
      case 'held':
        return 'phist-status-held';
      case 'pending':
        return 'phist-status-pending';
      default:
        return 'phist-status-pending';
    }
  };

  const getDirectionBadge = (payment) => {
    if (payment.payer?._id === userInfo?._id) {
      return <span className="phist-direction phist-sent"><FaArrowUp /> Sent</span>;
    } else {
      return <span className="phist-direction phist-received"><FaArrowDown /> Received</span>;
    }
  };

  if (loading) {
    return (
      <div className="phist-container">
        <div className="phist-loading">
          <div className="phist-spinner"></div>
          <p>Loading payment history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="phist-container">
      <div className="phist-header">
        <h2><FaMoneyBillWave /> Payment History</h2>
        <Link to="/payments" className="phist-view-all">
          View All <FaArrowRight />
        </Link>
      </div>

      <div className="phist-stats">
        <div className="phist-stat-card phist-stat-sent">
          <div className="phist-stat-icon">
            <FaArrowUp />
          </div>
          <div className="phist-stat-info">
            <span className="phist-stat-label">Total Sent</span>
            <span className="phist-stat-value">${totalSent.toFixed(2)}</span>
          </div>
        </div>
        <div className="phist-stat-card phist-stat-received">
          <div className="phist-stat-icon">
            <FaArrowDown />
          </div>
          <div className="phist-stat-info">
            <span className="phist-stat-label">Total Received</span>
            <span className="phist-stat-value">${totalReceived.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {recentPayments.length === 0 ? (
        <div className="phist-empty">
          <FaMoneyBillWave />
          <h3>No Payment History</h3>
          <p>You haven't made or received any payments yet.</p>
        </div>
      ) : (
        <div className="phist-list">
          {recentPayments.map((payment) => (
            <Link 
              key={payment._id} 
              to={`/payments/${payment._id}`}
              className="phist-payment-card"
            >
              <div className="phist-card-header">
                <div className="phist-card-title">
                  <FaMoneyBillWave />
                  <span>Payment #{payment.transactionId}</span>
                </div>
                {getDirectionBadge(payment)}
              </div>

              <div className="phist-card-body">
                <div className="phist-amount">
                  ${payment.payer?._id === userInfo?._id ? payment.amount.toFixed(2) : payment.netAmount.toFixed(2)}
                </div>
                <div className="phist-other-party">
                  {payment.payer?._id === userInfo?._id ? (
                    <span>To: {payment.payee?.name || 'Unknown'}</span>
                  ) : (
                    <span>From: {payment.payer?.name || 'Unknown'}</span>
                  )}
                </div>
                <div className="phist-card-footer">
                  <span className={`phist-status ${getStatusClass(payment.status)}`}>
                    {getStatusIcon(payment.status)}
                    {payment.status}
                  </span>
                  <span className="phist-date">
                    {new Date(payment.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="phist-card-arrow">
                <FaArrowRight />
              </div>
            </Link>
          ))}
        </div>
      )}

      {recentPayments.length > 0 && (
        <div className="phist-footer">
          <Link to="/payments" className="phist-view-all-btn">
            View All Payments ({paymentsArray.length}) <FaArrowRight />
          </Link>
        </div>
      )}
    </div>
  );
};

export default PaymentHistoryTab;
