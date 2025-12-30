import React from 'react'
import { FaCalendarAlt, FaClock, FaExclamationTriangle } from 'react-icons/fa'
import './TimeProgressBar.css'

function TimeProgressBar({ startDate, deadline, duration, deliveryTime, compact = false, status = 'active', completedAt = null }) {
    // Calculate deadline if not provided
    const calculateDeadline = () => {
        if (deadline) return deadline

        if (!startDate) return null

        const start = new Date(startDate)
        let daysToAdd = 0

        // Priority 1: Use deliveryTime (from proposal)
        if (deliveryTime && typeof deliveryTime === 'number') {
            daysToAdd = deliveryTime
        }
        // Priority 2: Use duration (from job)
        else if (duration) {
            if (typeof duration === 'number') {
                daysToAdd = duration
            } else if (duration.value) {
                const value = duration.value
                const unit = duration.unit || 'days'

                switch (unit) {
                    case 'days':
                        daysToAdd = value
                        break
                    case 'weeks':
                        daysToAdd = value * 7
                        break
                    case 'months':
                        daysToAdd = value * 30
                        break
                    default:
                        daysToAdd = value
                }
            }
        }

        if (daysToAdd > 0) {
            const calculatedDeadline = new Date(start)
            calculatedDeadline.setDate(calculatedDeadline.getDate() + daysToAdd)
            return calculatedDeadline
        }

        return null
    }

    const finalDeadline = calculateDeadline()

    // Calculate time progress
    const calculateProgress = () => {
        // If contract is completed, always return 100%
        if (status === 'completed') {
            if (!startDate) {
                return {
                    percentage: 100,
                    passedDays: 0,
                    totalDays: 0,
                    remainingDays: 0,
                    remainingTime: { days: 0, hours: 0, minutes: 0, totalMs: 0 },
                    isOverdue: false,
                    isNearDeadline: false,
                    isCompleted: true
                }
            }

            const start = new Date(startDate)
            // Use completedAt if available, otherwise use finalDeadline or current date
            const end = completedAt ? new Date(completedAt) : (finalDeadline ? new Date(finalDeadline) : new Date())
            const totalMs = end - start
            const totalDays = Math.max(Math.ceil(totalMs / (1000 * 60 * 60 * 24)), 1) // At least 1 day

            return {
                percentage: 100,
                passedDays: totalDays,
                totalDays: totalDays,
                remainingDays: 0,
                remainingTime: { days: 0, hours: 0, minutes: 0, totalMs: 0 },
                isOverdue: false,
                isNearDeadline: false,
                isCompleted: true
            }
        }

        if (!startDate || !finalDeadline) {
            return {
                percentage: 0,
                passedDays: 0,
                totalDays: 0,
                remainingDays: 0,
                remainingTime: null,
                isOverdue: false,
                isNearDeadline: false,
                isCompleted: false
            }
        }

        const start = new Date(startDate)
        const end = new Date(finalDeadline)
        const now = new Date()

        // Calculate days
        const totalMs = end - start
        const passedMs = now - start
        const remainingMs = end - now

        const totalDays = Math.ceil(totalMs / (1000 * 60 * 60 * 24))
        const passedDays = Math.floor(passedMs / (1000 * 60 * 60 * 24))

        // Calculate remaining time in detail
        const calculateRemainingTime = (ms) => {
            if (ms <= 0) return { days: 0, hours: 0, minutes: 0, totalMs: 0 }

            const days = Math.floor(ms / (1000 * 60 * 60 * 24))
            const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
            const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))

            return { days, hours, minutes, totalMs: ms }
        }

        const remainingTime = calculateRemainingTime(remainingMs)
        const remainingDays = remainingTime.days

        // Calculate percentage based on precise time
        const percentage = Math.min(Math.max((passedMs / totalMs) * 100, 0), 100)

        return {
            percentage: Math.round(percentage),
            passedDays: Math.max(passedDays, 0),
            totalDays,
            remainingDays,
            remainingTime,
            isOverdue: now > end,
            isNearDeadline: remainingDays === 0 || (remainingDays <= 5 && remainingDays > 0),
            isCompleted: false
        }
    }

    const progress = calculateProgress()

    // If no deadline can be calculated and contract is not completed, don't render anything
    if (!finalDeadline && status !== 'completed') {
        return null
    }

    // Determine progress bar color based on time remaining percentage
    const getProgressColor = () => {
        // If completed, always show green
        if (progress.isCompleted || status === 'completed') return '#108a00' // Green - Completed

        if (progress.isOverdue) return '#f44336' // Red - Overdue

        // Calculate remaining percentage (100% - elapsed%)
        const remainingPercentage = 100 - progress.percentage

        if (remainingPercentage <= 10) return '#f44336' // Red - Less than 10% time left
        if (remainingPercentage <= 25) return '#ff9800' // Orange - Less than 25% time left
        return '#108a00' // Green - More than 25% time left
    }

    const formatDate = (date) => {
        if (!date) return 'N/A'
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    // Format remaining time with days, hours, and minutes (always show all)
    const formatRemainingTime = (remainingTime) => {
        // If completed, show "Completed"
        if (progress.isCompleted || status === 'completed') {
            return 'Completed'
        }

        if (!remainingTime || remainingTime.totalMs <= 0) {
            return 'Overdue'
        }

        const { days, hours, minutes } = remainingTime

        // Always show days, hours, and minutes in abbreviated format
        return `${days}d ${hours}h ${minutes}m`
    }

    // Compact version for cards
    if (compact) {
        return (
            <div className="time-progress-compact">
                <div className="progress-header-compact">
                    <span className="progress-label">
                        <FaClock /> Timeline
                    </span>
                    <span className="progress-percentage" style={{ color: getProgressColor() }}>
                        {progress.percentage}%
                    </span>
                </div>
                <div className="progress-bar-container">
                    <div
                        className="progress-bar-fill"
                        style={{
                            width: `${progress.percentage}%`,
                            backgroundColor: getProgressColor()
                        }}
                    >
                        {progress.percentage > 10 && (
                            <span className="progress-bar-text">{progress.percentage}%</span>
                        )}
                    </div>
                </div>
                <div className="progress-info-compact">
                    {progress.isOverdue ? (
                        <span className="overdue-warning">
                            <FaExclamationTriangle /> Overdue
                        </span>
                    ) : (
                        <span className="days-remaining">
                            {formatRemainingTime(progress.remainingTime)} remaining
                        </span>
                    )}
                </div>
            </div>
        )
    }

    // Full version for detailed pages
    return (
        <div className="time-progress-bar">
            <div className="progress-header">
                <h4>
                    <FaClock /> Project Timeline
                </h4>
                {progress.isOverdue && (
                    <span className="overdue-badge">
                        <FaExclamationTriangle /> Overdue
                    </span>
                )}
                {progress.isNearDeadline && !progress.isOverdue && (
                    <span className="warning-badge">
                        <FaExclamationTriangle /> Deadline Approaching
                    </span>
                )}
            </div>

            <div className="progress-bar-wrapper">
                <div className="progress-bar-container">
                    <div
                        className="progress-bar-fill"
                        style={{
                            width: `${progress.percentage}%`,
                            backgroundColor: getProgressColor()
                        }}
                    >
                        {progress.percentage > 5 && (
                            <span className="progress-bar-text">{progress.percentage}%</span>
                        )}
                    </div>
                </div>
                <span className="progress-percentage-label" style={{ color: getProgressColor() }}>
                    {progress.percentage}%
                </span>
            </div>

            <div className="progress-details">
                <div className="progress-detail-item">
                    <FaCalendarAlt className="detail-icon" />
                    <div className="detail-content">
                        <span className="detail-label">Started</span>
                        <span className="detail-value">{formatDate(startDate)}</span>
                    </div>
                </div>

                <div className="progress-detail-item">
                    <FaCalendarAlt className="detail-icon" />
                    <div className="detail-content">
                        <span className="detail-label">Deadline</span>
                        <span className="detail-value">{formatDate(finalDeadline)}</span>
                    </div>
                </div>

                <div className="progress-detail-item">
                    <FaClock className="detail-icon" />
                    <div className="detail-content">
                        <span className="detail-label">Time Elapsed</span>
                        <span className="detail-value">
                            {progress.passedDays} / {progress.totalDays} days
                        </span>
                    </div>
                </div>

                <div className="progress-detail-item">
                    <FaClock className="detail-icon" />
                    <div className="detail-content">
                        <span className="detail-label">Remaining</span>
                        <span className="detail-value" style={{
                            color: progress.isOverdue ? '#f44336' : progress.isNearDeadline ? '#ff9800' : '#108a00',
                            fontWeight: 'bold'
                        }}>
                            {progress.isOverdue
                                ? formatRemainingTime({
                                    days: Math.abs(progress.remainingDays),
                                    hours: 0,
                                    minutes: 0,
                                    totalMs: -1
                                }) + ' overdue'
                                : formatRemainingTime(progress.remainingTime)
                            }
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TimeProgressBar
