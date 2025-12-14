import React, { useState, useEffect } from "react";
import { FaBell } from "react-icons/fa";
import { API_ENDPOINTS } from "../../Services/config";
import storage from "../../Services/storage";
import "./notification.css";

function NotificationBell({ userId }) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const token = storage.get('token');
    if (!token || !userId) {
      setNotifications([]);
      return;
    }

    fetch(API_ENDPOINTS.NOTIFICATIONS.replace(':userId', userId), {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to fetch notifications');
        }
        return res.json();
      })
      .then(data => {
        const notificationArray = Array.isArray(data) ? data : (data.notifications || []);
        setNotifications(Array.isArray(notificationArray) ? notificationArray : []);
      })
      .catch((error) => {
        console.error('Error fetching notifications:', error);
        setNotifications([]);
      });
  }, [userId]);

  return (
    <div
      className="notif-wrapper"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <FaBell className="notif-icon" />

      {Array.isArray(notifications) && notifications.some(n => !n.isRead) && (
        <span className="notif-count">
          {notifications.filter(n => !n.isRead).length}
        </span>
      )}

      {open && (
        <div className="notif-dropdown">
          {Array.isArray(notifications) && notifications.length > 0 ? (
            notifications.map((n) => (
              <div key={n._id} className={`notif-item ${!n.isRead ? "unread" : ""}`}>
                <p className="notif-text">{n.content}</p>

                {n.linkUrl && (
                  <a href={n.linkUrl} className="notif-link">
                    Open
                  </a>
                )}

                <span className="notif-date">
                  {new Date(n.createdAt).toLocaleString()}
                </span>
              </div>
            ))
          ) : (
            <div className="notif-empty">No notifications</div>
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
