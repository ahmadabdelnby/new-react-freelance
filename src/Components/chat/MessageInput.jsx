import React, { useState, useEffect, useRef } from 'react'
import { FaPaperPlane, FaPaperclip, FaSmile } from 'react-icons/fa'
import socketService from '../../Services/socketService'
import './MessageInput.css'

function MessageInput({ onSendMessage, conversationId }) {
  const [message, setMessage] = useState('')
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

  const handleSubmit = (e) => {
    e.preventDefault()
    if (message.trim()) {
      // Stop typing indicator
      if (isTypingRef.current) {
        socketService.emit('typing', { conversationId, isTyping: false })
        isTypingRef.current = false
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }

      onSendMessage(message)
      setMessage('')
    }
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
      <form onSubmit={handleSubmit} className="message-input-form">
        <button
          type="button"
          className="btn-attachment"
          title="Attach file"
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
          disabled={!message.trim()}
        >
          <FaPaperPlane />
        </button>
      </form>
    </div>
  )
}

export default MessageInput
