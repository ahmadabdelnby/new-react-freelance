import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaEllipsisV, FaEdit, FaTrash } from 'react-icons/fa';
import './projectCard.css';

const ProjectCard = ({ project, onDelete, onEdit }) => {
    const { user } = useSelector((state) => state.auth) // 🔥 Get current user
    const [showMenu, setShowMenu] = useState(false)

    // Map backend data to component format
    const {
        _id,
        title,
        description,
        budget,
        skills = [],
        specialty,
        client,
        proposals = [],
        createdAt,
        status
    } = project;

    const normalizedStatus = status ? status.toLowerCase().replace(/_/g, '-') : 'unknown';
    const statusText = status ? status.replace(/[_-]/g, ' ') : 'unknown';

    // 🔥 Check if current user is the job owner
    // Handle nested user object structure
    const actualUser = user?.user || user;
    const userId = actualUser?._id || actualUser?.id || actualUser?.userId;
    const clientId = client?._id || client?.id || client;
    const isOwner = userId && clientId && String(clientId) === String(userId);

    // 🔥 Handle menu actions
    const handleEdit = () => {
        setShowMenu(false)
        if (onEdit) onEdit(_id)
    }

    const handleDelete = () => {
        setShowMenu(false)
        if (onDelete) onDelete(_id)
    }

    // 🔥 Get client display name
    const getClientName = () => {
        if (!client) return 'Deleted User';
        if (client.first_name) {
            return client.last_name
                ? `${client.first_name} ${client.last_name}`
                : client.first_name;
        }
        return client.username || 'Anonymous';
    };

    // Helper function to calculate time ago
    const getTimeAgo = (date) => {
        const now = new Date();
        const posted = new Date(date);
        const diffInMs = now - posted;
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
        const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

        // 🔥 Less than 1 minute
        if (diffInMinutes < 1) return 'Less than a minute ago';

        // 🔥 Minutes (1-59)
        if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;

        // Hours (1-23)
        if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;

        // Days
        return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    };

    return (
        <section className="project-card">
            <div className="project-card-grid">
                {/* Main Content */}
                <div className="project-card-main">
                    {/* Posted Time & Status */}
                    <div className="project-meta-row">
                        <span className="project-posted-time">
                            Posted <span>{getTimeAgo(createdAt)}</span>
                        </span>
                        <span className={`status-badge status-${normalizedStatus}`}>
                            {statusText}
                        </span>
                    </div>

                    {/* Title */}
                    <h3 className="project-title">
                        <Link to={`/jobs/${_id}`} className="project-link">
                            {title}
                        </Link>
                    </h3>
                </div>

                {/* Actions */}
                <div className="project-actions">
                    {/* 🔥 Edit/Delete Menu for Owner */}
                    {isOwner && (
                        <div className="job-owner-menu">
                            <button
                                className="menu-toggle-btn"
                                onClick={() => setShowMenu(!showMenu)}
                                aria-label="Job options"
                            >
                                <FaEllipsisV />
                            </button>
                            {showMenu && (
                                <div className="job-menu-dropdown">
                                    <button className="menu-item edit" onClick={handleEdit}>
                                        <FaEdit /> Edit Job
                                    </button>
                                    <button className="menu-item delete" onClick={handleDelete}>
                                        <FaTrash /> Delete Job
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Save Button */}
                    <button
                        className="action-btn"
                        aria-label={`Save job ${title}`}
                        title="Save this job"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="icon">
                            <path
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="1.5"
                                d="M19.674 6.176c-1.722-1.634-4.484-1.515-6.165.16L11.988 7.89l-1.642-1.634a4.314 4.314 0 00-6.085 0 4.269 4.269 0 000 6.058s5.485 5.221 7.246 6.537c.28.199.68.199.96 0 1.762-1.316 7.247-6.537 7.247-6.537 1.721-1.714 1.721-4.464-.04-6.138z"
                            ></path>
                        </svg>
                    </button>
                </div>
            </div>

            {/* Job Details */}
            <div className="project-details">
                <small className="project-meta">
                    <strong>{budget?.type === 'hourly' ? 'Hourly' : 'Fixed-price'}</strong>
                    {specialty && <span> - {typeof specialty === 'object' ? specialty.name : specialty}</span>}
                    {budget?.amount && (
                        <span>
                            {' - '}
                            <span>Budget: </span>
                            <span>${budget.amount}{budget.type === 'hourly' ? '/hr' : ''}</span>
                        </span>
                    )}
                </small>
                {/* Views and Proposals Count */}
                <small className="project-engagement">
                    {_id && (
                        <>
                            <span className="engagement-item">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="icon-sm">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5z" />
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                                </svg>
                                {project.views || 0} views
                            </span>
                            <span className="engagement-separator">•</span>
                            <span className="engagement-item">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="icon-sm">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                {project.proposalsCount || 0} proposals
                            </span>
                        </>
                    )}
                </small>
            </div>

            {/* Description */}
            <div className="project-description">
                <p>{description}</p>
            </div>

            {/* Skills */}
            {skills.length > 0 && (
                <div className="project-skills">
                    <div className="skills-container">
                        {skills.map((skill, index) => (
                            <a
                                key={typeof skill === 'object' ? skill._id : index}
                                href="#"
                                className="skill-tag"
                                onClick={(e) => e.preventDefault()}
                            >
                                {typeof skill === 'object' ? skill.name : skill}
                            </a>
                        ))}
                    </div>
                </div>
            )}

            {/* Attachments - Professional Display */}
            {project.attachments && project.attachments.length > 0 && (
                <div className="project-attachments">
                    <div className="attachments-header">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="icon-sm">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                        <span className="attachments-count">
                            {project.attachments.length} Attachment{project.attachments.length > 1 ? 's' : ''}
                        </span>
                    </div>
                    <div className="attachments-preview">
                        {project.attachments.slice(0, 3).map((attachment, index) => {
                            const isImage = attachment.fileType?.includes('image');
                            const fileName = attachment.fileName || `File ${index + 1}`;
                            const fileExt = fileName.split('.').pop()?.toUpperCase() || 'FILE';

                            return (
                                <div key={index} className="attachment-preview-card" title={fileName}>
                                    <div className="preview-icon">
                                        {isImage ? (
                                            <svg className="file-icon image-icon" viewBox="0 0 24 24" fill="none">
                                                <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" fill="currentColor" />
                                            </svg>
                                        ) : (
                                            <svg className="file-icon doc-icon" viewBox="0 0 24 24" fill="none">
                                                <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6z" fill="currentColor" />
                                            </svg>
                                        )}
                                    </div>
                                    <div className="preview-info">
                                        <span className="file-ext">{fileExt}</span>
                                        <span className="file-name-preview">{fileName.substring(0, 10)}{fileName.length > 10 ? '...' : ''}</span>
                                    </div>
                                </div>
                            );
                        })}
                        {project.attachments.length > 3 && (
                            <div className="attachment-preview-card more-files">
                                <span>+{project.attachments.length - 3}</span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Client Information */}
            <div className="project-client-info">
                <div className="client-info-row">
                    {/* Payment Verification */}
                    <small className="payment-status">
                        <div className={`verification-badge ${client?.paymentVerified ? 'verified' : 'unverified'}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="icon">
                                <path
                                    fill="currentColor"
                                    fillRule="evenodd"
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="1.5"
                                    d="M20.4 13.1c.8 1 .3 2.5-.9 2.9-.8.2-1.3 1-1.3 1.8 0 1.3-1.2 2.2-2.5 1.8-.8-.3-1.7 0-2.1.7-.7 1.1-2.3 1.1-3 0-.5-.7-1.3-1-2.1-.7-1.4.4-2.6-.6-2.6-1.8 0-.8-.5-1.6-1.3-1.8-1.2-.4-1.7-1.8-.9-2.9.5-.7.5-1.6 0-2.2-.9-1-.4-2.5.9-2.9.8-.2 1.3-1 1.3-1.8C5.9 5 7.1 4 8.3 4.5c.8.3 1.7 0 2.1-.7.7-1.1 2.3-1.1 3 0 .5.7 1.3 1 2.1.7 1.4-.5 2.6.5 2.6 1.7 0 .8.5 1.6 1.3 1.8 1.2.4 1.7 1.8.9 2.9-.4.6-.4 1.6.1 2.2z"
                                />
                                <path
                                    stroke="#fff"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="1.5"
                                    d="M15.5 9.7L11 14.3l-2.5-2.5"
                                />
                            </svg>
                        </div>
                        <strong className="payment-text">
                            Payment {client?.paymentVerified ? 'verified' : 'unverified'}
                        </strong>
                    </small>

                    {/* Client Name */}
                    <small className="client-spent">
                        <strong>Client: {getClientName()}</strong>
                    </small>

                    {/* Client Country */}
                    {client?.country && (
                        <small className="client-country">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="icon-sm">
                                <path
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="1.5"
                                    d="M12 11.9a2.5 2.5 0 100-5 2.5 2.5 0 000 5z"
                                />
                                <path
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="1.5"
                                    d="M18.4 9.4C18.4 5.9 15.6 3 12 3 8.4 3 5.6 5.9 5.6 9.4c0 1.5.6 2.9 1.5 4.1 1.3 1.8 5 7.5 5 7.5s3.6-5.7 5-7.5c.7-1.2 1.3-2.5 1.3-4.1z"
                                />
                            </svg>
                            {client.country}
                        </small>
                    )}
                </div>
            </div>
        </section>
    );
};

export default ProjectCard;
