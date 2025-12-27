import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { API_ENDPOINTS } from '../Services/config';
import { setUser, updateBalance } from '../Services/Authentication/AuthSlice';
import { useAutoBalanceSync } from '../hooks/useBalanceSync';
import { FaDollarSign, FaCheckCircle, FaArrowLeft, FaPaypal } from 'react-icons/fa';
import './AddFunds.css';

const AddFunds = () => {
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [customAmount, setCustomAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPayPalButtons, setShowPayPalButtons] = useState(false);
  const [currentBalance, setCurrentBalance] = useState(user?.balance || 0);

  // Auto-sync balance when component mounts
  useAutoBalanceSync();

  // Update local balance when Redux state changes
  useEffect(() => {
    if (user?.balance !== undefined) {
      setCurrentBalance(user.balance);
    }
  }, [user?.balance]);

  const quickAmounts = [50, 100, 250, 500, 1000, 2000];

  // PayPal Client ID from environment
  const paypalClientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;

  const handleAmountSelect = (amount) => {
    setSelectedAmount(amount);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^\d+$/.test(value)) {
      setCustomAmount(value);
      setSelectedAmount(null);
    }
  };

  const getFinalAmount = () => {
    return customAmount ? parseInt(customAmount) : selectedAmount;
  };

  const handleProceedToPayment = () => {
    const amount = getFinalAmount();

    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (amount < 10) {
      toast.error('Minimum deposit amount is $10');
      return;
    }

    if (amount > 10000) {
      toast.error('Maximum deposit amount is $10,000');
      return;
    }

    setShowPayPalButtons(true);
  };

  // PayPal Create Order
  const createOrder = async (data, actions) => {
    const amount = getFinalAmount();

    try {
      const response = await fetch(API_ENDPOINTS.CREATE_PAYPAL_ORDER, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ amount })
      });

      const orderData = await response.json();

      if (!response.ok || !orderData.success) {
        throw new Error(orderData.message || 'Failed to create PayPal order');
      }

      console.log('✅ PayPal Order Created:', orderData.orderId);
      return orderData.orderId;
    } catch (error) {
      console.error('❌ Create Order Error:', error);
      toast.error(error.message || 'Failed to create order');
      throw error;
    }
  };

  // PayPal Capture Order
  const onApprove = async (data, actions) => {
    setLoading(true);

    try {
      const response = await fetch(API_ENDPOINTS.CAPTURE_PAYPAL_ORDER, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ orderId: data.orderID })
      });

      const captureData = await response.json();

      if (!response.ok || !captureData.success) {
        throw new Error(captureData.message || 'Failed to capture payment');
      }

      console.log('✅ Payment Captured:', captureData);

      // Update user balance in Redux (syncs across all components)
      dispatch(updateBalance(captureData.transaction.newBalance));

      // Update local balance state for immediate UI feedback
      setCurrentBalance(captureData.transaction.newBalance);

      setShowSuccess(true);
      toast.success(`Successfully added $${captureData.transaction.amount} to your account!`);

      // Scroll to top to show success message
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Redirect to dashboard after 3 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);

    } catch (error) {
      console.error('❌ Capture Payment Error:', error);
      toast.error(error.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  // PayPal Error Handler
  const onError = (err) => {
    console.error('❌ PayPal Error:', err);
    toast.error('Payment failed. Please try again.');
    setLoading(false);
  };

  // PayPal Cancel Handler
  const onCancel = (data) => {
    console.log('⚠️ Payment Cancelled:', data);
    toast.info('Payment cancelled');
    setShowPayPalButtons(false);
  };

  const handleAddFunds = async () => {
    const amount = getFinalAmount();

    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (amount < 10) {
      toast.error('Minimum deposit amount is $10');
      return;
    }

    if (amount > 10000) {
      toast.error('Maximum deposit amount is $10,000');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(API_ENDPOINTS.ADD_FUNDS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount,
          paymentMethod
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to add funds');
      }

      // Update user balance in Redux
      const updatedUser = {
        ...user,
        balance: data.transaction.newBalance
      };
      dispatch(setUser(updatedUser));

      setShowSuccess(true);
      toast.success(`Successfully added $${amount} to your account!`);

      // Redirect to dashboard after 3 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);

    } catch (error) {
      console.error('Add funds error:', error);
      toast.error(error.message || 'Failed to add funds');
    } finally {
      setLoading(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="add-funds-success">
        <div className="success-card">
          <FaCheckCircle className="success-icon" />
          <h2>Payment Successful!</h2>
          <p className="success-amount">${getFinalAmount()}</p>
          <p className="success-message">has been added to your account</p>
          <p className="redirect-message">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <PayPalScriptProvider options={{
      'client-id': paypalClientId,
      currency: 'USD'
    }}>
      <div className="add-funds-page">
        <div className="container">
          <div className="add-funds-container">
            <div className="add-funds-header">
              <button className="back-btn" onClick={() => navigate('/dashboard')}>
                <FaArrowLeft /> Back
              </button>
              <h1>Add Funds</h1>
              <p>Add money to your account balance via PayPal</p>
            </div>

            <div className="add-funds-content">
              {/* Current Balance */}
              <div className="current-balance-card">
                <span className="balance-label">Current Balance</span>
                <span className="balance-amount">${currentBalance?.toFixed(2) || '0.00'}</span>
              </div>

              {/* Quick Amounts */}
              <div className="section">
                <h3 className="section-title">Select Amount</h3>
                <div className="quick-amounts">
                  {quickAmounts.map((amount) => (
                    <button
                      key={amount}
                      className={`amount-btn ${selectedAmount === amount ? 'active' : ''}`}
                      onClick={() => handleAmountSelect(amount)}
                      disabled={showPayPalButtons}
                    >
                      <FaDollarSign />
                      {amount}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Amount */}
              <div className="section">
                <h3 className="section-title">Or Enter Custom Amount</h3>
                <div className="custom-amount-input">
                  <span className="currency-symbol">$</span>
                  <input
                    type="text"
                    placeholder="Enter amount"
                    value={customAmount}
                    onChange={handleCustomAmountChange}
                    className="amount-input"
                    disabled={showPayPalButtons}
                  />
                </div>
                <p className="input-hint">Minimum: $10 | Maximum: $10,000</p>
              </div>

              {/* Summary */}
              {getFinalAmount() > 0 && (
                <div className="payment-summary">
                  <div className="summary-row">
                    <span>Amount to Add:</span>
                    <span className="summary-amount">${getFinalAmount()}</span>
                  </div>
                  <div className="summary-row">
                    <span>Processing Fee:</span>
                    <span className="summary-fee">$0</span>
                  </div>
                  <div className="summary-row total">
                    <span>Total:</span>
                    <span className="summary-total">${getFinalAmount()}</span>
                  </div>
                </div>
              )}

              {/* PayPal Buttons or Proceed Button */}
              {!showPayPalButtons ? (
                <button
                  className="add-funds-btn"
                  onClick={handleProceedToPayment}
                  disabled={loading || getFinalAmount() <= 0}
                >
                  <FaPaypal />
                  Proceed to PayPal Checkout
                </button>
              ) : (
                <div className="paypal-buttons-container">
                  <h3 className="section-title">Complete Payment</h3>
                  <PayPalButtons
                    style={{
                      layout: 'vertical',
                      color: 'gold',
                      shape: 'rect',
                      label: 'paypal'
                    }}
                    createOrder={createOrder}
                    onApprove={onApprove}
                    onError={onError}
                    onCancel={onCancel}
                    disabled={loading}
                  />
                  <button
                    className="cancel-btn"
                    onClick={() => setShowPayPalButtons(false)}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                </div>
              )}

              {/* Security Note */}
              <div className="security-note">
                <p>🔒 Your payment is secure and encrypted via PayPal</p>
                <p className="demo-note">
                  💡 Sandbox Mode: Use PayPal sandbox test accounts for testing
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PayPalScriptProvider>
  );
};

export default AddFunds;
