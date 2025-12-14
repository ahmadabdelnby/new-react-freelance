import React from 'react'
import { FaFileAlt, FaUserTie, FaComments, FaCreditCard } from 'react-icons/fa'
import './HowItWorks.css'

function HowItWorks() {
  const steps = [
    {
      id: 1,
      icon: <FaFileAlt className="step-icon" />,
      title: 'Post a job for free',
      description: 'Tell us what you need. Create your own job post or generate one with AI then filled talent matches.'
    },
    {
      id: 2,
      icon: <FaUserTie className="step-icon" />,
      title: 'Hire top talent fast',
      description: "Consult, interview, and hire quickly, so you can meet the freelancers you're excited about."
    },
    {
      id: 3,
      icon: <FaComments className="step-icon" />,
      title: 'Collaborate easily',
      description: 'Use Upwork to chat or video call, share files, and track project progress right from the app.'
    },
    {
      id: 4,
      icon: <FaCreditCard className="step-icon" />,
      title: 'Payment simplified',
      description: 'Manage payments in one place with flexible billing options. Only pay for approved work, hourly or by milestone.'
    }
  ]

  return (
    <section className="how-it-works">
      <div className="container">
        <h2 className="how-it-works-title">How it works</h2>
        
        <div className="steps-grid">
          {steps.map((step) => (
            <div key={step.id} className="step-card">
              <div className="step-icon-wrapper">
                {step.icon}
              </div>
              <h3 className="step-title">{step.title}</h3>
              <p className="step-description">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default HowItWorks
