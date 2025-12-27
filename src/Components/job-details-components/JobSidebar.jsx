import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { FaHeart, FaRegHeart, FaFlag } from 'react-icons/fa'
import { API_ENDPOINTS } from '../../Services/config'
import { getImageUrl } from '../../Services/imageUtils'
import storage from '../../Services/storage'
import {
  getContractsByClient,
  calculateHireRate,
  getJobStatusBreakdown
} from '../../utils/contractStats'
import './JobSidebar.css'

function JobSidebar({ client, job }) {
  const [isSaved, setIsSaved] = useState(false)
  const [clientStats, setClientStats] = useState({
    openJobs: 0,
    inProgressJobs: 0,
    completedJobs: 0,
    totalJobs: 0,
    hireRate: 0,
    conversationsCount: 0
  })
  const [jobLink] = useState(window.location.href)

  useEffect(() => {
    if (client?._id) {
      // Always fetch client stats (works with or without authentication)
      fetchClientStats()
      // Conversations count requires authentication
      const token = storage.get('token')
      if (token) {
        fetchConversationsCount()
      }
    }
  }, [client?._id])

  const fetchClientStats = async () => {
    try {
      console.log('🔍 === START ===')
      console.log('Client ID:', client._id)

      const token = storage.get('token')

      // ✅ Fetch ALL jobs for this specific client (including completed ones)
      // This is CRITICAL for accurate hire rate calculation
      // Include token only if user is logged in
      const headers = {
        'Content-Type': 'application/json'
      }
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const jobsResponse = await fetch(API_ENDPOINTS.JOBS_BY_CLIENT(client._id), {
        headers
      })

      if (!jobsResponse.ok) {
        console.error('❌ API Error:', jobsResponse.status)
        throw new Error(`Failed to fetch jobs: ${jobsResponse.status}`)
      }

      const jobsData = await jobsResponse.json()
      const clientJobs = Array.isArray(jobsData) ? jobsData : (jobsData.jobs || [])

      console.log('Total Client Jobs (all statuses):', clientJobs.length)
      console.log('Client Jobs Details:', clientJobs.map(j => ({
        id: j._id,
        title: j.title,
        status: j.status
      })))

      // Get job status breakdown (using utility function)
      const jobStats = getJobStatusBreakdown(clientJobs)
      console.log('Job Stats:', jobStats)

      // Fetch ALL contracts
      const contractsResponse = await fetch(API_ENDPOINTS.CONTRACTS, {
        headers
      })

      if (!contractsResponse.ok) {
        console.error('❌ Contracts API Error:', contractsResponse.status)
        throw new Error('Failed to fetch contracts')
      }

      const contractsData = await contractsResponse.json()
      const allContracts = Array.isArray(contractsData) ? contractsData : (contractsData.contracts || [])

      console.log('Total Contracts:', allContracts.length)
      console.log('Contracts:', allContracts.map(c => ({
        id: c._id,
        jobTitle: c.job?.title,
        clientId: c.client?._id || c.client,
        status: c.status
      })))

      // Filter contracts by client (using utility function)
      const clientContracts = getContractsByClient(allContracts, client._id)

      console.log('Client Contracts:', clientContracts.length)
      console.log('Client Contracts Details:', clientContracts.map(c => ({
        id: c._id,
        jobTitle: c.job?.title,
        status: c.status
      })))

      // Calculate hire rate (using utility function)
      const hireRate = calculateHireRate(clientContracts, clientJobs)
      console.log('Hire Rate:', hireRate + '%')
      console.log('🔍 === END ===')

      setClientStats(prev => ({
        ...prev,
        openJobs: jobStats.open,
        inProgressJobs: jobStats.in_progress,
        completedJobs: jobStats.completed,
        totalJobs: jobStats.total,
        hireRate
      }))
    } catch (error) {
      console.error('❌ Error fetching client stats:', error)
    }
  }

  const fetchConversationsCount = async () => {
    try {
      const token = storage.get('token')

      // Skip conversations count if user is not logged in
      if (!token) {
        setClientStats(prev => ({
          ...prev,
          conversationsCount: 0
        }))
        return
      }

      // Get client's active jobs (open + in_progress)
      const jobsResponse = await fetch(API_ENDPOINTS.JOBS_BY_CLIENT(client._id), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      const jobsData = await jobsResponse.json()
      const clientJobs = Array.isArray(jobsData) ? jobsData : (jobsData.jobs || [])
      const activeJobIds = clientJobs
        .filter(job => job.status === 'open' || job.status === 'in_progress')
        .map(job => job._id)

      // Get all conversations
      const response = await fetch(API_ENDPOINTS.CHAT_CONVERSATIONS, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      const data = await response.json()
      const conversations = Array.isArray(data) ? data : (data.conversations || [])

      // Count only conversations related to client's active jobs
      const activeConversations = conversations.filter(conv => {
        const hasClient = conv.participants?.some(p => p._id === client._id || p === client._id)
        const hasActiveJob = conv.job && activeJobIds.includes(String(conv.job._id || conv.job))
        return hasClient && hasActiveJob
      })

      setClientStats(prev => ({
        ...prev,
        conversationsCount: activeConversations.length
      }))
    } catch (error) {
      console.error('Error fetching conversations:', error)
    }
  }

  const formatMemberSince = (date) => {
    if (!date) {
      console.log('⚠️ No createdAt date for client:', client)
      return 'N/A'
    }
    const d = new Date(date)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
  }

  // 🔍 Debug: Log client data to verify it's coming from database
  useEffect(() => {
    console.log('📊 Client Data:', client)
    console.log('📊 Client Stats:', clientStats)
  }, [client, clientStats])

  const handleSave = () => {
    setIsSaved(!isSaved)
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(jobLink)
    toast.success('Link copied to clipboard!')
  }

  if (!client) return null

  return (
    <div className="job-sidebar">
      {/* Action Buttons */}
      <button className={`save-job-btn ${isSaved ? 'saved' : ''}`} onClick={handleSave}>
        {isSaved ? <FaHeart className="heart-icon filled" /> : <FaRegHeart className="heart-icon" />}
        <span>Save job</span>
      </button>

      <button className="flag-btn">
        <FaFlag className="flag-icon" />
        <span>Flag as inappropriate</span>
      </button>

      {/* Client Info */}
      <div className="client-info">
        <h3 className="client-heading">ABOUT THE CLIENT</h3>

        {/* Client Profile Card */}
        {client._id && (
          <Link to={`/freelancer/${client._id}`} className="client-profile-card">
            <div className="client-avatar">
              <img
                src={getImageUrl(client.profile_picture)}
                alt={`${client.first_name} ${client.last_name}`}
                className="client-avatar-img"
              />
            </div>
            <div className="client-info-text">
              <div className="client-name">{client.first_name} {client.last_name}</div>
              <div className="client-view-profile">View Profile →</div>
            </div>
          </Link>
        )}

        {/* Location */}
        {client.country && (
          <div className="job-stat-item">
            <div className="job-stat-label">Location</div>
            <div className="job-stat-value">{client.country}</div>
          </div>
        )}

        {/* Member Since */}
        <div className="job-stat-item">
          <div className="job-stat-label">Member Since</div>
          <div className="job-stat-value">{formatMemberSince(client.createdAt)}</div>
        </div>

        {/* Verification Badges */}
        <div className="job-stat-item">
          <div className="job-stat-label">Verification</div>
          <div className="job-stat-value verification-badges">
            {(client.isEmailVerified || client.email) && <span className="badge verified" title="Email Verified">Email</span>}
            {(client.isPhoneVerified || client.phone_number) && <span className="badge verified" title="Phone Verified">Phone</span>}
            {client.isIdentityVerified && <span className="badge verified" title="Identity Verified">ID</span>}
            {!(client.isEmailVerified || client.email) && !(client.isPhoneVerified || client.phone_number) && !client.isIdentityVerified && (
              <span className="badge unverified">Not Verified</span>
            )}
          </div>
        </div>

        {/* Total Jobs Posted */}
        <div className="job-stat-item">
          <div className="job-stat-label">Total Jobs Posted</div>
          <div className="job-stat-value">{clientStats.totalJobs}</div>
        </div>

        {/* Jobs Completed - Always show */}
        <div className="job-stat-item">
          <div className="job-stat-label">Jobs Completed</div>
          <div className="job-stat-value">{clientStats.completedJobs}</div>
        </div>

        {/* Hire Rate */}
        <div className="job-stat-item">
          <div className="job-stat-label">Hire Rate</div>
          <div className="job-stat-value hire-rate">
            {clientStats.hireRate}%
            {clientStats.hireRate >= 80 && <span className="excellent-badge"> Excellent</span>}
            {clientStats.hireRate >= 50 && clientStats.hireRate < 80 && <span className="good-badge"> Good</span>}
          </div>
        </div>

        {/* Total Spent - Only show if > 0 */}
        {client.totalSpent > 0 && (
          <div className="job-stat-item">
            <div className="job-stat-label">Total Spent</div>
            <div className="job-stat-value">${client.totalSpent?.toLocaleString()}</div>
          </div>
        )}

        {/* Open Jobs */}
        <div className="job-stat-item">
          <div className="job-stat-label">Open Jobs</div>
          <div className="job-stat-value">{clientStats.openJobs}</div>
        </div>

        {/* In Progress Jobs - Always show */}
        <div className="job-stat-item">
          <div className="job-stat-label">In Progress</div>
          <div className="job-stat-value">{clientStats.inProgressJobs}</div>
        </div>

        {/* Conversations */}
        <div className="job-stat-item">
          <div className="job-stat-label">Active Conversations</div>
          <div className="job-stat-value">{clientStats.conversationsCount}</div>
        </div>

        {/* Average Rating - Only show if exists */}
        {client.averageRating > 0 && (
          <div className="job-stat-item">
            <div className="job-stat-label">Client Rating</div>
            <div className="job-stat-value rating-value">
              {client.averageRating.toFixed(1)} / 5.0
              {client.totalReviews && <span className="review-count"> ({client.totalReviews} reviews)</span>}
            </div>
          </div>
        )}
      </div>

      {/* Job Link */}
      <div className="job-link-section">
        <h4 className="job-link-heading">Job link</h4>
        <div className="job-link-input-wrapper">
          <input
            type="text"
            value={jobLink}
            readOnly
            className="job-link-input"
          />
        </div>
        <button className="copy-link-btn" onClick={handleCopyLink}>
          Copy link
        </button>
      </div>
    </div>
  )
}

export default JobSidebar
