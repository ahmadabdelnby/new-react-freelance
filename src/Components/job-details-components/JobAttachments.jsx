import React from 'react'
import { FaFileAlt, FaFilePdf, FaFileImage, FaFileWord, FaFileExcel, FaDownload } from 'react-icons/fa'
import { BASE_URL } from '../../Services/config'
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

  const getFileUrl = (url) => {
    if (url.startsWith('http')) return url
    return `${BASE_URL}${url}`
  }

  return (
    <div className="job-attachments">
      <h3 className="attachments-heading">Attachments</h3>
      <div className="attachments-list">
        {attachments.map((attachment, index) => (
          <div key={index} className="attachment-item">
            <div className="attachment-info">
              {getFileIcon(attachment.fileType)}
              <div className="attachment-details">
                <span className="attachment-name">{attachment.fileName || `Attachment ${index + 1}`}</span>
                {attachment.fileType && (
                  <span className="attachment-type">{attachment.fileType}</span>
                )}
              </div>
            </div>
            <a 
              href={getFileUrl(attachment.url)} 
              target="_blank" 
              rel="noopener noreferrer"
              className="download-btn"
              download
            >
              <FaDownload />
            </a>
          </div>
        ))}
      </div>
    </div>
  )
}

export default JobAttachments
