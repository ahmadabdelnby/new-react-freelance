import React, { useState, useRef, useEffect } from 'react'
import { FaChevronDown } from 'react-icons/fa'
import './SkillsExpertiseStep.css'

function SkillsExpertiseStep({ formData, handleChange, handleSkillAdd, handleSkillRemove, skills }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Filter skills based on search term
  const filteredSkills = searchTerm
    ? skills.filter(skill =>
      skill.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !formData.requiredSkills.includes(skill._id)
    )
    : skills.filter(skill => !formData.requiredSkills.includes(skill._id))

  const selectedSkillObjects = skills.filter(skill =>
    formData.requiredSkills.includes(skill._id)
  )

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value)
    setIsDropdownOpen(true)
  }

  const handleInputFocus = () => {
    setIsDropdownOpen(true)
  }

  const handleSkillSelect = (skillId) => {
    handleSkillAdd(skillId)
    setSearchTerm('')
    setIsDropdownOpen(false)
  }

  return (
    <div className="form-step">
      <h2 className="step-heading">What skills are required?</h2>

      <div className="form-group">
        <label className="form-label">Required Skills *</label>
        <div className="skills-input-wrapper" ref={dropdownRef}>
          <div className="skills-input-container">
            <input
              type="text"
              className="form-input skills-search-input"
              placeholder="Click to view all skills or type to search..."
              value={searchTerm}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
            />
            <FaChevronDown
              className={`dropdown-icon ${isDropdownOpen ? 'open' : ''}`}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            />
          </div>

          {/* Skills Dropdown */}
          {isDropdownOpen && (
            <div className="skills-dropdown">
              {filteredSkills.length > 0 ? (
                <>
                  {filteredSkills.slice(0, 15).map((skill) => (
                    <div
                      key={skill._id}
                      className="skill-option"
                      onClick={() => handleSkillSelect(skill._id)}
                    >
                      {skill.name}
                    </div>
                  ))}
                  {filteredSkills.length > 15 && (
                    <div className="skill-option-info">
                      +{filteredSkills.length - 15} more skills available
                    </div>
                  )}
                </>
              ) : (
                <div className="skill-option-empty">
                  {searchTerm ? 'No matching skills found' : 'All skills have been selected'}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Selected Skills */}
        {selectedSkillObjects.length > 0 && (
          <div className="skills-tags">
            {selectedSkillObjects.map((skill) => (
              <span key={skill._id} className="skill-tag">
                {skill.name}
                <button
                  type="button"
                  className="skill-remove"
                  onClick={() => handleSkillRemove(skill._id)}
                  aria-label={`Remove ${skill.name}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
        <small className="form-hint">
          {selectedSkillObjects.length === 0
            ? 'Add at least 1 skill required for this job'
            : `${selectedSkillObjects.length} skill${selectedSkillObjects.length > 1 ? 's' : ''} selected`
          }
        </small>
      </div>
    </div>
  )
}

export default SkillsExpertiseStep
