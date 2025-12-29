import React from 'react'
import { Link } from 'react-router-dom'
import {
    FaFileContract,
    FaDollarSign,
    FaCalendarAlt,
    FaCheckCircle,
    FaUser,
    FaClock,
    FaArrowRight
} from 'react-icons/fa'
import { getImageUrl } from '../../Services/imageUtils'
import TimeProgressBar from '../common/TimeProgressBar'
import { getContractStatusLabel, getStatusColor } from '../../utils/statusHelpers'
import './ContractCard.css'

function ContractCard({ contract, viewerRole }) {
    if (!contract) return null

    const formatDate = (date) => {
        if (!date) return 'N/A'
        const d = new Date(date)
        return d.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    const otherParty = viewerRole === 'client' ? contract.freelancer : contract.client
    const otherPartyRole = viewerRole === 'client' ? 'Freelancer' : 'Client'

    // Check contract state
    const isCompleted = contract.status === 'completed'
    const isTerminated = contract.status === 'terminated'
    const isPaused = contract.status === 'paused'

    // Get appropriate card title
    const getCardTitle = () => {
        if (isCompleted) return 'Completed Contract'
        if (isTerminated) return 'Terminated Contract'
        if (isPaused) return 'Paused Contract'
        return 'Active Contract'
    }

    return (
        <div className={`contract-card contract-${contract.status}`}>
            <div className="contract-card-header">
                <div className="contract-header-info">
                    <h3>{getCardTitle()}</h3>
                    <span className="contract-id">ID: {contract._id?.slice(-8)}</span>
                </div>
                <div
                    className="contract-status-badge"
                    style={{ backgroundColor: getStatusColor(contract.status, 'contract') }}
                >
                    {getContractStatusLabel(contract.status)}
                </div>
            </div>

            <div className="contract-card-body">
                {/* Other Party Info */}
                <div className="contract-party">
                    <div className="party-avatar">
                        {otherParty?.profile_picture ? (
                            <img
                                src={getImageUrl(otherParty.profile_picture)}
                                alt={`${otherParty.first_name} ${otherParty.last_name}`}
                            />
                        ) : (
                            <FaUser size={24} />
                        )}
                    </div>
                    <div className="party-info">
                        <span className="party-role">{otherPartyRole}</span>
                        <Link
                            to={`/freelancer/${otherParty?._id}`}
                            className="party-name"
                        >
                            {otherParty?.first_name} {otherParty?.last_name}
                        </Link>
                        {otherParty?.email && (
                            <span className="party-email">{otherParty.email}</span>
                        )}
                    </div>
                </div>

                {/* Contract Details Grid */}
                <div className="contract-details-grid">
                    <div className="contract-detail-item">
                        <div className="detail-icon">
                            <FaDollarSign />
                        </div>
                        <div className="detail-content">
                            <span className="detail-label">Contract Amount</span>
                            <span className="detail-value">${contract.agreedAmount?.toLocaleString()}</span>
                        </div>
                    </div>

                    <div className="contract-detail-item">
                        <div className="detail-icon">
                            <FaCalendarAlt />
                        </div>
                        <div className="detail-content">
                            <span className="detail-label">Start Date</span>
                            <span className="detail-value">{formatDate(contract.startDate)}</span>
                        </div>
                    </div>

                    {contract.endDate && (
                        <div className="contract-detail-item">
                            <div className="detail-icon">
                                <FaCheckCircle />
                            </div>
                            <div className="detail-content">
                                <span className="detail-label">End Date</span>
                                <span className="detail-value">{formatDate(contract.endDate)}</span>
                            </div>
                        </div>
                    )}

                    <div className="contract-detail-item">
                        <div className="detail-icon">
                            <FaClock />
                        </div>
                        <div className="detail-content">
                            <span className="detail-label">Budget Type</span>
                            <span className="detail-value">{contract.budgetType}</span>
                        </div>
                    </div>
                </div>

                {/* Time Progress Bar - Only for active contracts */}
                {contract.startDate && !isCompleted && !isTerminated && (
                    <TimeProgressBar
                        startDate={contract.startDate}
                        deadline={contract.deadline}
                        duration={contract.job?.duration}
                        deliveryTime={contract.proposal?.deliveryTime}
                        compact={true}
                    />
                )}

                {/* Completion Info */}
                {isCompleted && contract.completedAt && (
                    <div className="completion-info">
                        <FaCheckCircle className="completion-icon" />
                        <div className="completion-text">
                            <span>Completed on {formatDate(contract.completedAt)}</span>
                        </div>
                    </div>
                )}

                {/* Deliverables Progress */}
                {contract.deliverables && contract.deliverables.length > 0 && (
                    <div className="contract-progress">
                        <h4>Work Submitted</h4>
                        <div className="progress-info">
                            <span>{contract.deliverables.length} deliverable(s) submitted</span>
                        </div>
                    </div>
                )}
            </div>

            <div className="contract-card-footer">
                <Link
                    to={`/contracts/${contract._id}`}
                    className="btn-view-contract"
                >
                    View Full Contract <FaArrowRight />
                </Link>
            </div>
        </div>
    )
}

export default ContractCard
