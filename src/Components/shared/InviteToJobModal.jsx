import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Spinner } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { API_ENDPOINTS } from '../../Services/config';
import storage from '../../Services/storage';
import { FaBriefcase, FaDollarSign, FaPaperPlane } from 'react-icons/fa';
import './InviteToJobModal.css';

const InviteToJobModal = ({ show, onHide, freelancerId, freelancerName }) => {
    const { user } = useSelector((state) => state.auth);
    const [openJobs, setOpenJobs] = useState([]);
    const [selectedJobs, setSelectedJobs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);

    // Get actual user data
    const actualUser = user?.user || user;
    const isLoggedIn = !!actualUser;

    // Fetch user's open jobs when modal opens
    useEffect(() => {
        if (show && isLoggedIn) {
            fetchOpenJobs();
        }
    }, [show, isLoggedIn]);

    // Reset state when modal closes
    useEffect(() => {
        if (!show) {
            setSelectedJobs([]);
        }
    }, [show]);

    const fetchOpenJobs = async () => {
        setLoading(true);
        try {
            const token = storage.get('token');
            const response = await fetch(`${API_ENDPOINTS.JOB_INVITATIONS_MY_OPEN_JOBS}?freelancerId=${freelancerId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();

            if (data.success) {
                setOpenJobs(data.jobs || []);
            } else {
                toast.error(data.message || 'Failed to load jobs');
            }
        } catch (error) {
            console.error('Error fetching open jobs:', error);
            toast.error('Failed to load your open jobs');
        } finally {
            setLoading(false);
        }
    };

    const handleJobToggle = (jobId) => {
        setSelectedJobs(prev => {
            if (prev.includes(jobId)) {
                return prev.filter(id => id !== jobId);
            } else {
                return [...prev, jobId];
            }
        });
    };

    const handleSelectAll = () => {
        const availableJobs = openJobs.filter(job => !job.alreadyInvited);
        if (selectedJobs.length === availableJobs.length) {
            setSelectedJobs([]);
        } else {
            setSelectedJobs(availableJobs.map(job => job._id));
        }
    };

    const handleSendInvitation = async () => {
        if (selectedJobs.length === 0) {
            toast.warning('Please select at least one job');
            return;
        }

        console.log('Sending invitation:', { freelancerId, jobIds: selectedJobs });

        setSending(true);
        try {
            const token = storage.get('token');
            const response = await fetch(API_ENDPOINTS.JOB_INVITATIONS_SEND, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    freelancerId,
                    jobIds: selectedJobs
                })
            });

            const data = await response.json();
            console.log('Response:', data);

            if (data.success) {
                toast.success(data.message || 'Invitation sent successfully!');
                if (data.skippedJobs?.length > 0) {
                    toast.info(`Already invited for: ${data.skippedJobs.join(', ')}`);
                }
                onHide();
            } else {
                // Show specific message for already invited
                if (data.message?.includes('already invited')) {
                    toast.info('You have already invited this user to the selected job(s)');
                } else {
                    toast.error(data.message || 'Failed to send invitation');
                }
            }
        } catch (error) {
            console.error('Error sending invitation:', error);
            toast.error('Failed to send invitation');
        } finally {
            setSending(false);
        }
    };

    const formatBudget = (budget) => {
        if (!budget) return 'N/A';
        const amount = budget.amount?.toLocaleString() || '0';
        return budget.type === 'hourly' ? `$${amount}/hr` : `$${amount}`;
    };

    return (
        <Modal
            show={show}
            onHide={onHide}
            centered
            className="invite-to-job-modal"
            size="md"
            backdrop="static"
            keyboard={false}
            style={{ zIndex: 9999 }}
        >
            <Modal.Header closeButton>
                <Modal.Title>
                    <FaPaperPlane className="modal-title-icon" />
                    Invite to Job
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p className="invite-description">
                    Invite <strong>{freelancerName}</strong> to submit a proposal for your open jobs:
                </p>

                {loading ? (
                    <div className="loading-container">
                        <Spinner animation="border" variant="success" />
                        <p>Loading your open jobs...</p>
                    </div>
                ) : openJobs.length === 0 ? (
                    <div className="no-jobs-message">
                        <FaBriefcase className="no-jobs-icon" />
                        <p>You don't have any open jobs yet.</p>
                        <small>Post a job first to invite freelancers.</small>
                    </div>
                ) : (
                    <>
                        <div className="select-all-container">
                            <Form.Check
                                type="checkbox"
                                id="select-all"
                                label={`Select All (${openJobs.filter(j => !j.alreadyInvited).length} available)`}
                                checked={selectedJobs.length === openJobs.filter(j => !j.alreadyInvited).length && openJobs.filter(j => !j.alreadyInvited).length > 0}
                                onChange={handleSelectAll}
                                disabled={openJobs.filter(j => !j.alreadyInvited).length === 0}
                            />
                        </div>

                        <div className="jobs-list">
                            {openJobs.map(job => (
                                <label
                                    key={job._id}
                                    htmlFor={`job-${job._id}`}
                                    className={`job-item ${selectedJobs.includes(job._id) ? 'selected' : ''} ${job.alreadyInvited ? 'already-invited' : ''}`}
                                >
                                    <input
                                        type="checkbox"
                                        id={`job-${job._id}`}
                                        checked={selectedJobs.includes(job._id)}
                                        onChange={() => handleJobToggle(job._id)}
                                        className="job-checkbox"
                                        disabled={job.alreadyInvited}
                                    />
                                    <div className="job-info">
                                        <h6 className="job-title">{job.title}</h6>
                                        <div className="job-meta">
                                            <span className="job-budget">
                                                <FaDollarSign />
                                                {formatBudget(job.budget)}
                                            </span>
                                            {job.alreadyInvited && (
                                                <span className="already-invited-badge">Already invited</span>
                                            )}
                                        </div>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="outline-secondary" onClick={onHide} disabled={sending}>
                    Cancel
                </Button>
                <Button
                    variant="success"
                    onClick={handleSendInvitation}
                    disabled={sending || selectedJobs.length === 0 || openJobs.length === 0}
                >
                    {sending ? (
                        <>
                            <Spinner size="sm" animation="border" className="me-2" />
                            Sending...
                        </>
                    ) : (
                        <>
                            <FaPaperPlane className="me-2" />
                            Send Invitation{selectedJobs.length > 1 ? 's' : ''}
                        </>
                    )}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default InviteToJobModal;
