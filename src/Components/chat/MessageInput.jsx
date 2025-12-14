import React, { useState } from 'react'
import { FaPaperPlane, FaPaperclip, FaSmile } from 'react-icons/fa'
import './MessageInput.css'

function MessageInput({ onSendMessage }) {
  const [message, setMessage] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (message.trim()) {
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
          onChange={(e) => setMessage(e.target.value)}
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
