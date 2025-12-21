import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMyContracts } from '../../../Services/Contracts/ContractsSlice';
import { Link } from 'react-router-dom';
import { FaBriefcase, FaClock, FaDollarSign, FaCheckCircle, FaSpinner } from 'react-icons/fa';
import './MyJobsTab.css';

const MyJobsTab = ({ userId, isOwn }) => {
    const dispatch = useDispatch();
    const { contracts, loading } = useSelector((state) => state.contracts);

    useEffect(() => {
        if (isOwn) {
            dispatch(getMyContracts());
        }
    }, [isOwn, dispatch]);

    const contractsArray = Array.isArray(contracts) ? contracts : [];
    const activeJobs = contractsArray.filter(c => c.status === 'active' || c.status === 'in_progress');
    const completedJobs = contractsArray.filter(c => c.status === 'completed');

    if (loading) {
        return (
            <div className="myjobs-tab">
                <div className="myjobs-loading">
                    <FaSpinner className="spinner" />
                    <p>Loading your jobs...</p>
                </div>
            </div>
        );
    }

    if (!isOwn) {
        return (
            <div className="myjobs-tab">
                <div className="myjobs-private">
                    <FaBriefcase size={48} />
                    <p>Job details are private.</p>
                </div>
            </div>
        );
    }

    const renderJobCard = (contract, isActive = false) => {
        const job = contract.job;
        if (!job) return null;

        return (
            <div key={contract._id} className={`myjob-card ${isActive ? 'active' : 'completed'}`}>
                <div className="myjob-header">
                    <div className="myjob-status">
                        {isActive ? (
                            <>
                                <FaClock className="status-icon active" />
                                <span className="status-label active">In Progress</span>
                            </>
                        ) : (
                            <>
                                <FaCheckCircle className="status-icon completed" />
                                <span className="status-label completed">Completed</span>
                            </>
                        )}
                    </div>
                    <div className="myjob-amount">
                        <FaDollarSign className="amount-icon" />
                        <span className="amount-value">${contract.agreedAmount?.toLocaleString()}</span>
                    </div>
                </div>

                <Link to={`/job/${job._id}`} className="myjob-title">
                    {job.title}
                </Link>

                <p className="myjob-description">
                    {job.description?.substring(0, 150)}
                    {job.description?.length > 150 ? '...' : ''}
                </p>

                <div className="myjob-details">
                    <div className="myjob-detail-item">
                        <span className="detail-label">Client:</span>
                        <span className="detail-value">
                            {contract.client?.first_name} {contract.client?.last_name}
                        </span>
                    </div>
                    <div className="myjob-detail-item">
                        <span className="detail-label">Started:</span>
                        <span className="detail-value">
                            {new Date(contract.startDate).toLocaleDateString()}
                        </span>
                    </div>
                    {contract.endDate && (
                        <div className="myjob-detail-item">
                            <span className="detail-label">Completed:</span>
                            <span className="detail-value">
                                {new Date(contract.endDate).toLocaleDateString()}
                            </span>
                        </div>
                    )}
                </div>

                <div className="myjob-actions">
                    <Link to={`/contracts/${contract._id}`} className="myjob-btn view-contract">
                        View Contract
                    </Link>
                    <Link to={`/job/${job._id}`} className="myjob-btn view-job">
                        View Job
                    </Link>
                </div>
            </div>
        );
    };

    return (
        <div className="myjobs-tab">
            {/* Active Jobs Section */}
            <div className="myjobs-section">
                <div className="myjobs-section-header">
                    <h3 className="myjobs-section-title">
                        <FaClock /> Active Jobs
                    </h3>
                    <span className="myjobs-count">{activeJobs.length}</span>
                </div>

                <div className="myjobs-list">
                    {activeJobs.length === 0 ? (
                        <div className="myjobs-empty">
                            <FaBriefcase size={40} />
                            <p>No active jobs at the moment</p>
                            <Link to="/jobs" className="browse-jobs-btn">
                                Browse Available Jobs
                            </Link>
                        </div>
                    ) : (
                        activeJobs.map((contract) => renderJobCard(contract, true))
                    )}
                </div>
            </div>

            {/* Completed Jobs Section */}
            <div className="myjobs-section">
                <div className="myjobs-section-header">
                    <h3 className="myjobs-section-title">
                        <FaCheckCircle /> Completed Jobs
                    </h3>
                    <span className="myjobs-count">{completedJobs.length}</span>
                </div>

                <div className="myjobs-list">
                    {completedJobs.length === 0 ? (
                        <div className="myjobs-empty">
                            <FaCheckCircle size={40} />
                            <p>No completed jobs yet</p>
                        </div>
                    ) : (
                        completedJobs.map((contract) => renderJobCard(contract, false))
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyJobsTab;
