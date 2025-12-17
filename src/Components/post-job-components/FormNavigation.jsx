import React from 'react'
import './FormNavigation.css'

function FormNavigation({ currentStep, totalSteps, onPrev, onNext, onSubmit, loading }) {
  return (
    <div className="form-navigation">
      {currentStep > 1 && (
        <button
          type="button"
          className="btn-secondary"
          onClick={onPrev}
          disabled={loading}
        >
          Back
        </button>
      )}
      <div className="form-navigation-right">
        {currentStep < totalSteps ? (
          <button
            type="button"
            className="btn-primary"
            onClick={onNext}
            disabled={loading}
          >
            Next
          </button>
        ) : (
          <button
            type="button"
            className="btn-primary"
            onClick={onSubmit}
            disabled={loading}
          >
            {loading ? 'Posting...' : 'Post Job'}
          </button>
        )}
      </div>
    </div>
  )
}

export default FormNavigation
