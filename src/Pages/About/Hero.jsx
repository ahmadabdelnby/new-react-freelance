import React from 'react'
import './About.css'
import { FaUsers, FaCode, FaRocket, FaHeart } from 'react-icons/fa'

function Hero() {
  const stats = [
    { icon: <FaUsers />, number: '5', label: 'Team Members' },
    { icon: <FaCode />, number: '10K+', label: 'Lines of Code' },
    { icon: <FaRocket />, number: '50+', label: 'Features Built' },
    { icon: <FaHeart />, number: '100%', label: 'Passion' }
  ]

  return (
    <section className="about-hero-section">
      <div className="about-hero-container">
        <div className="about-hero-content">
          {/* Left Content */}
          <div className="about-hero-text">
            <span className="about-hero-label">About Us</span>
            <h1 className="about-hero-title">
              Building the Future of
              <span className="about-hero-highlight"> Freelancing</span>
            </h1>
            <p className="about-hero-description">
              We are a team of passionate developers from ITI (Information Technology Institute) 
              dedicated to creating a modern, efficient, and user-friendly freelancing platform 
              that connects talented professionals with amazing opportunities.
            </p>

            {/* Stats */}
            <div className="about-hero-stats">
              {stats.map((stat, index) => (
                <div key={index} className="about-stat-item">
                  <div className="about-stat-icon">{stat.icon}</div>
                  <div className="about-stat-info">
                    <span className="about-stat-number">{stat.number}</span>
                    <span className="about-stat-label">{stat.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right - Team Preview */}
          <div className="about-hero-visual">
            <div className="about-hero-images">
              <div className="about-hero-image-stack">
                <img src="/Ahmed.jpeg" alt="Team Member" className="about-stack-img about-stack-1" />
                <img src="/Mahmoud.jpeg" alt="Team Member" className="about-stack-img about-stack-2" />
                <img src="/makram.jpeg" alt="Team Member" className="about-stack-img about-stack-3" />
                <img src="/radwa.jpeg" alt="Team Member" className="about-stack-img about-stack-4" />
                <img src="/Rehab.jpeg" alt="Team Member" className="about-stack-img about-stack-5" />
              </div>
              <div className="about-hero-badge">
                <span className="about-badge-text">ITI Graduates</span>
                <span className="about-badge-year">2025</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Background Decoration */}
      <div className="about-hero-bg-decoration">
        <div className="about-decoration-circle about-circle-1"></div>
        <div className="about-decoration-circle about-circle-2"></div>
      </div>
    </section>
  )
}

export default Hero
