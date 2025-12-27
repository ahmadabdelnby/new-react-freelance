import React from 'react'
import './HeroSection.css'
import { FaSearch } from 'react-icons/fa'
import { useLanguage } from "../../context/LanguageContext";

const HERO_IMAGE = 'https://res.cloudinary.com/upwork-cloud-acquisition-prod/image/upload/q_auto,h_630/v1741896805/brontes/hero/ApartmentCoder.jpg'

function HeroSection() {
    const { t } = useLanguage();
  return (
    <section className="hero-variant">
      <div className="hero-card">
        <div className="hero-bg" style={{ backgroundImage: `url(${HERO_IMAGE})` }} />

        <div className="hero-inner container">
          <div className="hero-left">
            <h1 className="hero-title">{t.hero.title}</h1>

            <div className="search-card">
              <div className="search-tabs">
                <button className="tab active">{t.hero.findTalent}</button>
                <button className="tab">{t.hero.browseJobs}</button>
              </div>

              <div className="search-row">
                <input className="search-input" placeholder={t.hero.searchPlaceholder} />
                <button className="search-btn">
                  <FaSearch /> <span>{t.hero.search}</span>
                </button>
              </div>
            </div>
          </div>

          <div className="hero-right" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}

export default HeroSection