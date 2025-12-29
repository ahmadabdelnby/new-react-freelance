import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiUpload, FiFileText, FiSend, FiX } from 'react-icons/fi';
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
          return {
            name: file.name,
            url: data.url || data.path || data.file?.path,
            size: file.size,
            type: file.type
          };
        } else {
          throw new Error(data.message || 'Upload failed');
        }
      });

      const uploadedFiles = await Promise.all(uploadPromises);

      setFormData(prev => ({
        ...prev,
        files: [...prev.files, ...uploadedFiles]
      }));

      toast.success(`${files.length} file(s) uploaded successfully`);
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
        // Navigate to contract details page
        setTimeout(() => {
          navigate(`/contracts/${contractId}`, { replace: true });
        }, 1000);
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
    <div className="submit-work-container">
      <div className="submit-work-card">
        <div className="submit-work-header">
          <FiSend className="header-icon" />
          <h2>Submit Your Work</h2>
          <p>Upload your deliverables and provide a description</p>
        </div>

        <form onSubmit={handleSubmit} className="submit-work-form">
          {/* Description */}
          <div className="form-group">
            <label htmlFor="description">
              <FiFileText /> Work Description *
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what you've completed, any important notes, instructions for usage, etc."
              rows="6"
              required
            />
          </div>

          {/* File Upload */}
          <div className="form-group">
            <label>
              <FiUpload /> Upload Files *
            </label>
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
                  <>
                    <span className="spinner"></span>
                    <span>Uploading files...</span>
                  </>
                ) : (
                  <>
                    <FiUpload className="upload-icon" />
                    <span>Click to upload or drag and drop</span>
                    <small>All file types accepted, max 100MB per file</small>
                  </>
                )}
              </label>
            </div>

            {/* Uploaded Files List */}
            {formData.files.length > 0 && (
              <div className="uploaded-files-list">
                <h4>Uploaded Files ({formData.files.length})</h4>
                {formData.files.map((file, index) => (
                  <div key={index} className="file-item">
                    <div className="file-info">
                      <FiFileText className="file-icon" />
                      <div className="file-details">
                        <span className="file-name">{file.name}</span>
                        <span className="file-size">{formatFileSize(file.size)}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="remove-file-btn"
                    >
                      <FiX />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info Box */}
          <div className="info-box">
            <p>
              <strong>Note:</strong> Once you submit your work, the client will be notified to review it.
              They can either accept your work and release payment, or request revisions.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn-cancel"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Submitting...
                </>
              ) : (
                <>
                  <FiSend />
                  Submit Work
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmitWork;
