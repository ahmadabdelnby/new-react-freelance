import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getMyProposals } from '../Services/Proposals/ProposalsSlice';
import { API_ENDPOINTS } from '../Services/config';
import { FaDownload } from 'react-icons/fa';
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
            not_selected: { class: 'status-not_selected', label: 'Not Selected', icon: 'fa-minus-circle' }
        };
        return statusConfig[status] || { class: 'status-default', label: status, icon: 'fa-question-circle' };
    };

    const filteredProposals = filter === 'all'
        ? proposals
        : proposals?.filter(proposal => proposal.status === filter);

    return (
        <div className="mp-prop-page">
            <div className="container py-5">
                <div className="mp-prop-header mb-4">
                    <button onClick={() => navigate(-1)} className="mp-prop-back-button">
                        <i className="fas fa-arrow-left"></i> Back
                    </button>
                    <h1 className="mp-prop-title">
                        <i className="fas fa-file-invoice-dollar"></i> My Proposals
                    </h1>
                    <p className="mp-prop-subtitle">Track all proposals you've submitted as a freelancer</p>
                </div>

                <div className="mp-prop-filters mb-4">
                    <div className="mp-prop-filter-buttons">
                        <button
                            className={`mp-prop-filter-btn ${filter === 'all' ? 'active' : ''}`}
                            onClick={() => setFilter('all')}
                        >
                            All Proposals
                        </button>
                        <button
                            className={`mp-prop-filter-btn ${filter === 'pending' ? 'active' : ''}`}
                            onClick={() => setFilter('pending')}
                        >
                            Pending
                        </button>
                        <button
                            className={`mp-prop-filter-btn ${filter === 'accepted' ? 'active' : ''}`}
                            onClick={() => setFilter('accepted')}
                        >
                            Accepted
                        </button>
                        <button
                            className={`mp-prop-filter-btn ${filter === 'rejected' ? 'active' : ''}`}
                            onClick={() => setFilter('rejected')}
                        >
                            Rejected
                        </button>
                        <button
                            className={`mp-prop-filter-btn ${filter === 'not_selected' ? 'active' : ''}`}
                            onClick={() => setFilter('not_selected')}
                        >
                            Not Selected
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
                    <div className="mp-prop-empty">
                        <i className="fas fa-file-invoice"></i>
                        <h3>No Proposals Found</h3>
                        <p>You haven't submitted any proposals yet</p>
                        <button onClick={() => navigate('/jobs')} className="mp-prop-btn-primary">
                            Browse Jobs
                        </button>
                    </div>
                ) : (
                    <div className="mp-prop-list">
                        {filteredProposals?.map((proposal) => {
                            const statusInfo = getStatusBadge(proposal.status);
                            return (
                                <div key={proposal._id} className="mp-prop-card">
                                    <div className="mp-prop-card-header">
                                        <div>
                                            <h3 className="mp-prop-job-title">{proposal.job?.title || 'Job Title'}</h3>
                                            <p className="mp-prop-job-client">
                                                <i className="fas fa-user"></i>
                                                Client: {proposal.job?.client?.first_name} {proposal.job?.client?.last_name}
                                            </p>
                                        </div>
                                        <span className={`mp-prop-status-badge ${statusInfo.class.replace(/^status-/, 'mp-prop-status-')}`}>
                                            <i className={`fas ${statusInfo.icon}`}></i>
                                            {statusInfo.label}
                                        </span>
                                    </div>

                                    <div className="mp-prop-details">
                                        <div className="mp-prop-detail-item">
                                            <i className="fas fa-dollar-sign"></i>
                                            <span>Bid Amount: ${proposal.bidAmount}</span>
                                        </div>
                                        <div className="mp-prop-detail-item">
                                            <i className="fas fa-calendar-alt"></i>
                                            <span>Delivery: {proposal.deliveryTime} days</span>
                                        </div>
                                        <div className="mp-prop-detail-item">
                                            <i className="fas fa-clock"></i>
                                            <span>
                                                Submitted: {new Date(proposal.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mp-prop-cover">
                                        <h4>Cover Letter</h4>
                                        <p>{proposal.coverLetter?.substring(0, 200)}...</p>
                                    </div>

                                    {proposal.attachments && proposal.attachments.length > 0 && (
                                        <div className="mp-prop-attachments">
                                            <h5>Attachments</h5>
                                            <ul className="mp-prop-attachment-list">
                                                {proposal.attachments.map((att, idx) => {
                                                    const fileObj = typeof att === 'string' ? { url: att } : att;
                                                    const fileUrl = fileObj.url || fileObj;
                                                    const fileName = fileObj.fileName || fileObj.name || (fileUrl || '').split('/').pop();
                                                    const cleanUrl = (fileUrl || '').replace(/^\/public/, '');
                                                    const downloadPath = `${API_ENDPOINTS.BASE_URL}/Freelancing/api/v1/upload/attachments/download?filePath=${encodeURIComponent(cleanUrl)}&originalName=${encodeURIComponent(fileName)}`;
                                                    const viewUrl = fileUrl && (fileUrl.startsWith('http') ? fileUrl : `${API_ENDPOINTS.BASE_URL}${fileUrl.replace(/^\/public/, '')}`);

                                                    return (
                                                        <li key={fileObj._id || fileUrl || idx} className="mp-prop-attachment-item" onClick={() => {
                                                            if (viewUrl) window.open(viewUrl, '_blank', 'noopener');
                                                        }}>
                                                            <div className="mp-prop-attachment-info">
                                                                <i className="fas fa-file mp-prop-file-icon"></i>
                                                                <div className="mp-prop-attachment-meta">
                                                                    <a href={viewUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="mp-prop-attachment-link">{fileName}</a>
                                                                </div>
                                                            </div>
                                                            <a href={downloadPath} className="download-btn mp-prop-download-btn" download={fileName} onClick={(e) => e.stopPropagation()} title="Download">
                                                                <FaDownload />
                                                            </a>
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        </div>
                                    )}

                                    <div className="mp-prop-actions">
                                        <button
                                            onClick={() => navigate(`/jobs/${proposal.job?._id}`)}
                                            className="mp-prop-btn-view"
                                        >
                                            View Job
                                        </button>
                                        {proposal.status === 'accepted' && (
                                            <button
                                                onClick={() => navigate(`/contracts`)}
                                                className="mp-prop-btn-contract"
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
