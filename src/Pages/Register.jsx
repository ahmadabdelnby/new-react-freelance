import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { FaApple, FaGoogle, FaEye, FaEyeSlash, FaChevronDown } from 'react-icons/fa'
import { register, clearError } from '../Services/Authentication/AuthSlice'
import logger from '../Services/logger'
import { toast } from 'react-toastify'
import SearchableCountrySelect from '../Components/common/SearchableCountrySelect.jsx'
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
    category: '',
    role: 'user',
    sendEmails: true,
    agreeTerms: false
  })
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [categories, setCategories] = useState([])
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

  useEffect(() => {
    // Fetch categories
    const fetchCategories = async () => {
      try {
        const response = await fetch('http://localhost:3000/Freelancing/api/v1/categories')
        if (response.ok) {
          const data = await response.json()
          setCategories(data)
        }
      } catch (error) {
        logger.error('Failed to fetch categories:', error)
      }
    }
    fetchCategories()
  }, [])

  const validateField = (name, value) => {
    let error = ''

    switch (name) {
      case 'first_name':
        if (!value.trim()) {
          error = 'First name is required'
        } else if (value.trim().length < 3) {
          error = 'First name must be at least 3 characters'
        } else if (value.trim().length > 100) {
          error = 'First name must not exceed 100 characters'
        }
        break
      case 'last_name':
        if (!value.trim()) {
          error = 'Last name is required'
        } else if (value.trim().length < 3) {
          error = 'Last name must be at least 3 characters'
        } else if (value.trim().length > 100) {
          error = 'Last name must not exceed 100 characters'
        }
        break
      case 'username':
        if (!value.trim()) {
          error = 'Username is required'
        } else if (value.length < 3) {
          error = 'Username must be at least 3 characters'
        } else if (value.length > 50) {
          error = 'Username must not exceed 50 characters'
        } else if (!/^[a-zA-Z0-9_]+$/.test(value)) {
          error = 'Username can only contain letters, numbers, and underscores'
        }
        break
      case 'email':
        if (!value.trim()) {
          error = 'Email is required'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = 'Please enter a valid email address'
        } else if (value.length > 255) {
          error = 'Email must not exceed 255 characters'
        }
        break
      case 'password':
        if (!value) {
          error = 'Password is required'
        } else if (value.length < 8) {
          error = 'Password must be at least 8 characters long'
        }
        break
      case 'confirmPassword':
        if (!value) {
          error = 'Please confirm your password'
        } else if (value !== formData.password) {
          error = 'Passwords do not match'
        }
        break
      case 'country':
        if (!value) error = 'Please select your country'
        break
      case 'gender':
        if (!value) error = 'Please select your gender'
        break
      default:
        break
    }

    return error
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    const newValue = type === 'checkbox' ? checked : value

    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }))

    // Mark field as touched when user starts typing
    setTouched(prev => ({
      ...prev,
      [name]: true
    }))

    // Validate field in real-time
    const error = validateField(name, newValue)
    setErrors(prev => ({
      ...prev,
      [name]: error
    }))
  }

  const handleBlur = (e) => {
    const { name, value } = e.target
    setTouched(prev => ({
      ...prev,
      [name]: true
    }))

    const error = validateField(name, value)
    setErrors(prev => ({
      ...prev,
      [name]: error
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate required fields
    if (!formData.first_name.trim()) {
      toast.error('First name is required')
      return
    }
    if (!formData.last_name.trim()) {
      toast.error('Last name is required')
      return
    }
    if (!formData.username.trim()) {
      toast.error('Username is required')
      return
    }
    if (formData.username.length < 3) {
      toast.error('Username must be at least 3 characters')
      return
    }
    if (!formData.email.trim()) {
      toast.error('Email is required')
      return
    }
    if (!formData.password) {
      toast.error('Password is required')
      return
    }
    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters long')
      return
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match!')
      return
    }
    if (!formData.country) {
      toast.error('Please select your country')
      return
    }
    if (!formData.agreeTerms) {
      toast.error('Please agree to the Terms of Service')
      return
    }

    const registerData = {
      first_name: formData.first_name,
      last_name: formData.last_name,
      username: formData.username,
      email: formData.email,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
      phone_number: formData.phone_number || null,
      gender: formData.gender,
      country: formData.country,
      category: formData.category || null,
      role: formData.role
    };

    const result = await dispatch(register(registerData))

    if (register.fulfilled.match(result)) {
      navigate('/dashboard')
    } else {
      toast.error(result.payload || 'Registration failed. Please try again.');
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
      <main className="register-main">
        <div className="register-container">
          <h1 className="register-title">Sign up to find work you love</h1>

          {/* Social Signup Buttons */}
          {/* <div className="social-signup-buttons">
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
          </div> */}

          {/* Divider */}
          {/* <div className="register-divider">
            <span>or</span>
          </div> */}

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
                <label htmlFor="first_name" className="form-label">
                  First name <span className="required-star">*</span>
                </label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  className={`form-input ${errors.first_name && touched.first_name ? 'input-error' : ''}`}
                  placeholder="First name (3-100 characters)"
                  value={formData.first_name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                />
                {errors.first_name && touched.first_name && (
                  <span className="error-message">{errors.first_name}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="last_name" className="form-label">
                  Last name <span className="required-star">*</span>
                </label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  className={`form-input ${errors.last_name && touched.last_name ? 'input-error' : ''}`}
                  placeholder="Last name (3-100 characters)"
                  value={formData.last_name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                />
                {errors.last_name && touched.last_name && (
                  <span className="error-message">{errors.last_name}</span>
                )}
              </div>
            </div>

            {/* Username */}
            <div className="form-group">
              <label htmlFor="username" className="form-label">
                Username <span className="required-star">*</span>
              </label>
              <input
                type="text"
                id="username"
                name="username"
                className={`form-input ${errors.username && touched.username ? 'input-error' : ''}`}
                placeholder="Username (3-50 characters, letters/numbers/_)"
                value={formData.username}
                onChange={handleChange}
                onBlur={handleBlur}
                required
              />
              {errors.username && touched.username && (
                <span className="error-message">{errors.username}</span>
              )}
              {!errors.username && <small className="form-helper-text">This will be your public username</small>}
            </div>

            {/* Email */}
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email <span className="required-star">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className={`form-input ${errors.email && touched.email ? 'input-error' : ''}`}
                placeholder="yourname@example.com (max 255 characters)"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                required
              />
              {errors.email && touched.email && (
                <span className="error-message">{errors.email}</span>
              )}
              {!errors.email && <small className="form-helper-text">We'll send you a verification email</small>}
            </div>

            {/* Password */}
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password <span className="required-star">*</span>
              </label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  className={`form-input ${errors.password && touched.password ? 'input-error' : ''}`}
                  placeholder="Password (minimum 8 characters)"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
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
              {errors.password && touched.password && (
                <span className="error-message">{errors.password}</span>
              )}
            </div>

            {/* Confirm Password */}
            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                Confirm Password <span className="required-star">*</span>
              </label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  className={`form-input ${errors.confirmPassword && touched.confirmPassword ? 'input-error' : ''}`}
                  placeholder="Confirm password (must match above)"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                />
              </div>
              {errors.confirmPassword && touched.confirmPassword && (
                <span className="error-message">{errors.confirmPassword}</span>
              )}
              {!errors.confirmPassword && <small className="form-helper-text">Must match the password above</small>}
            </div>

            {/* Phone Number */}
            <div className="form-group">
              <label htmlFor="phone_number" className="form-label">
                Phone Number <span className="optional-badge">(Optional)</span>
              </label>
              <input
                type="tel"
                id="phone_number"
                name="phone_number"
                className="form-input"
                placeholder="Phone number (max 20 digits)"
                value={formData.phone_number}
                onChange={handleChange}
              />
              <small className="form-helper-text">You can add this later in your profile</small>
            </div>

            {/* Category */}
            <div className="form-group">
              <label htmlFor="category" className="form-label">
                Category <span className="optional-badge">(Optional)</span>
              </label>
              <div className="select-wrapper">
                <select
                  id="category"
                  name="category"
                  className="form-select"
                  value={formData.category}
                  onChange={handleChange}
                >
                  <option value="">Select your category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <FaChevronDown className="select-arrow" />
              </div>
              <small className="form-helper-text">Choose your primary work category</small>
            </div>

            {/* Gender */}
            <div className="form-group">
              <label htmlFor="gender" className="form-label">
                Gender <span className="required-star">*</span>
              </label>
              <div className="select-wrapper">
                <select
                  id="gender"
                  name="gender"
                  className="form-select"
                  value={formData.gender}
                  onChange={handleChange}
                  required
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
              <label htmlFor="country" className="form-label">
                Country <span className="required-star">*</span>
              </label>
              <SearchableCountrySelect
                name="country"
                value={formData.country}
                onChange={handleChange}
                required
              />
              <small className="form-helper-text">Search or scroll to find your country</small>
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
                <span className="required-star">* </span>Yes, I understand and agree to the <Link to="/terms" className="link-green">Herfa Terms of Service</Link>, including the <Link to="/user-agreement" className="link-green">User Agreement</Link> and <Link to="/privacy" className="link-green">Privacy Policy</Link>.
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