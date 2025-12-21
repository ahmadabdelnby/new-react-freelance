import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { acceptProposal, rejectProposal } from '../../Services/Proposals/ProposalsSlice'
import { FaFileAlt, FaCheckCircle, FaFileContract, FaDollarSign, FaInfoCircle } from 'react-icons/fa'
import { toast } from 'react-toastify'
import ProposalCard from './ProposalCard'
import './ProposalsList.css'

function ProposalsList({ proposals, jobId }) {
  const dispatch = useDispatch()
  const { loading } = useSelector((state) => state.proposals)
  const [acceptedProposal, setAcceptedProposal] = useState(null)

  const proposalsList = Array.isArray(proposals) ? proposals : []

  const handleAccept = async (proposalId) => {
    if (window.confirm('Are you sure you want to accept this proposal? A contract will be created automatically and payment will be held in escrow.')) {
      try {
        const result = await dispatch(acceptProposal(proposalId)).unwrap()
        
        if (result.contract) {
          setAcceptedProposal(result)
          toast.success('Proposal accepted! Contract created and payment secured in escrow.', {
            position: 'top-center',
            autoClose: 5000
          })
        } else {
          toast.success('Proposal accepted successfully!')
        }
      } catch (error) {
        toast.error(error || 'Failed to accept proposal')
      }
    }
  }

  const handleReject = async (proposalId) => {
    const reason = window.prompt('Please provide a reason for rejecting this proposal (optional):')
    if (reason !== null) {
      try {
        await dispatch(rejectProposal(proposalId)).unwrap()
        toast.success('Proposal rejected successfully')
      } catch (error) {
        toast.error(error || 'Failed to reject proposal')
      }
    }
  }

  if (proposalsList.length === 0) {
    return (
      <div className="plist-container">
        <div className="plist-no-proposals">
          <div className="plist-no-icon">
            <FaFileAlt size={56} />
          </div>
          <h3>No Proposals Yet</h3>
          <p>No freelancers have submitted proposals for this job yet.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="plist-container">
      <div className="plist-header">
        <h2 className="plist-title">
          Proposals Received <span className="plist-count">({proposalsList.length})</span>
        </h2>
      </div>

      {acceptedProposal && acceptedProposal.contract && (
        <div className="plist-success-alert">
          <div className="plist-alert-header">
            <FaCheckCircle className="plist-success-icon" />
            <h3>Contract Created Successfully!</h3>
          </div>
          
          <div className="plist-alert-body">
            <p className="plist-alert-message">
              The contract has been created and the payment of{' '}
              <strong>${acceptedProposal.payment?.amount?.toLocaleString()}</strong>{' '}
              has been secured in escrow.
            </p>

            <div className="plist-contract-grid">
              <div className="plist-info-item">
                <FaFileContract className="plist-info-icon" />
                <div className="plist-info-content">
                  <span className="plist-info-label">Contract ID</span>
                  <span className="plist-info-value">{acceptedProposal.contract._id?.slice(-8)}</span>
                </div>
              </div>

              <div className="plist-info-item">
                <FaDollarSign className="plist-info-icon" />
                <div className="plist-info-content">
                  <span className="plist-info-label">Platform Fee</span>
                  <span className="plist-info-value">${acceptedProposal.payment?.platformFee?.toFixed(2)}</span>
                </div>
              </div>

              <div className="plist-info-item">
                <FaDollarSign className="plist-info-icon" />
                <div className="plist-info-content">
                  <span className="plist-info-label">Net Amount</span>
                  <span className="plist-info-value">${acceptedProposal.payment?.netAmount?.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="plist-escrow-notice">
              <FaInfoCircle />
              <p>
                The payment is held securely in escrow and will be released to the freelancer 
                upon successful completion of the contract.
              </p>
            </div>

            <div className="plist-alert-actions">
              <Link 
                to={`/contracts/${acceptedProposal.contract._id}`} 
                className="plist-btn-view"
              >
                <FaFileContract /> View Contract Details
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="plist-proposals">
        {proposalsList.map((proposal) => (
          <ProposalCard
            key={proposal._id}
            proposal={proposal}
            onAccept={handleAccept}
            onReject={handleReject}
            loading={loading}
          />
        ))}
      </div>
    </div>
  )
}

export default ProposalsList
