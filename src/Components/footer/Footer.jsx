import React from "react";
import { Link } from "react-router-dom";
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
} from "react-icons/fa";
import "./footer.css";
import { useLanguage } from "../../context/LanguageContext";

const Footer = () => {
  const { t } = useLanguage();
  const f = t.footer;
  return (
    <footer className="footer-container">
      <div className="container">
        <div className="row footer-content">
          {/* Hire Now Column */}
          <div className="col-lg-3 col-md-6 col-sm-12 footer-column">
            <h5 className="footer-heading">{f.hireNow}</h5>
            <ul className="footer-links">
              <li>
                <Link to="/freelancers">{f.links.browseFreelancers}</Link>
              </li>
              <li>
                <Link to="/post-job">{f.links.postJob}</Link>
              </li>
              <li>
                <a href="/freelance-developers">{f.links.freelanceDevelopers}</a>
              </li>
              <li>
                <a href="/freelance-designers">{f.links.freelanceDesigners}</a>
              </li>
              <li>
                <a href="/freelance-translators">{f.links.freelanceTranslators}</a>
              </li>
              <li>
                <a href="/freelance-writers">{f.links.freelanceWriters}</a>
              </li>
              <li>
                <a href="/freelance-marketing">{f.links.freelanceMarketing}</a>
              </li>
            </ul>
          </div>

          {/* Find Jobs Column */}
          <div className="col-lg-3 col-md-6 col-sm-12 footer-column">
            <h5 className="footer-heading">{f.findJobs}</h5>
            <ul className="footer-links">
              <li>
                <Link to="/jobs">{f.links.allJobs}</Link>
              </li>
              <li>
                <a href="/development-jobs">{f.links.developmentJobs}</a>
              </li>
              <li>
                <a href="/graphic-design-jobs">{f.links.graphicDesignJobs}</a>
              </li>
              <li>
                <a href="/writing-jobs">{f.links.writingJobs}</a>
              </li>
              <li>
                <a href="/digital-marketing-jobs">{f.links.digitalMarketingJobs}</a>
              </li>
              <li>
                <a href="/marketing-jobs">{f.links.marketingJobs}</a>
              </li>
            </ul>
          </div>

          {/* About Column */}
          <div className="col-lg-3 col-md-6 col-sm-12 footer-column">
            <h5 className="footer-heading">{f.about}</h5>
            <ul className="footer-links">
              <li>
                <Link to="/about">{f.links.aboutUs}</Link>
              </li>
              <li>
                <Link to="/how-it-works">{f.links.howItWorks}</Link>
              </li>
              <li>
                <a href="/success-stories">{f.links.successStories}</a>
              </li>
              <li>
                <a href="/reviews">{f.links.reviews}</a>
              </li>
              <li>
                <a href="/community-partners">{f.links.communityPartners}</a>
              </li>
            </ul>
          </div>

          {/* Contact Support Column */}
          <div className="col-lg-3 col-md-6 col-sm-12 footer-column">
            <h5 className="footer-heading">{f.contactSupport}</h5>
            <ul className="footer-links">
              <li>
                <a href="/contact">{f.links.contactUs}</a>
              </li>
              <li>
                <a href="/blog">{f.links.blog}</a>
              </li>
              <li>
                <a href="/press">{f.links.press}</a>
              </li>
              <li>
                <a href="/freelancers-hub">{f.links.freelancersHub}</a>
              </li>
              <li>
                <a href="/freelancers-faq">{f.links.freelancersFaq}</a>
              </li>
              <li>
                <a href="/employers-faq">{f.links.employersFaq}</a>
              </li>
              <li>
                <a href="/terms">{f.links.terms}</a>
              </li>
              <li>
                <a href="/privacy">{f.links.privacy}</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Social Media Icons */}
        <div className="row footer-social-row">
          <div className="col-12 text-center">
            <div className="footer-social-icons">
              <a href="#" className="footer-social-icon" aria-label="Facebook">
                <FaFacebookF />
              </a>
              <a href="#" className="footer-social-icon" aria-label="Twitter">
                <FaTwitter />
              </a>
              <a href="#" className="footer-social-icon" aria-label="Instagram">
                <FaInstagram />
              </a>
              <a href="#" className="footer-social-icon" aria-label="LinkedIn">
                <FaLinkedinIn />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="row footer-copyright-row">
          <div className="col-12 text-center">
            <p className="footer-copyright-text">
              {f.copyright} |{" "}
              <a href="/privacy" className="footer-privacy-link">
                {f.links.privacy}
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
