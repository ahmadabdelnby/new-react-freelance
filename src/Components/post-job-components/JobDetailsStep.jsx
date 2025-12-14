import React from 'react'
import { FaChevronDown } from 'react-icons/fa'
import './JobDetailsStep.css'

function JobDetailsStep({ formData, handleChange, categories, specialties }) {
  return (
    <div className="form-step">
      <h2 className="step-heading">Tell us about your job</h2>
      
      <div className="form-group">
        <label htmlFor="title" className="form-label">Job Title *</label>
        <input
          type="text"
          id="title"
          name="title"
          className="form-input"
          placeholder="e.g. Build a responsive website"
          value={formData.title}
          onChange={handleChange}
          required
        />
        <small className="form-hint">Write a clear, descriptive title for your job</small>
      </div>

      <div className="form-group">
        <label htmlFor="category" className="form-label">Category *</label>
        <div className="select-wrapper">
          <select
            id="category"
            name="category"
            className="form-select"
            value={formData.category}
            onChange={handleChange}
            required
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </select>
          <FaChevronDown className="select-arrow" />
        </div>
      </div>

      {specialties.length > 0 && (
        <div className="form-group">
          <label htmlFor="specialty" className="form-label">Specialty *</label>
          <div className="select-wrapper">
            <select
              id="specialty"
              name="specialty"
              className="form-select"
              value={formData.specialty}
              onChange={handleChange}
              required
            >
              <option value="">Select a specialty</option>
              {specialties.map((spec) => (
                <option key={spec._id} value={spec._id}>{spec.name}</option>
              ))}
            </select>
            <FaChevronDown className="select-arrow" />
          </div>
        </div>
      )}

      <div className="form-group">
        <label htmlFor="description" className="form-label">Job Description *</label>
        <textarea
          id="description"
          name="description"
          className="form-textarea"
          rows="8"
          placeholder="Describe your project in detail..."
          value={formData.description}
          onChange={handleChange}
          required
        />
        <small className="form-hint">Include project details, deliverables, and any specific requirements</small>
      </div>
    </div>
  )
}

export default JobDetailsStep
