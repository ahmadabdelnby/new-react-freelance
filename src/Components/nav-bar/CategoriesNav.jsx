import React from 'react'
import { 
  FaCode, 
  FaPalette, 
  FaVideo, 
  FaLanguage, 
  FaPen, 
  FaBullhorn, 
  FaChartLine, 
  FaSuitcase, 
  FaGraduationCap, 
  FaDollarSign, 
  FaCogs, 
  FaChevronDown,
  FaChevronLeft,
  FaChevronRight
} from 'react-icons/fa'
import './categoriesNav.css'

function CategoriesNav() {
  const scrollLeft = () => {
    const container = document.querySelector('.categories-scroll')
    if (container) {
      container.scrollBy({ left: -200, behavior: 'smooth' })
    }
  }

  const scrollRight = () => {
    const container = document.querySelector('.categories-scroll')
    if (container) {
      container.scrollBy({ left: 200, behavior: 'smooth' })
    }
  }

  return (
    <div className="categories-navbar">
      <div className="container">
        <div className="categories-container d-flex align-items-center">
          {/* Left Arrow */}
          <button 
            className="category-arrow category-arrow-left"
            onClick={scrollLeft}
            aria-label="Scroll categories left"
          >
            <FaChevronLeft />
          </button>
          
          {/* Categories Scroll Container */}
          <div className="categories-scroll">
            <div className="category-item">
              <FaCode className="nav-category-icon" />
              <span>Developers</span>
            </div>
            <div className="category-item">
              <FaPalette className="nav-category-icon" />
              <span>Designers</span>
            </div>
            <div className="category-item">
              <FaVideo className="nav-category-icon" />
              <span>Media Production</span>
            </div>
            <div className="category-item">
              <FaLanguage className="nav-category-icon" />
              <span>Translators</span>
            </div>
            <div className="category-item">
              <FaPen className="nav-category-icon" />
              <span>Writing</span>
            </div>
            <div className="category-item">
              <FaBullhorn className="nav-category-icon" />
              <span>Digital Marketing</span>
            </div>
            <div className="category-item">
              <FaChartLine className="nav-category-icon" />
              <span>Marketing</span>
            </div>
            <div className="category-item">
              <FaSuitcase className="nav-category-icon" />
              <span>Sales</span>
            </div>
            <div className="category-item">
              <FaGraduationCap className="nav-category-icon" />
              <span>Training</span>
            </div>
            <div className="category-item">
              <FaDollarSign className="nav-category-icon" />
              <span>Finance</span>
            </div>
            <div className="category-item dropdown-category">
              <FaCogs className="nav-category-icon" />
              <span>Business</span>
              <FaChevronDown className="dropdown-arrow" />
            </div>
            <div className="category-item dropdown-category">
              <FaCogs className="nav-category-icon" />
              <span>Engineering</span>
              <FaChevronDown className="dropdown-arrow" />
            </div>
          </div>
          
          {/* Right Arrow */}
          <button 
            className="category-arrow category-arrow-right"
            onClick={scrollRight}
            aria-label="Scroll categories right"
          >
            <FaChevronRight />
          </button>
        </div>
      </div>
    </div>
  )
}

export default CategoriesNav
