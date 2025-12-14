import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchJobById } from '../Services/Jobs/JobsSlice'
import { getJobProposals } from '../Services/Proposals/ProposalsSlice'
import JobHeader from '../Components/job-details-components/JobHeader'
import JobSummary from '../Components/job-details-components/JobSummary'
import JobPricing from '../Components/job-details-components/JobPricing'
import JobSkills from '../Components/job-details-components/JobSkills'
import JobSidebar from '../Components/job-details-components/JobSidebar'
import JobAttachments from '../Components/job-details-components/JobAttachments'
import ProposalsList from '../Components/job-details-components/ProposalsList'
import ApplyJobForm from '../Components/job-details-components/ApplyJobForm'
import SuggestedJobs from '../Components/job-details-components/SuggestedJobs'
import './JobDetails.css'

function JobDetails() {
  const { jobId } = useParams()
  const dispatch = useDispatch()
  const { currentJob, loading: jobLoading } = useSelector((state) => state.jobs)
  const { user } = useSelector((state) => state.auth)
  const { proposals: rawProposals } = useSelector((state) => state.proposals)
  const [activeTab, setActiveTab] = useState('details')

  // Ensure proposals is always an array
  const proposals = Array.isArray(rawProposals) ? rawProposals : []

  useEffect(() => {
    if (jobId) {
      dispatch(fetchJobById(jobId))
      // Fetch proposals for all users to see
      dispatch(getJobProposals(jobId))
    }
  }, [jobId, dispatch])

  if (jobLoading || !currentJob) {
    return (
      <div className="loading-container">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  const isClient = user?.role === 'client'
  const isJobOwner = currentJob.client?._id === user?._id

  return (
    <div className="job-details-page">
      <div className="container">
        <div className={`job-details-layout ${activeTab === 'proposals' ? 'full-width-proposals' : ''}`}>
          {/* Main Content */}
          <div className="job-main-content">
            <JobHeader job={currentJob} />
            
            {/* Tabs (Details / Proposals) - Available for everyone */}
            <div className="job-tabs">
              <button
                className={`tab-button ${activeTab === 'details' ? 'active' : ''}`}
                onClick={() => setActiveTab('details')}
              >
                Job Details
              </button>
              <button
                className={`tab-button ${activeTab === 'proposals' ? 'active' : ''}`}
                onClick={() => setActiveTab('proposals')}
              >
                Proposals ({proposals.length})
              </button>
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
                {user?.role === 'user' && !isJobOwner && (
                  <ApplyJobForm jobId={jobId} jobStatus={currentJob.status} />
                )}
              </>
            ) : (
              <ProposalsList proposals={proposals} jobId={jobId} />
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

      {/* Suggested Jobs Section */}
      <SuggestedJobs currentJobId={jobId} />
    </div>
  )
}

export default JobDetails
