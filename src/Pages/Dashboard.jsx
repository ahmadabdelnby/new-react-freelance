import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { API_ENDPOINTS } from '../Services/config'
import logger from '../Services/logger'
import { FaBriefcase, FaFileAlt, FaFileContract, FaDollarSign, FaChartLine } from 'react-icons/fa'
import ProfileCompletionWidget from '../Components/profile-completion/ProfileCompletionWidget'
import './Dashboard.css'

function Dashboard() {
  const { user, token, isAuthenticated } = useSelector((state) => state.auth)
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
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

        {/* Stats Cards */}
        <div className="row g-4 mb-5">
          {/* Jobs Posted/Applied */}
          <div className="col-md-3">
            <div className="stat-card">
              <div className="stat-icon bg-primary">
                <FaBriefcase />
              </div>
              <div className="stat-content">
                <h3 className="stat-number">{stats?.jobs?.posted || 0}</h3>
                <p className="stat-label">Jobs Posted</p>
              </div>
            </div>
          </div>

          {/* Proposals */}
          <div className="col-md-3">
            <div className="stat-card">
              <div className="stat-icon bg-info">
                <FaFileAlt />
              </div>
              <div className="stat-content">
                <h3 className="stat-number">{stats?.proposals?.submitted || 0}</h3>
                <p className="stat-label">Proposals Submitted</p>
              </div>
            </div>
          </div>

          {/* Contracts */}
          <div className="col-md-3">
            <div className="stat-card">
              <div className="stat-icon bg-warning">
                <FaFileContract />
              </div>
              <div className="stat-content">
                <h3 className="stat-number">{stats?.contracts?.active || 0}</h3>
                <p className="stat-label">Active Contracts</p>
              </div>
            </div>
          </div>

          {/* Earnings/Spent */}
          <div className="col-md-3">
            <div className="stat-card">
              <div className="stat-icon bg-success">
                <FaDollarSign />
              </div>
              <div className="stat-content">
                <h3 className="stat-number">
                  ${stats?.financials?.earned || 0}
                </h3>
                <p className="stat-label">Total Earned</p>
              </div>
            </div>
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

        {/* Recent Contracts */}
        {stats?.recentContracts && stats.recentContracts.length > 0 && (
          <div className="recent-contracts">
            <h2 className="section-title mb-4">Recent Contracts</h2>
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Job Title</th>
                    <th>Status</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentContracts.map((contract) => (
                    <tr key={contract._id}>
                      <td>{contract.job?.title || 'N/A'}</td>
                      <td>
                        <span className={`badge bg-${
                          contract.status === 'active' ? 'success' :
                          contract.status === 'completed' ? 'primary' :
                          'secondary'
                        }`}>
                          {contract.status}
                        </span>
                      </td>
                      <td>${contract.agreedAmount}</td>
                      <td>{new Date(contract.createdAt).toLocaleDateString()}</td>
                      <td>
                        <button className="btn btn-sm btn-outline-primary">
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

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
