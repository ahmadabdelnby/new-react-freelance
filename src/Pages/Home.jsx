import React from 'react'
import FeaturesSection from '../Components/home-components/FeaturesSection'
import HeroSection from '../Components/home-components/HeroSection'
import CTASection from '../Components/home-components/CTASection'
import CategoriesSection from '../Components/home-components/CategoriesSection'

function Home() {
  return (
    <div className="page-content">
      <HeroSection/>
      <CategoriesSection/>
      <FeaturesSection/>
      <CTASection/>
    </div>

  )
}

export default Home