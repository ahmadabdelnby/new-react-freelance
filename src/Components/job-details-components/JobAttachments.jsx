import React from 'react'
import { FaFileAlt, FaFilePdf, FaFileImage, FaFileWord, FaFileExcel, FaDownload, FaTimes } from 'react-icons/fa'
import { API_ENDPOINTS } from '../../Services/config'
import './JobAttachments.css'

function JobAttachments({ attachments }) {
  if (!attachments || attachments.length === 0) {
    return null
  }

  const getFileIcon = (fileType) => {
    if (!fileType) return <FaFileAlt />

    const type = fileType.toLowerCase()
    if (type.includes('pdf')) return <FaFilePdf className="file-icon pdf" />
    if (type.includes('image') || type.includes('png') || type.includes('jpg') || type.includes('jpeg')) {
      return <FaFileImage className="file-icon image" />
    }
    if (type.includes('word') || type.includes('doc')) return <FaFileWord className="file-icon word" />
    if (type.includes('excel') || type.includes('xls')) return <FaFileExcel className="file-icon excel" />

    return <FaFileAlt className="file-icon" />
  }

  const isImage = (fileType) => {
    if (!fileType) return false
    const type = fileType.toLowerCase()
    return type.includes('image') || type.includes('png') || type.includes('jpg') || type.includes('jpeg')
  }

  const getViewUrl = (url) => {
    if (!url) return ''
    if (url.startsWith('http')) return url
    // Fix URL: remove /public prefix if exists
    const cleanUrl = url.replace(/^\/public/, '')
    // Direct file URL served by static middleware
    return `${API_ENDPOINTS.BASE_URL}${cleanUrl}`
  }

  const getDownloadUrl = (url, attachment) => {
    if (!url) return ''
    if (url.startsWith('http')) return url
    const cleanUrl = url.replace(/^\/public/, '')
    const serverBase = API_ENDPOINTS.BASE_URL
    const downloadPath = `/Freelancing/api/v1/upload/attachments/download`
    const originalName = encodeURIComponent(attachment?.fileName || '')
    return `${serverBase}${downloadPath}?filePath=${encodeURIComponent(cleanUrl)}&originalName=${originalName}`
  }

  const handleAttachmentClick = (attachment) => {
    const viewUrl = getViewUrl(attachment.url)
    if (viewUrl) {
      window.open(viewUrl, '_blank', 'noopener')
    }
  }

  return (
    <>
      <div className="job-attachments">
        <h3 className="attachments-heading">
          Attachments ({attachments.length})
        </h3>
        <div className="attachments-list">
          {attachments.map((attachment, index) => {
            const isImg = isImage(attachment.fileType)
            return (
              <div
                key={index}
                className={`attachment-item ${isImg ? 'image-attachment' : ''}`}
                onClick={() => handleAttachmentClick(attachment)}
              >
                <div className="attachment-info">
                  {getFileIcon(attachment.fileType)}
                  <div className="attachment-details">
                    <span className="attachment-name">{attachment.fileName || `Attachment ${index + 1}`}</span>
                    <div className="attachment-meta">
                      {attachment.fileSize && (
                        <span className="attachment-size">
                          {(attachment.fileSize / 1024).toFixed(1)} KB
                        </span>
                      )}
                      {isImg && (
                        <>
                          <span className="meta-separator">•</span>
                          <span className="preview-hint">Click to preview</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <a
                  href={getDownloadUrl(attachment.url, attachment)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="download-btn"
                  download={attachment?.fileName || ''}
                  onClick={(e) => e.stopPropagation()}
                  title="Download"
                >
                  <FaDownload />
                </a>
              </div>
            )
          })}
        </div>
      </div>

      {/* 🔥 Image Preview Modal */}
      {/* {previewImage && (
        <div className="image-preview-modal" onClick={() => setPreviewImage(null)}>
          <div className="image-preview-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-preview" onClick={() => setPreviewImage(null)}>
              <FaTimes />
            </button>
            <img src={previewImage} alt="Preview" />
          </div>
        </div>
      )} */}
    </>
  )
}

export default JobAttachments
