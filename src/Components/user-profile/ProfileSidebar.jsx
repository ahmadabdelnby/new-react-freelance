import React from 'react';
import { FaStar, FaCheckCircle, FaTimesCircle, FaClock } from 'react-icons/fa';
import './ProfileSidebar.css';

const ProfileSidebar = ({ userData }) => {
    if (!userData) {
        return <aside className="profile-sidebar">Loading...</aside>;
    }

    const renderStars = (rating) => {
        const fullStars = Math.floor(rating || 0);
        return [...Array(5)].map((_, i) => (
            <FaStar key={`star-${i}`} className={i < fullStars ? "star-filled" : "star-empty"} />
        ));
    };

    return (
        <aside className="profile-sidebar">
            {/* Statistics Section */}
            <div className="sidebar-card">
                <h3 className="sidebar-title">Statistics</h3>

                <div className="stat-item">
                    <div className="stat-label">
                        <FaStar className="stat-icon star" />
                        Rating
                    </div>
                    <div className="stat-value">
                        <div className="rating-stars">
                            {renderStars(userData.averageRating || 0)}
                        </div>
                        <span className="rating-count">({userData.reviewsCount || 0})</span>
                    </div>
                </div>

                <div className="stat-item">
                    <span className="stat-label">Completed Projects</span>
                    <span className="stat-value stat-percentage">{userData.completedJobs || 0}%</span>
                </div>

                <div className="stat-item">
                    <span className="stat-label">On-Time Delivery</span>
                    <span className="stat-value stat-percentage">{userData.onTimeDelivery || 100}%</span>
                </div>

                <div className="stat-item">
                    <span className="stat-label">Rehire Rate</span>
                    <span className="stat-value stat-percentage">{userData.rehireRate || 0}%</span>
                </div>

                <div className="stat-item">
                    <span className="stat-label">Communication Success</span>
                    <span className="stat-value stat-percentage">{userData.communicationSuccess || 100}%</span>
                </div>

                <div className="stat-item">
                    <div className="stat-label">
                        <FaClock className="stat-icon" />
                        Avg Response Time
                    </div>
                    <span className="stat-value">{userData.responseTime || 16} min</span>
                </div>

                <div className="stat-item">
                    <span className="stat-label">Completed Projects</span>
                    <span className="stat-value">{userData.completedJobs || 1}</span>
                </div>
            </div>

            {/* Verifications Section */}
            <div className="sidebar-card">
                <h3 className="sidebar-title">Verifications</h3>

                <div className="verification-item">
                    {userData.isEmailVerified || userData.email ? (
                        <FaCheckCircle className="verification-icon verified" />
                    ) : (
                        <FaTimesCircle className="verification-icon unverified" />
                    )}
                    <span className={userData.isEmailVerified || userData.email ? 'verified-text' : 'unverified-text'}>
                        Email Address
                    </span>
                </div>

                <div className="verification-item">
                    {userData.phone_number ? (
                        <FaCheckCircle className="verification-icon verified" />
                    ) : (
                        <FaTimesCircle className="verification-icon unverified" />
                    )}
                    <span className={userData.phone_number ? 'verified-text' : 'unverified-text'}>
                        Phone Number
                    </span>
                </div>

                <div className="verification-item">
                    {userData.isIdentityVerified ? (
                        <FaCheckCircle className="verification-icon verified" />
                    ) : (
                        <FaTimesCircle className="verification-icon unverified" />
                    )}
                    <span className={userData.isIdentityVerified ? 'verified-text' : 'unverified-text'}>
                        Identity Document
                    </span>
                </div>
            </div>

            {/* Membership Info */}
            <div className="sidebar-card">
                <h3 className="sidebar-title">Membership Info</h3>

                <div className="info-item">
                    <span className="info-label">Registration Date</span>
                    <span className="info-value">
                        {userData.createdAt ? new Date(userData.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        }) : 'N/A'}
                    </span>
                </div>

                <div className="info-item">
                    <span className="info-label">Last Seen</span>
                    <span className="info-value">
                        {userData.isOnline ? (
                            <span className="online-status">● Online</span>
                        ) : userData.lastSeen ? (
                            (() => {
                                const now = new Date();
                                const lastSeenDate = new Date(userData.lastSeen);
                                const diffMs = now - lastSeenDate;
                                const diffMins = Math.floor(diffMs / 60000);
                                const diffHours = Math.floor(diffMs / 3600000);
                                const diffDays = Math.floor(diffMs / 86400000);

                                if (diffMins < 1) return 'Just now';
                                if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
                                if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
                                if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
                                return lastSeenDate.toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                });
                            })()
                        ) : 'N/A'}
                    </span>
                </div>
            </div>
        </aside>
    );
};

export default ProfileSidebar;
