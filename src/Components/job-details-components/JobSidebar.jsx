import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { FaHeart, FaRegHeart, FaFlag } from 'react-icons/fa'
import { API_ENDPOINTS } from '../../Services/config'
import storage from '../../Services/storage'
import './JobSidebar.css'

function JobSidebar({ client, job }) {
  const [isSaved, setIsSaved] = useState(false)
  const [clientStats, setClientStats] = useState({
    openJobs: 0,
    inProgressJobs: 0,
    totalJobs: 0,
    hireRate: 0,
    conversationsCount: 0
  })
  const [jobLink] = useState(window.location.href)

  useEffect(() => {
    if (client?._id) {
      fetchClientStats()
      fetchConversationsCount()
    }
  }, [client?._id])

  const fetchClientStats = async () => {
    try {
      const token = storage.get('token')
      const response = await fetch(API_ENDPOINTS.JOBS_ALL, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      const data = await response.json()
      const allJobs = Array.isArray(data) ? data : (data.jobs || [])
      
      // Filter jobs by this client
      const clientJobs = allJobs.filter(j => j.client?._id === client._id || j.client === client._id)
      
      const openJobs = clientJobs.filter(j => j.status === 'open').length
      const inProgressJobs = clientJobs.filter(j => j.status === 'in_progress').length
      const totalJobs = clientJobs.length
      
      // Calculate hire rate: (jobs with proposals accepted / total jobs) * 100
      // For now, we'll use in_progress + completed as "hired" jobs
      const hiredJobs = clientJobs.filter(j => j.status === 'in_progress' || j.status === 'completed').length
      const hireRate = totalJobs > 0 ? Math.round((hiredJobs / totalJobs) * 100) : 0
      
      setClientStats(prev => ({
        ...prev,
        openJobs,
        inProgressJobs,
        totalJobs,
        hireRate
      }))
    } catch (error) {
      console.error('Error fetching client stats:', error)
    }
  }

  const fetchConversationsCount = async () => {
    try {
      const token = storage.get('token')
      const response = await fetch(API_ENDPOINTS.CHAT_CONVERSATIONS, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      const data = await response.json()
      const conversations = Array.isArray(data) ? data : (data.conversations || [])
      
      // Filter conversations involving this client
      const clientConversations = conversations.filter(conv => 
        conv.participants?.some(p => p._id === client._id || p === client._id)
      )
      
      setClientStats(prev => ({
        ...prev,
        conversationsCount: clientConversations.length
      }))
    } catch (error) {
      console.error('Error fetching conversations:', error)
    }
  }

  const formatMemberSince = (date) => {
    if (!date) return 'N/A'
    const d = new Date(date)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return `${months[d.getMonth()]} ${d.getFullYear()}`
  }

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
        <h3 className="client-heading">About the client</h3>
        
        {/* Client Name */}
        {client._id && (
          <div className="client-name-section">
            <Link to={`/freelancer/${client._id}`} className="client-name-link">
              <strong>{client.first_name} {client.last_name}</strong>
            </Link>
          </div>
        )}

        {/* Member Since */}
        <div className="stat-item">
          <div className="stat-label">تاريخ الانضمام</div>
          <div className="stat-value">{formatMemberSince(client.createdAt)}</div>
        </div>

        {/* Hire Rate */}
        <div className="stat-item">
          <div className="stat-label">معدل التوظيف</div>
          <div className="stat-value">{clientStats.hireRate}%</div>
        </div>

        {/* Open Jobs */}
        <div className="stat-item">
          <div className="stat-label">المشاريع المفتوحة</div>
          <div className="stat-value">{clientStats.openJobs}</div>
        </div>

        {/* In Progress Jobs */}
        <div className="stat-item">
          <div className="stat-label">مشاريع قيد التنفيذ</div>
          <div className="stat-value">{clientStats.inProgressJobs}</div>
        </div>

        {/* Conversations */}
        <div className="stat-item">
          <div className="stat-label">التواصلات الجارية</div>
          <div className="stat-value">{clientStats.conversationsCount}</div>
        </div>
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
