import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    getUserNotifications,
    markAsRead,
    markAllAsRead
} from '../Services/Notifications/NotificationsSlice';
import socketService from '../Services/socketService';
import { toast } from 'react-toastify';
import {
    FaBell,
    FaCheckCircle,
    FaSpinner,
    FaBriefcase,
    FaFileContract,
    FaDollarSign,
    FaComments,
    FaStar
} from 'react-icons/fa';
import './Notifications.css';

const Notifications = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { notifications, loading } = useSelector((state) => state.notifications);
    const { user, token } = useSelector((state) => state.auth);
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

    // 🔥 Real-time: Listen for ALL notification types via Socket.io
    useEffect(() => {
        if (!token || !user?._id) return;

        socketService.connect(token);

        // General handler for all notification types
        const handleNotification = (eventType, data) => {
            console.log(`✅ ${eventType} notification received:`, data);
            dispatch(getUserNotifications());
        };

        // Jobs
        const handleJobPosted = (data) => {
            toast.success(`Job "${data.jobTitle}" posted successfully!`, { autoClose: 4000 });
            handleNotification('job_posted', data);
        };

        const handleJobClosed = (data) => {
            toast.info(`Job "${data.jobTitle}" has been closed`, { autoClose: 4000 });
            handleNotification('job_closed', data);
        };

        const handleJobUpdated = (data) => {
            toast.info(`Job "${data.jobTitle}" has been updated`, { autoClose: 4000 });
            handleNotification('job_updated', data);
        };

        // Proposals
        const handleNewProposal = (data) => {
            toast.info(`New proposal received for "${data.jobTitle}"`, { autoClose: 5000 });
            handleNotification('new_proposal', data);
        };

        const handleProposalAccepted = (data) => {
            toast.success(`Your proposal for "${data.jobTitle}" was accepted!`, { autoClose: 5000 });
            handleNotification('proposal_accepted', data);
        };

        const handleProposalRejected = (data) => {
            toast.info(`Your proposal for "${data.jobTitle}" was not selected`, { autoClose: 5000 });
            handleNotification('proposal_rejected', data);
        };

        // Contracts
        const handleContractCompleted = (data) => {
            toast.success('Contract completed successfully!', { autoClose: 5000 });
            handleNotification('contract_completed', data);
        };

        // Deliverables
        const handleDeliverableSubmitted = (data) => {
            toast.info(`${data.freelancerName} submitted work for review`, { autoClose: 5000 });
            handleNotification('deliverable_submitted', data);
        };

        const handleDeliverableAccepted = (data) => {
            toast.success(`Your work has been accepted! $${data.amount} released`, { autoClose: 6000 });
            handleNotification('deliverable_accepted', data);
        };

        const handleDeliverableRejected = (data) => {
            toast.warning('Client requested revisions for your work', { autoClose: 5000 });
            handleNotification('deliverable_rejected', data);
        };

        // Payments
        const handlePaymentReleased = (data) => {
            toast.success(`Payment of $${data.amount} released to you!`, { autoClose: 6000 });
            handleNotification('payment_released', data);
        };

        const handleWithdrawalCompleted = (data) => {
            toast.success(`Withdrawal of $${data.amount} completed successfully`, { autoClose: 5000 });
            handleNotification('withdrawal_completed', data);
        };

        // Messages
        const handleNewMessage = (data) => {
            toast.info(`${data.senderName} sent you a message`, { autoClose: 4000 });
            handleNotification('new_message', data);
        };

        // Reviews
        const handleReviewReceived = (data) => {
            toast.info('You received a new review', { autoClose: 4000 });
            handleNotification('review_received', data);
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
            // Cleanup all listeners
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
            toast.error('Failed to mark all as read');
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

                    {unreadCount > 0 && (
                        <button
                            onClick={handleMarkAllAsRead}
                            className="btn-mark-all-read"
                        >
                            <FaCheckCircle /> Mark All as Read
                        </button>
                    )}
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

                                    {!notification.isRead && (
                                        <div className="notification-unread-indicator">
                                            <div className="notifications-unread-dot"></div>
                                        </div>
                                    )}
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
