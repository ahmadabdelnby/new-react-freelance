import React from "react";
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
  FaChevronRight,
} from "react-icons/fa";
import "./categoriesNav.css";

function CategoriesNav() {
  const scrollLeft = () => {
    const container = document.querySelector(".categories-scroll");
    if (container) {
      container.scrollBy({ left: -200, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    const container = document.querySelector(".categories-scroll");
    if (container) {
      container.scrollBy({ left: 200, behavior: "smooth" });
    }
  };

  return (
    <div className="categories-navbar">
      <div className="container">
        <div className="categories-container d-flex align-items-center">
          {/* Left Arrow */}
          <button
            className="categories-nav-arrow categories-nav-arrow-left"
            onClick={scrollLeft}
            aria-label="Scroll categories left"
          >
            <FaChevronLeft />
          </button>

          {/* Categories Scroll Container */}
          <div className="categories-scroll">
            <div className="categories-nav-item">
              <FaCode className="categories-nav-icon" />
              <span>Developers</span>
            </div>
            <div className="categories-nav-item">
              <FaPalette className="categories-nav-icon" />
              <span>Designers</span>
            </div>
            <div className="categories-nav-item">
              <FaVideo className="categories-nav-icon" />
              <span>Media Production</span>
            </div>
            <div className="categories-nav-item">
              <FaLanguage className="categories-nav-icon" />
              <span>Translators</span>
            </div>
            <div className="categories-nav-item">
              <FaPen className="categories-nav-icon" />
              <span>Writing</span>
            </div>
            <div className="categories-nav-item">
              <FaBullhorn className="categories-nav-icon" />
              <span>Digital Marketing</span>
            </div>
            <div className="categories-nav-item">
              <FaChartLine className="categories-nav-icon" />
              <span>Marketing</span>
            </div>
            <div className="categories-nav-item">
              <FaSuitcase className="categories-nav-icon" />
              <span>Sales</span>
            </div>
            <div className="categories-nav-item">
              <FaGraduationCap className="categories-nav-icon" />
              <span>Training</span>
            </div>
            <div className="categories-nav-item">
              <FaDollarSign className="categories-nav-icon" />
              <span>Finance</span>
            </div>
            <div className="categories-nav-item categories-nav-dropdown">
              <FaCogs className="categories-nav-icon" />
              <span>Business</span>
              <FaChevronDown className="categories-nav-dropdown-arrow" />
            </div>
            <div className="categories-nav-item categories-nav-dropdown">
              <FaCogs className="categories-nav-icon" />
              <span>Engineering</span>
              <FaChevronDown className="categories-nav-dropdown-arrow" />
            </div>
          </div>

          {/* Right Arrow */}
          <button
            className="categories-nav-arrow categories-nav-arrow-right"
            onClick={scrollRight}
            aria-label="Scroll categories right"
          >
            <FaChevronRight />
          </button>
        </div>
      </div>
    </div>
  );
}

export default CategoriesNav;
