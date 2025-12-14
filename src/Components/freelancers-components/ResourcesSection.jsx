import React from 'react'
import './ResourcesSection.css'

function ResourcesSection() {
  const resources = [
    {
      id: 1,
      image: 'https://res.cloudinary.com/upwork-cloud-acquisition-prod/image/upload/c_fit/arges/redesigned-hire/resources/cost-to-hire.jpg',
      title: 'Cost to hire a Freelancer',
      description: 'Explore typical freelancer rates and what businesses pay to hire top talent.'
    },
    {
      id: 2,
      image: 'https://res.cloudinary.com/upwork-cloud-acquisition-prod/image/upload/c_fit/arges/redesigned-hire/resources/job-description.jpg',
      title: 'Freelancer job description template',
      description: 'Get tips to write a job post that attracts qualified freelancers.'
    },
    {
      id: 3,
      image: 'https://res.cloudinary.com/upwork-cloud-acquisition-prod/image/upload/c_fit/arges/redesigned-hire/resources/interview-questions.jpg',
      title: 'Freelancer interview questions',
      description: 'Top interview questions to help you hire the right freelancers, faster.'
    }
  ]

  return (
    <section className="resources-section">
      <div className="container">
        <h2 className="resources-title">Resources to help you hire</h2>
        
        <div className="resources-grid">
          {resources.map((resource) => (
            <div key={resource.id} className="resource-card">
              <div className="resource-image-wrapper">
                <img 
                  src={resource.image} 
                  alt={resource.title}
                  className="resource-image"
                />
              </div>
              <div className="resource-content">
                <h3 className="resource-title">{resource.title}</h3>
                <p className="resource-description">{resource.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ResourcesSection
