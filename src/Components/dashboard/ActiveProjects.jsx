import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { FaBriefcase, FaComments, FaEye, FaUser } from 'react-icons/fa'
import { toast } from 'react-toastify'
import { API_ENDPOINTS } from '../../Services/config'
import { getImageUrl } from '../../Services/imageUtils'
import storage from '../../Services/storage'
import TimeProgressBar from '../common/TimeProgressBar'
import './ActiveProjects.css'

function ActiveProjects() {
    const navigate = useNavigate()
    const [activeJobs, setActiveJobs] = useState([])
    const [loading, setLoading] = useState(true)
    const [loadingChat, setLoadingChat] = useState({})
    const { user, token } = useSelector((state) => state.auth)

    useEffect(() => {
        if (user?.id && token) {
            fetchActiveProjects()
        } else {
            setLoading(false)
        }
    }, [user, token])

    const fetchActiveProjects = async () => {
        try {
            const userId = user?.id

            if (!userId) {
                setLoading(false)
                return
            }

            const response = await fetch(`${API_ENDPOINTS.JOBS_ALL}/client/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (response.ok) {
                const data = await response.json()
                // Filter only in_progress jobs
                const inProgressJobs = data.jobs?.filter(j => j.status === 'in_progress') || []
                setActiveJobs(inProgressJobs)
            }
        } catch (error) {
            console.error('Error fetching active projects:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleChat = async (job) => {
        const jobId = job._id
        const freelancerId = job.contract?.freelancer?._id
        const proposalId = job.contract?.proposal?._id || job.contract?.proposal

        if (!freelancerId || !jobId || !proposalId) {
            toast.error('Missing required information to start chat')
            return
        }

        setLoadingChat(prev => ({ ...prev, [jobId]: true }))

        try {
            const authToken = storage.get('token')
            const response = await fetch(API_ENDPOINTS.CHAT_CREATE_CONVERSATION, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    participantId: freelancerId,
                    jobId: jobId,
                    proposalId: proposalId
                })
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.message || 'Failed to start conversation')
            }

            const data = await response.json()
            if (data.conversation?._id) {
                navigate(`/chat?conversationId=${data.conversation._id}`)
            } else {
                toast.error('Failed to get conversation ID')
            }
        } catch (error) {
            console.error('Start chat error:', error)
            toast.error(error.message || 'Failed to start conversation')
        } finally {
            setLoadingChat(prev => ({ ...prev, [jobId]: false }))
        }
    }

    if (loading) {
        return (
            <div className="active-projects-card">
                <div className="loading-spinner">
                    <div className="spinner-border text-success" role="status"></div>
                </div>
            </div>
        )
    }

    if (activeJobs.length === 0) {
        return (
            <div className="active-projects-card">
                <div className="card-header-custom">
                    <FaBriefcase />
                    <h3>Active Projects</h3>
                    <span className="count-badge">0</span>
                </div>
                <div className="empty-state">
                    <p>No active projects at the moment</p>
                    <Link to="/post-job" className="btn-post-job">Post a New Job</Link>
                </div>
            </div>
        )
    }

    return (
        <div className="active-projects-card">
            <div className="card-header-custom">
                <FaBriefcase />
                <h3>Active Projects</h3>
                <span className="count-badge">{activeJobs.length}</span>
            </div>

            <div className="projects-list">
                {activeJobs.map((job) => (
                    <div key={job._id} className="project-item">
                        <div className="project-header">
                            <Link to={`/jobs/${job._id}`} className="project-title">
                                {job.title}
                            </Link>
                            <span className="project-status">In Progress</span>
                        </div>

                        {job.contract && job.contract.freelancer && (
                            <div className="project-freelancer">
                                <div className="freelancer-avatar">
                                    {job.contract.freelancer.profile_picture ? (
                                        <img
                                            src={getImageUrl(job.contract.freelancer.profile_picture)}
                                            alt={job.contract.freelancer.first_name}
                                        />
                                    ) : (
                                        <FaUser />
                                    )}
                                </div>
                                <div className="freelancer-info">
                                    <Link
                                        to={`/freelancer/${job.contract.freelancer._id}`}
                                        className="freelancer-name"
                                    >
                                        {job.contract.freelancer.first_name} {job.contract.freelancer.last_name}
                                    </Link>
                                    <span className="freelancer-role">Freelancer</span>
                                </div>
                            </div>
                        )}

                        <div className="project-meta">
                            <span className="project-budget">${job.budget?.amount?.toLocaleString()}</span>
                            <span className="project-date">
                                Started: {new Date(job.contract?.startDate).toLocaleDateString()}
                            </span>
                        </div>

                        {/* Time Progress */}
                        {job.contract?.startDate && (
                            <div style={{ marginTop: '12px' }}>
                                <TimeProgressBar
                                    startDate={job.contract.startDate}
                                    deadline={job.contract.deadline || job.deadline}
                                    duration={job.duration}
                                    deliveryTime={job.contract.proposal?.deliveryTime}
                                    status={job.contract.status}
                                    compact={true}
                                />
                            </div>
                        )}

                        <div className="project-actions">
                            <button
                                className="btn-action btn-chat"
                                onClick={() => handleChat(job)}
                                disabled={loadingChat[job._id]}
                            >
                                <FaComments /> {loadingChat[job._id] ? 'Loading...' : 'Chat'}
                            </button>
                            <Link
                                to={`/jobs/${job._id}`}
                                className="btn-action btn-view"
                            >
                                <FaEye /> View Details
                            </Link>
                        </div>
                    </div>
                ))}
            </div>

            {activeJobs.length > 3 && (
                <div className="card-footer-custom">
                    <Link to="/my-jobs" className="btn-view-all">
                        View All Projects ({activeJobs.length})
                    </Link>
                </div>
            )}
        </div>
    )
}

export default ActiveProjects
