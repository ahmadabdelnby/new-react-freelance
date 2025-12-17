import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useSearchParams } from 'react-router-dom'
import { getConversations, createConversation } from '../Services/Chat/ChatSlice'
import socketService from '../Services/socketService'
import { initializeSocketListeners } from '../Services/socketIntegration'
import ConversationList from '../Components/chat/ConversationList'
import ChatWindow from '../Components/chat/ChatWindow'
import ChatSidebar from '../Components/chat/ChatSidebar'
import './ChatPage.css'

function ChatPage() {
  const dispatch = useDispatch()
  const [searchParams] = useSearchParams()
  const { user, token } = useSelector((state) => state.auth)
  const { conversations, loading } = useSelector((state) => state.chat)
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  useEffect(() => {
    // Fetch conversations
    dispatch(getConversations())

    // Initialize Socket.io listeners if connected
    if (socketService.isConnected()) {
      initializeSocketListeners(dispatch)
    }

    // Check if userId parameter exists to open chat with specific user
    const userId = searchParams.get('userId')
    if (userId) {
      // Create or get conversation with this user
      dispatch(createConversation(userId))
        .unwrap()
        .then((conversation) => {
          setSelectedConversation(conversation)
        })
        .catch((error) => {
          console.error('Failed to open conversation:', error)
        })
    }
  }, [dispatch, searchParams])

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation)
    setIsSidebarOpen(false)
  }

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  if (loading && conversations.length === 0) {
    return (
      <div className="chat-page-loading">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="chat-page">
      <div className="chat-container">
        {/* Conversations List */}
        <div className="conversations-panel">
          <ConversationList
            conversations={conversations}
            selectedConversation={selectedConversation}
            onSelectConversation={handleSelectConversation}
            currentUserId={user?._id}
          />
        </div>

        {/* Chat Window */}
        <div className="chat-window-panel">
          {selectedConversation ? (
            <ChatWindow
              conversation={selectedConversation}
              currentUserId={user?._id}
              onToggleSidebar={handleToggleSidebar}
            />
          ) : (
            <div className="no-conversation-selected">
              <div className="welcome-message">
                <h2>Welcome to Herfa Chat</h2>
                <p>Select a conversation to start messaging</p>
              </div>
            </div>
          )}
        </div>

        {/* Chat Sidebar */}
        {selectedConversation && (
          <div className={`chat-sidebar-panel ${isSidebarOpen ? 'open' : ''}`}>
            <ChatSidebar
              conversation={selectedConversation}
              currentUserId={user?._id}
              onClose={() => setIsSidebarOpen(false)}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default ChatPage
