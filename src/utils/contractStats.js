/**
 * Contract Statistics Utility Functions
 * Use these functions to calculate contract-related statistics anywhere in the app
 */

/**
 * Filter contracts by client ID
 * @param {Array} contracts - All contracts
 * @param {String} clientId - Client user ID
 * @returns {Array} - Contracts where user is the client
 */
export const getContractsByClient = (contracts, clientId) => {
    if (!contracts || !Array.isArray(contracts) || !clientId) {
        return []
    }

    return contracts.filter(contract => {
        const contractClientId = contract.client?._id || contract.client
        return String(contractClientId) === String(clientId)
    })
}

/**
 * Filter contracts by freelancer ID
 * @param {Array} contracts - All contracts
 * @param {String} freelancerId - Freelancer user ID
 * @returns {Array} - Contracts where user is the freelancer
 */
export const getContractsByFreelancer = (contracts, freelancerId) => {
    if (!contracts || !Array.isArray(contracts) || !freelancerId) {
        return []
    }

    return contracts.filter(contract => {
        const contractFreelancerId = contract.freelancer?._id || contract.freelancer
        return String(contractFreelancerId) === String(freelancerId)
    })
}

/**
 * Calculate hire rate for a client
 * Hire Rate = (number of contracts / number of jobs posted) × 100
 * @param {Array} clientContracts - Contracts where user is client
 * @param {Array} clientJobs - Jobs posted by client
 * @returns {Number} - Hire rate percentage (0-100)
 */
export const calculateHireRate = (clientContracts, clientJobs) => {
    if (!clientJobs || clientJobs.length === 0) {
        return 0
    }

    const contracts = clientContracts || []

    // Count contracts that were actually hired (active or completed)
    const hiredContracts = contracts.filter(
        c => c.status === 'active' || c.status === 'completed'
    ).length

    // Hire rate = hired contracts / total jobs posted
    const hireRate = Math.round((hiredContracts / clientJobs.length) * 100)

    return hireRate
}

/**
 * Calculate completion rate for a freelancer
 * Completion Rate = (completed contracts / total contracts) × 100
 * @param {Array} freelancerContracts - Contracts where user is freelancer
 * @returns {Number} - Completion rate percentage (0-100)
 */
export const calculateCompletionRate = (freelancerContracts) => {
    if (!freelancerContracts || freelancerContracts.length === 0) {
        return 0
    }

    const completedContracts = freelancerContracts.filter(
        c => c.status === 'completed'
    ).length

    const completionRate = Math.round((completedContracts / freelancerContracts.length) * 100)

    return completionRate
}

/**
 * Get contract statistics by status
 * @param {Array} contracts - Contracts to analyze
 * @returns {Object} - Object with counts by status
 */
export const getContractStatusBreakdown = (contracts) => {
    if (!contracts || !Array.isArray(contracts)) {
        return {
            active: 0,
            completed: 0,
            cancelled: 0,
            disputed: 0,
            total: 0
        }
    }

    return {
        active: contracts.filter(c => c.status === 'active').length,
        completed: contracts.filter(c => c.status === 'completed').length,
        cancelled: contracts.filter(c => c.status === 'cancelled').length,
        disputed: contracts.filter(c => c.status === 'disputed').length,
        total: contracts.length
    }
}

/**
 * Get job statistics by status for a client
 * @param {Array} jobs - Jobs to analyze
 * @returns {Object} - Object with counts by status
 */
export const getJobStatusBreakdown = (jobs) => {
    if (!jobs || !Array.isArray(jobs)) {
        return {
            open: 0,
            in_progress: 0,
            completed: 0,
            cancelled: 0,
            total: 0
        }
    }

    return {
        open: jobs.filter(j => j.status === 'open').length,
        in_progress: jobs.filter(j => j.status === 'in_progress').length,
        completed: jobs.filter(j => j.status === 'completed').length,
        cancelled: jobs.filter(j => j.status === 'cancelled').length,
        total: jobs.length
    }
}

/**
 * Calculate total earnings from contracts
 * @param {Array} contracts - Contracts to sum
 * @param {Boolean} afterFees - Whether to calculate after platform fees (10%)
 * @returns {Number} - Total earnings
 */
export const calculateTotalEarnings = (contracts, afterFees = true) => {
    if (!contracts || !Array.isArray(contracts)) {
        return 0
    }

    const completedContracts = contracts.filter(c => c.status === 'completed')
    const total = completedContracts.reduce((sum, contract) => {
        const amount = contract.agreedAmount || 0
        return sum + amount
    }, 0)

    // Platform takes 10% fee from freelancer
    return afterFees ? total * 0.9 : total
}
