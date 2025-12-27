import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { submitProposal, clearSubmitSuccess, getJobProposals } from '../../Services/Proposals/ProposalsSlice'
import { FaPaperclip, FaTimes, FaCheckCircle, FaInfoCircle } from 'react-icons/fa'
import './ApplyJobForm.css'

function ApplyJobForm({ jobId, jobStatus }) {
  const dispatch = useDispatch()
  const { loading, error, submitSuccess, proposals: rawProposals } = useSelector((state) => state.proposals)
  const { user } = useSelector((state) => state.auth)

  const proposals = Array.isArray(rawProposals) ? rawProposals : []

  // Handle nested user object structure
  const actualUser = user?.user || user
  const userId = actualUser?._id || actualUser?.id

  const [formData, setFormData] = useState({
    bidAmount: '',
    deliveryTime: '',
    coverLetter: '',
    message: ''
  })

  const [attachments, setAttachments] = useState([])

  // Check if user already submitted a proposal for this job
  useEffect(() => {
    if (jobId) {
      dispatch(getJobProposals(jobId))
    }
  }, [dispatch, jobId])

  // Check if current user has already submitted a proposal
  const userProposal = proposals.find(
    p => String(p.freelancer_id?._id || p.freelancer_id) === String(userId)
  )

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    setAttachments([...attachments, ...files])
  }

  const removeAttachment = (index) => {
    setAttachments(attachments.filter((_, i) => i !== index))
  }

  const isJobOpen = jobStatus === 'open'

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!isJobOpen) {
      toast.error('This job is not open for proposals')
      return
    }

    if (!formData.bidAmount || !formData.deliveryTime || !formData.coverLetter) {
      toast.error('Please fill in all required fields')
      return
    }

    if (formData.coverLetter.trim().length < 50) {
      toast.error('Cover letter must be at least 50 characters')
      return
    }

    const proposalData = {
      bidAmount: formData.bidAmount,
      deliveryTime: formData.deliveryTime,
      coverLetter: formData.coverLetter.trim(),
      message: formData.message.trim(),
      attachments
    }

    const result = await dispatch(submitProposal({ jobId, proposalData }))

    if (result.type === 'proposals/submit/fulfilled') {
      // 🔥 Refetch proposals to update UI immediately
      await dispatch(getJobProposals(jobId))

      // Scroll to top to show success message
      window.scrollTo({ top: 0, behavior: 'smooth' })

      // Reset form
      setFormData({
        bidAmount: '',
        deliveryTime: '',
        coverLetter: '',
        message: ''
      })
      setAttachments([])

      // Clear success message after 5 seconds
      setTimeout(() => {
        dispatch(clearSubmitSuccess())
      }, 5000)
    }
  }

  if (submitSuccess) {
    return (
      <div className="apply-success-message">
        <FaCheckCircle className="success-icon" />
        <h3>Proposal Submitted Successfully!</h3>
        <p>Your proposal has been sent to the client. You'll be notified when they review it.</p>
      </div>
    )
  }

  // If user already submitted a proposal, show message instead of form
  if (userProposal) {
    return (
      <div className="apply-info-message">
        <FaInfoCircle className="info-icon" />
        <h3>You've Already Applied</h3>
        <p>
          You submitted a proposal for this job on {new Date(userProposal.createdAt).toLocaleDateString()}.
        </p>
        <p className="proposal-status">
          Status: <strong>{userProposal.status}</strong>
        </p>
      </div>
    )
  }

  return (
    <div className="apply-job-form-container">
      <h2 className="apply-title">Submit a Proposal</h2>
      <p className="apply-subtitle">
        Stand out from other freelancers by providing detailed information about your proposal
      </p>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {!isJobOpen && (
        <div className="alert alert-warning" role="alert">
          This job is not open for proposals.
        </div>
      )}

      <form onSubmit={handleSubmit} className="apply-form">
        {/* Bid Amount */}
        <div className="form-group">
          <label htmlFor="bidAmount" className="form-label">
            Bid Amount <span className="required">*</span>
          </label>
          <div className="input-with-prefix">
            <span className="input-prefix">$</span>
            <input
              type="number"
              id="bidAmount"
              name="bidAmount"
              className="form-input"
              placeholder="0.00"
              min="1"
              step="0.01"
              value={formData.bidAmount}
              onChange={handleChange}
              required
            />
          </div>
          <small className="form-help">Enter your proposed amount for this project</small>
        </div>

        {/* Delivery Time */}
        <div className="form-group">
          <label htmlFor="deliveryTime" className="form-label">
            Delivery Time (days) <span className="required">*</span>
          </label>
          <input
            type="number"
            id="deliveryTime"
            name="deliveryTime"
            className="form-input"
            placeholder="e.g., 7"
            min="1"
            value={formData.deliveryTime}
            onChange={handleChange}
            required
          />
          <small className="form-help">How many days will you need to complete this project?</small>
        </div>

        {/* Cover Letter */}
        <div className="form-group">
          <label htmlFor="coverLetter" className="form-label">
            Cover Letter <span className="required">*</span>
          </label>
          <textarea
            id="coverLetter"
            name="coverLetter"
            className="form-textarea"
            placeholder="Explain why you're the best fit for this job. Highlight your relevant experience and skills..."
            rows="8"
            value={formData.coverLetter}
            onChange={handleChange}
            required
          />
          <small className="form-help">
            {formData.coverLetter.length} characters (min 50)
          </small>
        </div>

        {/* Optional Message */}
        <div className="form-group">
          <label htmlFor="message" className="form-label">
            Message to Client <span className="optional">(Optional)</span>
          </label>
          <textarea
            id="message"
            name="message"
            className="form-textarea"
            placeholder="Add a short note or clarification for the client (optional)"
            rows="4"
            value={formData.message}
            onChange={handleChange}
          />
          <small className="form-help">Optional additional note (max 1000 chars)</small>
        </div>

        {/* Attachments */}
        <div className="form-group">
          <label className="form-label">
            Attachments <span className="optional">(Optional)</span>
          </label>

          <div className="file-upload-area">
            <input
              type="file"
              id="attachments"
              className="file-input"
              multiple
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              onChange={handleFileChange}
            />
            <label htmlFor="attachments" className="file-upload-label">
              <FaPaperclip className="upload-icon" />
              <span>Click to upload files</span>
              <small>PDF, DOC, DOCX, JPG, PNG (Max 5MB each)</small>
            </label>
          </div>

          {attachments.length > 0 && (
            <div className="attachments-preview">
              {attachments.map((file, index) => (
                <div key={`attachment-${file.name}-${index}`} className="attachment-item">
                  <FaPaperclip className="attachment-icon" />
                  <span className="attachment-name">{file.name}</span>
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
        </div>

        {/* Submit Button */}
        <div className="form-actions">
          <button
            type="submit"
            className="btn-submit-proposal"
            disabled={loading || !isJobOpen}
          >
            {loading ? 'Submitting...' : 'Submit Proposal'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default ApplyJobForm
