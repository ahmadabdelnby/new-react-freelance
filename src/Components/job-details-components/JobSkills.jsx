import React from 'react'
import './JobSkills.css'

function JobSkills({ skills }) {
  return (
    <div className="job-skills">
      <h3 className="skills-heading">Skills and Expertise</h3>
      <h4 className="skills-subheading">Mandatory skills</h4>

      <div className="skills-tags">
        {skills.map((skill, index) => (
          <span key={skill._id || skill.name || skill || `skill-${index}`} className="skill-tag">
            {typeof skill === 'object' ? skill.name : skill}
          </span>
        ))}
      </div>
    </div>
  )
}

export default JobSkills
