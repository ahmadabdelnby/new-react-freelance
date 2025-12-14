import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { FaApple, FaGoogle, FaEye, FaEyeSlash, FaChevronDown } from 'react-icons/fa'
import { register, clearError } from '../Services/Authentication/AuthSlice'
import logger from '../Services/logger'
import { toast } from 'react-toastify'
import './Register.css'

function Register() {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone_number: '',
    gender: 'male',
    country: 'Egypt',
    role: 'user',
    sendEmails: true,
    agreeTerms: false
  })
  const [showPassword, setShowPassword] = useState(false)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { isLoading, error, isAuthenticated } = useSelector((state) => state.auth)

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard')
    }
  }, [isAuthenticated, navigate])

  useEffect(() => {
    return () => {
      dispatch(clearError())
    }
  }, [dispatch])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match!')
      return
    }

    if (!formData.agreeTerms) {
      toast.error('Please agree to the Terms of Service')
      return
    }

    const result = await dispatch(register({
      first_name: formData.first_name,
      last_name: formData.last_name,
      username: formData.username,
      email: formData.email,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
      phone_number: formData.phone_number,
      gender: formData.gender,
      country: formData.country,
      role: formData.role
    }))

    if (register.fulfilled.match(result)) {
      navigate('/dashboard')
    }
  }

  const handleAppleSignup = () => {
    logger.log('Apple signup')
  }

  const handleGoogleSignup = () => {
    logger.log('Google signup')
  }

  return (
    <div className="register-page">
      {/* Header */}
      <header className="register-header">
        <div className="register-header-container">
          <Link to="/" className="register-logo">
            <div className="logo-container">
              <div className="logo-icon">
                <span className="logo-symbol">H</span>
              </div>
              <div className="logo-text">
                <span className="logo-main">Herfa</span>
              </div>
            </div>
          </Link>
          <div className="header-actions">
            <span className="header-text">Here to hire talent?</span>
            <Link to="/post-job" className="btn-join-client">Join as a Client</Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="register-main">
        <div className="register-container">
          <h1 className="register-title">Sign up to find work you love</h1>

          {/* Social Signup Buttons */}
          <div className="social-signup-buttons">
            <button
              type="button"
              className="btn-social-signup btn-apple-signup"
              onClick={handleAppleSignup}
              disabled
              title="Coming Soon"
            >
              <FaApple className="social-signup-icon" />
              Continue with Apple
            </button>

            <button
              type="button"
              className="btn-social-signup btn-google-signup"
              onClick={handleGoogleSignup}
              disabled
              title="Coming Soon"
            >
              <FaGoogle className="social-signup-icon" />
              Continue with Google
            </button>
          </div>

          {/* Divider */}
          <div className="register-divider">
            <span>or</span>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="register-form">
            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}

            {/* Name Fields */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="first_name" className="form-label">First name</label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  className="form-input"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="last_name" className="form-label">Last name</label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  className="form-input"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Username */}
            <div className="form-group">
              <label htmlFor="username" className="form-label">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                className="form-input"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>

            {/* Email */}
            <div className="form-group">
              <label htmlFor="email" className="form-label">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                className="form-input"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            {/* Password */}
            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  className="form-input"
                  placeholder="Password (8 or more characters)"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  className="form-input"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Phone Number */}
            <div className="form-group">
              <label htmlFor="phone_number" className="form-label">Phone Number</label>
              <input
                type="tel"
                id="phone_number"
                name="phone_number"
                className="form-input"
                value={formData.phone_number}
                onChange={handleChange}
              />
            </div>

            {/* Gender */}
            <div className="form-group">
              <label htmlFor="gender" className="form-label">Gender</label>
              <div className="select-wrapper">
                <select
                  id="gender"
                  name="gender"
                  className="form-select"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
                <FaChevronDown className="select-arrow" />
              </div>
            </div>

            {/* Country */}
            <div className="form-group">
              <label htmlFor="country" className="form-label">Country</label>
              <div className="select-wrapper">
                <select
                  id="country"
                  name="country"
                  className="form-select"
                  value={formData.country}
                  onChange={handleChange}
                >
                  <option value="Egypt">Egypt</option>
                  <option value="United States">United States</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Canada">Canada</option>
                  <option value="Australia">Australia</option>
                  <option value="Germany">Germany</option>
                </select>
                <FaChevronDown className="select-arrow" />
              </div>
            </div>

            {/* Email Preferences Checkbox */}
            <div className="form-checkbox">
              <input
                type="checkbox"
                id="sendEmails"
                name="sendEmails"
                checked={formData.sendEmails}
                onChange={handleChange}
              />
              <label htmlFor="sendEmails" className="checkbox-label">
                Send me helpful emails to find rewarding work and job leads.
              </label>
            </div>

            {/* Terms Checkbox */}
            <div className="form-checkbox">
              <input
                type="checkbox"
                id="agreeTerms"
                name="agreeTerms"
                checked={formData.agreeTerms}
                onChange={handleChange}
                required
              />
              <label htmlFor="agreeTerms" className="checkbox-label">
                Yes, I understand and agree to the <Link to="/terms" className="link-green">Herfa Terms of Service</Link>, including the <Link to="/user-agreement" className="link-green">User Agreement</Link> and <Link to="/privacy" className="link-green">Privacy Policy</Link>.
              </label>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              className="btn-create-account"
              disabled={isLoading}
            >
              {isLoading ? 'Creating account...' : 'Create my account'}
            </button>
          </form>

          {/* Login Link */}
          <div className="register-footer">
            <p className="login-text">
              Already have an account? <Link to="/login" className="link-green">Log In</Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Register