import storage from './storage'
import { toast } from 'react-toastify'

/**
 * Handle API responses and check for deleted user accounts
 * @param {Response} response - Fetch API response
 * @returns {Promise<any>} - Parsed JSON data
 */
export const handleApiResponse = async (response) => {
  const data = await response.json()

  // 🔥 Check if user account was deleted
  if (response.status === 401 && data.accountDeleted) {
    // Clear all auth data
    storage.remove('token')
    storage.remove('user')

    // Show error message
    toast.error('Your account has been deleted. Please login again.')

    // Redirect to login after a short delay
    setTimeout(() => {
      window.location.href = '/login'
    }, 2000)

    throw new Error(data.message || 'Account deleted')
  }

  // Handle other 401 errors
  if (response.status === 401) {
    storage.remove('token')
    storage.remove('user')
    toast.error(data.message || 'Your session has expired. Please login again.', {
      autoClose: 3000,
      toastId: 'session-expired' // Prevent duplicate toasts
    })

    setTimeout(() => {
      window.location.href = '/'
    }, 1500)

    throw new Error(data.message || 'Unauthorized')
  }

  if (!response.ok) {
    throw new Error(data.message || `API error: ${response.status}`)
  }

  return data
}

/**
 * Make authenticated API request
 * @param {string} url - API endpoint
 * @param {object} options - Fetch options
 * @returns {Promise<any>} - Parsed JSON data
 */
export const authFetch = async (url, options = {}) => {
  const token = storage.get('token')

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(url, {
    ...options,
    headers,
  })

  return handleApiResponse(response)
}
