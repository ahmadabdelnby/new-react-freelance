import React from 'react'
import './ErrorMessage.css'

function ErrorMessage({ 
  message = 'An error occurred', 
  onRetry, 
  onDismiss,
  type = 'error' 
}) {
  const icons = {
    error: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="15" y1="9" x2="9" y2="15"></line>
        <line x1="9" y1="9" x2="15" y2="15"></line>
      </svg>
    ),
    warning: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
        <line x1="12" y1="9" x2="12" y2="13"></line>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
      </svg>
    ),
    info: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="16" x2="12" y2="12"></line>
        <line x1="12" y1="8" x2="12.01" y2="8"></line>
      </svg>
    )
  }

  return (
    <div className={`error-message error-message-${type}`}>
      <div className="error-message-icon">
        {icons[type]}
      </div>
      
      <div className="error-message-content">
        <p className="error-message-text">{message}</p>
      </div>

      <div className="error-message-actions">
        {onRetry && (
          <button className="btn-retry" onClick={onRetry}>
            Retry
          </button>
        )}
        {onDismiss && (
          <button className="btn-dismiss" onClick={onDismiss}>
            ×
          </button>
        )}
      </div>
    </div>
  )
}

export default ErrorMessage
