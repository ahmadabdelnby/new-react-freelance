import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { FaStar, FaCheckCircle, FaTimesCircle, FaClock, FaUserTie, FaInfoCircle, FaDollarSign, FaBriefcase, FaRedo, FaChartLine } from 'react-icons/fa';
import { API_ENDPOINTS } from '../../Services/config';
import storage from '../../Services/storage';
import {
    getContractsByClient,
    calculateHireRate,
    calculateClientRating,
    getJobStatusBreakdown,
    getContractStatusBreakdown
} from '../../utils/contractStats';
import { formatLastSeen } from '../../utils/timeUtils';
import './ProfileSidebar.css';

const ProfileSidebar = ({ userData }) => {
    const [clientStats, setClientStats] = useState({
        clientRating: { rating: 0, breakdown: {}, metrics: {} },
        totalJobs: 0,
        openJobs: 0,
        hireRate: 0,
        activeContracts: 0
    });
    const [freelancerStats, setFreelancerStats] = useState({
        activeContracts: 0,
        totalContracts: 0,
        successRate: 0
    });
    const [showScoreTooltip, setShowScoreTooltip] = useState(false);
    const scoreTooltipRef = useRef(null);

    // Get real-time user status from Redux
    const userStatuses = useSelector((state) => state.chat?.userStatuses || {});
    const onlineUsers = useSelector((state) => state.chat?.onlineUsers || []);

    // Determine if this user is online (from real-time status or userData)
    const isUserOnline = userData?._id && (
        onlineUsers.includes(userData._id) ||
        userStatuses[userData._id]?.isOnline ||
        userData?.isOnline
    );

    // Get lastSeen from real-time status or userData
    const userLastSeen = userData?._id && (
        userStatuses[userData._id]?.lastSeen || userData?.lastSeen
    );

    // Force re-render every minute to update "X minutes ago" display
    const [, setTick] = useState(0);
    useEffect(() => {
        const interval = setInterval(() => {
            setTick(tick => tick + 1);
        }, 60000); // Update every minute

        return () => clearInterval(interval);
    }, []);

    // Close tooltip when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (scoreTooltipRef.current && !scoreTooltipRef.current.contains(event.target)) {
                setShowScoreTooltip(false);
            }
        };

        if (showScoreTooltip) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showScoreTooltip]);

    // Fetch client stats if user has role 'client' or has posted jobs
    useEffect(() => {
        if (userData?._id && (userData?.role === 'client' || userData?.totalSpent > 0)) {
            fetchClientStats();
        }
    }, [userData?._id]);

    // Fetch freelancer stats
    useEffect(() => {
        if (userData?._id) {
            fetchFreelancerStats();
        }
    }, [userData?._id]);

    const fetchFreelancerStats = async () => {
        try {
            const token = storage.get('token');
            const headers = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            // Fetch contracts where user is freelancer
            const contractsResponse = await fetch(API_ENDPOINTS.CONTRACTS, { headers });
            const contractsData = await contractsResponse.json();
            const allContracts = Array.isArray(contractsData) ? contractsData : (contractsData.contracts || []);

            // Filter contracts where user is freelancer
            const freelancerContracts = allContracts.filter(c =>
                c.freelancer?._id === userData._id || c.freelancer === userData._id
            );

            const activeContracts = freelancerContracts.filter(c => c.status === 'in_progress').length;
            const completedContracts = freelancerContracts.filter(c => c.status === 'completed').length;
            const totalContracts = freelancerContracts.length;
            const successRate = totalContracts > 0 ? Math.round((completedContracts / totalContracts) * 100) : 0;

            setFreelancerStats({
                activeContracts,
                totalContracts,
                successRate
            });
        } catch (error) {
            console.error('Error fetching freelancer stats:', error);
        }
    };

    const fetchClientStats = async () => {
        try {
            const token = storage.get('token');
            const headers = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            // Fetch client's jobs
            const jobsResponse = await fetch(API_ENDPOINTS.JOBS_BY_CLIENT(userData._id), { headers });
            const jobsData = await jobsResponse.json();
            const clientJobs = Array.isArray(jobsData) ? jobsData : (jobsData.jobs || []);

            // Fetch all contracts
            const contractsResponse = await fetch(API_ENDPOINTS.CONTRACTS, { headers });
            const contractsData = await contractsResponse.json();
            const allContracts = Array.isArray(contractsData) ? contractsData : (contractsData.contracts || []);

            // Filter contracts by client
            const clientContracts = getContractsByClient(allContracts, userData._id);

            // Get stats
            const jobStats = getJobStatusBreakdown(clientJobs);
            const contractStatsData = getContractStatusBreakdown(clientContracts);
            const hireRate = calculateHireRate(clientContracts, clientJobs);

            // Calculate client rating
            const clientRating = calculateClientRating({
                hireRate,
                completedContracts: contractStatsData.completed,
                totalContracts: contractStatsData.total,
                cancelledContracts: contractStatsData.cancelled,
                totalJobs: jobStats.total,
                totalSpent: userData.totalSpent || 0
            });

            // Active contracts as client
            const activeClientContracts = clientContracts.filter(c => c.status === 'active' || c.status === 'in_progress').length;

            setClientStats({
                clientRating,
                totalJobs: jobStats.total,
                openJobs: jobStats.open,
                hireRate,
                activeContracts: activeClientContracts
            });
        } catch (error) {
            console.error('Error fetching client stats:', error);
        }
    };

    // Helper to get spending/earnings tier label
    const getAmountTier = (amount) => {
        if (amount >= 100000) return '$100K+';
        if (amount >= 50000) return '$50K+';
        if (amount >= 20000) return '$20K+';
        if (amount >= 10000) return '$10K+';
        if (amount >= 5000) return '$5K+';
        if (amount >= 1000) return '$1K+';
        if (amount >= 500) return '$500+';
        if (amount > 0) return '<$500';
        return '$0';
    };

    // Alias for backward compatibility
    const getSpendingTier = getAmountTier;

    // State for stat info tooltips
    const [activeTooltip, setActiveTooltip] = useState(null);

    // Stat explanations
    const statExplanations = {
        rating: {
            title: 'Freelancer Rating',
            description: 'Average rating from client reviews after completing projects.'
        },
        earnings: {
            title: 'Total Earnings',
            description: 'Total amount earned from completed contracts on the platform.'
        },
        completedProjects: {
            title: 'Completed Projects',
            description: 'Number of contracts successfully completed as a freelancer.'
        },
        successRate: {
            title: 'Success Rate',
            description: 'Percentage of contracts completed successfully vs total contracts.'
        },
        activeContracts: {
            title: 'Active Contracts',
            description: 'Current ongoing contracts in progress.'
        },
        rehireRate: {
            title: 'Rehire Rate',
            description: 'Percentage of clients who hired this freelancer again.'
        },
        hourlyRate: {
            title: 'Hourly Rate',
            description: 'The freelancer\'s preferred hourly rate for projects.'
        },
        responseTime: {
            title: 'Avg Response Time',
            description: 'Average time to respond to new messages from clients.'
        },
        totalSpent: {
            title: 'Total Spent',
            description: 'Total amount spent on hiring freelancers.'
        },
        jobsPosted: {
            title: 'Jobs Posted',
            description: 'Total number of job listings created.'
        },
        openJobs: {
            title: 'Open Jobs',
            description: 'Jobs currently accepting proposals from freelancers.'
        },
        hireRate: {
            title: 'Hire Rate',
            description: 'Percentage of posted jobs that resulted in hiring.'
        },
        completedAsClient: {
            title: 'Completed Projects',
            description: 'Number of projects completed as a client.'
        },
        activeContractsClient: {
            title: 'Active Contracts',
            description: 'Current ongoing contracts with freelancers.'
        }
    };

    // Toggle tooltip
    const toggleTooltip = (key) => {
        setActiveTooltip(activeTooltip === key ? null : key);
    };

    // Close tooltip when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (!e.target.closest('.stat-info-wrapper')) {
                setActiveTooltip(null);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

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
            {/* As Freelancer Section */}
            <div className="profile-sidebar-card">
                <h3 className="profile-sidebar-title">
                    <FaBriefcase className="section-title-icon" />
                    As Freelancer
                </h3>

                {/* Freelancer Rating */}
                <div className="profile-stat-item">
                    <div className="profile-stat-label">
                        <FaStar className="profile-stat-icon star" />
                        Rating
                    </div>
                    <div className="profile-stat-value stat-info-wrapper">
                        <div className="profile-rating-stars">
                            {renderStars(userData.averageRating || 0)}
                        </div>
                        <span className="profile-rating-count">({userData.totalReviews || 0})</span>
                        <FaInfoCircle className="stat-info-icon" onClick={() => toggleTooltip('rating')} />
                        {activeTooltip === 'rating' && (
                            <div className="stat-info-tooltip">
                                <div className="stat-info-tooltip-title">{statExplanations.rating.title}</div>
                                <div className="stat-info-tooltip-desc">{statExplanations.rating.description}</div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Total Earnings */}
                <div className="profile-stat-item">
                    <div className="profile-stat-label">
                        <FaDollarSign className="profile-stat-icon earnings" />
                        Total Earnings
                    </div>
                    <div className="profile-stat-value stat-info-wrapper">
                        <span className="profile-stat-earnings">{getAmountTier(userData.totalEarnings || 0)}</span>
                        <FaInfoCircle className="stat-info-icon" onClick={() => toggleTooltip('earnings')} />
                        {activeTooltip === 'earnings' && (
                            <div className="stat-info-tooltip">
                                <div className="stat-info-tooltip-title">{statExplanations.earnings.title}</div>
                                <div className="stat-info-tooltip-desc">{statExplanations.earnings.description}</div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Completed Projects */}
                <div className="profile-stat-item">
                    <div className="profile-stat-label">
                        <FaCheckCircle className="profile-stat-icon success" />
                        Completed Projects
                    </div>
                    <div className="profile-stat-value stat-info-wrapper">
                        <span>{userData.completedJobs || 0}</span>
                        <FaInfoCircle className="stat-info-icon" onClick={() => toggleTooltip('completedProjects')} />
                        {activeTooltip === 'completedProjects' && (
                            <div className="stat-info-tooltip">
                                <div className="stat-info-tooltip-title">{statExplanations.completedProjects.title}</div>
                                <div className="stat-info-tooltip-desc">{statExplanations.completedProjects.description}</div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Success Rate */}
                {freelancerStats.totalContracts > 0 && (
                    <div className="profile-stat-item">
                        <div className="profile-stat-label">
                            <FaChartLine className="profile-stat-icon success" />
                            Success Rate
                        </div>
                        <div className="profile-stat-value stat-info-wrapper">
                            <span className="profile-stat-percentage">{freelancerStats.successRate}%</span>
                            <FaInfoCircle className="stat-info-icon" onClick={() => toggleTooltip('successRate')} />
                            {activeTooltip === 'successRate' && (
                                <div className="stat-info-tooltip">
                                    <div className="stat-info-tooltip-title">{statExplanations.successRate.title}</div>
                                    <div className="stat-info-tooltip-desc">{statExplanations.successRate.description}</div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Active Contracts */}
                <div className="profile-stat-item">
                    <div className="profile-stat-label">
                        <FaBriefcase className="profile-stat-icon active" />
                        Active Contracts
                    </div>
                    <div className="profile-stat-value stat-info-wrapper">
                        <span>{freelancerStats.activeContracts}</span>
                        <FaInfoCircle className="stat-info-icon" onClick={() => toggleTooltip('activeContracts')} />
                        {activeTooltip === 'activeContracts' && (
                            <div className="stat-info-tooltip">
                                <div className="stat-info-tooltip-title">{statExplanations.activeContracts.title}</div>
                                <div className="stat-info-tooltip-desc">{statExplanations.activeContracts.description}</div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Rehire Rate */}
                <div className="profile-stat-item">
                    <div className="profile-stat-label">
                        <FaRedo className="profile-stat-icon" />
                        Rehire Rate
                    </div>
                    <div className="profile-stat-value stat-info-wrapper">
                        <span className="profile-stat-percentage">{userData.rehireRate || 0}%</span>
                        <FaInfoCircle className="stat-info-icon" onClick={() => toggleTooltip('rehireRate')} />
                        {activeTooltip === 'rehireRate' && (
                            <div className="stat-info-tooltip">
                                <div className="stat-info-tooltip-title">{statExplanations.rehireRate.title}</div>
                                <div className="stat-info-tooltip-desc">{statExplanations.rehireRate.description}</div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Hourly Rate */}
                <div className="profile-stat-item">
                    <div className="profile-stat-label">
                        <FaDollarSign className="profile-stat-icon" />
                        Hourly Rate
                    </div>
                    <div className="profile-stat-value stat-info-wrapper">
                        <span className="profile-stat-rate">{userData.hourlyRate > 0 ? `$${userData.hourlyRate}/hr` : 'Not set'}</span>
                        <FaInfoCircle className="stat-info-icon" onClick={() => toggleTooltip('hourlyRate')} />
                        {activeTooltip === 'hourlyRate' && (
                            <div className="stat-info-tooltip">
                                <div className="stat-info-tooltip-title">{statExplanations.hourlyRate.title}</div>
                                <div className="stat-info-tooltip-desc">{statExplanations.hourlyRate.description}</div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Avg Response Time */}
                <div className="profile-stat-item">
                    <div className="profile-stat-label">
                        <FaClock className="profile-stat-icon" />
                        Avg Response Time
                    </div>
                    <div className="profile-stat-value stat-info-wrapper">
                        <span>{userData.responseTime ? `${userData.responseTime} min` : 'N/A'}</span>
                        <FaInfoCircle className="stat-info-icon" onClick={() => toggleTooltip('responseTime')} />
                        {activeTooltip === 'responseTime' && (
                            <div className="stat-info-tooltip">
                                <div className="stat-info-tooltip-title">{statExplanations.responseTime.title}</div>
                                <div className="stat-info-tooltip-desc">{statExplanations.responseTime.description}</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* As Client Section */}
            <div className="profile-sidebar-card">
                <h3 className="profile-sidebar-title">
                    <FaUserTie className="section-title-icon" />
                    As Client
                </h3>

                {/* Client Score */}
                <div className="profile-stat-item prf-client-score-container" ref={scoreTooltipRef}>
                    <div className="profile-stat-label">
                        <FaStar className="profile-stat-icon star" />
                        Client Score
                    </div>
                    <div className="profile-stat-value prf-client-score-wrapper">
                        <span className="prf-client-score-value">
                            {clientStats.clientRating.rating.toFixed(1)}/5
                        </span>
                        {clientStats.clientRating.rating >= 4.0 && <span className="prf-score-badge excellent">Excellent</span>}
                        {clientStats.clientRating.rating >= 3.0 && clientStats.clientRating.rating < 4.0 && <span className="prf-score-badge good">Good</span>}
                        {clientStats.clientRating.rating > 0 && clientStats.clientRating.rating < 3.0 && <span className="prf-score-badge building">Building</span>}
                        {clientStats.clientRating.rating === 0 && <span className="prf-score-badge new">New</span>}

                        <FaInfoCircle
                            className="prf-client-info-icon"
                            onClick={() => setShowScoreTooltip(!showScoreTooltip)}
                        />

                        <div className={`prf-client-tooltip ${showScoreTooltip ? 'show' : ''}`}>
                            <div className="prf-client-tooltip-header">How is this calculated?</div>
                            <div className="prf-client-tooltip-content">
                                <div className="prf-client-tooltip-item">
                                    <span>Hire Rate ({clientStats.clientRating.metrics?.hireRate || 0}%)</span>
                                    <span className="prf-tooltip-score">+{clientStats.clientRating.breakdown?.hireRateScore || 0}</span>
                                </div>
                                <div className="prf-client-tooltip-item">
                                    <span>Completion ({clientStats.clientRating.metrics?.completionRate || 0}%)</span>
                                    <span className="prf-tooltip-score">+{clientStats.clientRating.breakdown?.completionScore || 0}</span>
                                </div>
                                <div className="prf-client-tooltip-item">
                                    <span>Low Cancellations ({100 - (clientStats.clientRating.metrics?.cancellationRate || 0)}%)</span>
                                    <span className="prf-tooltip-score">+{clientStats.clientRating.breakdown?.cancellationScore || 0}</span>
                                </div>
                                <div className="prf-client-tooltip-item">
                                    <span>Activity ({clientStats.clientRating.metrics?.totalJobs || 0} jobs)</span>
                                    <span className="prf-tooltip-score">+{clientStats.clientRating.breakdown?.activityScore || 0}</span>
                                </div>
                                <div className="prf-client-tooltip-item">
                                    <span>Spending ({getSpendingTier(clientStats.clientRating.metrics?.totalSpent || 0)})</span>
                                    <span className="prf-tooltip-score">+{clientStats.clientRating.breakdown?.spendingScore || 0}</span>
                                </div>
                                <div className="prf-client-tooltip-divider"></div>
                                <div className="prf-client-tooltip-total">
                                    <span>Total</span>
                                    <span>{clientStats.clientRating.rating.toFixed(1)} / 5.0</span>
                                </div>
                            </div>
                            <div className="prf-client-tooltip-footer">Based on platform activity</div>
                        </div>
                    </div>
                </div>

                {/* Total Spent */}
                <div className="profile-stat-item">
                    <div className="profile-stat-label">
                        <FaDollarSign className="profile-stat-icon spent" />
                        Total Spent
                    </div>
                    <div className="profile-stat-value stat-info-wrapper">
                        <span className="profile-stat-spent">{getAmountTier(userData.totalSpent || 0)}</span>
                        <FaInfoCircle className="stat-info-icon" onClick={() => toggleTooltip('totalSpent')} />
                        {activeTooltip === 'totalSpent' && (
                            <div className="stat-info-tooltip">
                                <div className="stat-info-tooltip-title">{statExplanations.totalSpent.title}</div>
                                <div className="stat-info-tooltip-desc">{statExplanations.totalSpent.description}</div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Jobs Posted */}
                <div className="profile-stat-item">
                    <div className="profile-stat-label">
                        <FaBriefcase className="profile-stat-icon" />
                        Jobs Posted
                    </div>
                    <div className="profile-stat-value stat-info-wrapper">
                        <span>{clientStats.totalJobs}</span>
                        <FaInfoCircle className="stat-info-icon" onClick={() => toggleTooltip('jobsPosted')} />
                        {activeTooltip === 'jobsPosted' && (
                            <div className="stat-info-tooltip">
                                <div className="stat-info-tooltip-title">{statExplanations.jobsPosted.title}</div>
                                <div className="stat-info-tooltip-desc">{statExplanations.jobsPosted.description}</div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Open Jobs */}
                <div className="profile-stat-item">
                    <div className="profile-stat-label">
                        <FaClock className="profile-stat-icon active" />
                        Open Jobs
                    </div>
                    <div className="profile-stat-value stat-info-wrapper">
                        <span>{clientStats.openJobs}</span>
                        <FaInfoCircle className="stat-info-icon" onClick={() => toggleTooltip('openJobs')} />
                        {activeTooltip === 'openJobs' && (
                            <div className="stat-info-tooltip">
                                <div className="stat-info-tooltip-title">{statExplanations.openJobs.title}</div>
                                <div className="stat-info-tooltip-desc">{statExplanations.openJobs.description}</div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Hire Rate */}
                <div className="profile-stat-item">
                    <div className="profile-stat-label">
                        <FaChartLine className="profile-stat-icon success" />
                        Hire Rate
                    </div>
                    <div className="profile-stat-value stat-info-wrapper">
                        <span className="profile-stat-percentage">{clientStats.hireRate}%</span>
                        <FaInfoCircle className="stat-info-icon" onClick={() => toggleTooltip('hireRate')} />
                        {activeTooltip === 'hireRate' && (
                            <div className="stat-info-tooltip">
                                <div className="stat-info-tooltip-title">{statExplanations.hireRate.title}</div>
                                <div className="stat-info-tooltip-desc">{statExplanations.hireRate.description}</div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Completed as Client */}
                <div className="profile-stat-item">
                    <div className="profile-stat-label">
                        <FaCheckCircle className="profile-stat-icon success" />
                        Completed Projects
                    </div>
                    <div className="profile-stat-value stat-info-wrapper">
                        <span>{userData.completedJobsAsClient || 0}</span>
                        <FaInfoCircle className="stat-info-icon" onClick={() => toggleTooltip('completedAsClient')} />
                        {activeTooltip === 'completedAsClient' && (
                            <div className="stat-info-tooltip">
                                <div className="stat-info-tooltip-title">{statExplanations.completedAsClient.title}</div>
                                <div className="stat-info-tooltip-desc">{statExplanations.completedAsClient.description}</div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Active Contracts as Client */}
                <div className="profile-stat-item">
                    <div className="profile-stat-label">
                        <FaBriefcase className="profile-stat-icon active" />
                        Active Contracts
                    </div>
                    <div className="profile-stat-value stat-info-wrapper">
                        <span>{clientStats.activeContracts}</span>
                        <FaInfoCircle className="stat-info-icon" onClick={() => toggleTooltip('activeContractsClient')} />
                        {activeTooltip === 'activeContractsClient' && (
                            <div className="stat-info-tooltip">
                                <div className="stat-info-tooltip-title">{statExplanations.activeContractsClient.title}</div>
                                <div className="stat-info-tooltip-desc">{statExplanations.activeContractsClient.description}</div>
                            </div>
                        )}
                    </div>
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
                        {isUserOnline ? (
                            <span className="profile-online-status">● Online</span>
                        ) : userLastSeen ? (
                            formatLastSeen(userLastSeen)
                        ) : 'N/A'}
                    </span>
                </div>
            </div>
        </aside>
    );
};

export default ProfileSidebar;
