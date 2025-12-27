import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiCheck, FiAlertCircle, FiFileText, FiDownload, FiX } from 'react-icons/fi';
import './ReviewWork.css';
import { REVIEW_WORK } from '../Services/config';

const ReviewWork = ({ deliverable, contractId, onReviewComplete }) => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [action, setAction] = useState(''); // 'accept' or 'request_revision'
  const [revisionNote, setRevisionNote] = useState('');
  const [loading, setLoading] = useState(false);

  const openModal = (actionType) => {
    setAction(actionType);
    setShowModal(true);
    setRevisionNote('');
  };

  const closeModal = () => {
    setShowModal(false);
    setAction('');
    setRevisionNote('');
  };

  const handleReview = async () => {
    if (action === 'request_revision' && !revisionNote.trim()) {
      toast.error('Please provide revision notes');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        REVIEW_WORK(contractId, deliverable._id),
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            action,
            revisionNote: action === 'request_revision' ? revisionNote : undefined
          })
        }
      );

      const data = await response.json();

      if (response.ok) {
        // Scroll to top to show success message
        window.scrollTo({ top: 0, behavior: 'smooth' });

        if (action === 'accept') {
          toast.success('🎉 Work accepted! Contract completed and payment released.');
        } else {
          toast.success('Revision requested. Freelancer has been notified.');
        }
        closeModal();
        if (onReviewComplete) {
          onReviewComplete();
        }
      } else {
        toast.error(data.message || 'Failed to review work');
      }
    } catch (error) {
      console.error('Error reviewing work:', error);
      toast.error('Failed to review work. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = () => {
    const statusConfig = {
      pending_review: { label: 'Pending Review', className: 'status-pending' },
      accepted: { label: 'Accepted', className: 'status-accepted' },
      revision_requested: { label: 'Revision Requested', className: 'status-revision' }
    };

    const config = statusConfig[deliverable.status] || statusConfig.pending_review;

    return <span className={`status-badge ${config.className}`}>{config.label}</span>;
  };

  return (
    <>
      <div className="review-work-card">
        <div className="deliverable-header">
          <div className="header-left">
            <h3>Work Submission</h3>
            {getStatusBadge()}
          </div>
          <span className="submission-date">
            Submitted on {formatDate(deliverable.submittedAt)}
          </span>
        </div>

        {/* Description */}
        <div className="deliverable-section">
          <h4><FiFileText /> Description</h4>
          <p className="description-text">{deliverable.description}</p>
        </div>

        {/* Files */}
        {deliverable.files && deliverable.files.length > 0 && (
          <div className="deliverable-section">
            <h4><FiDownload /> Deliverable Files ({deliverable.files.length})</h4>
            <div className="files-grid">
              {deliverable.files.map((file, index) => (
                <div key={index} className="file-card">
                  <FiFileText className="file-icon" />
                  <div className="file-info">
                    <span className="file-name">{file.name}</span>
                    <span className="file-size">{formatFileSize(file.size)}</span>
                  </div>
                  <a
                    href={file.url}
                    download={file.name}
                    className="download-btn"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FiDownload />
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Revision Note (if exists) */}
        {deliverable.revisionNote && (
          <div className="deliverable-section revision-note-section">
            <h4><FiAlertCircle /> Revision Notes</h4>
            <div className="revision-note-box">
              <p>{deliverable.revisionNote}</p>
              {deliverable.reviewedAt && (
                <small>Requested on {formatDate(deliverable.reviewedAt)}</small>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons - Only show if pending review */}
        {deliverable.status === 'pending_review' && (
          <div className="review-actions">
            <button
              onClick={() => openModal('request_revision')}
              className="btn-revision"
            >
              <FiAlertCircle />
              Request Revision
            </button>
            <button
              onClick={() => openModal('accept')}
              className="btn-accept"
            >
              <FiCheck />
              Accept & Complete
            </button>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>
              <FiX />
            </button>

            <div className="modal-header">
              {action === 'accept' ? (
                <>
                  <FiCheck className="modal-icon success" />
                  <h3>Accept Work & Complete Contract?</h3>
                </>
              ) : (
                <>
                  <FiAlertCircle className="modal-icon warning" />
                  <h3>Request Revisions</h3>
                </>
              )}
            </div>

            <div className="modal-body">
              {action === 'accept' ? (
                <>
                  <p>By accepting this work:</p>
                  <ul>
                    <li>The contract will be marked as completed</li>
                    <li>Payment will be released to the freelancer</li>
                    <li>You'll be able to leave a review</li>
                  </ul>
                  <p><strong>This action cannot be undone.</strong></p>
                </>
              ) : (
                <>
                  <p>Please explain what needs to be revised:</p>
                  <textarea
                    value={revisionNote}
                    onChange={(e) => setRevisionNote(e.target.value)}
                    placeholder="Describe the changes you'd like the freelancer to make..."
                    rows="5"
                    className="revision-textarea"
                  />
                </>
              )}
            </div>

            <div className="modal-actions">
              <button
                onClick={closeModal}
                className="btn-cancel-modal"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleReview}
                className={action === 'accept' ? 'btn-confirm-accept' : 'btn-confirm-revision'}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Processing...
                  </>
                ) : action === 'accept' ? (
                  <>
                    <FiCheck />
                    Accept & Complete
                  </>
                ) : (
                  <>
                    <FiAlertCircle />
                    Request Revision
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ReviewWork;
