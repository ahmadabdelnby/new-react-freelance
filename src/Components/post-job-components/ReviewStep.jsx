import React from 'react'
import './ReviewStep.css'

function ReviewStep({ formData, categories, specialties, skills }) {
  // Get category name
  const categoryName = categories.find(cat => cat._id === formData.category)?.name || 'Not specified'

  // Get specialty name
  const specialtyName = specialties.find(spec => spec._id === formData.specialty)?.name || 'Not specified'

  // Get selected skills names
  const selectedSkills = skills.filter(skill => formData.requiredSkills.includes(skill._id))

  return (
    <div className="form-step">
      <h2 className="step-heading">Review your job post</h2>

      <div className="job-preview">
        <div className="preview-section">
          <h3 className="preview-heading">Job Details</h3>
          <div className="preview-item">
            <strong>Title:</strong> {formData.title || 'Not specified'}
          </div>
          <div className="preview-item">
            <strong>Category:</strong> {categoryName}
          </div>
          <div className="preview-item">
            <strong>Specialty:</strong> {specialtyName}
          </div>
          <div className="preview-item">
            <strong>Description:</strong>
            <p className="preview-description">{formData.description || 'Not specified'}</p>
          </div>
        </div>

        <div className="preview-section">
          <h3 className="preview-heading">Skills & Expertise</h3>
          <div className="preview-item">
            <strong>Required Skills:</strong>
            <div className="skills-tags">
              {selectedSkills.length > 0 ? (
                selectedSkills.map((skill) => (
                  <span key={skill._id} className="skill-tag-preview">{skill.name}</span>
                ))
              ) : (
                <span>No skills added</span>
              )}
            </div>
          </div>
        </div>

        <div className="preview-section">
          <h3 className="preview-heading">Budget & Timeline</h3>
          <div className="preview-item">
            <strong>Payment Type:</strong> Fixed Price
          </div>
          <div className="preview-item">
            <strong>Budget:</strong> ${formData.budget || '0'}
          </div>
          <div className="preview-item">
            <strong>Duration:</strong> {formData.duration || '0'} days
          </div>
        </div>
      </div>

      <div className="review-note">
        <p>Please review all details carefully before posting your job.</p>
      </div>
    </div>
  )
}

export default ReviewStep
