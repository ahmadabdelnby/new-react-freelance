import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getClientJobs } from '../Services/Jobs/JobsSlice';
import './MyJobs.css';

function MyJobs() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { clientJobs, loading, error } = useSelector((state) => state.jobs);
    const { user } = useSelector((state) => state.auth);
    const [filter, setFilter] = useState('all');

    // Handle nested user object structure
    const actualUser = user?.user || user;
    const userId = actualUser?._id || actualUser?.id;

    useEffect(() => {
        if (userId) {
            dispatch(getClientJobs());
        }
    }, [dispatch, userId]);

    const getStatusBadge = (status) => {
        const statusConfig = {
            open: { class: 'status-open', label: 'Open' },
            in_progress: { class: 'status-in-progress', label: 'In Progress' },
            completed: { class: 'status-completed', label: 'Completed' },
            cancelled: { class: 'status-cancelled', label: 'Cancelled' }
        };
        return statusConfig[status] || { class: 'status-default', label: status };
    };

    const filteredJobs = filter === 'all'
        ? clientJobs
        : clientJobs?.filter(job => job.status === filter);

    return (
        <div className="my-jobs-page">
            <div className="container py-5">
                <div className="page-header mb-4">
                    <button onClick={() => navigate(-1)} className="back-button">
                        <i className="fas fa-arrow-left"></i> Back
                    </button>
                    <h1 className="page-title">
                        <i className="fas fa-file-alt"></i> My Posted Jobs
                    </h1>
                    <p className="page-subtitle">Manage all jobs you've posted as a client</p>
                </div>

                <div className="filters-section mb-4">
                    <div className="filter-buttons">
                        <button
                            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                            onClick={() => setFilter('all')}
                        >
                            All Jobs
                        </button>
                        <button
                            className={`filter-btn ${filter === 'open' ? 'active' : ''}`}
                            onClick={() => setFilter('open')}
                        >
                            Open
                        </button>
                        <button
                            className={`filter-btn ${filter === 'in_progress' ? 'active' : ''}`}
                            onClick={() => setFilter('in_progress')}
                        >
                            In Progress
                        </button>
                        <button
                            className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
                            onClick={() => setFilter('completed')}
                        >
                            Completed
                        </button>
                        <button
                            className={`filter-btn ${filter === 'cancelled' ? 'active' : ''}`}
                            onClick={() => setFilter('cancelled')}
                        >
                            Cancelled
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="loading-state">
                        <i className="fas fa-spinner fa-spin"></i>
                        <p>Loading your jobs...</p>
                    </div>
                ) : error ? (
                    <div className="empty-state">
                        <i className="fas fa-exclamation-circle"></i>
                        <h3>Error Loading Jobs</h3>
                        <p>{error}</p>
                        <button onClick={() => dispatch(getClientJobs())} className="btn-primary">
                            Retry
                        </button>
                    </div>
                ) : filteredJobs?.length === 0 ? (
                    <div className="empty-state">
                        <i className="fas fa-briefcase"></i>
                        <h3>No Jobs Found</h3>
                        <p>You haven't posted any jobs yet</p>
                        <button onClick={() => navigate('/post-job')} className="btn-primary">
                            Post Your First Job
                        </button>
                    </div>
                ) : (
                    <div className="jobs-list">
                        {filteredJobs?.map((job) => {
                            const statusInfo = getStatusBadge(job.status);
                            return (
                                <div key={job._id} className="job-card-myjobs">
                                    <div className="job-card-header">
                                        <h3 className="job-card-title">{job.title}</h3>
                                        <span className={`job-status-badge ${statusInfo.class}`}>
                                            {statusInfo.label}
                                        </span>
                                    </div>

                                    <p className="job-card-description">
                                        {job.description?.substring(0, 120)}...
                                    </p>

                                    <div className="job-card-meta">
                                        <div className="meta-item">
                                            <span className="meta-label">Budget:</span>
                                            <span className="meta-value">
                                                {job.budget?.type === 'fixed'
                                                    ? `$${typeof job.budget?.amount === 'number'
                                                        ? job.budget.amount.toLocaleString()
                                                        : (job.budget?.amount?.value || 0).toLocaleString()}`
                                                    : `$${job.budget?.hourlyRateFrom || 0}-$${job.budget?.hourlyRateTo || 0}/hr`}
                                            </span>
                                        </div>
                                        <div className="meta-item">
                                            <span className="meta-label">Duration:</span>
                                            <span className="meta-value">
                                                {job.duration?.value
                                                    ? `${job.duration.value} ${job.duration.unit || 'days'}`
                                                    : 'Not specified'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="job-card-stats">
                                        <div className="stat-item">
                                            <i className="fas fa-file-alt"></i>
                                            <span>{job.proposalsCount || 0} Proposals</span>
                                        </div>
                                        <div className="stat-item">
                                            <i className="fas fa-eye"></i>
                                            <span>{job.views || 0} Views</span>
                                        </div>
                                    </div>

                                    <div className="job-card-actions">
                                        <button
                                            onClick={() => navigate(`/jobs/${job._id}`)}
                                            className="btn-view-details"
                                        >
                                            <i className="fas fa-eye"></i> View Details
                                        </button>
                                        {job.status === 'open' && (
                                            <button
                                                onClick={() => navigate(`/edit-job/${job._id}`)}
                                                className="btn-edit-job"
                                            >
                                                <i className="fas fa-edit"></i> Edit
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

export default MyJobs;
