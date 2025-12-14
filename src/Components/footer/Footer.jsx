import React from 'react'
import { Link } from 'react-router-dom'
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from 'react-icons/fa'
import './footer.css'

const Footer = () => {
  return (
    <footer className="custom-footer-f">
      <div className="container">
        <div className="row footer-content-f">
          {/* Hire Now Column */}
          <div className="col-lg-3 col-md-6 col-sm-12 footer-column-f">
            <h5 className="footer-heading-f">Hire Now</h5>
            <ul className="footer-links-f">
              <li><Link to="/freelancers">Browse All Freelancers</Link></li>
              <li><Link to="/post-job">Post a Job</Link></li>
              <li><a href="/freelance-developers">Freelance Developers</a></li>
              <li><a href="/freelance-designers">Freelance Designers</a></li>
              <li><a href="/freelance-translators">Freelance Translators</a></li>
              <li><a href="/freelance-writers">Freelance Writers</a></li>
              <li><a href="/freelance-marketing">Freelance Digital Marketing</a></li>
            </ul>
          </div>

          {/* Find Jobs Column */}
          <div className="col-lg-3 col-md-6 col-sm-12 footer-column-f">
            <h5 className="footer-heading-f">Find Jobs</h5>
            <ul className="footer-links-f">
              <li><Link to="/jobs">All Jobs</Link></li>
              <li><a href="/development-jobs">Development Jobs</a></li>
              <li><a href="/graphic-design-jobs">Graphic Design Jobs</a></li>
              <li><a href="/writing-jobs">Writing Jobs</a></li>
              <li><a href="/digital-marketing-jobs">Digital Marketing Jobs</a></li>
              <li><a href="/marketing-jobs">Marketing Jobs</a></li>
            </ul>
          </div>

          {/* About Column */}
          <div className="col-lg-3 col-md-6 col-sm-12 footer-column-f">
            <h5 className="footer-heading-f">About</h5>
            <ul className="footer-links-f">
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/how-it-works">How Herfa Works</Link></li>
              <li><a href="/success-stories">Success Stories</a></li>
              <li><a href="/reviews">Reviews & Testimonials</a></li>
              <li><a href="/community-partners">Our Community Partners</a></li>
            </ul>
          </div>

          {/* Contact Support Column */}
          <div className="col-lg-3 col-md-6 col-sm-12 footer-column-f">
            <h5 className="footer-heading-f">Contact Support</h5>
            <ul className="footer-links-f">
              <li><a href="/contact">Contact Us</a></li>
              <li><a href="/blog">Blog</a></li>
              <li><a href="/press">Press</a></li>
              <li><a href="/freelancers-hub">Freelancers Hub</a></li>
              <li><a href="/freelancers-faq">Freelancers FAQ</a></li>
              <li><a href="/employers-faq">Employers FAQ</a></li>
              <li><a href="/terms">Terms & Conditions</a></li>
              <li><a href="/privacy">Privacy Policy</a></li>
            </ul>
          </div>
        </div>

        {/* Social Media Icons */}
        <div className="row social-media-row-f">
          <div className="col-12 text-center">
            <div className="social-icons-f">
              <a href="#" className="social-icon-f" aria-label="Facebook">
                <FaFacebookF />
              </a>
              <a href="#" className="social-icon-f" aria-label="Twitter">
                <FaTwitter />
              </a>
              <a href="#" className="social-icon-f" aria-label="Instagram">
                <FaInstagram />
              </a>
              <a href="#" className="social-icon-f" aria-label="LinkedIn">
                <FaLinkedinIn />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="row copyright-row-f">
          <div className="col-12 text-center">
            <p className="copyright-text-f">
              © 2025 Herfa - All Rights Reserved. v1.0 | <a href="/privacy" className="privacy-link-f">Privacy Policy</a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer