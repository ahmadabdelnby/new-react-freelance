import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import {
  FaCode,
  FaSuitcase,
  FaCogs,
  FaChevronDown,
  FaInfoCircle,
  FaQuestionCircle,
  FaBars,
  FaTimes,
  FaComments
} from 'react-icons/fa'
import './navbar.css'
import NotificationBell from '../notification/notification'
import { getUnreadCount } from '../../Services/Chat/ChatSlice'
import socketService from '../../Services/socketService'
import storage from '../../Services/storage'
import { logout } from '../../Services/Authentication/AuthSlice'

function CustomNavbar({ onOpenChatDrawer }) {
  const [openDropdown, setOpenDropdown] = useState(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const navbarRef = useRef(null)
  const navigate = useNavigate()

  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { unreadCount } = useSelector((state) => state.chat)

  useEffect(() => {
    if (user) {
      // Fetch unread count only (Socket is already connected in Layout)
      dispatch(getUnreadCount())
    }
  }, [user, dispatch])

  const toggleDropdown = (dropdown) => {
    setOpenDropdown(openDropdown === dropdown ? null : dropdown)
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
    setOpenDropdown(null)
  }

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navbarRef.current && !navbarRef.current.contains(event.target)) {
        closeMobileMenu()
      }
    }

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isMobileMenuOpen])

  const handleLogout = async () => {
    try {
      await dispatch(logout())
      closeMobileMenu()
      navigate('/')
    } catch { }
  }

  return (
    <nav className="main-navbar" ref={navbarRef}>
      <div className="navbar-container">
        {/* Logo Section */}
        <div className="navbar-section navbar-left">
          <Link to={user ? "/dashboard" : "/"} className="navbar-brand logo-brand" onClick={closeMobileMenu}>
            <div className="logo-container">
              <div className="logo-icon">
                <span className="logo-symbol">H</span>
              </div>
              <div className="logo-text">
                <span className="logo-main">Herfa</span>
                <span className="logo-arabic">حرفة</span>
              </div>
            </div>
          </Link>

          {/* Mobile Toggle Button */}
          <button
            className="mobile-toggle-btn"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {/* Main Navigation Links - Center */}
        <div className={`navbar-section navbar-center ${isMobileMenuOpen ? 'mobile-menu-open' : ''}`}>
          <ul className="navbar-nav main-nav-links">
            <li className="nav-item">
              <Link to="/jobs" className="nav-link nav-link-custom" onClick={closeMobileMenu}>
                <FaSuitcase className="nav-icon" />
                Jobs
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/freelancers" className="nav-link nav-link-custom" onClick={closeMobileMenu}>
                <FaCode className="nav-icon" />
                Freelancers
              </Link>
            </li>

            {/* Discover Dropdown */}
            <li
              className="nav-item dropdown-item-custom"
              onMouseEnter={() => toggleDropdown('discover')}
              onMouseLeave={() => toggleDropdown(null)}
            >
              <button className="nav-link nav-link-custom dropdown-toggle-custom">
                <FaInfoCircle className="nav-icon" />
                Discover
                <FaChevronDown className="dropdown-arrow-icon" />
              </button>
              {openDropdown === 'discover' && (
                <div className="dropdown-menu-custom">
                  <Link to="/categories" className="dropdown-item-link" onClick={closeMobileMenu}>Categories</Link>
                  <Link to="/about" className="dropdown-item-link" onClick={closeMobileMenu}>About Us</Link>
                  <Link to="/how-it-works" className="dropdown-item-link" onClick={closeMobileMenu}>How It Works</Link>
                </div>
              )}
            </li>

            {/* Support Dropdown */}
            <li
              className="nav-item dropdown-item-custom"
              onMouseEnter={() => toggleDropdown('support')}
              onMouseLeave={() => toggleDropdown(null)}
            >
              <button className="nav-link nav-link-custom dropdown-toggle-custom">
                <FaQuestionCircle className="nav-icon" />
                Support
                <FaChevronDown className="dropdown-arrow-icon" />
              </button>
              {openDropdown === 'support' && (
                <div className="dropdown-menu-custom">
                  <Link to="/contact" className="dropdown-item-link" onClick={closeMobileMenu}>Contact Us</Link>
                  <Link to="/lifted" className="dropdown-item-link" onClick={closeMobileMenu}>Help Center</Link>
                </div>
              )}
            </li>
          </ul>
        </div>

        {/* Right Side Navigation */}
        <div className={`navbar-section navbar-right ${isMobileMenuOpen ? 'mobile-menu-open' : ''}`}>
          <ul className="navbar-nav right-nav">
            {user && (
              <li className='nav-item chat-icon-container'>
                <button
                  className="nav-link chat-button"
                  onClick={() => {
                    closeMobileMenu()
                    onOpenChatDrawer?.()
                  }}
                  title="Messages"
                >
                  <FaComments className="nav-icon" />
                  {unreadCount > 0 && (
                    <span className="chat-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
                  )}
                </button>
              </li>
            )}
            <li className='nav-item'>
              <NotificationBell />
            </li>
            {user ? (
              <>
                <li className="nav-item">
                  <Link to="/UserProfile" className="nav-link auth-link" onClick={closeMobileMenu}>Profile</Link>
                </li>
                <li className="nav-item">
                  <button className="nav-link auth-link btn-link" onClick={handleLogout}>Logout</button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link to="/register" className="nav-link auth-link" onClick={closeMobileMenu}>Register</Link>
                </li>
                <li className="nav-item">
                  <Link to="/login" className="nav-link auth-link" onClick={closeMobileMenu}>Login</Link>
                </li>
              </>
            )}
            {user && (
              <li className="nav-item">
                <Link to="/post-job" className="btn btn-primary post-job-btn" onClick={closeMobileMenu}>
                  Post Job
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  )
}

export default CustomNavbar