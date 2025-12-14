import React, { useState } from 'react'
import './SkillsExpertiseStep.css'

function SkillsExpertiseStep({ formData, handleChange, handleSkillAdd, handleSkillRemove, experienceLevels, skills }) {
  const [searchTerm, setSearchTerm] = useState('')
  
  const filteredSkills = skills.filter(skill => 
    skill.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const selectedSkillObjects = skills.filter(skill => 
    formData.requiredSkills.includes(skill._id)
  )

  return (
    <div className="form-step">
      <h2 className="step-heading">What skills are required?</h2>
      
      <div className="form-group">
        <label className="form-label">Required Skills *</label>
        <div className="skills-input-wrapper">
          <input
            type="text"
            className="form-input"
            placeholder="Search for skills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {/* Skills Dropdown */}
        {searchTerm && filteredSkills.length > 0 && (
          <div className="skills-dropdown">
            {filteredSkills.slice(0, 10).map((skill) => (
              <div
                key={skill._id}
                className={`skill-option ${formData.requiredSkills.includes(skill._id) ? 'selected' : ''}`}
                onClick={() => {
                  if (!formData.requiredSkills.includes(skill._id)) {
                    handleSkillAdd(skill._id)
                    setSearchTerm('')
                  }
                }}
              >
                {skill.name}
              </div>
            ))}
          </div>
        )}

        {/* Selected Skills */}
        <div className="skills-tags">
          {selectedSkillObjects.map((skill) => (
            <span key={skill._id} className="skill-tag">
              {skill.name}
              <button
                type="button"
                className="skill-remove"
                onClick={() => handleSkillRemove(skill._id)}
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <small className="form-hint">Add at least 1 skill required for this job</small>
      </div>

      <div className="form-group">
        <label className="form-label">Experience Level *</label>
        <div className="experience-options">
          {experienceLevels.map((level) => (
            <label key={level.value} className="radio-card">
              <input
                type="radio"
                name="experienceLevel"
                value={level.value}
                checked={formData.experienceLevel === level.value}
                onChange={handleChange}
                required
              />
              <div className="radio-card-content">
                <div className="radio-card-title">{level.label}</div>
                <div className="radio-card-description">{level.description}</div>
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}

export default SkillsExpertiseStep
