import React from 'react'
import { FaDollarSign, FaClock, FaEye, FaFileAlt } from 'react-icons/fa'
import './JobPricing.css'

function JobPricing({ job }) {
  // Extract budget information
  const budgetAmount = job.budget?.amount || job.budget || 0;
  const budgetType = job.budget?.type || job.priceType || 'fixed';

  // Format duration
  const formatDuration = () => {
    if (!job.duration?.value) return null;
    const unitMap = {
      days: 'day',
      weeks: 'week',
      months: 'month'
    };
    const unit = unitMap[job.duration.unit] || job.duration.unit;
    return `${job.duration.value} ${unit}${job.duration.value > 1 ? 's' : ''}`;
  };

  return (
    <div className="job-pricing">
      <div className="pricing-item">
        <FaDollarSign className="pricing-icon" />
        <div className="pricing-content">
          <div className="pricing-value">
            ${budgetAmount}{budgetType === 'hourly' ? '/hr' : ''}
          </div>
          <div className="pricing-label">
            {budgetType === 'hourly' ? 'Hourly Rate' : 'Fixed Price'}
          </div>
        </div>
      </div>

      {job.duration?.value && (
        <div className="pricing-item">
          <FaClock className="pricing-icon" />
          <div className="pricing-content">
            <div className="pricing-value">{formatDuration()}</div>
            <div className="pricing-label">Duration</div>
          </div>
        </div>
      )}

      {(job.views !== undefined || job.proposalsCount !== undefined) && (
        <div className="pricing-item">
          <FaEye className="pricing-icon" />
          <div className="pricing-content">
            <div className="pricing-value">
              {job.views || 0} views • {job.proposalsCount || 0} proposals
            </div>
            <div className="pricing-label">Engagement</div>
          </div>
        </div>
      )}
    </div>
  )
}

export default JobPricing
