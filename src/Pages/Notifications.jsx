import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    getUserNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications
} from '../Services/Notifications/NotificationsSlice';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import {
    FaBell,
    FaCheckCircle,
    FaSpinner,
    FaBriefcase,
    FaFileContract,
    FaDollarSign,
    FaComments,
    FaStar,
    FaTrash
} from 'react-icons/fa';
import './Notifications.css';
import '../styles/sweetalert-custom.css';

const Notifications = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { notifications, loading } = useSelector((state) => state.notifications);
    const { user } = useSelector((state) => state.auth);
    const [filter, setFilter] = useState('all'); // all, unread, read

    // 🔍 Debug: Log notifications data
    useEffect(() => {
        console.log('📊 Notifications State:', {
            notifications,
            type: typeof notifications,
            isArray: Array.isArray(notifications),
            length: Array.isArray(notifications) ? notifications.length : 'N/A',
            loading,
            user: user?._id || user?.user?._id
        });
    }, [notifications, loading, user]);

    useEffect(() => {
        console.log('🔄 Fetching notifications...');
        dispatch(getUserNotifications());
    }, [dispatch]);

    // Note: Socket listeners are now centralized in socketIntegration.js
    // No need to register them here to avoid duplicates

    const handleNotificationClick = async (notification) => {
        // Mark as read
        if (!notification.isRead) {
            await dispatch(markAsRead(notification._id));
        }

        // Navigate based on notification type
        if (notification.type === 'proposal_accepted') {
            const contractId = notification.linkUrl?.split('/').pop();
            if (contractId) {
                navigate(`/contracts/${contractId}`);
            } else {
                navigate('/contracts');
            }
        } else if (notification.type === 'contract_completed') {
            const contractId = notification.linkUrl?.split('/').pop();
            if (contractId) {
                navigate(`/contracts/${contractId}`);
            } else {
                navigate('/contracts');
            }
        } else if (notification.type === 'new_proposal') {
            const jobId = notification.linkUrl?.split('/').pop();
            if (jobId) {
                navigate(`/jobs/${jobId}`);
            }
        } else if (notification.linkUrl) {
            navigate(notification.linkUrl);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await dispatch(markAllAsRead()).unwrap();
            toast.success('All notifications marked as read');
        } catch (error) {
            console.error('Failed to mark all as read:', error);
            toast.error('Failed to mark all as read');
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
        if (totalCount === 0) return;

        const result = await Swal.fire({
            title: 'Clear All Notifications?',
            text: 'This will permanently delete all your notifications. This action cannot be undone.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Yes, clear all!',
            cancelButtonText: 'Cancel',
            reverseButtons: true
        });

        if (!result.isConfirmed) return;

        try {
            await dispatch(deleteAllNotifications()).unwrap();
            Swal.fire({
                title: 'Cleared!',
                text: 'All notifications have been deleted.',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });
        } catch (error) {
            console.error('Failed to clear notifications:', error);
            Swal.fire({
                title: 'Error!',
                text: 'Failed to clear notifications. Please try again.',
                icon: 'error',
                confirmButtonColor: '#dc3545'
            });
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            // Jobs
            case 'job_posted':
            case 'job_closed':
            case 'job_updated':
                return <FaBriefcase className="notif-icon" />;

            // Proposals
            case 'new_proposal':
            case 'proposal_accepted':
            case 'proposal_rejected':
                return <FaCheckCircle className="notif-icon" />;

            // Contracts & Deliverables
            case 'contract_created':
            case 'contract_completed':
            case 'deliverable_submitted':
            case 'deliverable_accepted':
            case 'deliverable_rejected':
                return <FaFileContract className="notif-icon" />;

            // Payments
            case 'payment_received':
            case 'payment_sent':
            case 'payment_released':
            case 'withdrawal_completed':
                return <FaDollarSign className="notif-icon" />;

            // Messages
            case 'new_message':
                return <FaComments className="notif-icon" />;

            // Reviews
            case 'review_received':
            case 'review_reminder':
                return <FaStar className="notif-icon" />;

            default:
                return <FaBell className="notif-icon" />;
        }
    };

    const filteredNotifications = Array.isArray(notifications)
        ? notifications.filter((n) => {
            if (filter === 'unread') return !n.isRead;
            if (filter === 'read') return n.isRead;
            return true;
        })
        : [];

    const unreadCount = Array.isArray(notifications)
        ? notifications.filter((n) => !n.isRead).length
        : 0;

    const totalCount = Array.isArray(notifications) ? notifications.length : 0;
    const readCount = totalCount - unreadCount;

    return (
        <div className="notifications-page">
            <div className="container">
                <div className="notifications-header">
                    <div className="header-left">
                        <FaBell className="page-icon" />
                        <h1>Notifications</h1>
                        {unreadCount > 0 && (
                            <span className="notifications-unread-badge">{unreadCount} unread</span>
                        )}
                    </div>

                    <div className="header-actions">
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllAsRead}
                                className="btn-mark-all-read"
                            >
                                <FaCheckCircle /> Mark All as Read
                            </button>
                        )}
                        {totalCount > 0 && (
                            <button
                                onClick={handleClearAll}
                                className="btn-clear-all"
                            >
                                <FaTrash /> Clear All
                            </button>
                        )}
                    </div>
                </div>

                <div className="notifications-filters">
                    <button
                        className={`notifications-filter-btn ${filter === 'all' ? 'active' : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        All ({totalCount})
                    </button>
                    <button
                        className={`notifications-filter-btn ${filter === 'unread' ? 'active' : ''}`}
                        onClick={() => setFilter('unread')}
                    >
                        Unread ({unreadCount})
                    </button>
                    <button
                        className={`notifications-filter-btn ${filter === 'read' ? 'active' : ''}`}
                        onClick={() => setFilter('read')}
                    >
                        Read ({readCount})
                    </button>
                </div>

                <div className="notifications-container">
                    {loading && notifications.length === 0 ? (
                        <div className="notifications-loading">
                            <FaSpinner className="spinner" />
                            <p>Loading notifications...</p>
                        </div>
                    ) : filteredNotifications.length > 0 ? (
                        <div className="notifications-list">
                            {filteredNotifications.map((notification) => (
                                <div
                                    key={notification._id}
                                    className={`notification-card ${!notification.isRead ? 'unread' : ''}`}
                                    onClick={() => handleNotificationClick(notification)}
                                >
                                    <div className="notification-icon-wrapper">
                                        {getNotificationIcon(notification.type)}
                                    </div>

                                    <div className="notification-content">
                                        <p className="notification-text">{notification.content}</p>
                                        <div className="notification-meta">
                                            <span className="notification-date">
                                                {new Date(notification.createdAt).toLocaleString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </span>
                                            {notification.category && (
                                                <span className="notification-category">
                                                    {notification.category}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="notification-right">
                                        {!notification.isRead && (
                                            <div className="notifications-unread-dot"></div>
                                        )}
                                        <button
                                            className="notification-delete-btn"
                                            onClick={(e) => handleDeleteNotification(e, notification._id)}
                                            title="Delete notification"
                                        >
                                            <FaTrash size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="notifications-empty">
                            <FaBell size={64} />
                            <h3>No notifications found</h3>
                            <p>
                                {filter === 'unread'
                                    ? "You don't have any unread notifications"
                                    : filter === 'read'
                                        ? "You don't have any read notifications"
                                        : "You don't have any notifications yet"}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Notifications;
