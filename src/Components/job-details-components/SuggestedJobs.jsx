import React, { useRef } from 'react'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import SuggestedJobCard from '../../Shared/Cards/SuggestedJobCard'
import './SuggestedJobs.css'

function SuggestedJobs() {
  const scrollContainerRef = useRef(null)

  // Sample suggested jobs data
  const suggestedJobs = [
    {
      id: 4,
      title: 'React Developer for Dashboard UI',
      budget: 1200,
      priceType: 'Fixed-price',
      skills: ['React', 'TypeScript', 'Tailwind CSS', 'API Integration'],
      clientRating: 4.8,
      clientCountry: 'United States',
      postedTime: '2 hours ago'
    },
    {
      id: 5,
      title: 'Frontend Developer - Landing Page Design',
      budget: 600,
      priceType: 'Fixed-price',
      skills: ['HTML5', 'CSS3', 'JavaScript', 'Responsive Design'],
      clientRating: 5,
      clientCountry: 'Canada',
      postedTime: '4 hours ago'
    },
    {
      id: 6,
      title: 'WordPress Theme Customization Expert',
      budget: 400,
      priceType: 'Fixed-price',
      skills: ['WordPress', 'PHP', 'CSS', 'HTML'],
      clientRating: 4.7,
      clientCountry: 'Australia',
      postedTime: '6 hours ago'
    },
    {
      id: 7,
      title: 'Vue.js Developer for SPA Application',
      budget: 1500,
      priceType: 'Fixed-price',
      skills: ['Vue.js', 'Vuex', 'JavaScript', 'REST API'],
      clientRating: 4.9,
      clientCountry: 'United Kingdom',
      postedTime: '8 hours ago'
    },
    {
      id: 8,
      title: 'Bootstrap Expert for Responsive Website',
      budget: 350,
      priceType: 'Fixed-price',
      skills: ['Bootstrap', 'HTML', 'CSS', 'jQuery'],
      clientRating: 4.6,
      clientCountry: 'Germany',
      postedTime: '10 hours ago'
    },
    {
      id: 9,
      title: 'CSS Animation Specialist Needed',
      budget: 500,
      priceType: 'Fixed-price',
      skills: ['CSS3', 'Animations', 'JavaScript', 'GSAP'],
      clientRating: 5,
      clientCountry: 'Netherlands',
      postedTime: '12 hours ago'
    }
  ]

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -350, behavior: 'smooth' })
    }
  }

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 350, behavior: 'smooth' })
    }
  }

  return (
    <section className="suggested-jobs-section">
      <div className="container">
        <div className="suggested-jobs-header">
          <h2 className="suggested-jobs-title">Jobs you might like</h2>
          <div className="suggested-jobs-controls">
            <button 
              className="slider-arrow slider-arrow-left"
              onClick={scrollLeft}
              aria-label="Scroll left"
            >
              <FaChevronLeft />
            </button>
            <button 
              className="slider-arrow slider-arrow-right"
              onClick={scrollRight}
              aria-label="Scroll right"
            >
              <FaChevronRight />
            </button>
          </div>
        </div>

        <div className="suggested-jobs-slider" ref={scrollContainerRef}>
          {suggestedJobs.map((job) => (
            <div key={job.id} className="suggested-job-slide">
              <SuggestedJobCard job={job} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default SuggestedJobs
