import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { API_ENDPOINTS } from '../Services/config';
import { setUser, updateBalance } from '../Services/Authentication/AuthSlice';
import { useAutoBalanceSync } from '../hooks/useBalanceSync';
import { FaDollarSign, FaPaypal, FaArrowLeft, FaCheckCircle } from 'react-icons/fa';
import './Withdraw.css';

const Withdraw = () => {
    const dispatch = useDispatch();
    const { user, token } = useSelector((state) => state.auth);
    const navigate = useNavigate();
    const [amount, setAmount] = useState('');
    const [paypalEmail, setPaypalEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [currentBalance, setCurrentBalance] = useState(user?.balance || 0);

    // Auto-sync balance when component mounts
    useAutoBalanceSync();

    // Update local balance when Redux state changes
    useEffect(() => {
        if (user?.balance !== undefined) {
            setCurrentBalance(user.balance);
        }
    }, [user?.balance]);

    const quickAmounts = [50, 100, 250, 500, 1000];

    const handleAmountSelect = (value) => {
        setAmount(value.toString());
    };

    const handleAmountChange = (e) => {
        const value = e.target.value;
        if (value === '' || /^\d+$/.test(value)) {
            setAmount(value);
        }
    };

    const handleWithdraw = async () => {
        const withdrawAmount = parseInt(amount);

        // Validation
        if (!withdrawAmount || withdrawAmount <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }

        if (withdrawAmount < 10) {
            toast.error('Minimum withdrawal amount is $10');
            return;
        }

        if (!paypalEmail) {
            toast.error('Please enter your PayPal email');
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(paypalEmail)) {
            toast.error('Please enter a valid email address');
            return;
        }

        if (withdrawAmount > currentBalance) {
            toast.error(`Insufficient balance. Available: $${currentBalance}`);
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('http://localhost:3000/Freelancing/api/v1/funds/withdraw', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    amount: withdrawAmount,
                    paypalEmail: paypalEmail
                })
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Withdrawal failed');
            }

            console.log('✅ Withdrawal successful:', data);
            toast.success('Withdrawal processed successfully!');

            // Update user balance in Redux (syncs across all components)
            dispatch(updateBalance(data.transaction.newBalance));

            // Update local balance state for immediate UI feedback
            setCurrentBalance(data.transaction.newBalance);

            setShowSuccess(true);

            // Scroll to top to show success message
            window.scrollTo({ top: 0, behavior: 'smooth' });

            // Reset form after delay
            setTimeout(() => {
                setShowSuccess(false);
                setAmount('');
                setPaypalEmail('');
                navigate('/dashboard');
            }, 3000);

        } catch (error) {
            console.error('❌ Withdrawal error:', {
                message: error.message,
                error: error
            });

            // Show detailed error message
            const errorMessage = error.message || 'Failed to process withdrawal';
            toast.error(errorMessage, {
                autoClose: 5000,
                position: 'top-center'
            });

            // Log details for debugging
            console.log('📊 Error details:', {
                amount: withdrawAmount,
                email: paypalEmail,
                currentBalance: currentBalance,
                error: error.message
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="withdraw-container">
            <div className="withdraw-card">
                <div className="withdraw-header">
                    <button className="back-button" onClick={() => navigate(-1)}>
                        <FaArrowLeft />
                    </button>
                    <h1>Withdraw Funds</h1>
                    <div className="balance-display">
                        <FaDollarSign />
                        <span>Available Balance: ${currentBalance?.toFixed(2) || '0.00'}</span>
                    </div>
                </div>

                {showSuccess ? (
                    <div className="success-message">
                        <FaCheckCircle className="success-icon" />
                        <h2>Withdrawal Successful!</h2>
                        <p>Funds will be sent to your PayPal account shortly.</p>
                    </div>
                ) : (
                    <>
                        <div className="withdraw-section">
                            <h3>Select Amount</h3>
                            <div className="quick-amounts">
                                {quickAmounts.map((value) => (
                                    <button
                                        key={value}
                                        className={`amount-button ${amount === value.toString() ? 'selected' : ''}`}
                                        onClick={() => handleAmountSelect(value)}
                                        disabled={value > currentBalance}
                                    >
                                        ${value}
                                    </button>
                                ))}
                            </div>

                            <div className="custom-amount">
                                <label>Or Enter Custom Amount</label>
                                <div className="input-wrapper">
                                    <FaDollarSign className="dollar-icon" />
                                    <input
                                        type="text"
                                        placeholder="Enter amount"
                                        value={amount}
                                        onChange={handleAmountChange}
                                        className="amount-input"
                                    />
                                </div>
                                <small className="input-hint">Minimum withdrawal: $10</small>
                            </div>
                        </div>

                        <div className="withdraw-section">
                            <h3>PayPal Account</h3>
                            <div className="paypal-input-wrapper">
                                <FaPaypal className="paypal-icon" />
                                <input
                                    type="email"
                                    placeholder="your-email@paypal.com"
                                    value={paypalEmail}
                                    onChange={(e) => setPaypalEmail(e.target.value)}
                                    className="paypal-input"
                                />
                            </div>
                            <small className="input-hint">Enter your PayPal email address</small>
                        </div>

                        <div className="withdraw-summary">
                            <div className="summary-row">
                                <span>Amount to Withdraw:</span>
                                <strong>${amount || '0'}</strong>
                            </div>
                            <div className="summary-row">
                                <span>Remaining Balance:</span>
                                <strong>${(currentBalance - (parseInt(amount) || 0)).toFixed(2)}</strong>
                            </div>
                        </div>

                        <button
                            className="withdraw-button"
                            onClick={handleWithdraw}
                            disabled={loading || !amount || !paypalEmail}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner"></span>
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <FaPaypal />
                                    Withdraw to PayPal
                                </>
                            )}
                        </button>

                        <div className="withdraw-info">
                            <p>
                                <strong>Note:</strong> Withdrawals are processed through PayPal.
                                Funds typically arrive within 1-3 business days.
                            </p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Withdraw;
