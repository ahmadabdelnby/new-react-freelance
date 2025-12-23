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
} from "react-icons/fa";
import "./navbar.css";
import NotificationBell from "../notification/notification";
import { getUnreadCount } from "../../Services/Chat/ChatSlice";
import socketService from "../../Services/socketService";
import storage from "../../Services/storage";
import { logout } from "../../Services/Authentication/AuthSlice";

function CustomNavbar({ onOpenChatDrawer }) {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navbarRef = useRef(null);
  const navigate = useNavigate();

  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { unreadCount } = useSelector((state) => state.chat);

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
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navbarRef.current && !navbarRef.current.contains(event.target)) {
        closeMobileMenu();
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  const handleLogout = async () => {
    try {
      await dispatch(logout());
      closeMobileMenu();
      navigate("/");
    } catch {}
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
          className={`navbar-section navbar-center ${
            isMobileMenuOpen ? "navbar-mobile-menu-open" : ""
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
                Jobs
              </Link>
            </li>
            <li className="nav-item">
              <Link
                to="/freelancers"
                className="nav-link nav-link-custom"
                onClick={closeMobileMenu}
              >
                <FaCode className="nav-icon" />
                Freelancers
              </Link>
            </li>

            {/* Discover Dropdown */}
            <li
              className="nav-item navbar-dropdown-item"
              onMouseEnter={() => toggleDropdown("discover")}
              onMouseLeave={() => toggleDropdown(null)}
            >
              <button className="nav-link nav-link-custom navbar-dropdown-toggle">
                <FaInfoCircle className="nav-icon" />
                Discover
                <FaChevronDown className="navbar-dropdown-arrow-icon" />
              </button>
              {openDropdown === "discover" && (
                <div className="navbar-dropdown-menu">
                  <Link
                    to="/categories"
                    className="navbar-dropdown-item-link"
                    onClick={closeMobileMenu}
                  >
                    Categories
                  </Link>
                  <Link
                    to="/about"
                    className="navbar-dropdown-item-link"
                    onClick={closeMobileMenu}
                  >
                    About Us
                  </Link>
                  <Link
                    to="/how-it-works"
                    className="navbar-dropdown-item-link"
                    onClick={closeMobileMenu}
                  >
                    How It Works
                  </Link>
                </div>
              )}
            </li>

            {/* Support Dropdown */}
            <li
              className="nav-item navbar-dropdown-item"
              onMouseEnter={() => toggleDropdown("support")}
              onMouseLeave={() => toggleDropdown(null)}
            >
              <button className="nav-link nav-link-custom navbar-dropdown-toggle">
                <FaQuestionCircle className="nav-icon" />
                Support
                <FaChevronDown className="navbar-dropdown-arrow-icon" />
              </button>
              {openDropdown === "support" && (
                <div className="navbar-dropdown-menu">
                  <Link
                    to="/contact"
                    className="navbar-dropdown-item-link"
                    onClick={closeMobileMenu}
                  >
                    Contact Us
                  </Link>
                  <Link
                    to="/lifted"
                    className="navbar-dropdown-item-link"
                    onClick={closeMobileMenu}
                  >
                    Help Center
                  </Link>
                </div>
              )}
            </li>

            {/* More Dropdown - Only for logged in users */}
            {user && (
              <li
                className="nav-item navbar-dropdown-item"
                onMouseEnter={() => toggleDropdown("more")}
                onMouseLeave={() => toggleDropdown(null)}
              >
                <button className="nav-link nav-link-custom navbar-dropdown-toggle">
                  <FaEllipsisH className="nav-icon" />
                  More
                  <FaChevronDown className="navbar-dropdown-arrow-icon" />
                </button>
                {openDropdown === "more" && (
                  <div className="navbar-dropdown-menu">
                    <button
                      className="navbar-dropdown-item-link navbar-dropdown-button"
                      onClick={() => {
                        closeMobileMenu();
                        onOpenChatDrawer?.();
                      }}
                    >
                      <FaComments className="nav-icon" /> Messages
                    </button>
                    <Link
                      to="/notifications"
                      className="navbar-dropdown-item-link"
                      onClick={closeMobileMenu}
                    >
                      <FaBell className="nav-icon" /> Notifications
                    </Link>
                    <Link
                      to="/contracts"
                      className="navbar-dropdown-item-link"
                      onClick={closeMobileMenu}
                    >
                      <FaFileContract className="nav-icon" /> Contracts
                    </Link>
                    <Link
                      to="/payments"
                      className="navbar-dropdown-item-link"
                      onClick={closeMobileMenu}
                    >
                      <FaDollarSign className="nav-icon" /> Payments
                    </Link>
                    <Link
                      to="/post-job"
                      className="navbar-dropdown-item-link"
                      onClick={closeMobileMenu}
                    >
                      <FaBriefcase className="nav-icon" /> Post Job
                    </Link>
                  </div>
                )}
              </li>
            )}
          </ul>
        </div>

        {/* Right Side Navigation */}
        <div
          className={`navbar-section navbar-right ${
            isMobileMenuOpen ? "navbar-mobile-menu-open" : ""
          }`}
        >
          <ul className="navbar-nav navbar-right-nav">
            {user ? (
              <>
                <li className="nav-item">
                  <Link
                    to="/UserProfile"
                    className="nav-link navbar-auth-link"
                    onClick={closeMobileMenu}
                  >
                    Profile
                  </Link>
                </li>
                <li className="nav-item">
                  <button
                    className="nav-link navbar-auth-link btn-link"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link
                    to="/register"
                    className="nav-link navbar-auth-link"
                    onClick={closeMobileMenu}
                  >
                    Register
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    to="/login"
                    className="nav-link navbar-auth-link"
                    onClick={closeMobileMenu}
                  >
                    Login
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
