import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiUpload, FiFileText, FiSend, FiX, FiArrowLeft, FiCheckCircle, FiAlertCircle, FiFile } from 'react-icons/fi';
import './SubmitWork.css';
import { SUBMIT_WORK, UPLOAD_ATTACHMENTS } from '../Services/config';

const SubmitWork = () => {
  const { contractId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    files: []
  });

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);

    if (files.length === 0) return;

    setUploadingFiles(true);

    try {
      const token = localStorage.getItem('token');
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append('attachments', file); // Changed from 'file' to 'attachments'

        const response = await fetch(UPLOAD_ATTACHMENTS, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        const data = await response.json();

        if (response.ok) {
          // Backend returns { files: [{url, fileName, fileSize, fileType}] }
          if (data.files && data.files.length > 0) {
            const fileData = data.files[0];
            return {
              name: fileData.fileName || file.name,
              url: fileData.url, // This is relative path like /uploads/attachments/xxx
              size: fileData.fileSize || file.size,
              type: fileData.fileType || file.type
            };
          } else if (data.url) {
            // Fallback for old API responses
            return {
              name: file.name,
              url: data.url || data.path || data.file?.path,
              size: file.size,
              type: file.type
            };
          }
        } else {
          throw new Error(data.message || 'Upload failed');
        }
      });

      const uploadedFiles = await Promise.all(uploadPromises);

      setFormData(prev => ({
        ...prev,
        files: [...prev.files, ...uploadedFiles.filter(f => f !== null)]
      }));

      toast.success(`${uploadedFiles.filter(f => f !== null).length} file(s) uploaded successfully`);
    } catch (error) {
      console.error('Error uploading files:', error);
      toast.error('Failed to upload some files. Please try again.');
    } finally {
      setUploadingFiles(false);
    }
  };

  const removeFile = (index) => {
    setFormData(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.description.trim()) {
      toast.error('Please provide a description of your work');
      return;
    }

    if (formData.files.length === 0) {
      toast.error('Please upload at least one file');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(SUBMIT_WORK(contractId), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Work submitted successfully! Client will review it soon.');

        // Clear form
        setFormData({ description: '', files: [] });

        // Navigate to contract details page immediately (no scroll)
        navigate(`/contracts/${contractId}`, { replace: true });
      } else {
        toast.error(data.message || 'Failed to submit work');
      }
    } catch (error) {
      console.error('Error submitting work:', error);
      toast.error('Failed to submit work. Please try again.');
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

  return (
    <div className="submit-work-page">
      <div className="submit-work-container">
        <div className="submit-work-card">
          {/* Header with back button */}
          <div className="submit-work-header">
            <button
              onClick={() => navigate(-1)}
              className="back-button"
              type="button"
            >
              <FiArrowLeft />
            </button>
            <div className="header-content">
              <div className="header-icon-wrapper">
                <FiSend className="header-icon" />
              </div>
              <h1>Submit Your Work</h1>
              <p>Upload your deliverables and describe what you've completed</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="submit-work-form">
            {/* Progress indicator */}
            {/* <div className="progress-steps">
              <div className={`step ${formData.description ? 'completed' : 'active'}`}>
                <div className="step-icon">
                  {formData.description ? <FiCheckCircle /> : <span>1</span>}
                </div>
                <span className="step-label">Description</span>
              </div>
              <div className="step-line"></div>
              <div className={`step ${formData.files.length > 0 ? 'completed' : formData.description ? 'active' : ''}`}>
                <div className="step-icon">
                  {formData.files.length > 0 ? <FiCheckCircle /> : <span>2</span>}
                </div>
                <span className="step-label">Files</span>
              </div>
              <div className="step-line"></div>
              <div className={`step ${formData.description && formData.files.length > 0 ? 'active' : ''}`}>
                <div className="step-icon">
                  <span>3</span>
                </div>
                <span className="step-label">Submit</span>
              </div>
            </div> */}

            {/* Description Section */}
            <div className="form-section">
              <div className="section-header">
                <FiFileText className="section-icon" />
                <h2>Work Description</h2>
                <span className="required-badge">Required</span>
              </div>
              <div className="form-group">
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe what you've completed, any important notes, instructions for usage, etc.&#10;&#10;Example:&#10;• Completed all requested features&#10;• Tested on multiple browsers&#10;• Added documentation for setup"
                  rows="8"
                  required
                  className={formData.description ? 'has-content' : ''}
                />
                <div className="textarea-footer">
                  <span className="char-count">{formData.description.length} characters</span>
                  {formData.description.length >= 50 && (
                    <span className="validation-message success">
                      <FiCheckCircle /> Good description
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* File Upload Section */}
            <div className="form-section">
              <div className="section-header">
                <FiUpload className="section-icon" />
                <h2>Upload Deliverables</h2>
                <span className="required-badge">Required</span>
              </div>

              <div className="file-upload-area">
                <input
                  type="file"
                  id="file-upload"
                  multiple
                  onChange={handleFileUpload}
                  className="file-input"
                  disabled={uploadingFiles}
                />
                <label htmlFor="file-upload" className={`file-upload-label ${uploadingFiles ? 'uploading' : ''}`}>
                  {uploadingFiles ? (
                    <div className="uploading-state">
                      <span className="spinner"></span>
                      <span className="uploading-text">Uploading files...</span>
                      <small>Please wait while we process your files</small>
                    </div>
                  ) : (
                    <div className="upload-prompt">
                      <div className="upload-icon-wrapper">
                        <FiUpload className="upload-icon" />
                      </div>
                      <span className="upload-title">Click to upload or drag and drop</span>
                      <small className="upload-subtitle">All file types accepted • Max 100MB per file</small>
                    </div>
                  )}
                </label>
              </div>

              {/* Uploaded Files List */}
              {formData.files.length > 0 && (
                <div className="uploaded-files-section">
                  <div className="files-header">
                    <h3>
                      <FiCheckCircle className="success-icon" />
                      Uploaded Files ({formData.files.length})
                    </h3>
                  </div>
                  <div className="uploaded-files-list">
                    {formData.files.map((file, index) => (
                      <div key={index} className="file-item">
                        <div className="file-icon-wrapper">
                          <FiFile className="file-icon" />
                        </div>
                        <div className="file-info">
                          <div className="file-details">
                            <span className="file-name">{file.name}</span>
                            <span className="file-size">{formatFileSize(file.size)}</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="remove-file-btn"
                          title="Remove file"
                        >
                          <FiX />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Info Box */}
            <div className="info-section">
              <div className="info-box">
                <div className="info-icon">
                  <FiAlertCircle />
                </div>
                <div className="info-content">
                  <h3>What happens next?</h3>
                  <ul>
                    <li>The client will be notified immediately about your submission</li>
                    <li>They can review your work and either accept it or request revisions</li>
                    <li>Once accepted, the payment will be released to your account</li>
                    <li>You'll receive notifications about any updates to your submission</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="form-actions">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="submit-work-btn submit-work-btn-cancel"
                disabled={loading}
              >
                <FiArrowLeft />
                Cancel
              </button>
              <button
                type="submit"
                className="submit-work-btn submit-work-btn-submit"
                disabled={loading || !formData.description.trim() || formData.files.length === 0}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Submitting...
                  </>
                ) : (
                  <>
                    <FiSend />
                    Submit Work for Review
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SubmitWork;
