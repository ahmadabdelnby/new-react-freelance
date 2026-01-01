import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { API_ENDPOINTS } from '../../Services/config';
import {
    FaArrowLeft,
    FaSpinner,
    FaCheck,
    FaTimes,
    FaDollarSign,
    FaCalendarAlt,
    FaClock,
    FaUser,
    FaExclamationCircle,
    FaCheckCircle
} from 'react-icons/fa';
import './ModificationRequestsPage.css';

const ModificationRequestsPage = () => {
    const { contractId } = useParams();
    const { token, user } = useSelector((state) => state.auth);
    const [requests, setRequests] = useState([]);
    const [contract, setContract] = useState(null);
    const [loading, setLoading] = useState(true);
    const [respondingTo, setRespondingTo] = useState(null);
    const [responseNote, setResponseNote] = useState('');

    const actualUser = user?.user || user;
    const userId = actualUser?._id || actualUser?.id;

    const fetchData = async () => {
        try {
            setLoading(true);

            // Fetch contract details
            const contractRes = await fetch(API_ENDPOINTS.CONTRACT_BY_ID(contractId), {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const contractData = await contractRes.json();
            if (contractRes.ok) {
                setContract(contractData);
            }

            // Fetch modification requests
            const requestsRes = await fetch(API_ENDPOINTS.CONTRACT_MODIFICATIONS_BY_CONTRACT(contractId), {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const requestsData = await requestsRes.json();
            if (requestsRes.ok && requestsData.data) {
                setRequests(requestsData.data);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load modification requests');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [contractId]);

    const handleRespond = async (requestId, action) => {
        try {
            setRespondingTo(requestId);

            const response = await fetch(API_ENDPOINTS.RESPOND_TO_MODIFICATION(requestId), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    action,
                    responseNote
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `Failed to ${action} request`);
            }

            toast.success(`Modification request ${action === 'approve' ? 'approved' : 'rejected'} successfully!`);
            setResponseNote('');
            fetchData(); // Refresh data
        } catch (error) {
            toast.error(error.message);
        } finally {
            setRespondingTo(null);
        }
    };

    const isClient = contract && String(contract.client?._id || contract.client) === String(userId);

    const getStatusBadge = (status) => {
        switch (status) {
            case 'pending':
                return <span className="status-badge status-pending"><FaClock /> Pending</span>;
            case 'approved':
                return <span className="status-badge status-approved"><FaCheckCircle /> Approved</span>;
            case 'rejected':
                return <span className="status-badge status-rejected"><FaTimes /> Rejected</span>;
            default:
                return <span className="status-badge">{status}</span>;
        }
    };

    if (loading) {
        return (
            <div className="modification-requests-page">
                <div className="loading-state">
                    <FaSpinner className="spinner" />
                    <p>Loading modification requests...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="modification-requests-page">
            <div className="container">
                <div className="page-header">
                    <Link to={`/contracts/${contractId}`} className="back-link">
                        <FaArrowLeft /> Back to Contract
                    </Link>
                    <h1>Contract Modification Requests</h1>
                    {contract && (
                        <p className="job-title">For: {contract.job?.title}</p>
                    )}
                </div>

                {requests.length === 0 ? (
                    <div className="no-requests">
                        <FaExclamationCircle />
                        <h3>No Modification Requests</h3>
                        <p>There are no modification requests for this contract yet.</p>
                    </div>
                ) : (
                    <div className="requests-list">
                        {requests.map((request) => (
                            <div key={request._id} className={`request-card ${request.status}`}>
                                <div className="request-header">
                                    <div className="requester-info">
                                        <FaUser />
                                        <span>Requested by {request.requestedBy?.first_name} {request.requestedBy?.last_name}</span>
                                    </div>
                                    {getStatusBadge(request.status)}
                                </div>

                                <div className="request-body">
                                    <div className="modification-type">
                                        <strong>Type:</strong>
                                        {request.modificationType === 'budget' && ' Budget Change'}
                                        {request.modificationType === 'deadline' && ' Deadline Extension'}
                                        {request.modificationType === 'both' && ' Budget & Deadline Change'}
                                    </div>

                                    <div className="values-comparison">
                                        <div className="values-column">
                                            <h4>Current Values</h4>
                                            {(request.modificationType === 'budget' || request.modificationType === 'both') && (
                                                <div className="value-item">
                                                    <FaDollarSign />
                                                    <span>Budget: ${request.currentValues?.budget?.toLocaleString()}</span>
                                                </div>
                                            )}
                                            {(request.modificationType === 'deadline' || request.modificationType === 'both') && (
                                                <div className="value-item">
                                                    <FaCalendarAlt />
                                                    <span>Delivery: {request.currentValues?.deliveryTime} days</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="arrow">→</div>

                                        <div className="values-column requested">
                                            <h4>Requested Values</h4>
                                            {(request.modificationType === 'budget' || request.modificationType === 'both') && (
                                                <div className={`value-item ${request.requestedValues?.budget > request.currentValues?.budget ? 'increase' : 'decrease'}`}>
                                                    <FaDollarSign />
                                                    <span>Budget: ${request.requestedValues?.budget?.toLocaleString()}</span>
                                                    <span className="diff">
                                                        ({request.budgetDifference > 0 ? '+' : ''}{request.budgetDifference?.toLocaleString()})
                                                    </span>
                                                </div>
                                            )}
                                            {(request.modificationType === 'deadline' || request.modificationType === 'both') && (
                                                <div className="value-item">
                                                    <FaCalendarAlt />
                                                    <span>Delivery: {request.requestedValues?.deliveryTime} days</span>
                                                    <span className="diff">
                                                        ({request.requestedValues?.deliveryTime > request.currentValues?.deliveryTime ? '+' : ''}
                                                        {request.requestedValues?.deliveryTime - request.currentValues?.deliveryTime} days)
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="reason-section">
                                        <strong>Reason:</strong>
                                        <p>{request.reason}</p>
                                    </div>

                                    {request.responseNote && (
                                        <div className="response-note">
                                            <strong>Client's Response:</strong>
                                            <p>{request.responseNote}</p>
                                        </div>
                                    )}

                                    <div className="request-meta">
                                        <span>Submitted: {new Date(request.createdAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}</span>
                                        {request.respondedAt && (
                                            <span>Responded: {new Date(request.respondedAt).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}</span>
                                        )}
                                    </div>
                                </div>

                                {/* Action buttons for client on pending requests */}
                                {isClient && request.status === 'pending' && (
                                    <div className="request-actions">
                                        {request.budgetDifference > 0 && (
                                            <div className="budget-warning">
                                                <FaExclamationCircle />
                                                <span>Approving will deduct ${request.budgetDifference.toFixed(2)} from your wallet</span>
                                            </div>
                                        )}
                                        {request.budgetDifference < 0 && (
                                            <div className="budget-info">
                                                <FaCheckCircle />
                                                <span>Approving will refund ${Math.abs(request.budgetDifference).toFixed(2)} to your wallet</span>
                                            </div>
                                        )}

                                        <div className="response-note-input">
                                            <label>Response Note (optional):</label>
                                            <textarea
                                                placeholder="Add a note with your response..."
                                                value={responseNote}
                                                onChange={(e) => setResponseNote(e.target.value)}
                                                maxLength={500}
                                            />
                                        </div>

                                        <div className="action-buttons">
                                            <button
                                                className="btn-reject"
                                                onClick={() => handleRespond(request._id, 'reject')}
                                                disabled={respondingTo === request._id}
                                            >
                                                {respondingTo === request._id ? <FaSpinner className="spinner" /> : <FaTimes />}
                                                Reject
                                            </button>
                                            <button
                                                className="btn-approve"
                                                onClick={() => handleRespond(request._id, 'approve')}
                                                disabled={respondingTo === request._id}
                                            >
                                                {respondingTo === request._id ? <FaSpinner className="spinner" /> : <FaCheck />}
                                                Approve
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ModificationRequestsPage;
