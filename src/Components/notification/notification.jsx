import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FaBell } from "react-icons/fa";
import {
  getUserNotifications,
  markAsRead,
} from "../../Services/Notifications/NotificationsSlice";
import socketService from "../../Services/socketService";
import { toast } from "react-toastify";
import "./notification.css";

function NotificationBell() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [leaveTimeout, setLeaveTimeout] = useState(null);
  const { user, token } = useSelector((state) => state.auth);
  const { notifications, loading } = useSelector(
    (state) => state.notifications
  );

  useEffect(() => {
    if (user?._id) {
      dispatch(getUserNotifications());
    }
  }, [user, dispatch]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (leaveTimeout) {
        clearTimeout(leaveTimeout);
      }
    };
  }, [leaveTimeout]);

  // 🔥 Real-time: Listen for ALL notification types via Socket.io
  useEffect(() => {
    if (!token || !user?._id) return;

    socketService.connect(token);

    // Unified handler for all notifications
    const handleNotification = (eventType) => (data) => {
      console.log(`✅ ${eventType} notification received:`, data);
      dispatch(getUserNotifications());
    };

    // Jobs
    const handleJobPosted = (data) => {
      toast.success(`Job "${data.jobTitle}" posted!`, { autoClose: 3000 });
      handleNotification('job_posted')(data);
    };

    const handleJobClosed = (data) => {
      toast.info(`Job "${data.jobTitle}" closed`, { autoClose: 3000 });
      handleNotification('job_closed')(data);
    };

    const handleJobUpdated = (data) => {
      toast.info(`Job "${data.jobTitle}" updated`, { autoClose: 3000 });
      handleNotification('job_updated')(data);
    };

    // Proposals
    const handleNewProposal = (data) => {
      toast.info(`New proposal for "${data.jobTitle}"`, { autoClose: 4000 });
      handleNotification('new_proposal')(data);
    };

    const handleProposalAccepted = (data) => {
      toast.success(`Proposal accepted for "${data.jobTitle}"!`, { autoClose: 4000 });
      handleNotification('proposal_accepted')(data);
    };

    const handleProposalRejected = (data) => {
      toast.info(`Proposal not selected for "${data.jobTitle}"`, { autoClose: 4000 });
      handleNotification('proposal_rejected')(data);
    };

    // Contracts & Deliverables
    const handleContractCompleted = (data) => {
      toast.success('Contract completed!', { autoClose: 4000 });
      handleNotification('contract_completed')(data);
    };

    const handleDeliverableSubmitted = (data) => {
      toast.info(`Work submitted for review`, { autoClose: 4000 });
      handleNotification('deliverable_submitted')(data);
    };

    const handleDeliverableAccepted = (data) => {
      toast.success(`Work accepted! $${data.amount} released`, { autoClose: 5000 });
      handleNotification('deliverable_accepted')(data);
    };

    const handleDeliverableRejected = (data) => {
      toast.warning('Revisions requested', { autoClose: 4000 });
      handleNotification('deliverable_rejected')(data);
    };

    // Payments
    const handlePaymentReleased = (data) => {
      toast.success(`Payment released: $${data.amount}`, { autoClose: 5000 });
      handleNotification('payment_released')(data);
    };

    const handleWithdrawalCompleted = (data) => {
      toast.success(`Withdrawal completed: $${data.amount}`, { autoClose: 4000 });
      handleNotification('withdrawal_completed')(data);
    };

    // Messages
    const handleNewMessage = (data) => {
      toast.info(`New message from ${data.senderName}`, { autoClose: 3000 });
      handleNotification('new_message')(data);
    };

    // Reviews
    const handleReviewReceived = (data) => {
      toast.info('New review received', { autoClose: 3000 });
      handleNotification('review_received')(data);
    };

    // Register all listeners
    socketService.on('job_posted', handleJobPosted);
    socketService.on('job_closed', handleJobClosed);
    socketService.on('job_updated', handleJobUpdated);
    socketService.on('new_proposal', handleNewProposal);
    socketService.on('proposal_accepted', handleProposalAccepted);
    socketService.on('proposal_rejected', handleProposalRejected);
    socketService.on('contract_completed', handleContractCompleted);
    socketService.on('deliverable_submitted', handleDeliverableSubmitted);
    socketService.on('deliverable_accepted', handleDeliverableAccepted);
    socketService.on('deliverable_rejected', handleDeliverableRejected);
    socketService.on('payment_released', handlePaymentReleased);
    socketService.on('withdrawal_completed', handleWithdrawalCompleted);
    socketService.on('new_message', handleNewMessage);
    socketService.on('review_received', handleReviewReceived);

    return () => {
      socketService.off('job_posted', handleJobPosted);
      socketService.off('job_closed', handleJobClosed);
      socketService.off('job_updated', handleJobUpdated);
      socketService.off('new_proposal', handleNewProposal);
      socketService.off('proposal_accepted', handleProposalAccepted);
      socketService.off('proposal_rejected', handleProposalRejected);
      socketService.off('contract_completed', handleContractCompleted);
      socketService.off('deliverable_submitted', handleDeliverableSubmitted);
      socketService.off('deliverable_accepted', handleDeliverableAccepted);
      socketService.off('deliverable_rejected', handleDeliverableRejected);
      socketService.off('payment_released', handlePaymentReleased);
      socketService.off('withdrawal_completed', handleWithdrawalCompleted);
      socketService.off('new_message', handleNewMessage);
      socketService.off('review_received', handleReviewReceived);
    };
  }, [token, user, dispatch]);

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

  const handleMouseEnter = () => {
    if (leaveTimeout) {
      clearTimeout(leaveTimeout);
      setLeaveTimeout(null);
    }
    setOpen(true);
  };

  const handleMouseLeave = () => {
    const timeout = setTimeout(() => {
      setOpen(false);
    }, 300); // 300ms delay قبل إخفاء الـ popup
    setLeaveTimeout(timeout);
  };

  return (
    <div
      className="notif-wrapper"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button className="notif-bell-container" aria-label="Notifications">
        <FaBell className="notif-icon" />
        {unreadCount > 0 && <span className="notif-count">{unreadCount > 99 ? '99+' : unreadCount}</span>}
      </button>

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
