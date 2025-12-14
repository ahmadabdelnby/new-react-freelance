import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { FaGoogle, FaApple } from 'react-icons/fa'
import { login, clearError } from '../../Services/Authentication/AuthSlice'
import logger from '../../Services/logger'
import './login.css'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { isLoading, error, isAuthenticated } = useSelector((state) => state.auth)

  useEffect(() => {
    // Redirect if already authenticated
    if (isAuthenticated) {
      navigate('/dashboard')
    }
  }, [isAuthenticated, navigate])

  useEffect(() => {
    // Clear error when component unmounts
    return () => {
      dispatch(clearError())
    }
  }, [dispatch])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const result = await dispatch(login({ email, password }))
    
    if (login.fulfilled.match(result)) {
      navigate('/dashboard')
    }
  }

  const handleGoogleLogin = () => {
    // Handle Google login
    logger.log('Google login')
  }

  const handleAppleLogin = () => {
    // Handle Apple login
    logger.log('Apple login')
  }

  return (
    <div className="login-page">
      {/* Header */}
      <header className="login-header">
        <Link to="/" className="login-logo">
          <div className="logo-container">
            <div className="logo-icon">
              <span className="logo-symbol">H</span>
            </div>
            <div className="logo-text">
              <span className="logo-main">Herfa</span>
            </div>
          </div>
        </Link>
      </header>

      {/* Main Content */}
      <main className="login-main">
        <div className="login-container">
          <div className="login-card">
            <h1 className="login-title">Log in to Herfa</h1>

            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="login-form">
              {/* Username/Email Input */}
              <div className="form-group">
                  <label htmlFor="email">Email</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                  <label htmlFor="password">Password</label>
                <div className="input-wrapper">
                  <input
                    type="password"
                    className="form-input"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                
                {/* Forgot Password Link */}
                <div className="forgot-password-wrapper">
                  <Link to="/forgot-password" className="forgot-password-link">
                    Forgot password?
                  </Link>
                </div>
              </div>

              {/* Continue Button */}
              <button type="submit" className="btn-continue" disabled={isLoading}>
                {isLoading ? 'Logging in...' : 'Continue'}
              </button>

              {/* Divider */}
              <div className="login-divider">
                <span>or</span>
              </div>

              {/* Social Login Buttons */}
              <button
                type="button"
                className="social-btn google-btn"
                onClick={handleGoogleLogin}
                disabled
                title="Coming Soon"
              >
                <FaGoogle className="social-icon" />
                Continue with Google
              </button>

              {/* <button
                type="button"
                className="btn-social btn-apple"
                onClick={handleAppleLogin}
              >
                <FaApple className="social-icon" />
                Continue with Apple
              </button> */}
            </form>

            {/* Sign Up Link */}
            <div className="login-footer">
              <p className="signup-text">Don't have an Herfa account?</p>
              <Link to="/register" className="btn-signup">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="login-page-footer">
        <p className="footer-text">
          © 2018 - 2025 Herfa® Global Inc. • Privacy Policy • Your Privacy Choices
        </p>
      </footer>
    </div>
  )
}

export default Login