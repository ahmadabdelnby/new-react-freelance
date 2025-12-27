import React from 'react'
import CategoryCard from '../../Shared/Cards/CategoryCard'
import './CategoriesSection.css'
import { FaCode, FaPaintBrush, FaHandshake, FaPencilAlt, FaUserTie, FaChartLine, FaGavel, FaUsers, FaTools } from 'react-icons/fa'
import { AiOutlineRobot } from 'react-icons/ai'
import { useLanguage } from "../../context/LanguageContext";



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
    const { t } = useLanguage();

  return (
    <section className="categories-section">
      <div className="container">
        <h2 className="categories-title">{t.categories.title}</h2>

        <div className="categories-grid">
          {t.categories.list.map((c, i) => (
            <CategoryCard key={i} title={c} icon={Object.values(iconsMap)[i]} />
          ))}
        </div>
      </div>
    </section>
  );
}


export default CategoriesSection
