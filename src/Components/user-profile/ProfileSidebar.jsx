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
                    <span className="stat-value">{userData.completedJobs || 0}</span>
                </div>

                <div className="stat-item">
                    <span className="stat-label">Rehire Rate</span>
                    <span className="stat-value stat-percentage">{userData.rehireRate || 0}%</span>
                </div>

                {userData.totalEarnings !== undefined && (
                    <div className="stat-item">
                        <span className="stat-label">Total Earnings</span>
                        <span className="stat-value">${userData.totalEarnings || 0}</span>
                    </div>
                )}

                <div className="stat-item">
                    <div className="stat-label">
                        <FaClock className="stat-icon" />
                        Member Since
                    </div>
                    <span className="stat-value">{userData.avgResponseTime} min</span>
                </div>

                <div className="stat-item">
                    <span className="stat-label">Completed Projects</span>
                    <span className="stat-value">{userData.completedProjects}</span>
                </div>
            </div>

            {/* Verifications Section */}
            <div className="sidebar-card">
                <h3 className="sidebar-title">Verifications</h3>

                {(userData.verifications || []).map((verification, index) => (
                    <div key={verification.name || `verification-${index}`} className="verification-item">
                        {verification.verified ? (
                            <FaCheckCircle className="verification-icon verified" />
                        ) : (
                            <FaTimesCircle className="verification-icon unverified" />
                        )}
                        <span className={verification.verified ? 'verified-text' : 'unverified-text'}>
                            {verification.name}
                        </span>
                    </div>
                ))}
            </div>

            {/* Membership Info */}
            <div className="sidebar-card">
                <h3 className="sidebar-title">Membership Info</h3>

                <div className="info-item">
                    <span className="info-label">Registration Date</span>
                    <span className="info-value">{userData.registrationDate}</span>
                </div>

                <div className="info-item">
                    <span className="info-label">Last Seen</span>
                    <span className="info-value">{userData.lastSeen}</span>
                </div>
            </div>
        </aside>
    );
};

export default ProfileSidebar;
