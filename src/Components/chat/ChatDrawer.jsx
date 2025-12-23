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

function ChatDrawer({ isOpen, onClose }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { conversations, loading } = useSelector((state) => state.chat);
  const [selectedConversation, setSelectedConversation] = useState(null);

  useEffect(() => {
    if (isOpen && user) {
      dispatch(getConversations());
      dispatch(getUnreadCount());
    }
  }, [isOpen, user, dispatch]);

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
  };

  const handleBackToList = () => {
    setSelectedConversation(null);
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && <div className="chat-drawer-backdrop" onClick={onClose}></div>}

      {/* Drawer */}
      <div className={`chat-drawer ${isOpen ? "open" : ""}`}>
        {/* Header */}
        <div className="chat-drawer-header">
          <div className="chat-drawer-title">
            {selectedConversation ? (
              <button
                className="chat-drawer-btn-back"
                onClick={handleBackToList}
              >
                <FaArrowLeft />
              </button>
            ) : null}
            <div>
              <h3>Messages</h3>
              {!selectedConversation && (
                <span className="chat-drawer-conversations-count">
                  {conversations.length} conversations
                </span>
              )}
            </div>
          </div>
          <button className="chat-drawer-btn-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        {/* Content */}
        <div className="chat-drawer-content">
          {!user ? (
            <div className="chat-drawer-auth-message">
              <p>Please login to view your messages</p>
            </div>
          ) : loading && conversations.length === 0 ? (
            <div className="chat-drawer-loading">
              <div className="spinner-border text-success" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : selectedConversation ? (
            <div className="chat-drawer-window">
              <ChatWindow
                conversation={selectedConversation}
                currentUserId={user?.id}
                onToggleSidebar={() => {}}
              />
            </div>
          ) : (
            <div className="chat-drawer-list">
              <ConversationList
                conversations={conversations}
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
