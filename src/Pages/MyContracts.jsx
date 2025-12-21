import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { getMyContracts } from '../Services/Contracts/ContractsSlice.js';
import { 
  FaFileContract, 
  FaBriefcase, 
  FaUser, 
  FaDollarSign,
  FaCheckCircle,
  FaClock,
  FaExclamationCircle,
  FaSpinner,
  FaFilter,
  FaSearch
} from 'react-icons/fa';
import './MyContracts.css';

const MyContracts = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { contracts, loading } = useSelector((state) => state.contracts);
  const { user } = useSelector((state) => state.auth);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(getMyContracts());
  }, [dispatch]);

  const getStatusBadge = (status) => {
    const badges = {
      active: { class: 'status-active', label: 'Active', icon: FaClock },
      completed: { class: 'status-completed', label: 'Completed', icon: FaCheckCircle },
      cancelled: { class: 'status-cancelled', label: 'Cancelled', icon: FaExclamationCircle },
      disputed: { class: 'status-disputed', label: 'Disputed', icon: FaExclamationCircle }
    };
    return badges[status] || { class: 'status-default', label: status, icon: FaClock };
  };

  const filterContracts = (contractsList) => {
    if (!Array.isArray(contractsList)) return [];

    let filtered = contractsList;

    // Apply status filter
    if (filter !== 'all') {
      filtered = filtered.filter(contract => contract.status === filter);
    }

    // Apply search filter
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(contract => {
        const jobTitle = contract.job?.title?.toLowerCase() || '';
        const clientName = contract.client ? 
          `${contract.client.first_name} ${contract.client.last_name}`.toLowerCase() : '';
        const freelancerName = contract.freelancer ? 
          `${contract.freelancer.first_name} ${contract.freelancer.last_name}`.toLowerCase() : '';
        
        return jobTitle.includes(search) || 
               clientName.includes(search) || 
               freelancerName.includes(search);
      });
    }

    return filtered;
  };

  const filteredContracts = filterContracts(contracts);

  const getContractRole = (contract) => {
    if (!user || !contract) return null;
    if (String(user._id) === String(contract.client?._id)) return 'client';
    if (String(user._id) === String(contract.freelancer?._id)) return 'freelancer';
    return null;
  };

  if (loading && (!contracts || contracts.length === 0)) {
    return (
      <div className="my-contracts-page">
        <div className="contracts-loading">
          <FaSpinner className="spinner" />
          <p>Loading your contracts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="my-contracts-page">
      <div className="contracts-container">
        {/* Header */}
        <div className="contracts-header">
          <div className="header-content">
            <h1>
              <FaFileContract /> My Contracts
            </h1>
            <p className="header-subtitle">
              Manage all your active and completed contracts
            </p>
          </div>
          <div className="header-stats">
            <div className="stat-card">
              <span className="stat-value">{contracts?.length || 0}</span>
              <span className="stat-label">Total Contracts</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">
                {contracts?.filter(c => c.status === 'active')?.length || 0}
              </span>
              <span className="stat-label">Active</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">
                {contracts?.filter(c => c.status === 'completed')?.length || 0}
              </span>
              <span className="stat-label">Completed</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="contracts-filters">
          <div className="filter-tabs">
            <button
              className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All Contracts
            </button>
            <button
              className={`filter-tab ${filter === 'active' ? 'active' : ''}`}
              onClick={() => setFilter('active')}
            >
              <FaClock /> Active
            </button>
            <button
              className={`filter-tab ${filter === 'completed' ? 'active' : ''}`}
              onClick={() => setFilter('completed')}
            >
              <FaCheckCircle /> Completed
            </button>
            <button
              className={`filter-tab ${filter === 'cancelled' ? 'active' : ''}`}
              onClick={() => setFilter('cancelled')}
            >
              <FaExclamationCircle /> Cancelled
            </button>
          </div>

          <div className="search-box">
            <FaSearch />
            <input
              type="text"
              placeholder="Search contracts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Contracts List */}
        <div className="contracts-list">
          {filteredContracts.length === 0 ? (
            <div className="no-contracts">
              <FaFileContract size={64} />
              <h3>No Contracts Found</h3>
              <p>
                {searchTerm ? 
                  'Try adjusting your search terms' : 
                  filter !== 'all' ? 
                    `You don't have any ${filter} contracts yet` :
                    'You don\'t have any contracts yet'
                }
              </p>
              {filter === 'all' && !searchTerm && (
                <Link to="/jobs" className="btn-browse-jobs">
                  <FaBriefcase /> Browse Jobs
                </Link>
              )}
            </div>
          ) : (
            filteredContracts.map((contract) => {
              const statusBadge = getStatusBadge(contract.status);
              const StatusIcon = statusBadge.icon;
              const role = getContractRole(contract);
              const otherParty = role === 'client' ? contract.freelancer : contract.client;

              return (
                <div
                  key={contract._id}
                  className={`contract-card ${contract.status}`}
                  onClick={() => navigate(`/contracts/${contract._id}`)}
                >
                  <div className="contract-card-header">
                    <div className="contract-card-title">
                      <Link
                        to={`/job/${contract.job?._id}`}
                        className="job-title"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {contract.job?.title || 'Untitled Job'}
                      </Link>
                      <span className="contract-role-badge">
                        {role === 'client' ? 'As Client' : 'As Freelancer'}
                      </span>
                    </div>
                    <div className={`status-badge ${statusBadge.class}`}>
                      <StatusIcon />
                      <span>{statusBadge.label}</span>
                    </div>
                  </div>

                  <div className="contract-card-body">
                    {/* Other Party */}
                    <div className="contract-party">
                      <div className="party-avatar-small">
                        {otherParty?.profile_picture ? (
                          <img src={otherParty.profile_picture} alt={otherParty.first_name} />
                        ) : (
                          <FaUser />
                        )}
                      </div>
                      <div className="party-info-small">
                        <span className="party-label">
                          {role === 'client' ? 'Freelancer' : 'Client'}
                        </span>
                        <Link
                          to={`/freelancer/${otherParty?._id}`}
                          className="party-name-small"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {otherParty?.first_name} {otherParty?.last_name}
                        </Link>
                      </div>
                    </div>

                    {/* Contract Details */}
                    <div className="contract-details-grid">
                      <div className="detail-item">
                        <FaDollarSign />
                        <div>
                          <span className="detail-label">Amount</span>
                          <span className="detail-value">${contract.agreedAmount?.toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="detail-item">
                        <FaClock />
                        <div>
                          <span className="detail-label">Started</span>
                          <span className="detail-value">
                            {new Date(contract.startDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>

                      {contract.endDate && (
                        <div className="detail-item">
                          <FaCheckCircle />
                          <div>
                            <span className="detail-label">Completed</span>
                            <span className="detail-value">
                              {new Date(contract.endDate).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Payment Status */}
                    {contract.status === 'active' && (
                      <div className="payment-status escrow">
                        <span className="payment-icon">🔒</span>
                        <span>Payment in Escrow</span>
                      </div>
                    )}
                    {contract.status === 'completed' && (
                      <div className="payment-status released">
                        <span className="payment-icon">✓</span>
                        <span>Payment Released</span>
                      </div>
                    )}
                  </div>

                  <div className="contract-card-footer">
                    <button className="btn-view-contract">
                      View Contract Details →
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default MyContracts;
