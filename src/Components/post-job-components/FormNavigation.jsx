import React from 'react'
import './FormNavigation.css'

function FormNavigation({ currentStep, totalSteps, onPrev, onNext, onSubmit }) {
  return (
    <div className="form-navigation">
      {currentStep > 1 && (
        <button type="button" className="btn-secondary" onClick={onPrev}>
          Back
        </button>
      )}
      <div className="form-navigation-right">
        {currentStep < totalSteps ? (
          <button type="button" className="btn-primary" onClick={onNext}>
            Next
          </button>
        ) : (
          <button type="submit" className="btn-primary" onClick={onSubmit}>
            Post Job
          </button>
        )}
      </div>
    </div>
  )
}

export default FormNavigation
