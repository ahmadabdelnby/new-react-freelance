import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { acceptProposal, rejectProposal, getJobProposals } from '../../Services/Proposals/ProposalsSlice'
import { FaFileAlt, FaCheckCircle, FaFileContract, FaDollarSign, FaInfoCircle } from 'react-icons/fa'
import { toast } from 'react-toastify'
import { useBalanceSync } from '../../hooks/useBalanceSync'
import socketService from '../../Services/socketService'
import ProposalCard from './ProposalCard'
import AcceptProposalModal from './AcceptProposalModal'
import './ProposalsList.css'

function ProposalsList({ proposals, jobId, job }) {
  const dispatch = useDispatch()
  const { loading } = useSelector((state) => state.proposals)
  const { user, token } = useSelector((state) => state.auth)
  const [acceptedProposal, setAcceptedProposal] = useState(null)
  const [showAcceptModal, setShowAcceptModal] = useState(false)
  const [selectedProposal, setSelectedProposal] = useState(null)
  const { refreshBalance } = useBalanceSync()

  const proposalsList = Array.isArray(proposals) ? proposals : []
  const userBalance = user?.balance || 0

  // Get actual user ID (handling nested structure)
  const actualUser = user?.user || user
  const userId = actualUser?._id || actualUser?.id || actualUser?.userId

  // ✅ Socket events handled in socketIntegration.js - just refresh proposals when needed
  useEffect(() => {
    if (!token || !jobId) return

    dispatch(getJobProposals(jobId))
  }, [token, jobId, dispatch])

  const handleAcceptClick = (proposal) => {
    setSelectedProposal(proposal)
    setShowAcceptModal(true)
  }

  const handleAcceptConfirm = async () => {
    if (!selectedProposal) return

    try {
      const result = await dispatch(acceptProposal(selectedProposal._id)).unwrap()

      // Refresh balance after accepting proposal (balance was deducted for escrow)
      await refreshBalance()

      if (result.contract) {
        setAcceptedProposal(result)
        setShowAcceptModal(false)

        // Scroll to top to show success message
        window.scrollTo({ top: 0, behavior: 'smooth' })

        toast.success('Proposal accepted! Contract created and payment secured in escrow.', {
          position: 'top-center',
          autoClose: 5000
        })
      } else {
        toast.success('Proposal accepted successfully!')
        setShowAcceptModal(false)
      }
    } catch (error) {
      // 🔥 Handle insufficient balance error with detailed message
      if (error?.includes('Insufficient balance') || error?.includes('balance')) {
        const errorMatch = error.match(/(\d+\.?\d*)/g)
        if (errorMatch && errorMatch.length >= 2) {
          const currentBalance = errorMatch[0]
          const required = errorMatch[1]
          toast.error(
            `Insufficient balance! You have $${currentBalance} but need $${required}. Please add funds to your wallet.`,
            { autoClose: 8000, position: 'top-center' }
          )
        } else {
          toast.error('Insufficient balance. Please add funds to your wallet before hiring.', {
            autoClose: 6000,
            position: 'top-center'
          })
        }
      } else {
        toast.error(error || 'Failed to accept proposal')
      }
    }
  }

  const handleCancelModal = () => {
    setShowAcceptModal(false)
    setSelectedProposal(null)
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
            jobId={jobId}
            isClient={true}
            currentUserId={userId}
            onAccept={() => handleAcceptClick(proposal)}
            onReject={handleReject}
            loading={loading}
          />
        ))}
      </div>

      {showAcceptModal && selectedProposal && (
        <AcceptProposalModal
          proposal={selectedProposal}
          job={job}
          userBalance={userBalance}
          onConfirm={handleAcceptConfirm}
          onCancel={handleCancelModal}
          loading={loading}
        />
      )}
    </div>
  )
}

export default ProposalsList
