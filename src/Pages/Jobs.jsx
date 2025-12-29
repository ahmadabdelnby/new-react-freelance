import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import Swal from 'sweetalert2'
import { fetchJobs, deleteJob } from '../Services/Jobs/JobsSlice'
import ProjectCard from '../Shared/Cards/projectCard'
import ProjectSlider from '../Shared/projectsSlider/projectSlider'
import JobsFilter from '../Components/jobs-components/JobsFilter'
import { FaThLarge, FaList, FaSortAmountDown, FaChevronLeft, FaChevronRight, FaInfoCircle, FaPlus } from 'react-icons/fa'
import './Jobs.css'
import '../styles/sweetalert-custom.css'

function Jobs() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { jobs, loading, error } = useSelector((state) => state.jobs)
  const { user } = useSelector((state) => state.auth) // 🔥 Get current user

  // Ensure jobs is always an array
  const jobsList = Array.isArray(jobs) ? jobs : []

  // View and pagination states
  const [viewMode, setViewMode] = useState('list') // 'list' or 'grid'
  const [sortBy, setSortBy] = useState('newest') // 'newest', 'oldest', 'budget-high', 'budget-low'
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [jobsFilter, setJobsFilter] = useState('all') // 🔥 'all' or 'my-jobs'

  // 🔥 Delete handler
  const handleDeleteJob = async (jobId) => {
    const result = await Swal.fire({
      title: 'Delete Job?',
      text: 'Are you sure you want to delete this job? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      reverseButtons: true
    });

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
          handleCloseJob(jobId)
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

  // 🔥 Close job handler
  const handleCloseJob = async (jobId) => {
    try {
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

      // Refresh jobs list
      dispatch(fetchJobs())

      Swal.fire({
        title: 'Job Closed!',
        text: 'Job has been closed successfully.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      Swal.fire({
        title: 'Error!',
        text: error.message || 'Failed to close job',
        icon: 'error',
        confirmButtonColor: '#dc3545'
      });
    }
  }

  // 🔥 Edit handler
  const handleEditJob = (jobId) => {
    navigate(`/edit-job/${jobId}`)
  }

  useEffect(() => {
    dispatch(fetchJobs())
  }, [dispatch])

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [sortBy, itemsPerPage, jobsFilter]) // 🔥 Added jobsFilter

  // 🔥 Filter jobs based on selected tab
  const getFilteredJobs = () => {
    if (jobsFilter === 'my-jobs' && user) {
      return jobsList.filter(job => job.client?._id === user.id)
    }
    return jobsList
  }

  // Sort jobs
  const getSortedJobs = () => {
    const filtered = getFilteredJobs() // 🔥 Filter first
    const sorted = [...filtered]

    switch (sortBy) {
      case 'newest':
        return sorted.sort((a, b) => {
          const timeDiff = new Date(b.createdAt) - new Date(a.createdAt)
          // 🔥 If same time, use _id for consistent ordering (newer IDs come first)
          if (timeDiff === 0) {
            return b._id > a._id ? 1 : -1
          }
          return timeDiff
        })
      case 'oldest':
        return sorted.sort((a, b) => {
          const timeDiff = new Date(a.createdAt) - new Date(b.createdAt)
          if (timeDiff === 0) {
            return a._id > b._id ? 1 : -1
          }
          return timeDiff
        })
      case 'budget-high':
        return sorted.sort((a, b) => (b.budget?.amount || 0) - (a.budget?.amount || 0))
      case 'budget-low':
        return sorted.sort((a, b) => (a.budget?.amount || 0) - (b.budget?.amount || 0))
      default:
        return sorted
    }
  }

  const sortedJobs = getSortedJobs()

  // Pagination logic
  const totalJobs = sortedJobs.length
  const totalPages = Math.ceil(totalJobs / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentJobs = sortedJobs.slice(startIndex, endIndex)

  const goToPage = (page) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const goToPrevious = () => {
    if (currentPage > 1) goToPage(currentPage - 1)
  }

  const goToNext = () => {
    if (currentPage < totalPages) goToPage(currentPage + 1)
  }

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = []
    const maxVisible = 5

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i)
        pages.push('...')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1)
        pages.push('...')
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i)
      } else {
        pages.push(1)
        pages.push('...')
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i)
        pages.push('...')
        pages.push(totalPages)
      }
    }

    return pages
  }

  return (
    <div className="jobs-page">
      <div className="container">
        <div className="jobs-container">
          {/* Projects Slider */}
          <div className="jobs-slider-section">
            <ProjectSlider />
          </div>

          {/* Main Content with Sidebar */}
          <div className="jobs-main-content">
            {/* Filter Sidebar */}
            <aside className="jobs-sidebar">
              <JobsFilter />
            </aside>

            {/* Jobs List */}
            <div className="jobs-list-section">
              {/* Info Banner */}
              <div className="jobs-info-banner">
                <FaInfoCircle className="info-icon" />
                <span>
                  Showing {totalJobs} available {totalJobs === 1 ? 'job' : 'jobs'} only.
                  Jobs in progress or completed are not displayed.
                </span>
              </div>

              <div className="jobs-header">
                <div className="jobs-header-left">
                  <h2 className="jobs-title">Available Jobs</h2>
                  <p className="jobs-count">
                    {loading ? 'Loading...' : `${totalJobs} jobs found`}
                  </p>
                </div>

                <div className="jobs-header-right">
                  {/* Post Job Button */}
                  {user ? (
                    <button
                      className="btn-post-job"
                      onClick={() => navigate('/post-job')}
                      title="Post a new job"
                    >
                      <FaPlus /> Post Job
                    </button>
                  ) : (
                    <button
                      className="btn-post-job disabled"
                      onClick={() => {
                        Swal.fire({
                          title: 'Login Required',
                          text: 'Please login to post a job',
                          icon: 'info',
                          confirmButtonColor: '#14a800',
                          confirmButtonText: 'Go to Login'
                        }).then((result) => {
                          if (result.isConfirmed) {
                            navigate('/login');
                          }
                        });
                      }}
                      title="Login to post a job"
                    >
                      <FaPlus /> Post Job
                    </button>
                  )}

                  {/* Jobs Filter Tabs */}
                  {user && (
                    <div className="jobs-filter-tabs">
                      <button
                        className={`filter-tab-btn ${jobsFilter === 'all' ? 'active' : ''}`}
                        onClick={() => setJobsFilter('all')}
                      >
                        All Jobs
                      </button>
                      <button
                        className={`filter-tab-btn ${jobsFilter === 'my-jobs' ? 'active' : ''}`}
                        onClick={() => setJobsFilter('my-jobs')}
                      >
                        My Jobs
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Controls Bar */}
              <div className="jobs-controls">
                {/* View Mode Toggle */}
                <div className="view-mode-toggle">
                  <button
                    className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                    onClick={() => setViewMode('list')}
                    title="List View"
                  >
                    <FaList />
                  </button>
                  <button
                    className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                    onClick={() => setViewMode('grid')}
                    title="Grid View"
                  >
                    <FaThLarge />
                  </button>
                </div>

                {/* Sort Dropdown */}
                <div className="sort-controls">
                  <FaSortAmountDown className="sort-icon" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="sort-select"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="budget-high">Budget: High to Low</option>
                    <option value="budget-low">Budget: Low to High</option>
                  </select>
                </div>

                {/* Items Per Page */}
                <div className="items-per-page">
                  <span>Show:</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                    className="items-select"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                  <span>per page</span>
                </div>
              </div>

              {error && (
                <div className="alert alert-danger" role="alert">
                  {typeof error === 'string' ? error : error?.message || 'An error occurred'}
                </div>
              )}

              {loading ? (
                <div className="jobs-loading">
                  <div className="spinner-border text-success" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : jobsList.length === 0 ? (
                <div className="no-jobs-message">
                  <h3>No jobs found</h3>
                  <p>Try adjusting your filters to see more results</p>
                </div>
              ) : (
                <>
                  {/* Jobs List/Grid */}
                  <div className={`jobs-list ${viewMode === 'grid' ? 'jobs-grid' : ''}`}>
                    {currentJobs.map((job) => (
                      <ProjectCard
                        key={job._id}
                        project={job}
                        viewMode={viewMode}
                        onDelete={handleDeleteJob}
                        onEdit={handleEditJob}
                      />
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="pagination-container">
                      <div className="pagination-info">
                        Showing {startIndex + 1} - {Math.min(endIndex, totalJobs)} of {totalJobs} jobs
                      </div>

                      <div className="pagination-controls">
                        <button
                          className="pagination-btn"
                          onClick={goToPrevious}
                          disabled={currentPage === 1}
                        >
                          <FaChevronLeft /> Previous
                        </button>

                        <div className="pagination-numbers">
                          {getPageNumbers().map((page, index) => (
                            page === '...' ? (
                              <span key={`ellipsis-${index}`} className="pagination-ellipsis">
                                ...
                              </span>
                            ) : (
                              <button
                                key={page}
                                className={`pagination-number ${currentPage === page ? 'active' : ''}`}
                                onClick={() => goToPage(page)}
                              >
                                {page}
                              </button>
                            )
                          ))}
                        </div>

                        <button
                          className="pagination-btn"
                          onClick={goToNext}
                          disabled={currentPage === totalPages}
                        >
                          Next <FaChevronRight />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Jobs