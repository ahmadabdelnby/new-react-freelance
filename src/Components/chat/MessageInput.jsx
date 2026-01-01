import React, { useState, useEffect, useRef } from 'react'
import { FaPaperPlane, FaPaperclip, FaSmile, FaTimes, FaFileAlt, FaImage, FaFilePdf, FaFileWord, FaFileExcel, FaFilePowerpoint, FaFileArchive, FaFileCode, FaFileVideo, FaFileAudio, FaFileCsv } from 'react-icons/fa'
import EmojiPicker from 'emoji-picker-react'
import Swal from 'sweetalert2'
import socketService from '../../Services/socketService'
import { API_ENDPOINTS } from '../../Services/config'
import storage from '../../Services/storage'
import '../../styles/sweetalert-custom.css'
import './MessageInput.css'

function MessageInput({ onSendMessage, conversationId }) {
  const [message, setMessage] = useState('')
  const [attachments, setAttachments] = useState([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const fileInputRef = useRef(null)
  const emojiPickerRef = useRef(null)
  const typingTimeoutRef = useRef(null)
  const isTypingRef = useRef(false)

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleEmojiClick = (emojiData) => {
    setMessage(prev => prev + emojiData.emoji)
  }

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
      // Images
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/bmp',
      // Documents
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'text/csv',
      'application/rtf',
      // Archives
      'application/zip',
      'application/x-zip',
      'application/x-zip-compressed',
      'application/x-rar-compressed',
      'application/vnd.rar',
      'application/x-7z-compressed',
      'application/gzip',
      'application/x-gzip',
      'application/x-tar',
      'application/x-compressed',
      'application/octet-stream',
      // Code files
      'text/javascript',
      'application/javascript',
      'text/html',
      'text/css',
      'application/json',
      'text/xml',
      'application/xml',
      // Audio/Video (common formats)
      'audio/mpeg',
      'audio/wav',
      'audio/ogg',
      'video/mp4',
      'video/webm',
      'video/quicktime'
    ]

    // Also allow by extension when MIME type is empty or unknown
    const allowedExtensions = [
      'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp',
      'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv', 'rtf',
      'zip', 'rar', '7z', 'gz', 'tar',
      'js', 'ts', 'jsx', 'tsx', 'html', 'css', 'json', 'xml',
      'mp3', 'wav', 'ogg', 'mp4', 'webm', 'mov'
    ]

    const getFileExtension = (filename) => {
      const parts = filename.split('.')
      return parts.length > 1 ? parts.pop().toLowerCase() : ''
    }

    const isAllowedFile = (file) => {
      // Check MIME type first
      if (allowedTypes.includes(file.type)) return true
      // If MIME type is empty or unknown, check extension
      const ext = getFileExtension(file.name)
      return allowedExtensions.includes(ext)
    }

    const validFiles = []
    const errors = []

    for (const file of files) {
      if (file.size > maxSize) {
        errors.push(`${file.name} is too large (max 10MB)`)
        continue
      }
      if (!isAllowedFile(file)) {
        errors.push(`${file.name} type is not allowed`)
        continue
      }
      validFiles.push(file)
    }

    if (errors.length > 0) {
      Swal.fire({
        title: 'Upload Error',
        html: errors.map(e => `<div style="margin: 4px 0;">${e}</div>`).join(''),
        icon: 'error',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'swal-warning',
          confirmButton: 'swal-warning-confirm'
        }
      })
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
      Swal.fire({
        title: 'Upload Failed',
        text: 'Failed to upload files. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'swal-warning',
          confirmButton: 'swal-warning-confirm'
        }
      })
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
    if (fileType.includes('word') || fileType === 'application/rtf') return <FaFileWord />
    if (fileType.includes('excel') || fileType.includes('sheet')) return <FaFileExcel />
    if (fileType.includes('powerpoint') || fileType.includes('presentation')) return <FaFilePowerpoint />
    if (fileType.includes('zip') || fileType.includes('rar') || fileType.includes('7z') || fileType.includes('tar') || fileType.includes('gzip')) return <FaFileArchive />
    if (fileType.includes('javascript') || fileType.includes('html') || fileType.includes('css') || fileType.includes('json') || fileType.includes('xml')) return <FaFileCode />
    if (fileType.startsWith('video/')) return <FaFileVideo />
    if (fileType.startsWith('audio/')) return <FaFileAudio />
    if (fileType === 'text/csv') return <FaFileCsv />
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
    <div className="mip-container">
      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <div className="mip-attachments-preview">
          {attachments.map((file, index) => (
            <div key={index} className="mip-attachment-item">
              {file.preview ? (
                <div className="mip-attachment-image">
                  <img src={file.preview} alt={file.fileName} />
                </div>
              ) : (
                <div className="mip-attachment-file">
                  <div className="mip-attachment-file-icon">
                    {getFileIcon(file.fileType)}
                  </div>
                  <div className="mip-attachment-file-info">
                    <span className="mip-attachment-file-name">{file.fileName}</span>
                    <span className="mip-attachment-file-size">{formatFileSize(file.fileSize)}</span>
                  </div>
                </div>
              )}
              <button
                type="button"
                className="mip-attachment-remove"
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
        <div className="mip-upload-progress">
          <div className="mip-progress-bar">
            <div className="mip-progress-fill" style={{ width: `${uploadProgress}%` }}></div>
          </div>
          <span className="mip-progress-text">Uploading... {Math.round(uploadProgress)}%</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mip-form">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar"
          onChange={handleFileSelect}
          className="mip-file-input"
        />

        <button
          type="button"
          className="mip-btn mip-btn-attach"
          title="Attach file"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          <FaPaperclip />
        </button>

        <div className="mip-input-wrapper">
          <textarea
            className="mip-input"
            placeholder="Type a message..."
            value={message}
            onChange={handleChange}
            onKeyPress={handleKeyPress}
            rows={1}
          />
        </div>

        <div className="mip-emoji-container" ref={emojiPickerRef}>
          <button
            type="button"
            className="mip-btn mip-btn-emoji"
            title="Add emoji"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            <FaSmile />
          </button>
          {showEmojiPicker && (
            <div className="mip-emoji-picker">
              <EmojiPicker
                onEmojiClick={handleEmojiClick}
                width={300}
                height={400}
                searchDisabled={false}
                skinTonesDisabled={false}
                previewConfig={{ showPreview: false }}
              />
            </div>
          )}
        </div>

        <button
          type="submit"
          className="mip-btn mip-btn-send"
          disabled={!message.trim() && attachments.length === 0}
        >
          <FaPaperPlane />
        </button>
      </form>
    </div>
  )
}

export default MessageInput
