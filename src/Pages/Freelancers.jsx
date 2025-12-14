import React from 'react'
import FreelancerHero from '../Components/freelancers-components/FreelancerHero'
import FreelancersListing from '../Components/freelancers-components/FreelancersListing'
import HowItWorks from '../Components/freelancers-components/HowItWorks'
import ResourcesSection from '../Components/freelancers-components/ResourcesSection'
import HiringGuide from '../Components/freelancers-components/HiringGuide'

function Freelancers() {

  return (
    <>
    <div className="page-content">
      <FreelancerHero />
      <FreelancersListing />
      <HowItWorks />
      <ResourcesSection />
      <HiringGuide />
    </div>
    </>
  )

}

export default Freelancers