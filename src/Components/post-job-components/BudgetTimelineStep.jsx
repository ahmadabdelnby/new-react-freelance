import React, { useState } from 'react'
import { FaChevronDown, FaPaperclip, FaTimes } from 'react-icons/fa'
import './BudgetTimelineStep.css'

function BudgetTimelineStep({ formData, handleChange, handleFileChange }) {
  const [attachments, setAttachments] = useState([])

  const onFileChange = (e) => {
    const files = Array.from(e.target.files)
    // 🔥 Fix: Use files directly, not old attachments
    const newAttachments = [...attachments, ...files]
    setAttachments(newAttachments)
    if (handleFileChange) {
      handleFileChange(newAttachments)
    }
    console.log('📎 Files selected:', newAttachments.length, 'files')
  }

  const removeAttachment = (index) => {
    const newAttachments = attachments.filter((_, i) => i !== index)
    setAttachments(newAttachments)
    if (handleFileChange) {
      handleFileChange(newAttachments)
    }
    console.log('🗑️ File removed. Remaining:', newAttachments.length, 'files')
  }

  return (
    <div className="form-step">
      <h2 className="step-heading">Set your budget and timeline</h2>

      <div className="form-group">
        <label className="form-label">Budget Type</label>
        <div className="budget-type-notice">
          <p>All jobs are posted with <strong>Fixed Price</strong> budget type.</p>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="budget" className="form-label">Budget (USD) *</label>
        <input
          type="text"
          inputMode="decimal"
          id="budget"
          name="budget"
          className="form-input"
          placeholder="e.g. 500"
          value={formData.budget}
          onChange={handleChange}
          pattern="[0-9]+(\.[0-9]{1,2})?"
          required
        />
        <small className="form-hint">Enter the total budget for this project</small>
      </div>

      <div className="form-group">
        <label htmlFor="duration" className="form-label">Project Duration (days) *</label>
        <input
          type="text"
          inputMode="numeric"
          id="duration"
          name="duration"
          className="form-input"
          placeholder="e.g. 7"
          value={formData.duration}
          onChange={handleChange}
          pattern="[0-9]+"
          required
        />
        <small className="form-hint">How many days will this project take?</small>
      </div>

      <div className="form-group">
        <label className="form-label">
          Attachments <span className="optional">(Optional)</span>
        </label>

        <div className="file-upload-area">
          <input
            type="file"
            id="job-attachments"
            className="file-input"
            multiple
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.zip"
            onChange={onFileChange}
          />
          <label htmlFor="job-attachments" className="file-upload-label">
            <FaPaperclip className="upload-icon" />
            <span>Click to upload files</span>
            <small>PDF, DOC, DOCX, JPG, PNG, ZIP (Max 10MB each)</small>
          </label>
        </div>

        {attachments.length > 0 && (
          <div className="attachments-preview">
            {attachments.map((file, index) => (
              <div key={`attachment-${file.name}-${index}`} className="attachment-item">
                <FaPaperclip className="attachment-icon" />
                <span className="attachment-name">{file.name}</span>
                <span className="attachment-size">
                  ({(file.size / 1024).toFixed(1)} KB)
                </span>
                <button
                  type="button"
                  className="btn-remove-attachment"
                  onClick={() => removeAttachment(index)}
                >
                  <FaTimes />
                </button>
              </div>
            ))}
          </div>
        )}
        <small className="form-hint">Add any relevant files like requirements, designs, or examples</small>
      </div>
    </div>
  )
}

export default BudgetTimelineStep
