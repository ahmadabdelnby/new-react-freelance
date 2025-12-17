import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchJobs } from '../Services/Jobs/JobsSlice'
import ProjectCard from '../Shared/Cards/projectCard'
import ProjectSlider from '../Shared/projectsSlider/projectSlider'
import JobsFilter from '../Components/jobs-components/JobsFilter'
import './Jobs.css'

function Jobs() {
  const dispatch = useDispatch()
  const { jobs, loading, error } = useSelector((state) => state.jobs)

  // Ensure jobs is always an array
  const jobsList = Array.isArray(jobs) ? jobs : []

  useEffect(() => {
    dispatch(fetchJobs())
  }, [dispatch])

  return (
    <div className="jobs-page">
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
            <div className="jobs-header">
              <h2 className="jobs-title">Available Jobs</h2>
              <p className="jobs-count">
                {loading ? 'Loading...' : `${jobsList.length} jobs found`}
              </p>
            </div>

            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
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
              <div className="jobs-list">
                {jobsList.map((job) => (
                  <ProjectCard key={job._id} project={job} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Jobs