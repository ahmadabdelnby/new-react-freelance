import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { API_ENDPOINTS } from '../Services/config';
import { setUser } from '../Services/Authentication/AuthSlice';
import { FaCreditCard, FaPaypal, FaUniversity, FaDollarSign, FaCheckCircle, FaArrowLeft } from 'react-icons/fa';
import './AddFunds.css';

const AddFunds = () => {
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [customAmount, setCustomAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const quickAmounts = [50, 100, 250, 500, 1000, 2000];

  const paymentMethods = [
    { id: 'credit_card', name: 'Credit Card', icon: <FaCreditCard /> },
    { id: 'paypal', name: 'PayPal', icon: <FaPaypal /> },
    { id: 'bank_transfer', name: 'Bank Transfer', icon: <FaUniversity /> }
  ];

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
    <div className="add-funds-page">
      <div className="container">
        <div className="add-funds-container">
          <div className="add-funds-header">
            <button className="back-btn" onClick={() => navigate('/dashboard')}>
              <FaArrowLeft /> Back
            </button>
            <h1>Add Funds</h1>
            <p>Add money to your account balance</p>
          </div>

          <div className="add-funds-content">
            {/* Current Balance */}
            <div className="current-balance-card">
              <span className="balance-label">Current Balance</span>
              <span className="balance-amount">${user?.balance || 0}</span>
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
                />
              </div>
              <p className="input-hint">Minimum: $10 | Maximum: $10,000</p>
            </div>

            {/* Payment Methods */}
            <div className="section">
              <h3 className="section-title">Payment Method</h3>
              <div className="payment-methods">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    className={`payment-method-btn ${paymentMethod === method.id ? 'active' : ''}`}
                    onClick={() => setPaymentMethod(method.id)}
                  >
                    <span className="method-icon">{method.icon}</span>
                    <span className="method-name">{method.name}</span>
                  </button>
                ))}
              </div>
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

            {/* Add Funds Button */}
            <button
              className="add-funds-btn"
              onClick={handleAddFunds}
              disabled={loading || getFinalAmount() <= 0}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Processing...
                </>
              ) : (
                <>
                  <FaCreditCard />
                  Add ${getFinalAmount() || 0} to Account
                </>
              )}
            </button>

            {/* Security Note */}
            <div className="security-note">
              <p>🔒 Your payment information is secure and encrypted</p>
              <p className="demo-note">
                Note: This is a demo environment. No real payment will be processed.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddFunds;
