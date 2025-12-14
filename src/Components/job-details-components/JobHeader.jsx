import React from 'react'
import { FaMapMarkerAlt } from 'react-icons/fa'
import './JobHeader.css'

function JobHeader({ job }) {
  // Helper function to calculate time ago
  const getTimeAgo = (date) => {
    const now = new Date();
    const posted = new Date(date);
    const diffInHours = Math.floor((now - posted) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'less than an hour ago';
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    
    const diffInMonths = Math.floor(diffInDays / 30);
    return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
  };

  return (
    <div className="job-header">
      <div className="job-title-row">
        <h1 className="job-title">{job.title}</h1>
        {job.status && (
          <span className={`job-status-badge status-${job.status.toLowerCase().replace(/_/g, '-')}`}>
            {job.status.replace(/[_-]/g, ' ')}
          </span>
        )}
      </div>
      
      <div className="job-meta">
        <span className="job-posted">Posted {getTimeAgo(job.createdAt)}</span>
        {job.client?.country && (
          <>
            <span className="job-meta-separator">•</span>
            <div className="job-location">
              <FaMapMarkerAlt className="location-icon" />
              <span>{job.client.country}</span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default JobHeader
