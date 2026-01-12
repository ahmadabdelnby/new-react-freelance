import React from 'react'
import './CTASection.css'
import { useLanguage } from "../../context/LanguageContext";
import { FaRocket, FaArrowRight } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'

function CTASection() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <section className="cta-section-v2">
      <div className="container">
        <div className="cta-card">
          <div className="cta-content">
            <div className="cta-icon">
              <FaRocket />
            </div>
            <h2 className="cta-title">{t.cta.title}</h2>
            <p className="cta-subtitle">
              {t.cta?.subtitle || 'Join thousands of professionals and start your journey today'}
            </p>
          </div>
          <div className="cta-buttons">
            <button className="cta-button cta-primary" onClick={() => navigate('/register')}>
              {t.cta.button}
              <FaArrowRight className="btn-icon" />
            </button>
            <button className="cta-button cta-secondary" onClick={() => navigate('/jobs')}>
              {t.cta?.browseJobs || 'Browse Jobs'}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}


export default CTASection