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
            <FaStar key={`star-${i}`} className={i < fullStars ? "profile-star-filled" : "profile-star-empty"} />
        ));
    };

    return (
        <aside className="profile-sidebar">
            {/* Statistics Section */}
            <div className="profile-sidebar-card">
                <h3 className="profile-sidebar-title">Statistics</h3>

                <div className="profile-stat-item">
                    <div className="profile-stat-label">
                        <FaStar className="profile-stat-icon star" />
                        Rating
                    </div>
                    <div className="profile-stat-value">
                        <div className="profile-rating-stars">
                            {renderStars(userData.averageRating || 0)}
                        </div>
                        <span className="profile-rating-count">({userData.totalReviews || 0})</span>
                    </div>
                </div>

                <div className="profile-stat-item">
                    <span className="profile-stat-label">Completed Projects</span>
                    <span className="profile-stat-value profile-stat-percentage">{userData.completedJobs || 0}%</span>
                </div>

                <div className="profile-stat-item">
                    <span className="profile-stat-label">On-Time Delivery</span>
                    <span className="profile-stat-value profile-stat-percentage">{userData.onTimeDelivery || 100}%</span>
                </div>

                <div className="profile-stat-item">
                    <span className="profile-stat-label">Rehire Rate</span>
                    <span className="profile-stat-value profile-stat-percentage">{userData.rehireRate || 0}%</span>
                </div>

                <div className="profile-stat-item">
                    <span className="profile-stat-label">Communication Success</span>
                    <span className="profile-stat-value profile-stat-percentage">{userData.communicationSuccess || 100}%</span>
                </div>

                <div className="profile-stat-item">
                    <div className="profile-stat-label">
                        <FaClock className="profile-stat-icon" />
                        Avg Response Time
                    </div>
                    <span className="profile-stat-value">{userData.responseTime || 16} min</span>
                </div>

                <div className="profile-stat-item">
                    <span className="profile-stat-label">Completed Projects</span>
                    <span className="profile-stat-value">{userData.completedJobs || 1}</span>
                </div>
            </div>

            {/* Verifications Section */}
            <div className="profile-sidebar-card">
                <h3 className="profile-sidebar-title">Verifications</h3>

                <div className="profile-verification-item">
                    {userData.isEmailVerified || userData.email ? (
                        <FaCheckCircle className="profile-verification-icon verified" />
                    ) : (
                        <FaTimesCircle className="profile-verification-icon unverified" />
                    )}
                    <span className={userData.isEmailVerified || userData.email ? 'profile-verified-text' : 'profile-unverified-text'}>
                        Email Address
                    </span>
                </div>

                <div className="profile-verification-item">
                    {userData.phone_number ? (
                        <FaCheckCircle className="profile-verification-icon verified" />
                    ) : (
                        <FaTimesCircle className="profile-verification-icon unverified" />
                    )}
                    <span className={userData.phone_number ? 'profile-verified-text' : 'profile-unverified-text'}>
                        Phone Number
                    </span>
                </div>

                <div className="profile-verification-item">
                    {userData.isIdentityVerified ? (
                        <FaCheckCircle className="profile-verification-icon verified" />
                    ) : (
                        <FaTimesCircle className="profile-verification-icon unverified" />
                    )}
                    <span className={userData.isIdentityVerified ? 'profile-verified-text' : 'profile-unverified-text'}>
                        Identity Document
                    </span>
                </div>
            </div>

            {/* Membership Info */}
            <div className="profile-sidebar-card">
                <h3 className="profile-sidebar-title">Membership Info</h3>

                <div className="profile-info-item">
                    <span className="profile-info-label">Registration Date</span>
                    <span className="profile-info-value">
                        {userData.createdAt ? new Date(userData.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        }) : 'N/A'}
                    </span>
                </div>

                <div className="profile-info-item">
                    <span className="profile-info-label">Last Seen</span>
                    <span className="profile-info-value">
                        {userData.isOnline ? (
                            <span className="profile-online-status">● Online</span>
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
