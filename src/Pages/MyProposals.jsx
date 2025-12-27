import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getMyProposals } from '../Services/Proposals/ProposalsSlice';
import './MyProposals.css';

function MyProposals() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { myProposals, loading, error } = useSelector((state) => state.proposals);
    const { user } = useSelector((state) => state.auth);
    const [filter, setFilter] = useState('all');

    const proposals = myProposals || [];

    // Handle nested user object structure
    const actualUser = user?.user || user;
    const userId = actualUser?._id || actualUser?.id;

    useEffect(() => {
        if (userId) {
            dispatch(getMyProposals());
        }
    }, [dispatch, userId]);

    const getStatusBadge = (status) => {
        const statusConfig = {
            submitted: { class: 'status-submitted', label: 'Submitted', icon: 'fa-paper-plane' },
            viewed: { class: 'status-viewed', label: 'Viewed', icon: 'fa-eye' },
            accepted: { class: 'status-accepted', label: 'Accepted', icon: 'fa-check-circle' },
            rejected: { class: 'status-rejected', label: 'Rejected', icon: 'fa-times-circle' },
            withdrawn: { class: 'status-withdrawn', label: 'Withdrawn', icon: 'fa-ban' },
            not_selected: { class: 'status-not-selected', label: 'Not Selected', icon: 'fa-minus-circle' }
        };
        return statusConfig[status] || { class: 'status-default', label: status, icon: 'fa-question-circle' };
    };

    const filteredProposals = filter === 'all'
        ? proposals
        : proposals?.filter(proposal => proposal.status === filter);

    return (
        <div className="my-proposals-page">
            <div className="container py-5">
                <div className="page-header mb-4">
                    <button onClick={() => navigate(-1)} className="back-button">
                        <i className="fas fa-arrow-left"></i> Back
                    </button>
                    <h1 className="page-title">
                        <i className="fas fa-file-invoice-dollar"></i> My Proposals
                    </h1>
                    <p className="page-subtitle">Track all proposals you've submitted as a freelancer</p>
                </div>

                <div className="filters-section mb-4">
                    <div className="filter-buttons">
                        <button
                            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                            onClick={() => setFilter('all')}
                        >
                            All Proposals
                        </button>
                        <button
                            className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
                            onClick={() => setFilter('pending')}
                        >
                            Pending
                        </button>
                        <button
                            className={`filter-btn ${filter === 'accepted' ? 'active' : ''}`}
                            onClick={() => setFilter('accepted')}
                        >
                            Accepted
                        </button>
                        <button
                            className={`filter-btn ${filter === 'rejected' ? 'active' : ''}`}
                            onClick={() => setFilter('rejected')}
                        >
                            Rejected
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="loading-state">
                        <i className="fas fa-spinner fa-spin"></i>
                        <p>Loading your proposals...</p>
                    </div>
                ) : error ? (
                    <div className="empty-state">
                        <i className="fas fa-exclamation-circle"></i>
                        <h3>Error Loading Proposals</h3>
                        <p>{error}</p>
                        <button onClick={() => dispatch(getMyProposals())} className="btn-primary">
                            Retry
                        </button>
                    </div>
                ) : filteredProposals?.length === 0 ? (
                    <div className="empty-state">
                        <i className="fas fa-file-invoice"></i>
                        <h3>No Proposals Found</h3>
                        <p>You haven't submitted any proposals yet</p>
                        <button onClick={() => navigate('/jobs')} className="btn-primary">
                            Browse Jobs
                        </button>
                    </div>
                ) : (
                    <div className="proposals-list">
                        {filteredProposals?.map((proposal) => {
                            const statusInfo = getStatusBadge(proposal.status);
                            return (
                                <div key={proposal._id} className="proposal-card">
                                    <div className="proposal-header">
                                        <div>
                                            <h3 className="job-title">{proposal.job?.title || 'Job Title'}</h3>
                                            <p className="job-client">
                                                <i className="fas fa-user"></i>
                                                Client: {proposal.job?.client?.first_name} {proposal.job?.client?.last_name}
                                            </p>
                                        </div>
                                        <span className={`status-badge ${statusInfo.class}`}>
                                            <i className={`fas ${statusInfo.icon}`}></i>
                                            {statusInfo.label}
                                        </span>
                                    </div>

                                    <div className="proposal-details">
                                        <div className="detail-item">
                                            <i className="fas fa-dollar-sign"></i>
                                            <span>Bid Amount: ${proposal.bidAmount}</span>
                                        </div>
                                        <div className="detail-item">
                                            <i className="fas fa-calendar-alt"></i>
                                            <span>Delivery: {proposal.deliveryTime} days</span>
                                        </div>
                                        <div className="detail-item">
                                            <i className="fas fa-clock"></i>
                                            <span>
                                                Submitted: {new Date(proposal.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="proposal-cover-letter">
                                        <h4>Cover Letter</h4>
                                        <p>{proposal.coverLetter?.substring(0, 200)}...</p>
                                    </div>

                                    <div className="proposal-actions">
                                        <button
                                            onClick={() => navigate(`/jobs/${proposal.job?._id}`)}
                                            className="btn-view"
                                        >
                                            View Job
                                        </button>
                                        {proposal.status === 'accepted' && (
                                            <button
                                                onClick={() => navigate(`/contracts`)}
                                                className="btn-contract"
                                            >
                                                View Contract
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

export default MyProposals;
