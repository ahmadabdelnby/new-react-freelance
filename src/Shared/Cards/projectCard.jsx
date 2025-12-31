import React, { useState, useRef, useEffect } from 'react';
import Swal from 'sweetalert2'
import { showCannotEditAlert } from '../../Shared/swalHelpers'
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaEllipsisV, FaEdit, FaTimes } from 'react-icons/fa';
import './projectCard.css';

const ProjectCard = ({ project, onDelete, onEdit, onClose }) => {
    const navigate = useNavigate()
    const { user } = useSelector((state) => state.auth) // 🔥 Get current user
    const [showMenu, setShowMenu] = useState(false)
    const menuRef = useRef(null)

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
        const proposalsCount = (Array.isArray(proposals) && proposals.length) || project.proposalsCount || 0
        if (proposalsCount > 0) {
            showCannotEditAlert()
            return
        }
        if (onEdit) onEdit(_id)
    }

    const handleDelete = () => {
        setShowMenu(false)
        if (onDelete) onDelete(_id)
    }

    const handleClose = () => {
        setShowMenu(false)
        if (onClose) onClose(_id)
    }

    // Close menu when clicking outside
    useEffect(() => {
        const handleOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setShowMenu(false)
            }
        }
        if (showMenu) document.addEventListener('mousedown', handleOutside)
        return () => document.removeEventListener('mousedown', handleOutside)
    }, [showMenu])


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

    // 🔥 Handle card click to navigate to job details
    const handleCardClick = (e) => {
        // Prevent navigation if clicking on links, buttons, or interactive elements
        if (
            e.target.closest('a') || 
            e.target.closest('button') || 
            e.target.closest('.job-owner-menu')
        ) {
            return;
        }
        navigate(`/jobs/${_id}`);
    };

    return (
        <section className="job-card" onClick={handleCardClick}>
            <div className="job-card-grid">
                {/* Main Content */}
                <div className="job-card-main">
                    {/* Posted Time & Status */}
                    <div className="job-card-meta-row">
                        <span className="job-card-posted-time">
                            Posted <span>{getTimeAgo(createdAt)}</span>
                        </span>
                        <span className={`status-badge status-${normalizedStatus}`}>
                            {statusText}
                        </span>
                    </div>

                    {/* Title */}
                    <h3 className="job-card-title">
                        <Link to={`/jobs/${_id}`} className="job-card-link">
                            {title}
                        </Link>
                    </h3>
                </div>

                {/* Actions */}
                <div className="job-card-actions">
                    {/* 🔥 Edit/Delete Menu for Owner */}
                    {isOwner && (
                        <div className="job-owner-menu" ref={menuRef}>
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
                                    <button className="menu-item close" onClick={handleClose}>
                                        <FaTimes /> Close Job
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>



            {/* Description */}
            <div className="job-card-description">
                <p>{description?.length > 100 ? description.substring(0, 100) + '...' : description}</p>
            </div>

            {/* Project Meta Data */}
            <div className="job-card-meta">
                {/* Budget */}
                {budget && (
                    <div className="meta-item">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="icon-sm">
                            <path
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="1.5"
                                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                            <path
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M12 8h.01"
                            />
                        </svg>
                        <span className="meta-label">Budget:</span>
                        <span className="meta-value-2 budget-value">
                            ${budget.amount} {budget.type === 'fixed' ? 'Fixed' : 'Hourly'}
                        </span>
                    </div>
                )}

                {/* Specialty */}
                {specialty && (
                    <div className="meta-item">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="icon-sm">
                            <path
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="1.5"
                                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                            />
                        </svg>
                        <span className="meta-label">Specialty:</span>
                        <span className="meta-value-2">{specialty.name || specialty}</span>
                    </div>
                )}

                {/* Views */}
                <div className="meta-item">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="icon-sm">
                        <path
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.5"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.5"
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                    </svg>
                    <span className="meta-label">Views:</span>
                    <span className="meta-value">{project.views || 0}</span>
                </div>

                {/* Proposals */}
                <div className="meta-item">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="icon-sm">
                        <path
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.5"
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                    </svg>
                    <span className="meta-label">Proposals:</span>
                    <span className="meta-value">{proposals.length || project.proposalsCount || 0}</span>
                </div>
            </div>

            {/* Attachments - Professional Display */}
            {project.attachments && project.attachments.length > 0 && (
                <div className="job-card-attachments">
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
            <div className="job-card-client-info">
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
