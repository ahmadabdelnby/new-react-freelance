import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FaBell, FaTrash } from "react-icons/fa";
import {
  getUserNotifications,
  markAsRead,
  deleteNotification,
  deleteAllNotifications,
} from "../../Services/Notifications/NotificationsSlice";
import socketService from "../../Services/socketService";
import { toast } from "react-toastify";
import Swal from 'sweetalert2';
import "./notification.css";
import "../../styles/sweetalert-custom.css";

function NotificationBell({ isMobile = false, onNavigate }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [leaveTimeout, setLeaveTimeout] = useState(null);
  const { token, isAuthenticated } = useSelector((state) => state.auth);
  const { notifications, loading } = useSelector(
    (state) => state.notifications
  );

  // 🔥 Fetch notifications on mount when user is authenticated
  useEffect(() => {
    if (isAuthenticated && token) {
      console.log('🔔 NotificationBell: Fetching notifications...');
      dispatch(getUserNotifications());
    }
  }, [isAuthenticated, token, dispatch]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (leaveTimeout) {
        clearTimeout(leaveTimeout);
      }
    };
  }, [leaveTimeout]);

  // ✅ Socket events handled in socketIntegration.js
  // This component only needs to fetch notifications on mount
  useEffect(() => {
    if (!isAuthenticated || !token) return;

    dispatch(getUserNotifications());
  }, [isAuthenticated, token, dispatch]);

  const handleNotificationClick = async (notification) => {
    // Mark as read
    if (!notification.isRead) {
      await dispatch(markAsRead(notification._id));
    }

    setOpen(false);

    // Navigate based on notification type
    if (notification.type === "proposal_accepted") {
      // Extract contract ID from linkUrl if available
      const contractId = notification.linkUrl?.split("/").pop();
      if (contractId) {
        navigate(`/contracts/${contractId}`);
      } else {
        navigate("/contracts");
      }
    } else if (notification.type === "contract_completed") {
      const contractId = notification.linkUrl?.split("/").pop();
      if (contractId) {
        navigate(`/contracts/${contractId}`);
      } else {
        navigate("/contracts");
      }
    } else if (notification.type === "new_proposal") {
      const jobId = notification.linkUrl?.split("/").pop();
      if (jobId) {
        navigate(`/jobs/${jobId}`);
      }
    } else if (notification.linkUrl) {
      navigate(notification.linkUrl);
    }
  };

  const handleDeleteNotification = async (e, notificationId) => {
    e.stopPropagation(); // Prevent triggering notification click
    try {
      await dispatch(deleteNotification(notificationId)).unwrap();
      toast.success('Notification deleted');
    } catch (error) {
      console.error('Failed to delete notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  const handleClearAll = async () => {
    if (notifications.length === 0) return;

    const result = await Swal.fire({
      title: 'Clear All Notifications?',
      text: 'This will permanently delete all your notifications.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, clear all!',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
      customClass: {
        popup: 'swal-notification-popup'
      }
    });

    if (!result.isConfirmed) return;

    try {
      await dispatch(deleteAllNotifications()).unwrap();
      Swal.fire({
        title: 'Cleared!',
        text: 'All notifications deleted.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Failed to clear notifications:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to clear notifications.',
        icon: 'error',
        confirmButtonColor: '#dc3545'
      });
    }
  };

  const unreadCount = Array.isArray(notifications)
    ? notifications.filter((n) => !n.isRead).length
    : 0;

  // 🔍 Debug log for notifications state
  useEffect(() => {
    console.log('🔔 NotificationBell State:', {
      notificationsCount: notifications?.length || 0,
      unreadCount,
      isArray: Array.isArray(notifications),
      loading
    });
  }, [notifications, unreadCount, loading]);

  const handleMouseEnter = () => {
    if (isMobile) return; // Don't open dropdown on mobile
    if (leaveTimeout) {
      clearTimeout(leaveTimeout);
      setLeaveTimeout(null);
    }
    setOpen(true);
  };

  const handleMouseLeave = () => {
    if (isMobile) return; // Don't handle mouse leave on mobile
    const timeout = setTimeout(() => {
      setOpen(false);
    }, 300); // 300ms delay قبل إخفاء الـ popup
    setLeaveTimeout(timeout);
  };

  const handleBellClick = () => {
    if (isMobile) {
      // On mobile, navigate to notifications page
      if (onNavigate) onNavigate();
      navigate('/notifications');
    }
  };

  return (
    <div
      className="notif-wrapper"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        className="notif-bell-container"
        aria-label="Notifications"
        onClick={handleBellClick}
      >
        <FaBell className="notif-icon" />
        {unreadCount > 0 && <span className="notif-count">{unreadCount > 99 ? '99+' : unreadCount}</span>}
      </button>

      {open && !isMobile && (
        <div className="notif-dropdown">
          <div className="notif-header">
            <h4>Notifications</h4>
            <div className="notif-header-actions">
              {unreadCount > 0 && (
                <span className="notif-badge">{unreadCount} new</span>
              )}
              {notifications.length > 0 && (
                <button
                  className="notif-clear-all"
                  onClick={handleClearAll}
                  title="Clear all notifications"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>

          <div className="notif-list">
            {loading && notifications.length === 0 ? (
              <div className="notif-loading">Loading...</div>
            ) : Array.isArray(notifications) && notifications.length > 0 ? (
              notifications.slice(0, 10).map((n) => (
                <div
                  key={n._id}
                  className={`notif-item ${!n.isRead ? "unread" : ""}`}
                  onClick={() => handleNotificationClick(n)}
                >
                  <div className="notif-content">
                    <p className="notif-text">{n.content}</p>
                    <span className="notif-date">
                      {new Date(n.createdAt).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div className="notif-actions">
                    {!n.isRead && <div className="notif-unread-dot"></div>}
                    <button
                      className="notif-delete-btn"
                      onClick={(e) => handleDeleteNotification(e, n._id)}
                      title="Delete notification"
                    >
                      <FaTrash size={12} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="notif-empty">
                <FaBell size={32} />
                <p>No notifications yet</p>
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="notif-footer">
              <button
                className="notif-view-all"
                onClick={() => {
                  setOpen(false);
                  navigate("/notifications");
                }}
              >
                View All Notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
