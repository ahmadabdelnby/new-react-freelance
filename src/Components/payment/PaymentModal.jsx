import React, { useState } from 'react';
import { FaTimes, FaCreditCard, FaPaypal, FaUniversity } from 'react-icons/fa';
import './PaymentModal.css';

const PaymentModal = ({ contract, onClose, onSuccess }) => {
    const [selectedMethod, setSelectedMethod] = useState('');
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState('');
    const [step, setStep] = useState('method'); // method, details, confirmation

    const paymentMethods = [
        { id: 'card', label: 'Credit/Debit Card', icon: <FaCreditCard /> },
        { id: 'paypal', label: 'PayPal', icon: <FaPaypal /> },
        { id: 'bank', label: 'Bank Transfer', icon: <FaUniversity /> }
    ];

    const handleMethodSelect = (methodId) => {
        setSelectedMethod(methodId);
        setError('');
    };

    const handleContinue = () => {
        if (!selectedMethod) {
            setError('Please select a payment method');
            return;
        }
        setStep('details');
    };

    const handlePayment = async (e) => {
        e.preventDefault();
        setProcessing(true);
        setError('');

        try {
            // Simulate payment processing
            await new Promise(resolve => setTimeout(resolve, 2000));

            setStep('confirmation');
            
            setTimeout(() => {
                onSuccess();
                onClose();
            }, 2000);
        } catch (err) {
            setError(err.message || 'Payment failed. Please try again.');
        } finally {
            setProcessing(false);
        }
    };

    const renderMethodSelection = () => (
        <div className="payment-step">
            <h4>Select Payment Method</h4>
            <div className="payment-methods">
                {paymentMethods.map((method) => (
                    <div
                        key={method.id}
                        className={`payment-method-card ${selectedMethod === method.id ? 'selected' : ''}`}
                        onClick={() => handleMethodSelect(method.id)}
                    >
                        <div className="method-icon">{method.icon}</div>
                        <span className="method-label">{method.label}</span>
                    </div>
                ))}
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <div className="payment-summary">
                <div className="summary-row">
                    <span>Contract Amount:</span>
                    <strong>${contract.amount?.toFixed(2)}</strong>
                </div>
                <div className="summary-row">
                    <span>Service Fee (10%):</span>
                    <span>${(contract.amount * 0.1).toFixed(2)}</span>
                </div>
                <div className="summary-row total">
                    <span>Total:</span>
                    <strong>${(contract.amount * 1.1).toFixed(2)}</strong>
                </div>
            </div>

            <div className="form-actions">
                <button className="btn btn-secondary" onClick={onClose}>
                    Cancel
                </button>
                <button className="btn btn-primary" onClick={handleContinue}>
                    Continue
                </button>
            </div>
        </div>
    );

    const renderPaymentDetails = () => (
        <div className="payment-step">
            <button className="back-btn" onClick={() => setStep('method')}>
                ← Back
            </button>

            <h4>Payment Details</h4>

            <form onSubmit={handlePayment}>
                {selectedMethod === 'card' && (
                    <>
                        <div className="form-group">
                            <label>Card Number</label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="1234 5678 9012 3456"
                                maxLength="19"
                                required
                            />
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Expiry Date</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="MM/YY"
                                    maxLength="5"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>CVV</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="123"
                                    maxLength="3"
                                    required
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Cardholder Name</label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="John Doe"
                                required
                            />
                        </div>
                    </>
                )}

                {selectedMethod === 'paypal' && (
                    <div className="paypal-info">
                        <p>You will be redirected to PayPal to complete your payment.</p>
                        <div className="form-group">
                            <label>PayPal Email</label>
                            <input
                                type="email"
                                className="form-control"
                                placeholder="your@email.com"
                                required
                            />
                        </div>
                    </div>
                )}

                {selectedMethod === 'bank' && (
                    <>
                        <div className="form-group">
                            <label>Bank Name</label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Your Bank"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Account Number</label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="1234567890"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Routing Number</label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="987654321"
                                required
                            />
                        </div>
                    </>
                )}

                {error && <div className="alert alert-danger">{error}</div>}

                <div className="form-actions">
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setStep('method')}
                        disabled={processing}
                    >
                        Back
                    </button>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={processing}
                    >
                        {processing ? 'Processing...' : `Pay $${(contract.amount * 1.1).toFixed(2)}`}
                    </button>
                </div>
            </form>
        </div>
    );

    const renderConfirmation = () => (
        <div className="payment-step confirmation">
            <div className="success-icon">✓</div>
            <h3>Payment Successful!</h3>
            <p>Your payment of ${(contract.amount * 1.1).toFixed(2)} has been processed.</p>
            <p className="confirmation-text">
                A confirmation email has been sent to your registered email address.
            </p>
        </div>
    );

    return (
        <div className="payment-modal-overlay" onClick={onClose}>
            <div className="payment-modal" onClick={(e) => e.stopPropagation()}>
                <div className="payment-modal-header">
                    <h3>Complete Payment</h3>
                    {step !== 'confirmation' && (
                        <button className="close-btn" onClick={onClose}>
                            <FaTimes />
                        </button>
                    )}
                </div>

                <div className="payment-modal-body">
                    {step === 'method' && renderMethodSelection()}
                    {step === 'details' && renderPaymentDetails()}
                    {step === 'confirmation' && renderConfirmation()}
                </div>
            </div>
        </div>
    );
};

export default PaymentModal;
