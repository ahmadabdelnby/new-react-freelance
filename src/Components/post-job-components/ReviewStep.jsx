import React from 'react'
import './ReviewStep.css'

function ReviewStep({ formData }) {
  return (
    <div className="form-step">
      <h2 className="step-heading">Review your job post</h2>
      
      <div className="job-preview">
        <div className="preview-section">
          <h3 className="preview-heading">Job Details</h3>
          <div className="preview-item">
            <strong>Title:</strong> {formData.jobTitle || 'Not specified'}
          </div>
          <div className="preview-item">
            <strong>Category:</strong> {formData.category || 'Not specified'}
          </div>
          <div className="preview-item">
            <strong>Description:</strong>
            <p>{formData.jobDescription || 'Not specified'}</p>
          </div>
        </div>

        <div className="preview-section">
          <h3 className="preview-heading">Skills & Expertise</h3>
          <div className="preview-item">
            <strong>Required Skills:</strong>
            <div className="skills-tags">
              {formData.skills.length > 0 ? (
                formData.skills.map((skill, index) => (
                  <span key={skill._id || skill.name || skill || `skill-${index}`} className="skill-tag-preview">{skill}</span>
                ))
              ) : (
                <span>No skills added</span>
              )}
            </div>
          </div>
          <div className="preview-item">
            <strong>Experience Level:</strong> {formData.experienceLevel || 'Not specified'}
          </div>
        </div>

        <div className="preview-section">
          <h3 className="preview-heading">Budget & Timeline</h3>
          <div className="preview-item">
            <strong>Payment Type:</strong> {formData.budgetType === 'fixed' ? 'Fixed Price' : 'Hourly Rate'}
          </div>
          {formData.budgetType === 'fixed' ? (
            <div className="preview-item">
              <strong>Budget:</strong> ${formData.budget || '0'}
            </div>
          ) : (
            <div className="preview-item">
              <strong>Hourly Rate:</strong> ${formData.hourlyRateMin || '0'} - ${formData.hourlyRateMax || '0'}
            </div>
          )}
          <div className="preview-item">
            <strong>Duration:</strong> {formData.projectDuration || 'Not specified'}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReviewStep
