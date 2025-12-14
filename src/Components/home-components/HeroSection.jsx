import React from 'react'
import './HeroSection.css'
import { FaSearch } from 'react-icons/fa'

const HERO_IMAGE = 'https://res.cloudinary.com/upwork-cloud-acquisition-prod/image/upload/q_auto,h_630/v1741896805/brontes/hero/ApartmentCoder.jpg'

function HeroSection() {
  return (
    <section className="hero-variant">
      <div className="hero-card">
        <div className="hero-bg" style={{ backgroundImage: `url(${HERO_IMAGE})` }} />

        <div className="hero-inner container">
          <div className="hero-left">
            <h1 className="hero-title">Connecting clients in need to freelancers who deliver</h1>

            <div className="search-card">
              <div className="search-tabs">
                <button className="tab active">Find talent</button>
                <button className="tab">Browse jobs</button>
              </div>

              <div className="search-row">
                <input className="search-input" placeholder="Search by role, skills, or keywords" />
                <button className="search-btn"><FaSearch /> <span>Search</span></button>
              </div>

              <div className="trusted-logos">
                <span className="logo">Microsoft</span>
                <span className="logo">airbnb</span>
                <span className="logo">bissell</span>
                <span className="logo">GLASSDOOR</span>
              </div>
            </div>
          </div>

          <div className="hero-right" aria-hidden="true" />
        </div>
      </div>
    </section>
  )
}

export default HeroSection