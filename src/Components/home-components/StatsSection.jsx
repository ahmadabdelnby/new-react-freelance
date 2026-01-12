import React, { useEffect, useState } from 'react'
import './StatsSection.css'
import { FaUsers, FaBriefcase, FaCheckCircle, FaDollarSign } from 'react-icons/fa'
import { useLanguage } from "../../context/LanguageContext";

const stats = [
  {
    icon: <FaUsers />,
    value: 50000,
    suffix: '+',
    labelKey: 'activeFreelancers',
    defaultLabel: 'Active Freelancers'
  },
  {
    icon: <FaBriefcase />,
    value: 25000,
    suffix: '+',
    labelKey: 'jobsPosted',
    defaultLabel: 'Jobs Posted'
  },
  {
    icon: <FaCheckCircle />,
    value: 98,
    suffix: '%',
    labelKey: 'satisfactionRate',
    defaultLabel: 'Satisfaction Rate'
  },
  {
    icon: <FaDollarSign />,
    value: 10,
    suffix: 'M+',
    labelKey: 'paidToFreelancers',
    defaultLabel: 'Paid to Freelancers'
  }
]

function AnimatedCounter({ value, suffix, duration = 2000 }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let startTime
    let animationFrame

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      
      setCount(Math.floor(progress * value))
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }

    animationFrame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrame)
  }, [value, duration])

  return (
    <span>
      {count.toLocaleString()}{suffix}
    </span>
  )
}

function StatsSection() {
  const { t } = useLanguage();
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.3 }
    )

    const section = document.querySelector('.stats-section')
    if (section) observer.observe(section)

    return () => observer.disconnect()
  }, [])

  return (
    <section className="stats-section">
      <div className="stats-overlay"></div>
      <div className="container">
        <div className="stats-grid">
          {stats.map((stat, index) => (
            <div key={index} className="stat-item">
              <div className="stat-icon-holder">
                {stat.icon}
              </div>
              <div className="stat-value">
                {isVisible ? (
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                ) : (
                  `0${stat.suffix}`
                )}
              </div>
              <div className="stat-label">
                {t.stats?.[stat.labelKey] || stat.defaultLabel}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default StatsSection
