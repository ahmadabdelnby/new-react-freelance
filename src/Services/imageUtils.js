import { BASE_URL } from './config';

/**
 * Get the full URL for a profile picture
 * @param {string} profilePicture - The profile picture path from the database
 * @returns {string} - The full URL to the profile picture
 */
export const getProfilePictureUrl = (profilePicture) => {
    if (!profilePicture) {
        return '/default-avatar.png';
    }
    
    // If it's already a full URL (starts with http:// or https://)
    if (profilePicture.startsWith('http://') || profilePicture.startsWith('https://')) {
        return profilePicture;
    }
    
    // If it's a relative path from the server
    return `${BASE_URL}${profilePicture}`;
};

/**
 * Get the full URL for a portfolio image
 * @param {string} imagePath - The image path from the database
 * @returns {string} - The full URL to the image
 */
export const getPortfolioImageUrl = (imagePath) => {
    if (!imagePath) {
        return '/placeholder-image.png';
    }
    
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
    }
    
    return `${BASE_URL}${imagePath}`;
};

/**
 * Get the full URL for any image
 * @param {string} imagePath - The image path from the database
 * @param {string} defaultImage - Default image path if imagePath is null
 * @returns {string} - The full URL to the image
 */
export const getImageUrl = (imagePath, defaultImage = '/default-avatar.png') => {
    if (!imagePath) {
        return defaultImage;
    }
    
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
    }
    
    return `${BASE_URL}${imagePath}`;
};
