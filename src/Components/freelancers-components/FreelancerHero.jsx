import React from 'react'
import { FaStar } from 'react-icons/fa'
import './FreelancerHero.css'

function FreelancerHero() {
  return (
    <section className="freelancer-hero">
      <div className="container">
        <div className="freelancer-hero-content">
          <h1 className="freelancer-hero-title">
            Hire the best Freelancers
          </h1>
          
          <div className="freelancer-rating">
            <span className="rating-text">Clients rate our Freelancers</span>
            <div className="rating-stars">
              <FaStar className="star-icon" />
              <FaStar className="star-icon" />
              <FaStar className="star-icon" />
              <FaStar className="star-icon" />
              <FaStar className="star-icon" />
            </div>
            <span className="rating-score">4.8/5</span>
          </div>
          
          <p className="rating-reviews">Based on 146,316 client reviews</p>
          
          <button className="hire-freelancers-btn">
            Hire freelancers
          </button>
        </div>
      </div>
    </section>
  )
}

export default FreelancerHero
