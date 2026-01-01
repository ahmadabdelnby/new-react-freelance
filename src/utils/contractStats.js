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
 * Hire Rate = (number of UNIQUE jobs with contracts / total jobs that could have contracts) × 100
 * 
 * PROFESSIONAL CALCULATION:
 * - Only counts jobs that reached a hiring stage (open, in_progress, completed)
 * - Excludes cancelled jobs (never had a chance to hire)
 * - Counts each job only once even if multiple contracts exist
 * 
 * @param {Array} clientContracts - Contracts where user is client
 * @param {Array} clientJobs - Jobs posted by client
 * @returns {Number} - Hire rate percentage (0-100)
 */
export const calculateHireRate = (clientContracts, clientJobs) => {
    if (!clientJobs || clientJobs.length === 0) {
        return 0
    }

    // Filter jobs that could potentially have contracts (exclude cancelled before hiring)
    const eligibleJobs = clientJobs.filter(
        job => job.status === 'open' || job.status === 'in_progress' || job.status === 'completed'
    )

    if (eligibleJobs.length === 0) {
        return 0
    }

    const contracts = clientContracts || []

    // Get unique job IDs that have at least one contract (active or completed)
    const jobsWithContracts = new Set()

    contracts.forEach(contract => {
        if (contract.status === 'active' || contract.status === 'completed') {
            const jobId = contract.job?._id || contract.job
            if (jobId) {
                jobsWithContracts.add(String(jobId))
            }
        }
    })

    // Hire rate = unique jobs with contracts / eligible jobs
    const hireRate = Math.round((jobsWithContracts.size / eligibleJobs.length) * 100)

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
 * Calculate Client Rating (automated score based on behavior)
 * 
 * SCORING BREAKDOWN (out of 5.0):
 * - Hire Rate: 25% weight (max 1.25 points)
 * - Contract Completion Rate: 30% weight (max 1.5 points)
 * - Low Cancellation Rate: 20% weight (max 1.0 points)
 * - Activity Level (Jobs Posted): 15% weight (max 0.75 points)
 * - Total Spent: 10% weight (max 0.5 points)
 * 
 * @param {Object} params - Rating parameters
 * @param {Number} params.hireRate - Percentage (0-100)
 * @param {Number} params.completedContracts - Number of completed contracts
 * @param {Number} params.totalContracts - Total contracts
 * @param {Number} params.cancelledContracts - Number of cancelled contracts
 * @param {Number} params.totalJobs - Total jobs posted
 * @param {Number} params.totalSpent - Total amount spent
 * @returns {Object} - { rating: Number, breakdown: Object }
 */
export const calculateClientRating = ({
    hireRate = 0,
    completedContracts = 0,
    totalContracts = 0,
    cancelledContracts = 0,
    totalJobs = 0,
    totalSpent = 0
}) => {
    // If no activity at all, return 0
    if (totalJobs === 0 && totalContracts === 0) {
        return {
            rating: 0,
            breakdown: {
                hireRateScore: 0,
                completionScore: 0,
                cancellationScore: 0,
                activityScore: 0,
                spendingScore: 0
            }
        }
    }

    // 1. Hire Rate Score (25% = 1.25 points max)
    // 100% hire rate = 1.25 points
    const hireRateScore = (hireRate / 100) * 1.25

    // 2. Contract Completion Rate (30% = 1.5 points max)
    const completionRate = totalContracts > 0
        ? (completedContracts / totalContracts) * 100
        : 0
    const completionScore = (completionRate / 100) * 1.5

    // 3. Low Cancellation Rate (20% = 1.0 points max)
    // 0% cancellation = 1.0 points, 100% cancellation = 0 points
    const cancellationRate = totalContracts > 0
        ? (cancelledContracts / totalContracts) * 100
        : 0
    const cancellationScore = ((100 - cancellationRate) / 100) * 1.0

    // 4. Activity Level - Jobs Posted (15% = 0.75 points max)
    // Scale: 1-5 jobs = 0.25, 6-15 jobs = 0.5, 16+ jobs = 0.75
    let activityScore = 0
    if (totalJobs >= 16) activityScore = 0.75
    else if (totalJobs >= 6) activityScore = 0.5
    else if (totalJobs >= 1) activityScore = 0.25

    // 5. Total Spent (10% = 0.5 points max)
    // Scale: $1-500 = 0.15, $501-2000 = 0.3, $2001-5000 = 0.4, $5001+ = 0.5
    let spendingScore = 0
    if (totalSpent >= 5001) spendingScore = 0.5
    else if (totalSpent >= 2001) spendingScore = 0.4
    else if (totalSpent >= 501) spendingScore = 0.3
    else if (totalSpent >= 1) spendingScore = 0.15

    // Calculate total rating
    const totalRating = hireRateScore + completionScore + cancellationScore + activityScore + spendingScore

    // Round to 1 decimal place, max 5.0
    const rating = Math.min(5.0, Math.round(totalRating * 10) / 10)

    return {
        rating,
        breakdown: {
            hireRateScore: Math.round(hireRateScore * 100) / 100,
            completionScore: Math.round(completionScore * 100) / 100,
            cancellationScore: Math.round(cancellationScore * 100) / 100,
            activityScore: Math.round(activityScore * 100) / 100,
            spendingScore: Math.round(spendingScore * 100) / 100
        },
        metrics: {
            hireRate,
            completionRate: Math.round(completionRate),
            cancellationRate: Math.round(cancellationRate),
            totalJobs,
            totalSpent
        }
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
