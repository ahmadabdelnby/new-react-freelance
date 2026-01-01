import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  FaCode,
  FaSuitcase,
  FaCogs,
  FaChevronDown,
  FaInfoCircle,
  FaQuestionCircle,
  FaBars,
  FaTimes,
  FaComments,
  FaFileContract,
  FaEllipsisH,
  FaBell,
  FaDollarSign,
  FaBriefcase,
  FaUser,
  FaSignOutAlt,
} from "react-icons/fa";
import "./navbar.css";
import NotificationBell from "../notification/notification";
import { getUnreadCount } from "../../Services/Chat/ChatSlice";
import socketService from "../../Services/socketService";
import storage from "../../Services/storage";
import { logout } from "../../Services/Authentication/AuthSlice";
import LanguageNavItem from './LanguageToggle'
import { useLanguage } from "../../context/LanguageContext";

function CustomNavbar({ onOpenChatDrawer }) {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const navbarRef = useRef(null);
  const userDropdownRef = useRef(null);
  const userDropdownTimeoutRef = useRef(null);
  const navigate = useNavigate();
  const { t } = useLanguage();
  const nav = t.navbar;

  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { unreadCount } = useSelector((state) => state.chat);

  // Get user display name and avatar
  const getUserDisplayName = () => {
    if (!user) return '';
    if (user.first_name) {
      return user.last_name ? `${user.first_name} ${user.last_name}` : user.first_name;
    }
    return user.username || user.email?.split('@')[0] || 'User';
  };

  const getUserAvatar = () => {
    if (user?.profilePicture) {
      // Check if it's a full URL or a relative path
      if (user.profilePicture.startsWith('http')) {
        return user.profilePicture;
      }
      return `${import.meta.env.VITE_API_URL?.replace('/Freelancing/api/v1', '')}${user.profilePicture}`;
    }
    return '/user-default-img.png';
  };

  // Handlers for user dropdown with delay
  const handleUserDropdownEnter = () => {
    if (userDropdownTimeoutRef.current) {
      clearTimeout(userDropdownTimeoutRef.current);
      userDropdownTimeoutRef.current = null;
    }
    setIsUserDropdownOpen(true);
  };

  const handleUserDropdownLeave = () => {
    userDropdownTimeoutRef.current = setTimeout(() => {
      setIsUserDropdownOpen(false);
    }, 150); // Small delay to allow moving to dropdown
  };

  useEffect(() => {
    if (user) {
      // Fetch unread count only (Socket is already connected in Layout)
      dispatch(getUnreadCount());
    }
  }, [user, dispatch]);

  const toggleDropdown = (dropdown) => {
    setOpenDropdown(openDropdown === dropdown ? null : dropdown);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    setOpenDropdown(null);
    setIsUserDropdownOpen(false);
  };

  // Close dropdown and menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navbarRef.current && !navbarRef.current.contains(event.target)) {
        closeMobileMenu();
      }
      // Close user dropdown when clicking outside
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await dispatch(logout());
      closeMobileMenu();
      navigate("/");
    } catch { }
  };

  return (
    <nav className="main-navbar" ref={navbarRef}>
      <div className="navbar-container">
        {/* Logo Section */}
        <div className="navbar-section navbar-left">
          <Link
            to={user ? "/dashboard" : "/"}
            className="navbar-brand navbar-logo-brand"
            onClick={closeMobileMenu}
          >
            <div className="navbar-logo-container">
              <div className="navbar-logo-icon">
                <span className="navbar-logo-symbol">H</span>
              </div>
              <div className="navbar-logo-text">
                <span className="navbar-logo-main">Herfa</span>
                <span className="navbar-logo-arabic">حرفة</span>
              </div>
            </div>
          </Link>

          {/* Mobile Toggle Button */}
          <button
            className="navbar-mobile-toggle-btn"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {/* Main Navigation Links - Center */}
        <div
          className={`navbar-section navbar-center ${isMobileMenuOpen ? "navbar-mobile-menu-open" : ""
            }`}
        >
          <ul className="navbar-nav navbar-main-nav-links">
            <li className="nav-item">
              <Link
                to="/jobs"
                className="nav-link nav-link-custom"
                onClick={closeMobileMenu}
              >
                <FaSuitcase className="nav-icon" />
                {nav.jobs}
              </Link>
            </li>
            <li className="nav-item">
              <Link
                to="/freelancers"
                className="nav-link nav-link-custom"
                onClick={closeMobileMenu}
              >
                <FaCode className="nav-icon" />
                {nav.freelancers}
              </Link>
            </li>

            {/* Discover Dropdown */}
            <li className="nav-item navbar-dropdown-item">
              <button
                className={`nav-link nav-link-custom navbar-dropdown-toggle ${openDropdown === "discover" ? "active" : ""}`}
                onClick={() => toggleDropdown("discover")}
              >
                <FaInfoCircle className="nav-icon" />
                {nav.discover}
                <FaChevronDown className="navbar-dropdown-arrow-icon" />
              </button>
              {openDropdown === "discover" && (
                <div className="navbar-dropdown-menu">
                  <Link
                    to="/categories"
                    className="navbar-dropdown-item-link"
                    onClick={closeMobileMenu}
                  >
                    {nav.categories}
                  </Link>
                  <Link
                    to="/about"
                    className="navbar-dropdown-item-link"
                    onClick={closeMobileMenu}
                  >
                    {nav.about}
                  </Link>
                  <Link
                    to="/how-it-works"
                    className="navbar-dropdown-item-link"
                    onClick={closeMobileMenu}
                  >
                    {nav.howItWorks}
                  </Link>
                </div>
              )}
            </li>

            {/* Support Dropdown */}
            <li className="nav-item navbar-dropdown-item">
              <button
                className={`nav-link nav-link-custom navbar-dropdown-toggle ${openDropdown === "support" ? "active" : ""}`}
                onClick={() => toggleDropdown("support")}
              >
                <FaQuestionCircle className="nav-icon" />
                {nav.support}
                <FaChevronDown className="navbar-dropdown-arrow-icon" />
              </button>
              {openDropdown === "support" && (
                <div className="navbar-dropdown-menu">
                  <Link
                    to="/contact"
                    className="navbar-dropdown-item-link"
                    onClick={closeMobileMenu}
                  >
                    {nav.contact}
                  </Link>
                  <Link
                    to="/lifted"
                    className="navbar-dropdown-item-link"
                    onClick={closeMobileMenu}
                  >
                    {nav.help}
                  </Link>
                </div>
              )}
            </li>

            {/* More Dropdown - Only for logged in users */}
            {user && (
              <li className="nav-item navbar-dropdown-item">
                <button
                  className={`nav-link nav-link-custom navbar-dropdown-toggle ${openDropdown === "more" ? "active" : ""}`}
                  onClick={() => toggleDropdown("more")}
                >
                  <FaEllipsisH className="nav-icon" />
                  {nav.more}
                  <FaChevronDown className="navbar-dropdown-arrow-icon" />
                </button>
                {openDropdown === "more" && (
                  <div className="navbar-dropdown-menu">
                    <Link
                      to="/contracts"
                      className="navbar-dropdown-item-link"
                      onClick={closeMobileMenu}
                    >
                      <FaFileContract className="nav-icon" /> {nav.contracts}
                    </Link>
                    <Link
                      to="/payments"
                      className="navbar-dropdown-item-link"
                      onClick={closeMobileMenu}
                    >
                      <FaDollarSign className="nav-icon" /> {nav.payments}
                    </Link>
                    <Link
                      to="/post-job"
                      className="navbar-dropdown-item-link"
                      onClick={closeMobileMenu}
                    >
                      <FaBriefcase className="nav-icon" /> {nav.postJob}
                    </Link>
                  </div>
                )}
              </li>
            )}
          </ul>
        </div>

        {/* Right Side Navigation */}
        <div
          className={`navbar-section navbar-right ${isMobileMenuOpen ? "navbar-mobile-menu-open" : ""
            }`}
        >
          <ul className="navbar-nav navbar-right-nav">
            {user ? (
              <>
                {/* Messages Icon with Badge */}
                <li className="nav-item">
                  <button
                    className="nav-link navbar-icon-btn"
                    onClick={() => {
                      closeMobileMenu();
                      onOpenChatDrawer?.();
                    }}
                    aria-label="Messages"
                    title="Messages"
                  >
                    <FaComments className="navbar-icon" />
                    {unreadCount > 0 && (
                      <span className="navbar-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
                    )}
                  </button>
                </li>

                {/* Notifications Icon with Badge */}
                <li className="nav-item">
                  <NotificationBell isMobile={isMobileMenuOpen} onNavigate={closeMobileMenu} />
                </li>

                <LanguageNavItem closeMobileMenu={closeMobileMenu} />
                
                {/* User Chip with Dropdown */}
                <li 
                  className="nav-item navbar-user-chip-container"
                  ref={userDropdownRef}
                  onMouseEnter={handleUserDropdownEnter}
                  onMouseLeave={handleUserDropdownLeave}
                >
                  <button 
                    className="navbar-user-chip"
                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  >
                    <img 
                      src={getUserAvatar()} 
                      alt="User Avatar" 
                      className="navbar-user-avatar"
                      onError={(e) => { e.target.src = '/user-default-img.png'; }}
                    />
                    <span className="navbar-user-name">{getUserDisplayName()}</span>
                    <FaChevronDown className={`navbar-user-arrow ${isUserDropdownOpen ? 'open' : ''}`} />
                  </button>
                  
                  {isUserDropdownOpen && (
                    <div className="navbar-user-dropdown">
                      <Link
                        to="/UserProfile"
                        className="navbar-user-dropdown-item"
                        onClick={closeMobileMenu}
                      >
                        <FaUser className="navbar-user-dropdown-icon" />
                        {nav.profile}
                      </Link>
                      <div className="navbar-user-dropdown-divider"></div>
                      <button
                        className="navbar-user-dropdown-item navbar-user-dropdown-logout"
                        onClick={handleLogout}
                      >
                        <FaSignOutAlt className="navbar-user-dropdown-icon" />
                        {nav.logout}
                      </button>
                    </div>
                  )}
                </li>
              </>
            ) : (
              <>
                <LanguageNavItem closeMobileMenu={closeMobileMenu} />
                <li className="nav-item">
                  <Link
                    to="/register"
                    className="nav-link navbar-auth-link"
                    onClick={closeMobileMenu}
                  >
                    {nav.register}
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    to="/login"
                    className="nav-link navbar-auth-link"
                    onClick={closeMobileMenu}
                  >
                    {nav.login}
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default CustomNavbar;
