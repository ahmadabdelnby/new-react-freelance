import React, { useState, useEffect, useRef } from 'react'
import { FaPaperPlane, FaPaperclip, FaSmile, FaTimes, FaFileAlt, FaImage, FaFilePdf, FaFileWord, FaFileExcel } from 'react-icons/fa'
import socketService from '../../Services/socketService'
import { API_ENDPOINTS } from '../../Services/config'
import storage from '../../Services/storage'
import './MessageInput.css'

function MessageInput({ onSendMessage, conversationId }) {
  const [message, setMessage] = useState('')
  const [attachments, setAttachments] = useState([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef(null)
  const typingTimeoutRef = useRef(null)
  const isTypingRef = useRef(false)

  const handleTyping = () => {
    // Emit typing event
    if (!isTypingRef.current) {
      socketService.emit('typing', { conversationId, isTyping: true })
      isTypingRef.current = true
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Set timeout to stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      socketService.emit('typing', { conversationId, isTyping: false })
      isTypingRef.current = false
    }, 2000)
  }

  const handleChange = (e) => {
    setMessage(e.target.value)
    if (e.target.value.trim()) {
      handleTyping()
    }
  }

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    // Validate files
    const maxSize = 10 * 1024 * 1024 // 10MB
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'application/zip',
      'application/x-rar-compressed'
    ]

    const validFiles = []
    const errors = []

    for (const file of files) {
      if (file.size > maxSize) {
        errors.push(`${file.name} is too large (max 10MB)`)
        continue
      }
      if (!allowedTypes.includes(file.type)) {
        errors.push(`${file.name} type is not allowed`)
        continue
      }
      validFiles.push(file)
    }

    if (errors.length > 0) {
      alert(errors.join('\n'))
    }

    if (validFiles.length === 0) return

    // Upload files
    setIsUploading(true)
    setUploadProgress(0)

    try {
      const token = storage.get('token')
      const uploadedFiles = []

      for (let i = 0; i < validFiles.length; i++) {
        const file = validFiles[i]
        const formData = new FormData()
        formData.append('attachments', file)

        const response = await fetch(API_ENDPOINTS.UPLOAD_ATTACHMENTS, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        })

        if (response.ok) {
          const data = await response.json()
          if (data.files && data.files.length > 0) {
            uploadedFiles.push({
              url: data.files[0].url,
              fileName: data.files[0].fileName,
              fileType: file.type,
              fileSize: file.size,
              preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
            })
          }
        }

        setUploadProgress(((i + 1) / validFiles.length) * 100)
      }

      setAttachments([...attachments, ...uploadedFiles])
    } catch (error) {
      console.error('Error uploading files:', error)
      alert('Failed to upload files')
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemoveAttachment = (index) => {
    const newAttachments = attachments.filter((_, i) => i !== index)
    setAttachments(newAttachments)
  }

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) return <FaImage />
    if (fileType === 'application/pdf') return <FaFilePdf />
    if (fileType.includes('word')) return <FaFileWord />
    if (fileType.includes('excel') || fileType.includes('sheet')) return <FaFileExcel />
    return <FaFileAlt />
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!message.trim() && attachments.length === 0) return

    // Stop typing indicator
    if (isTypingRef.current) {
      socketService.emit('typing', { conversationId, isTyping: false })
      isTypingRef.current = false
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Send message with attachments
    await onSendMessage(message.trim(), attachments)
    setMessage('')
    setAttachments([])
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      if (isTypingRef.current) {
        socketService.emit('typing', { conversationId, isTyping: false })
      }
    }
  }, [conversationId])

  return (
    <div className="message-input-container">
      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <div className="attachments-preview">
          {attachments.map((file, index) => (
            <div key={index} className="attachment-preview-item">
              {file.preview ? (
                <img src={file.preview} alt={file.fileName} className="attachment-preview-image" />
              ) : (
                <div className="attachment-preview-icon">
                  {getFileIcon(file.fileType)}
                </div>
              )}
              <div className="attachment-preview-info">
                <span className="attachment-preview-name">{file.fileName}</span>
                <span className="attachment-preview-size">{formatFileSize(file.fileSize)}</span>
              </div>
              <button
                type="button"
                className="btn-remove-attachment"
                onClick={() => handleRemoveAttachment(index)}
                title="Remove"
              >
                <FaTimes />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Progress */}
      {isUploading && (
        <div className="upload-progress-container">
          <div className="upload-progress-bar">
            <div className="upload-progress-fill" style={{ width: `${uploadProgress}%` }}></div>
          </div>
          <span className="upload-progress-text">Uploading... {Math.round(uploadProgress)}%</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="message-input-form">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />

        <button
          type="button"
          className="btn-attachment"
          title="Attach file"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          <FaPaperclip />
        </button>

        <textarea
          className="message-textarea"
          placeholder="Type a message..."
          value={message}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          rows={1}
        />

        <button
          type="button"
          className="btn-emoji"
          title="Add emoji"
        >
          <FaSmile />
        </button>

        <button
          type="submit"
          className="btn-send"
          disabled={!message.trim() && attachments.length === 0}
        >
          <FaPaperPlane />
        </button>
      </form>
    </div>
  )
}

export default MessageInput
