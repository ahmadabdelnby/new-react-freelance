import React from 'react'
import { FaExclamationCircle, FaBriefcase } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import './JobNoLongerAvailable.css'

function JobNoLongerAvailable({ status, message, reason, suggestion }) {
    const getStatusIcon = () => {
        switch (status) {
            case 'in_progress':
                return '🚧'
            case 'completed':
                return '✅'
            case 'cancelled':
                return '❌'
            default:
                return '⚠️'
        }
    }

    const getStatusColor = () => {
        switch (status) {
            case 'in_progress':
                return '#ffa726'
            case 'completed':
                return '#108a00'
            case 'cancelled':
                return '#f44336'
            default:
                return '#ff9800'
        }
    }

    return (
        <div className="job-unavailable-container">
            <div className="job-unavailable-card">
                <div className="job-unavailable-icon" style={{ color: getStatusColor() }}>
                    <span className="status-emoji">{getStatusIcon()}</span>
                    <FaExclamationCircle size={60} />
                </div>

                <h1 className="job-unavailable-title">{message || 'Job Not Available'}</h1>

                <p className="job-unavailable-reason">{reason}</p>

                <div className="job-status-badge" style={{ backgroundColor: getStatusColor() }}>
                    Status: {status?.replace('_', ' ').toUpperCase()}
                </div>

                {suggestion && (
                    <p className="job-unavailable-suggestion">
                        💡 {suggestion}
                    </p>
                )}

                <div className="job-unavailable-actions">
                    <Link to="/jobs" className="btn-browse-jobs">
                        <FaBriefcase /> Browse Available Jobs
                    </Link>
                    <Link to="/dashboard" className="btn-dashboard">
                        Go to Dashboard
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default JobNoLongerAvailable
