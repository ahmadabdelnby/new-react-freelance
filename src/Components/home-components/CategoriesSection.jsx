import React from 'react'
import CategoryCard from '../../Shared/Cards/CategoryCard'
import './CategoriesSection.css'
import { FaCode, FaPaintBrush, FaHandshake, FaPencilAlt, FaUserTie, FaChartLine, FaGavel, FaUsers, FaTools } from 'react-icons/fa'
import { AiOutlineRobot } from 'react-icons/ai'

const categories = [
  'Development & IT',
  'Design & Creative',
  'AI Services',
  'Sales & Marketing',
  'Writing & Translation',
  'Admin & Support',
  'Finance & Accounting',
  'Legal',
  'HR & Training',
  'Engineering & Architecture'
]

const iconsMap = {
  'Development & IT': <FaCode />, 
  'Design & Creative': <FaPaintBrush />, 
  'AI Services': <AiOutlineRobot />, 
  'Sales & Marketing': <FaHandshake />, 
  'Writing & Translation': <FaPencilAlt />,
  'Admin & Support': <FaUserTie />,
  'Finance & Accounting': <FaChartLine />,
  'Legal': <FaGavel />,
  'HR & Training': <FaUsers />,
  'Engineering & Architecture': <FaTools />
}

function CategoriesSection() {
  return (
    <section className="categories-section">
      <div className="container">
        <h2 className="categories-title">Explore millions of pros</h2>

        <div className="categories-grid">
          {categories.map((c) => (
            <CategoryCard key={c} title={c} icon={iconsMap[c]} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default CategoriesSection
