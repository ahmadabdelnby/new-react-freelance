import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { API_ENDPOINTS } from '../Services/config'
import logger from '../Services/logger'
import { FaBriefcase, FaFileAlt, FaFileContract, FaDollarSign, FaChartLine } from 'react-icons/fa'
import ProfileCompletionWidget from '../Components/profile-completion/ProfileCompletionWidget'
import { useAutoBalanceSync } from '../hooks/useBalanceSync'
import { getContractStatusLabel } from '../utils/statusHelpers'
import './Dashboard.css'

function Dashboard() {
  const { user, token, isAuthenticated } = useSelector((state) => state.auth)
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  // Auto-sync balance when component mounts
  useAutoBalanceSync();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/')
      return
    }

    fetchDashboardStats()
  }, [isAuthenticated, navigate])

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.STATISTICS_DASHBOARD, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-page">
      <div className="container py-5">
        {/* Welcome Section */}
        <div className="dashboard-header mb-4">
          <h1 className="dashboard-title">
            Welcome back, {user?.first_name || 'User'}! 👋
          </h1>
          <p className="dashboard-subtitle text-muted">
            Here's what's happening with your account
          </p>
        </div>

        {/* Profile Completion Widget */}
        {user?.role === 'freelancer' && (
          <div className="mb-4">
            <ProfileCompletionWidget />
          </div>
        )}

        {/* Current Balance Card */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="current-balance-card">
              <div className="balance-content">
                <span className="balance-label">Current Balance</span>
                <span className="balance-amount">${user?.balance?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="balance-actions">
                <Link to="/add-funds" className="add-funds-link">
                  <FaDollarSign /> Add Funds
                </Link>
                <Link to="/withdraw" className="withdraw-link">
                  <FaDollarSign /> Withdraw
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="row g-4 mb-5">
          {/* Active Projects Card (for clients) */}
          <div className="col-md-3">
            <Link to="/my-projects" className="stat-card-dashboard stat-card-projects">
              <div className="stat-icon">
                <FaBriefcase />
              </div>
              <div className="stat-details">
                <h4>Active Projects</h4>
                <div className="stat-count">{stats?.jobs?.active || 0}</div>
                <p className="stat-label-dashboard">As Client</p>
              </div>
            </Link>
          </div>

          {/* Active Contracts Card (for freelancers) */}
          <div className="col-md-3">
            <Link to="/my-contracts" className="stat-card-dashboard stat-card-contracts">
              <div className="stat-icon">
                <FaFileContract />
              </div>
              <div className="stat-details">
                <h4>Active Contracts</h4>
                <div className="stat-count">{stats?.contracts?.active || 0}</div>
                <p className="stat-label-dashboard">As Freelancer</p>
              </div>
            </Link>
          </div>

          {/* Jobs Posted Card */}
          <div className="col-md-3">
            <Link to="/my-jobs" className="stat-card-dashboard stat-card-jobs">
              <div className="stat-icon">
                <FaFileAlt />
              </div>
              <div className="stat-details">
                <h4>Total Jobs Posted</h4>
                <div className="stat-count">{stats?.jobs?.posted || 0}</div>
                <p className="stat-label-dashboard">All Statuses</p>
              </div>
            </Link>
          </div>

          {/* Proposals Card */}
          <div className="col-md-3">
            <Link to="/my-proposals" className="stat-card-dashboard stat-card-proposals">
              <div className="stat-icon">
                <FaDollarSign />
              </div>
              <div className="stat-details">
                <h4>My Proposals</h4>
                <div className="stat-count">{stats?.proposals?.submitted || 0}</div>
                <p className="stat-label-dashboard">All Statuses</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions mb-5">
          <h2 className="section-title mb-4">Quick Actions</h2>
          <div className="row g-3">
            <div className="col-md-3">
              <Link to="/jobs" className="action-card">
                <FaBriefcase className="action-icon" />
                <h4>Browse Jobs</h4>
                <p>Find new opportunities</p>
              </Link>
            </div>
            <div className="col-md-3">
              <Link to="/post-job" className="action-card">
                <FaFileAlt className="action-icon" />
                <h4>Post a Job</h4>
                <p>Hire talented freelancers</p>
              </Link>
            </div>
            <div className="col-md-3">
              <Link to="/UserProfile" className="action-card">
                <FaChartLine className="action-icon" />
                <h4>My Profile</h4>
                <p>Update your information</p>
              </Link>
            </div>
            <div className="col-md-3">
              <Link to="/chat" className="action-card">
                <FaFileContract className="action-icon" />
                <h4>Messages</h4>
                <p>Chat with clients/freelancers</p>
              </Link>
            </div>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="row g-4 mt-4">
          <div className="col-md-6">
            <div className="financial-card">
              <h3 className="card-title">Financial Overview</h3>
              <div className="financial-details">
                <div className="financial-item">
                  <span className="label">Total Earned:</span>
                  <span className="value text-success">
                    ${stats?.financials?.earned || 0}
                  </span>
                </div>
                <div className="financial-item">
                  <span className="label">Total Spent:</span>
                  <span className="value text-danger">
                    ${stats?.financials?.spent || 0}
                  </span>
                </div>
                <div className="financial-item">
                  <span className="label">Balance:</span>
                  <span className="value text-primary">
                    ${stats?.financials?.balance || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="financial-card">
              <h3 className="card-title">Activity Summary</h3>
              <div className="financial-details">
                <div className="financial-item">
                  <span className="label">Total Contracts:</span>
                  <span className="value">{stats?.contracts?.total || 0}</span>
                </div>
                <div className="financial-item">
                  <span className="label">Completed:</span>
                  <span className="value text-success">
                    {stats?.contracts?.completed || 0}
                  </span>
                </div>
                <div className="financial-item">
                  <span className="label">Accepted Proposals:</span>
                  <span className="value text-info">
                    {stats?.proposals?.accepted || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
