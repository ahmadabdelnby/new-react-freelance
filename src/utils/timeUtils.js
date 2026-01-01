/**
 * Format a lastSeen date to human-readable string
 * @param {Date|string} lastSeen - The last seen date
 * @returns {string} - Formatted string like "Just now", "5 minutes ago", etc.
 */
export const formatLastSeen = (lastSeen) => {
    if (!lastSeen) return 'N/A';

    const now = new Date();
    const lastSeenDate = new Date(lastSeen);
    const diffMs = now - lastSeenDate;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffSecs < 30) return 'Just now';
    if (diffMins < 1) return 'Less than a minute ago';
    if (diffMins === 1) return '1 minute ago';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours === 1) return '1 hour ago';
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;

    return lastSeenDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

/**
 * Get online status text
 * @param {boolean} isOnline - Whether user is online
 * @param {Date|string} lastSeen - The last seen date
 * @returns {string} - "Online" or formatted last seen
 */
export const getStatusText = (isOnline, lastSeen) => {
    if (isOnline) return 'Online';
    return `Last seen ${formatLastSeen(lastSeen)}`;
};
