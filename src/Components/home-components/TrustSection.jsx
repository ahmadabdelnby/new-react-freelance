import React from 'react'
import './TrustSection.css'
import { FaShieldAlt, FaLock, FaCreditCard, FaAward } from 'react-icons/fa'
import { useLanguage } from "../../context/LanguageContext";

const trustItems = [
  {
    icon: <FaShieldAlt />,
    titleKey: 'escrowProtection',
    descKey: 'escrowProtectionDesc',
    defaultTitle: 'Escrow Protection',
    defaultDesc: 'Your funds are held securely until you approve the completed work'
  },
  {
    icon: <FaLock />,
    titleKey: 'secureData',
    descKey: 'secureDataDesc',
    defaultTitle: 'Secure Data',
    defaultDesc: 'Bank-level encryption protects all your personal and financial information'
  },
  {
    icon: <FaCreditCard />,
    titleKey: 'multiplePay',
    descKey: 'multiplePayDesc',
    defaultTitle: 'Multiple Payment Options',
    defaultDesc: 'Pay and get paid through PayPal, credit cards, and bank transfers'
  },
  {
    icon: <FaAward />,
    titleKey: 'verifiedPro',
    descKey: 'verifiedProDesc',
    defaultTitle: 'Verified Professionals',
    defaultDesc: 'All freelancers are vetted and verified for quality assurance'
  }
]

function TrustSection() {
  const { t } = useLanguage();

  return (
    <section className="trust-section">
      <div className="container">
        <div className="trust-header">
          <h2 className="trust-title">{t.trust?.title || 'Trusted by Thousands Worldwide'}</h2>
          <p className="trust-subtitle">
            {t.trust?.subtitle || 'We prioritize your security and peace of mind with every transaction'}
          </p>
        </div>

        <div className="trust-grid">
          {trustItems.map((item, index) => (
            <div key={index} className="trust-item">
              <div className="trust-icon">
                {item.icon}
              </div>
              <div className="trust-content">
                <h4 className="trust-item-title">
                  {t.trust?.[item.titleKey] || item.defaultTitle}
                </h4>
                <p className="trust-item-desc">
                  {t.trust?.[item.descKey] || item.defaultDesc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default TrustSection
