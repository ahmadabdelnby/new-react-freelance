import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { fetchCategories, fetchSpecialtiesByCategory } from "../Services/Categories/CategoriesSlice";
import {
  FaCode,
  FaMobileAlt,
  FaPaintBrush,
  FaPenFancy,
  FaBullhorn,
  FaVideo,
  FaChartBar,
  FaDraftingCompass
} from "react-icons/fa";
import "./Categories.css";

const iconMap = {
  "Web Development": <FaCode />,
  "Mobile Development": <FaMobileAlt />,
  "Design & Creative": <FaPaintBrush />,
  "Writing & Translation": <FaPenFancy />,
  "Digital Marketing": <FaBullhorn />,
  "Video & Animation": <FaVideo />,
  "Data Science & Analytics": <FaChartBar />,
  "Engineering & Architecture": <FaDraftingCompass />,
};

function Categories() {
  const dispatch = useDispatch();
  const { categories, specialtiesByCategory } = useSelector((state) => state.categories);
  
  // Ensure categories is always an array
  const categoriesArray = Array.isArray(categories) ? categories : [];

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);
  
  useEffect(() => {
    if (categoriesArray.length > 0) {
      categoriesArray.forEach(category => {
        dispatch(fetchSpecialtiesByCategory(category._id));
      });
    }
  }, [dispatch, categoriesArray.length]);

  return (
    <div className="categories-page">
      <div className="categories-hero">
        <div className="container">
          <h1 className="categories-hero-title">Browse Categories</h1>
          <p className="categories-hero-subtitle">
            Explore our diverse range of professional services and find the perfect match for your project
          </p>
        </div>
      </div>

      <div className="container">
        <div className="categories-grid">
          {categoriesArray.map((category) => {
            const categorySpecialties = Array.isArray(specialtiesByCategory[category._id]) 
              ? specialtiesByCategory[category._id] 
              : [];

            return (
              <div key={category._id} className="category-card">
                <div className="category-card-header">
                  <div className="category-icon-wrapper">
                    <div className="category-page-icon">{iconMap[category.name]}</div>
                  </div>
                  <div className="category-info">
                    <h3 className="category-name">{category.name}</h3>
                    <p className="category-description">{category.description}</p>
                  </div>
                </div>

                <div className="category-specialties">
                  <h4 className="specialties-title">Specialties</h4>
                  <div className="specialties-list">
                    {categorySpecialties.map((specialty) => (
                      <Link
                        key={specialty._id}
                        to={`/jobs?category=${category.name}&specialty=${specialty.name}`}
                        className="specialty-tag"
                      >
                        {specialty.name}
                      </Link>
                    ))}
                  </div>
                </div>

                <Link to={`/jobs?category=${category.name}`} className="category-view-all">
                  View All Jobs in {category.name}
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Categories;
