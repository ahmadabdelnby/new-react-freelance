import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FaBell } from "react-icons/fa";
import {
  getUserNotifications,
  markAsRead,
} from "../../Services/Notifications/NotificationsSlice";
import "./notification.css";

function NotificationBell() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const { notifications, loading } = useSelector(
    (state) => state.notifications
  );

  useEffect(() => {
    if (user?._id) {
      dispatch(getUserNotifications());
    }
  }, [user, dispatch]);

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

  const unreadCount = Array.isArray(notifications)
    ? notifications.filter((n) => !n.isRead).length
    : 0;

  return (
    <div
      className="notif-wrapper"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <div className="notif-bell-container">
        <FaBell className="notif-icon" />
        <span className="notif-label">Notifications</span>
        {unreadCount > 0 && <span className="notif-count">{unreadCount}</span>}
      </div>

      {open && (
        <div className="notif-dropdown">
          <div className="notif-header">
            <h4>Notifications</h4>
            {unreadCount > 0 && (
              <span className="notif-badge">{unreadCount} new</span>
            )}
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
                  {!n.isRead && <div className="notif-unread-dot"></div>}
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
                  navigate("/contracts");
                }}
              >
                View All in My Contracts
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
