// API Helper with automatic 401 handling and consistent error handling

import storage from './storage';
import { toast } from 'react-toastify';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/Freelancing/api/v1';

// Helper function to get auth headers
const getAuthHeaders = (includeContentType = true) => {
    const token = storage.get('token');
    const headers = {};

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    if (includeContentType) {
        headers['Content-Type'] = 'application/json';
    }

    return headers;
};

// Handle 401 Unauthorized - Logout user
const handle401 = () => {
    storage.remove('token');
    storage.remove('user');
    toast.error('Your session has expired. Please login again.', {
        autoClose: 3000,
        toastId: 'session-expired' // Prevent duplicate toasts
    });

    // Delay redirect to show toast
    setTimeout(() => {
        window.location.href = '/';
    }, 1500);
};

// Main fetch wrapper with error handling
export const apiFetch = async (url, options = {}) => {
    try {
        const config = {
            ...options,
            headers: {
                ...getAuthHeaders(!options.body || options.body instanceof FormData ? false : true),
                ...options.headers
            }
        };

        // Remove Content-Type for FormData (browser will set it with boundary)
        if (options.body instanceof FormData && config.headers['Content-Type']) {
            delete config.headers['Content-Type'];
        }

        const response = await fetch(url, config);

        // Handle 401 Unauthorized
        if (response.status === 401) {
            handle401();
            throw new Error('Session expired. Please login again.');
        }

        // Try to parse JSON response
        let data;
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            data = await response.text();
        }

        // Handle non-OK responses
        if (!response.ok) {
            const errorMessage = typeof data === 'object' ? data.message : data;
            throw new Error(errorMessage || `HTTP ${response.status}: ${response.statusText}`);
        }

        return data;
    } catch (error) {
        // Network errors or fetch failures
        if (error.message === 'Failed to fetch') {
            throw new Error('Network error. Please check your connection.');
        }
        throw error;
    }
};

// Convenience methods
export const apiGet = (url) => apiFetch(url, { method: 'GET' });

export const apiPost = (url, body) => apiFetch(url, {
    method: 'POST',
    body: body instanceof FormData ? body : JSON.stringify(body)
});

export const apiPut = (url, body) => apiFetch(url, {
    method: 'PUT',
    body: body instanceof FormData ? body : JSON.stringify(body)
});

export const apiPatch = (url, body) => apiFetch(url, {
    method: 'PATCH',
    body: body instanceof FormData ? body : JSON.stringify(body)
});

export const apiDelete = (url) => apiFetch(url, { method: 'DELETE' });

// File upload helper with progress (if needed with custom implementation)
export const uploadFile = async (url, file, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);

    return apiPost(url, formData);
};

export default apiFetch;
