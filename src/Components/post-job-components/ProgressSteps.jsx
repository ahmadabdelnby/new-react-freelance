import React from 'react'
import { FaCheckCircle } from 'react-icons/fa'
import './ProgressSteps.css'

function ProgressSteps({ currentStep, steps }) {
  return (
    <div className="progress-steps">
      {steps.map((step) => (
        <div
          key={step.number}
          className={`progress-step ${currentStep >= step.number ? 'active' : ''} ${currentStep > step.number ? 'completed' : ''}`}
        >
          <div className="step-number">
            {currentStep > step.number ? <FaCheckCircle /> : step.number}
          </div>
          <div className="step-title">{step.title}</div>
        </div>
      ))}
    </div>
  )
}

export default ProgressSteps
