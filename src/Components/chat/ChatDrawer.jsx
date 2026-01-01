import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getConversations,
  getUnreadCount,
} from "../../Services/Chat/ChatSlice";
import ConversationList from "./ConversationList";
import ChatWindow from "./ChatWindow";
import { FaTimes, FaArrowLeft } from "react-icons/fa";
import "./ChatDrawer.css";

function ChatDrawer({ isOpen, onClose, conversationId }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { conversations, loading } = useSelector((state) => state.chat);
  const [selectedConversation, setSelectedConversation] = useState(null);

  useEffect(() => {
    if (isOpen && user) {
      dispatch(getConversations());
      dispatch(getUnreadCount());
    }
    // Reset selected conversation when drawer is closed
    if (!isOpen) {
      setSelectedConversation(null);
    }
  }, [isOpen, user, dispatch]);

  // Auto-select conversation if conversationId is provided
  useEffect(() => {
    if (conversationId && conversations.length > 0) {
      const conversation = conversations.find(c => c._id === conversationId);
      if (conversation) {
        setSelectedConversation(conversation);
      } else {
        // If conversation not found, it might be new - refresh conversations
        dispatch(getConversations());
      }
    }
  }, [conversationId, conversations, dispatch]);

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
  };

  const handleBackToList = () => {
    setSelectedConversation(null);
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && <div className="cdw-backdrop" onClick={onClose}></div>}

      {/* Drawer */}
      <div className={`cdw-drawer ${isOpen ? "open" : ""}`}>
        {/* Header */}
        <div className="cdw-header">
          <div className="cdw-title">
            {selectedConversation ? (
              <button
                className="cdw-btn-back"
                onClick={handleBackToList}
              >
                <FaArrowLeft />
              </button>
            ) : null}
            <div>
              <h3>Messages</h3>
              {!selectedConversation && (
                <span className="cdw-count">
                  {conversations.length} conversations
                </span>
              )}
            </div>
          </div>
          <button className="cdw-btn-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        {/* Content */}
        <div className="cdw-content">
          {!user ? (
            <div className="cdw-auth-msg">
              <p>Please login to view your messages</p>
            </div>
          ) : loading && conversations.length === 0 ? (
            <div className="cdw-loading">
              <div className="spinner-border text-success" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : selectedConversation ? (
            <div className="cdw-window">
              <ChatWindow
                conversation={selectedConversation}
                currentUserId={user?.id}
              />
            </div>
          ) : (
            <div className="cdw-list">
              <ConversationList
                conversations={conversations}
                selectedConversation={selectedConversation}
                currentUserId={user?.id}
                onSelectConversation={handleSelectConversation}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default ChatDrawer;
