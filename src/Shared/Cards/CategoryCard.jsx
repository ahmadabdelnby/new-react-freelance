import React from 'react'
import './CategoryCard.css'

function CategoryCard({ title, icon }) {
  return (
    <div className="category-card">
      <div className="category-icon">{icon || <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 12h18" stroke="#13A800" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>}</div>
      <div className="category-title">{title}</div>
    </div>
  )
}

export default CategoryCard
