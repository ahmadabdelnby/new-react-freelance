import React from 'react'
import './JobSummary.css'

function JobSummary({ job }) {
  return (
    <div className="job-summary">
      <h3 className="summary-heading">Description</h3>
      {job.description && (
        <div className="description-section">
          <p className="description-text">{job.description}</p>
        </div>
      )}
    </div>
  )
}

export default JobSummary
