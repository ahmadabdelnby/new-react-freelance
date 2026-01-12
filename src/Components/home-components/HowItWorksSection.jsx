import React from 'react'
import './HowItWorksSection.css'
import { FaUserPlus, FaSearch, FaHandshake, FaCheckCircle } from 'react-icons/fa'
import { useLanguage } from "../../context/LanguageContext";

const steps = [
  {
    number: '01',
    icon: <FaUserPlus />,
    titleKey: 'createAccount',
    descKey: 'createAccountDesc',
    defaultTitle: 'Create Your Account',
    defaultDesc: 'Sign up for free and complete your profile to get started on our platform.'
  },
  {
    number: '02',
    icon: <FaSearch />,
    titleKey: 'findOrPost',
    descKey: 'findOrPostDesc',
    defaultTitle: 'Find or Post Jobs',
    defaultDesc: 'Browse thousands of jobs or post your project to find the perfect freelancer.'
  },
  {
    number: '03',
    icon: <FaHandshake />,
    titleKey: 'collaborate',
    descKey: 'collaborateDesc',
    defaultTitle: 'Collaborate & Work',
    defaultDesc: 'Use our secure messaging and milestone system to work together effectively.'
  },
  {
    number: '04',
    icon: <FaCheckCircle />,
    titleKey: 'getPaid',
    descKey: 'getPaidDesc',
    defaultTitle: 'Get Paid Securely',
    defaultDesc: 'Receive payments safely through our escrow system with multiple withdrawal options.'
  }
]

function HowItWorksSection() {
  const { t } = useLanguage();

  return (
    <section className="how-it-works-section">
      <div className="container">
        <div className="section-header">
          <span className="section-badge">Simple Process</span>
          <h2 className="section-title">{t.howItWorks?.title || 'How It Works'}</h2>
          <p className="section-subtitle">
            {t.howItWorks?.subtitle || 'Get started in just a few simple steps and begin your freelancing journey'}
          </p>
        </div>

        <div className="steps-container">
          <div className="steps-line"></div>
          
          {steps.map((step, index) => (
            <div key={index} className="step-item">
              <div className="step-number">{step.number}</div>
              <div className="step-content">
                <div className="step-icon">
                  {step.icon}
                </div>
                <h3 className="step-title">
                  {t.howItWorks?.[step.titleKey] || step.defaultTitle}
                </h3>
                <p className="step-desc">
                  {t.howItWorks?.[step.descKey] || step.defaultDesc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default HowItWorksSection
