import React from 'react'
import './WhyChooseUs.css'
import { FaShieldAlt, FaMoneyBillWave, FaClock, FaUserCheck, FaHeadset, FaStar } from 'react-icons/fa'
import { useLanguage } from "../../context/LanguageContext";

const features = [
  {
    icon: <FaShieldAlt />,
    titleKey: 'securePayments',
    descKey: 'securePaymentsDesc',
    defaultTitle: 'Secure Payments',
    defaultDesc: 'Your payments are protected with our escrow system. Funds are only released when you approve the work.'
  },
  {
    icon: <FaUserCheck />,
    titleKey: 'verifiedFreelancers',
    descKey: 'verifiedFreelancersDesc',
    defaultTitle: 'Verified Freelancers',
    defaultDesc: 'All freelancers go through a verification process to ensure quality and professionalism.'
  },
  {
    icon: <FaClock />,
    titleKey: 'fastDelivery',
    descKey: 'fastDeliveryDesc',
    defaultTitle: 'Fast Delivery',
    defaultDesc: 'Get your projects completed on time with our deadline tracking and milestone system.'
  },
  {
    icon: <FaMoneyBillWave />,
    titleKey: 'competitivePricing',
    descKey: 'competitivePricingDesc',
    defaultTitle: 'Competitive Pricing',
    defaultDesc: 'Find talented freelancers at prices that fit your budget. No hidden fees or surprises.'
  },
  {
    icon: <FaHeadset />,
    titleKey: 'support247',
    descKey: 'support247Desc',
    defaultTitle: '24/7 Support',
    defaultDesc: 'Our dedicated support team is always ready to help you with any questions or issues.'
  },
  {
    icon: <FaStar />,
    titleKey: 'qualityGuarantee',
    descKey: 'qualityGuaranteeDesc',
    defaultTitle: 'Quality Guarantee',
    defaultDesc: 'We ensure high-quality work with our review system and satisfaction guarantee policy.'
  }
]

function WhyChooseUs() {
  const { t } = useLanguage();

  return (
    <section className="why-choose-section">
      <div className="container">
        <div className="section-header">
          <span className="section-badge">Why Herfa</span>
          <h2 className="section-title">{t.whyChoose?.title || 'Why Choose Our Platform?'}</h2>
          <p className="section-subtitle">
            {t.whyChoose?.subtitle || 'Discover the advantages that make us the preferred choice for freelancers and clients worldwide'}
          </p>
        </div>

        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">
                {feature.icon}
              </div>
              <h3 className="feature-title">
                {t.whyChoose?.[feature.titleKey] || feature.defaultTitle}
              </h3>
              <p className="feature-desc">
                {t.whyChoose?.[feature.descKey] || feature.defaultDesc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default WhyChooseUs
