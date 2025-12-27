/**
 * Helper functions for consistent status display across the application
 */

/**
 * Get human-readable label for contract status
 * @param {string} status - Contract status ('active', 'completed', 'paused', 'terminated')
 * @returns {string} Display label
 */
export const getContractStatusLabel = (status) => {
    const labels = {
        active: 'Active',
        completed: 'Completed',
        paused: 'Paused',
        terminated: 'Terminated'
    };
    return labels[status] || status;
};

/**
 * Get human-readable label for job status
 * @param {string} status - Job status ('open', 'in_progress', 'completed', 'cancelled')
 * @returns {string} Display label
 */
export const getJobStatusLabel = (status) => {
    const labels = {
        open: 'Open',
        in_progress: 'In Progress',
        completed: 'Completed',
        cancelled: 'Cancelled'
    };
    return labels[status] || status;
};

/**
 * Get CSS class for contract status
 * @param {string} status - Contract status
 * @returns {string} CSS class name
 */
export const getContractStatusClass = (status) => {
    const classes = {
        active: 'status-active',
        completed: 'status-completed',
        paused: 'status-paused',
        terminated: 'status-terminated'
    };
    return classes[status] || 'status-default';
};

/**
 * Get CSS class for job status
 * @param {string} status - Job status
 * @returns {string} CSS class name
 */
export const getJobStatusClass = (status) => {
    const classes = {
        open: 'status-open',
        in_progress: 'status-in-progress',
        completed: 'status-completed',
        cancelled: 'status-cancelled'
    };
    return classes[status] || 'status-default';
};

/**
 * Get color for status badge
 * @param {string} status - Status value
 * @param {string} type - Type of status ('contract' or 'job')
 * @returns {string} Color value
 */
export const getStatusColor = (status, type = 'contract') => {
    if (type === 'contract') {
        const colors = {
            active: '#28a745',
            completed: '#007bff',
            paused: '#ffc107',
            terminated: '#dc3545'
        };
        return colors[status] || '#6c757d';
    } else {
        const colors = {
            open: '#28a745',
            in_progress: '#17a2b8',
            completed: '#007bff',
            cancelled: '#dc3545'
        };
        return colors[status] || '#6c757d';
    }
};

/**
 * Check if a contract is active (can be worked on)
 * @param {Object} contract - Contract object
 * @returns {boolean}
 */
export const isContractActive = (contract) => {
    return contract?.status === 'active';
};

/**
 * Check if a contract is completed
 * @param {Object} contract - Contract object
 * @returns {boolean}
 */
export const isContractCompleted = (contract) => {
    return contract?.status === 'completed';
};

/**
 * Check if a job is open for applications
 * @param {Object} job - Job object
 * @returns {boolean}
 */
export const isJobOpen = (job) => {
    return job?.status === 'open';
};

/**
 * Check if a job has an active contract
 * @param {Object} job - Job object
 * @returns {boolean}
 */
export const isJobInProgress = (job) => {
    return job?.status === 'in_progress';
};

/**
 * Check if a job is completed
 * @param {Object} job - Job object
 * @returns {boolean}
 */
export const isJobCompleted = (job) => {
    return job?.status === 'completed';
};
