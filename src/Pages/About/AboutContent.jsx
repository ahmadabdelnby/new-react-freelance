import React from 'react'
import './AboutContent.css'
import { FaLightbulb, FaHandshake, FaShieldAlt, FaBolt } from 'react-icons/fa'

function AboutContent() {
  const values = [
    {
      icon: <FaLightbulb />,
      title: 'Innovation',
      description: 'We constantly push boundaries to create cutting-edge solutions that transform the freelancing experience.'
    },
    {
      icon: <FaHandshake />,
      title: 'Trust',
      description: 'Building reliable connections between clients and freelancers through transparency and integrity.'
    },
    {
      icon: <FaShieldAlt />,
      title: 'Security',
      description: 'Ensuring safe transactions and protecting user data with industry-leading security measures.'
    },
    {
      icon: <FaBolt />,
      title: 'Efficiency',
      description: 'Streamlining the hiring process to save time and deliver results faster than ever before.'
    }
  ]

  return (
    <section className="about-values-section">
      <div className="about-values-container">
        {/* Section Header */}
        <div className="about-values-header">
          <span className="about-values-label">Our Mission</span>
          <h2 className="about-values-title">Why We Built This Platform</h2>
          <p className="about-values-subtitle">
            As ITI graduates, we understand the challenges freelancers face. 
            Our mission is to create a platform that empowers talented professionals 
            to showcase their skills and connect with clients who value quality work.
          </p>
        </div>

        {/* Values Grid */}
        <div className="about-values-grid">
          {values.map((value, index) => (
            <div key={index} className="about-value-card">
              <div className="about-value-icon">
                {value.icon}
              </div>
              <h3 className="about-value-title">{value.title}</h3>
              <p className="about-value-description">{value.description}</p>
            </div>
          ))}
        </div>

        {/* Quote Section */}
        <div className="about-quote-section">
          <blockquote className="about-quote">
            "We believe that great work happens when talented people are empowered 
            with the right tools and opportunities."
          </blockquote>
          <div className="about-quote-author">
            <span className="about-author-name">The Team</span>
            <span className="about-author-title">ITI Freelancing Platform</span>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AboutContent
