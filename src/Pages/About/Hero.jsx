import React from 'react'
import './About.css'

function Hero() {
  return (
    <section className="hero-about-section">
      <div className="hero-about-container">
        <div className="hero-about-content">
          <div className="hero-about-text">
            <h1 className="hero-about-title">About Us</h1>
            <p className="hero-about-subtitle">The world's human and AI-powered work marketplace</p>
          </div>
          
          <div className="hero-about-image-wrapper">
            <img 
              src="https://cdn.prod.website-files.com/603fea6471d9d8559d077603/68fa13d58ef4d5b4462cfc3a_Visual%20(51).avif"
              alt="Hayden Brown - President & CEO"
              className="hero-about-image"
            />
            <div className="hero-about-caption">
              <h3 className="hero-about-name">Hayden Brown</h3>
              <p className="hero-about-position">President & CEO</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero