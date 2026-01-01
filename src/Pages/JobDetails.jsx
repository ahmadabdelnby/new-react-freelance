import React, { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import Swal from 'sweetalert2'
import { confirmCloseJob, showCannotEditAlert } from '../Shared/swalHelpers'
import { FaEllipsisV, FaEdit, FaTrash, FaMagic, FaTimes } from 'react-icons/fa'
import { fetchJobById, deleteJob, getRecommendedFreelancers } from '../Services/Jobs/JobsSlice'
import { getJobProposals } from '../Services/Proposals/ProposalsSlice'
import socketService from '../Services/socketService'
import JobHeader from '../Components/job-details-components/JobHeader'
import JobSummary from '../Components/job-details-components/JobSummary'
import JobPricing from '../Components/job-details-components/JobPricing'
import JobSkills from '../Components/job-details-components/JobSkills'
import JobSidebar from '../Components/job-details-components/JobSidebar'
import JobAttachments from '../Components/job-details-components/JobAttachments'
import ProposalsList from '../Components/job-details-components/ProposalsList'
import ApplyJobForm from '../Components/job-details-components/ApplyJobForm'
import SuggestedJobs from '../Components/job-details-components/SuggestedJobs'
import ActiveJobView from '../Components/job-details-components/ActiveJobView'
import JobNoLongerAvailable from '../Components/job-details-components/JobNoLongerAvailable'
import RecommendedFreelancersModal from '../Components/job-details-components/RecommendedFreelancersModal'
import './JobDetails.css'
import '../styles/sweetalert-custom.css'

function JobDetails() {
  const { jobId } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { currentJob, loading: jobLoading } = useSelector((state) => state.jobs)
  const { user, token } = useSelector((state) => state.auth)
  const { proposals: rawProposals } = useSelector((state) => state.proposals)
  const [activeTab, setActiveTab] = useState('details')
  const [showMenu, setShowMenu] = useState(false)
  const ownerMenuRef = useRef(null)
  const [showRecommendationsModal, setShowRecommendationsModal] = useState(false)
  const viewIncrementedRef = useRef({})

  // Ensure proposals is always an array
  const proposals = Array.isArray(rawProposals) ? rawProposals : []

  // Prevent duplicate SweetAlert in React StrictMode
  const notFoundAlertShown = useRef(false)

  useEffect(() => {
    if (jobId) {
      dispatch(fetchJobById(jobId))
        .unwrap()
        .catch((error) => {
          // If job not found, show error and redirect
          const errorMsg = typeof error === 'string' ? error : error?.message || '';
          if (errorMsg.toLowerCase().includes('not found') && !notFoundAlertShown.current) {
            notFoundAlertShown.current = true;
            Swal.fire({
              title: 'Job Not Found',
              text: 'This job has been deleted or is no longer available.',
              icon: 'error',
              confirmButtonColor: '#14a800',
              confirmButtonText: 'Go to Jobs'
            }).then((result) => {
              // Only navigate when user clicks the button
              if (result.isConfirmed) {
                navigate('/jobs');
              }
            });
          }
        });
      // Fetch proposals for all users to see
      dispatch(getJobProposals(jobId))
    }
  }, [jobId, dispatch])

  // Increment view count once per viewer (owner excluded).
  useEffect(() => {
    const doIncrementView = async () => {
      if (!jobId || !currentJob) return

      // Don't count owner's own views
      const actualUser = user?.user || user
      const userIdLocal = actualUser?._id || actualUser?.id
      if (userIdLocal && currentJob.client && String(currentJob.client._id || currentJob.client) === String(userIdLocal)) {
        return
      }

      try {
        const apiUrl = `${import.meta.env.VITE_API_URL}/jobs/${jobId}/view`

        // Prevent repeating the view increment for the same job during this session
        if (viewIncrementedRef.current[jobId]) return

        if (userIdLocal) {
          // ✅ Authenticated users: Backend handles deduplication via viewedBy array
          const tokenLocal = token || localStorage.getItem('token')
          const resp = await fetch(apiUrl, {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${tokenLocal}`,
              'Content-Type': 'application/json'
            }
          })

          if (resp.ok) {
            const data = await resp.json()

            // ✅ Mark as incremented in this session
            viewIncrementedRef.current[jobId] = true

            // ✅ Only refresh if view was actually incremented (not already counted)
            if (data.message === 'View count updated') {
              dispatch(fetchJobById(jobId))
            }
          }
        } else {
          // ✅ Guest users: Backend now handles IP-based deduplication (24h window)
          // Keep localStorage as fallback for same-browser deduplication
          const viewed = JSON.parse(localStorage.getItem('viewedJobs') || '[]')
          if (!viewed.includes(jobId)) {
            const resp = await fetch(apiUrl, { method: 'PATCH' })

            if (resp.ok) {
              const data = await resp.json()

              // ✅ Add to localStorage
              viewed.push(jobId)
              localStorage.setItem('viewedJobs', JSON.stringify(viewed))

              // ✅ Mark as incremented
              viewIncrementedRef.current[jobId] = true

              // ✅ Only refresh if view was actually incremented
              if (data.message === 'View count updated') {
                dispatch(fetchJobById(jobId))
              }
            }
          } else {
            // Already viewed in this browser - mark as incremented to prevent future calls
            viewIncrementedRef.current[jobId] = true
          }
        }
      } catch (err) {
        // Ignore view increment failures
        console.warn('Failed to increment view:', err)
      }
    }

    doIncrementView()
    // Only run when currentJob or jobId changes
  }, [jobId, currentJob, user, token, dispatch])

  // ✅ Cleanup viewIncrementedRef when leaving job page
  useEffect(() => {
    return () => {
      if (viewIncrementedRef.current[jobId]) {
        delete viewIncrementedRef.current[jobId]
      }
    }
  }, [jobId])

  // 🔥 Listen for job status changes via Socket.io
  useEffect(() => {
    if (!token || !jobId) return

    // ✅ Socket events handled in socketIntegration.js - no listeners needed here
    // Avoid redundant fetch here to prevent duplicate requests and loader flicker.
    // Join job room so user receives lightweight public status updates
    try {
      const sock = socketService.getSocket()
      if (sock && sock.connected) {
        socketService.emit('join_job', jobId)
      }
    } catch (err) {
      // ignore
    }

    return () => {
      try { socketService.emit('leave_job', jobId) } catch (e) { }
    }
  }, [token, jobId])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (ownerMenuRef.current && !ownerMenuRef.current.contains(e.target)) {
        setShowMenu(false)
      }
    }

    if (showMenu) {
      document.addEventListener('mousedown', handleOutsideClick)
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [showMenu])

  const handleDeleteJob = async () => {
    const result = await confirmDeleteJob()

    if (!result.isConfirmed) return;

    try {
      await dispatch(deleteJob(jobId)).unwrap()
      Swal.fire({
        title: 'Deleted!',
        text: 'Job deleted successfully!',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
      navigate('/jobs')
    } catch (error) {
      // 🔥 Professional: If deletion fails due to proposals, suggest closing instead
      const errorMessage = typeof error === 'string' ? error : error?.message || 'Failed to delete job'
      const errorReason = error?.reason || ''
      const hasSuggestion = error?.suggestion || errorMessage.includes('close')

      if (errorMessage.includes('proposals') || errorMessage.includes('Cannot delete') || hasSuggestion) {
        const messageText = errorReason ?
          `${errorMessage}\n\n${errorReason}\n\nWould you like to close this job instead? This will hide it from public listings while preserving the proposal history.` :
          `${errorMessage}\n\nWould you like to close this job instead? This will hide it from public listings while preserving the proposal history.`;

        const shouldCloseResult = await Swal.fire({
          title: 'Cannot Delete Job',
          text: messageText,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#14a800',
          cancelButtonColor: '#6c757d',
          confirmButtonText: 'Yes, close it!',
          cancelButtonText: 'Cancel',
          reverseButtons: true
        });

        if (shouldCloseResult.isConfirmed) {
          handleCloseJob()
        }
      } else {
        Swal.fire({
          title: 'Error!',
          text: errorMessage,
          icon: 'error',
          confirmButtonColor: '#dc3545'
        });
      }
    }
  }

  const handleCloseJob = async () => {
    // Confirm action with user before closing (shared helper)
    const confirm = await confirmCloseJob()

    if (!confirm.isConfirmed) return

    try {
      // Call close job API endpoint
      const token = localStorage.getItem('token')
      const response = await fetch(`${import.meta.env.VITE_API_URL}/jobs/${jobId}/close`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to close job')
      }

      toast.success('Job closed successfully!')
      navigate('/jobs')
    } catch (error) {
      toast.error(error.message || 'Failed to close job')
    }
  }

  const handleEditJob = () => {
    // Only allow edit if there are no proposals
    if (proposals && proposals.length > 0) {
      showCannotEditAlert()
      setShowMenu(false)
      return
    }

    navigate(`/edit-job/${jobId}`)
  }

  const handleGetRecommendations = () => {
    console.log('🔍 Getting recommendations for job:', jobId)
    console.log('Current job data:', currentJob)
    dispatch(getRecommendedFreelancers(jobId))
      .then((result) => {
        console.log('✅ Recommendations API response:', result)
      })
      .catch((error) => {
        console.error('❌ Failed to get recommendations:', error)
      })
    setShowRecommendationsModal(true)
  }

  // Show loading only when we don't yet have job data.
  if (!currentJob) {
    return (
      <div className="loading-container">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  // Handle nested user object structure
  const actualUser = user?.user || user
  const userId = actualUser?._id || actualUser?.id
  const userRole = actualUser?.role || user?.role

  const isClient = userRole === 'client'
  const isJobOwner = currentJob.client?._id === userId

  // 🔥 Professional: Check if job is in_progress or completed
  const isActiveJob = currentJob.status === 'in_progress' || currentJob.status === 'completed'
  const jobContract = currentJob.contract
  const viewerRole = currentJob.viewerRole // from backend
  const isAuthorizedViewer = viewerRole === 'client' || viewerRole === 'freelancer'

  // 🔥 If job is not available (403 from backend)
  if (currentJob.available === false && !currentJob.canViewDetails) {
    return (
      <div className="job-details-page">
        <div className="container">
          <JobNoLongerAvailable
            status={currentJob.status}
            message={currentJob.message}
            reason={currentJob.reason}
            suggestion={currentJob.suggestion}
          />
        </div>
      </div>
    )
  }

  // 🔥 If job is active and user is authorized (client or hired freelancer)
  if (isActiveJob && isAuthorizedViewer && jobContract) {
    return (
      <div className="job-details-page">
        <div className="container">
          <JobHeader job={currentJob} />
          <ActiveJobView
            job={currentJob}
            contract={jobContract}
            viewerRole={viewerRole}
          />
        </div>
        {/* No suggestions needed - User is busy with active project */}
      </div>
    )
  }

  // 🔥 Normal job view (open/closed jobs)
  return (
    <div className="job-details-page">
      <div className="container">
        <div className={`job-details-layout ${activeTab === 'proposals' ? 'full-width-proposals' : ''}`}>
          {/* Main Content */}
          <div className="job-main-content">
            {/* Owner Menu */}
            {isJobOwner && (
              <div className="job-owner-actions" ref={ownerMenuRef}>
                <button
                  className="job-menu-toggle"
                  onClick={() => setShowMenu(!showMenu)}
                  aria-label="Job options"
                >
                  <FaEllipsisV />
                </button>
                {showMenu && (
                  <div className="job-actions-dropdown">
                    <button onClick={handleEditJob} className="action-item edit">
                      <FaEdit /> Edit Job
                    </button>
                    <button
                      onClick={handleCloseJob}
                      className="action-item close"
                    >
                      <FaTimes /> Close Job
                    </button>

                  </div>
                )}
              </div>
            )}
            <JobHeader job={currentJob} />

            {/* Tabs (Details / Proposals) - Proposals only for job owner */}
            <div className="job-tabs">
              <button
                className={`tab-button ${activeTab === 'details' ? 'active' : ''}`}
                onClick={() => setActiveTab('details')}
              >
                Job Details
              </button>
              <button
                className={`tab-button ${activeTab === 'proposals' ? 'active' : ''} ${!isJobOwner ? 'disabled' : ''}`}
                onClick={() => isJobOwner && setActiveTab('proposals')}
                disabled={!isJobOwner}
                title={!isJobOwner ? 'Only the job owner can view proposals' : ''}
              >
                Proposals ({proposals.length})
              </button>
              {isJobOwner && (
                <button
                  className="btn-get-recommendations"
                  onClick={handleGetRecommendations}
                  title="Get AI-powered freelancer recommendations"
                >
                  <FaMagic /> Get Recommendations
                </button>
              )}
            </div>

            {/* Tab Content */}
            {activeTab === 'details' ? (
              <>
                <JobSummary job={currentJob} />
                <JobPricing job={currentJob} />
                <JobSkills skills={currentJob.skills || []} />

                {/* Attachments Section */}
                {currentJob.attachments && currentJob.attachments.length > 0 && (
                  <JobAttachments attachments={currentJob.attachments} />
                )}

                {/* Apply Form for Freelancers */}
                {userRole === 'user' && !isJobOwner && (
                  <ApplyJobForm jobId={jobId} jobStatus={currentJob.status} />
                )}

                {/* Guest User CTA - Show apply prompt for non-logged users */}
                {!user && currentJob.status === 'open' && (
                  <div className="guest-apply-prompt">
                    <div className="guest-prompt-content">
                      <FaEdit className="guest-prompt-icon" />
                      <h3>Want to apply for this job?</h3>
                      <p>Sign in or create a freelancer account to submit your proposal and start working on this project.</p>
                      <div className="guest-prompt-actions">
                        <button
                          onClick={() => navigate('/login', { state: { from: `/job/${jobId}` } })}
                          className="btn-guest-login"
                        >
                          Sign In to Apply
                        </button>
                        <button
                          onClick={() => navigate('/register', { state: { from: `/job/${jobId}` } })}
                          className="btn-guest-register"
                        >
                          Create Account
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <ProposalsList proposals={proposals} jobId={jobId} job={currentJob} />
            )}
          </div>

          {/* Sidebar - Hidden when viewing proposals */}
          {activeTab === 'details' && (
            <aside className="job-sidebar-wrapper">
              <JobSidebar client={currentJob.client} job={currentJob} />
            </aside>
          )}
        </div>
      </div>

      {/* Suggested Jobs Section - Only shown to freelancers, not job owner */}
      {!isJobOwner && userRole === 'user' && (
        <SuggestedJobs currentJobId={jobId} />
      )}

      {/* Recommended Freelancers Modal */}
      <RecommendedFreelancersModal
        isOpen={showRecommendationsModal}
        onClose={() => setShowRecommendationsModal(false)}
        jobId={jobId}
        jobTitle={currentJob.title}
      />
    </div>
  )
}

export default JobDetails
