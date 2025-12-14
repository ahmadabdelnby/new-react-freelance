import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { API_ENDPOINTS } from '../Services/config';
import './PasswordReset.css';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const response = await fetch(API_ENDPOINTS.FORGOT_PASSWORD, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to send reset email');
            }

            setMessage({
                type: 'success',
                text: 'Password reset email sent! Please check your inbox.'
            });
            setEmail('');
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.message || 'Failed to send reset email'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="password-reset-page">
            <div className="password-reset-container">
                <div className="reset-card">
                    <h2 className="reset-title">Forgot Password?</h2>
                    <p className="reset-subtitle">
                        Enter your email address and we'll send you a link to reset your password.
                    </p>

                    {message.text && (
                        <div className={`alert alert-${message.type}`}>
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="reset-form">
                        <div className="form-group">
                            <label htmlFor="email">Email Address</label>
                            <input
                                type="email"
                                id="email"
                                className="form-control"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>

                        <button 
                            type="submit" 
                            className="btn btn-primary btn-block"
                            disabled={loading}
                        >
                            {loading ? 'Sending...' : 'Send Reset Link'}
                        </button>
                    </form>

                    <div className="reset-footer">
                        <Link to="/login" className="back-to-login">
                            ← Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
