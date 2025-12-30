import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { FaFileContract, FaComments, FaFileUpload, FaUser } from 'react-icons/fa'
import { getMyContracts } from '../../Services/Contracts/ContractsSlice'
import { getImageUrl } from '../../Services/imageUtils'
import TimeProgressBar from '../common/TimeProgressBar'
import './ActiveContracts.css'

function ActiveContracts() {
    const dispatch = useDispatch()
    const { user } = useSelector((state) => state.auth)
    const { contracts, loading } = useSelector((state) => state.contracts)

    useEffect(() => {
        dispatch(getMyContracts())
    }, [dispatch])

    // Filter only active contracts where user is freelancer
    const activeContracts = contracts?.filter(c =>
        c.status === 'active' &&
        String(c.freelancer?._id) === String(user?.id)
    ) || []

    const handleChat = (clientId) => {
        window.location.href = `/chat?userId=${clientId}`
    }

    if (loading) {
        return (
            <div className="active-contracts-card">
                <div className="loading-spinner">
                    <div className="spinner-border text-success" role="status"></div>
                </div>
            </div>
        )
    }

    if (activeContracts.length === 0) {
        return (
            <div className="active-contracts-card">
                <div className="card-header-custom">
                    <FaFileContract />
                    <h3>Active Contracts</h3>
                    <span className="count-badge">0</span>
                </div>
                <div className="empty-state">
                    <p>No active contracts at the moment</p>
                    <Link to="/jobs" className="btn-browse-jobs">Browse Available Jobs</Link>
                </div>
            </div>
        )
    }

    return (
        <div className="active-contracts-card">
            <div className="card-header-custom">
                <FaFileContract />
                <h3>Active Contracts</h3>
                <span className="count-badge">{activeContracts.length}</span>
            </div>

            <div className="contracts-list">
                {activeContracts.map((contract) => (
                    <div key={contract._id} className="contract-item">
                        <div className="contract-header">
                            <Link to={`/jobs/${contract.job?._id}`} className="contract-title">
                                {contract.job?.title || 'Untitled Project'}
                            </Link>
                            <span className="contract-status">Active</span>
                        </div>

                        {contract.client && (
                            <div className="contract-client">
                                <div className="client-avatar">
                                    {contract.client.profile_picture ? (
                                        <img
                                            src={getImageUrl(contract.client.profile_picture)}
                                            alt={contract.client.first_name}
                                        />
                                    ) : (
                                        <FaUser />
                                    )}
                                </div>
                                <div className="client-info">
                                    <Link
                                        to={`/freelancer/${contract.client._id}`}
                                        className="client-name"
                                    >
                                        {contract.client.first_name} {contract.client.last_name}
                                    </Link>
                                    <span className="client-role">Client</span>
                                </div>
                            </div>
                        )}

                        <div className="contract-meta">
                            <div className="meta-item">
                                <span className="meta-label">Amount:</span>
                                <span className="meta-value">${contract.agreedAmount?.toLocaleString()}</span>
                            </div>
                            <div className="meta-item">
                                <span className="meta-label">Started:</span>
                                <span className="meta-value">
                                    {new Date(contract.startDate).toLocaleDateString()}
                                </span>
                            </div>
                        </div>

                        {/* Time Progress */}
                        {contract.startDate && (
                            <div style={{ marginTop: '12px' }}>
                                <TimeProgressBar
                                    startDate={contract.startDate}
                                    deadline={contract.deadline}
                                    duration={contract.job?.duration}
                                    deliveryTime={contract.proposal?.deliveryTime}
                                    status={contract.status}
                                    compact={true}
                                />
                            </div>
                        )}

                        <div className="contract-progress">
                            <div className="progress-info">
                                <span>Work Submitted</span>
                                <span>{contract.deliverables?.length || 0} deliverable(s)</span>
                            </div>
                        </div>

                        <div className="contract-actions">
                            <button
                                className="btn-action btn-chat"
                                onClick={() => handleChat(contract.client?._id)}
                            >
                                <FaComments /> Chat
                            </button>
                            <Link
                                to={`/contracts/${contract._id}/submit-work`}
                                className="btn-action btn-submit"
                            >
                                <FaFileUpload /> Submit Work
                            </Link>
                        </div>
                    </div>
                ))}
            </div>

            {activeContracts.length > 3 && (
                <div className="card-footer-custom">
                    <Link to="/contracts" className="btn-view-all">
                        View All Contracts ({activeContracts.length})
                    </Link>
                </div>
            )}
        </div>
    )
}

export default ActiveContracts
