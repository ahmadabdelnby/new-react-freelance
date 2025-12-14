import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { API_ENDPOINTS } from '../Services/config';
import './PasswordReset.css';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(true);
    const [tokenValid, setTokenValid] = useState(false);
    const [userEmail, setUserEmail] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        verifyToken();
    }, [token]);

    const verifyToken = async () => {
        try {
            const response = await fetch(API_ENDPOINTS.VERIFY_RESET_TOKEN(token));
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Invalid or expired token');
            }

            setTokenValid(true);
            setUserEmail(data.email);
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.message || 'Invalid or expired reset token'
            });
            setTokenValid(false);
        } finally {
            setVerifying(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            setMessage({
                type: 'error',
                text: 'Passwords do not match'
            });
            return;
        }

        if (formData.password.length < 6) {
            setMessage({
                type: 'error',
                text: 'Password must be at least 6 characters'
            });
            return;
        }

        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const response = await fetch(API_ENDPOINTS.RESET_PASSWORD(token), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    password: formData.password,
                    confirmPassword: formData.confirmPassword
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to reset password');
            }

            setMessage({
                type: 'success',
                text: 'Password reset successfully! Redirecting to login...'
            });

            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.message || 'Failed to reset password'
            });
        } finally {
            setLoading(false);
        }
    };

    if (verifying) {
        return (
            <div className="password-reset-page">
                <div className="password-reset-container">
                    <div className="reset-card text-center">
                        <div className="spinner-border" role="status">
                            <span className="sr-only">Verifying token...</span>
                        </div>
                        <p className="mt-3">Verifying reset link...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!tokenValid) {
        return (
            <div className="password-reset-page">
                <div className="password-reset-container">
                    <div className="reset-card text-center">
                        <div className="alert alert-error">
                            {message.text}
                        </div>
                        <a href="/forgot-password" className="btn btn-primary">
                            Request New Reset Link
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="password-reset-page">
            <div className="password-reset-container">
                <div className="reset-card">
                    <h2 className="reset-title">Reset Password</h2>
                    <p className="reset-subtitle">
                        Enter your new password for {userEmail}
                    </p>

                    {message.text && (
                        <div className={`alert alert-${message.type}`}>
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="reset-form">
                        <div className="form-group">
                            <label htmlFor="password">New Password</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                className="form-control"
                                placeholder="Enter new password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                minLength="6"
                                disabled={loading}
                            />
                            <small className="form-text">Minimum 6 characters</small>
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                className="form-control"
                                placeholder="Confirm new password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                disabled={loading}
                            />
                        </div>

                        <button 
                            type="submit" 
                            className="btn btn-primary btn-block"
                            disabled={loading}
                        >
                            {loading ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
