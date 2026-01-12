import React from 'react'
import FeaturesSection from '../Components/home-components/FeaturesSection'
import HeroSection from '../Components/home-components/HeroSection'
import CTASection from '../Components/home-components/CTASection'
import CategoriesSection from '../Components/home-components/CategoriesSection'
import WhyChooseUs from '../Components/home-components/WhyChooseUs'
import HowItWorksSection from '../Components/home-components/HowItWorksSection'
import StatsSection from '../Components/home-components/StatsSection'
import TrustSection from '../Components/home-components/TrustSection'

function Home() {
  return (
    <div className="page-content">
      <HeroSection/>
      <CategoriesSection/>
      <WhyChooseUs/>
      <HowItWorksSection/>
      <StatsSection/>
      <FeaturesSection/>
      <TrustSection/>
      <CTASection/>
    </div>

  )
}

export default Home