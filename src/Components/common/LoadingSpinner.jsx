import React from 'react'
import './LoadingSpinner.css'

function LoadingSpinner({ size = 'medium', fullScreen = false, message = 'Loading...' }) {
  const spinnerSize = {
    small: '20px',
    medium: '40px',
    large: '60px'
  }[size]

  if (fullScreen) {
    return (
      <div className="loading-spinner-fullscreen">
        <div className="loading-spinner-container">
          <div
            className="loading-spinner"
            style={{ width: spinnerSize, height: spinnerSize }}
          ></div>
          {message && <p className="loading-message">{message}</p>}
        </div>
      </div>
    )
  }

  return (
    <div className="loading-spinner-inline">
      <div
        className="loading-spinner"
        style={{ width: spinnerSize, height: spinnerSize }}
      ></div>
      {message && <p className="loading-message">{message}</p>}
    </div>
  )
}

export default LoadingSpinner
