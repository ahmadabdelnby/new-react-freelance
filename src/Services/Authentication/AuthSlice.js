import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { API_ENDPOINTS } from '../config'
import logger from '../logger'
import storage from '../storage'
import { toast } from 'react-toastify'

// 🔥 Check if token is expired
const isTokenExpired = (token) => {
    if (!token) return true;

    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expirationTime = payload.exp * 1000; // Convert to milliseconds
        const currentTime = Date.now();

        return currentTime >= expirationTime;
    } catch (error) {
        logger.error('Error checking token expiration:', error);
        return true; // If error, consider token expired
    }
};

// 🔥 Clear expired token on app load
const storedToken = storage.get('token');
if (storedToken && isTokenExpired(storedToken)) {
    logger.warn('⚠️ Token expired on app load - clearing auth data');
    storage.remove('token');
    storage.remove('user');
}

// Initial state
const initialState = {
    user: storage.getJSON('user') || null,
    token: storage.get('token') || null,
    isLoading: false,
    error: null,
    isAuthenticated: !!storage.get('token') && !isTokenExpired(storage.get('token')),
}

// 🔥 Validate user exists in database (called on app load)
export const validateUser = createAsyncThunk(
    'auth/validateUser',
    async (_, { rejectWithValue }) => {
        try {
            const token = storage.get('token')
            if (!token) {
                return rejectWithValue('No token found')
            }

            const response = await fetch(API_ENDPOINTS.PROFILE, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            })

            const data = await response.json()

            // 🔥 User account deleted or doesn't exist
            if (response.status === 401 && data.accountDeleted) {
                storage.remove('token')
                storage.remove('user')
                toast.error('Your account has been deleted or does not exist')
                return rejectWithValue('Account deleted')
            }

            // 🔥 Token expired
            if (response.status === 401) {
                storage.remove('token')
                storage.remove('user')
                toast.error('Your session has expired. Please login again.')
                return rejectWithValue(data.message || 'Session expired')
            }

            if (!response.ok) {
                storage.remove('token')
                storage.remove('user')
                return rejectWithValue(data.message || 'Validation failed')
            }

            // Update user data in storage - extract user object from response
            const userData = data.user || data
            storage.setJSON('user', userData)
            return userData
        } catch (error) {
            storage.remove('token')
            storage.remove('user')
            return rejectWithValue(error.message)
        }
    }
)

// Async thunk for login
export const login = createAsyncThunk(
    'auth/login',
    async (credentials, { rejectWithValue }) => {
        try {
            const response = await fetch(API_ENDPOINTS.LOGIN, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials),
            })

            const data = await response.json()

            if (!response.ok) {
                return rejectWithValue(data.message || 'Login failed')
            }

            // Save token and user to localStorage
            storage.set('token', data.token)
            storage.setJSON('user', data.user)

            return data
        } catch (error) {
            return rejectWithValue(error.message)
        }
    }
)

// Async thunk for register
export const register = createAsyncThunk(
    'auth/register',
    async (userData, { rejectWithValue }) => {
        try {
            const response = await fetch(API_ENDPOINTS.REGISTER, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            })

            const data = await response.json()

            if (!response.ok) {
                return rejectWithValue(data.message || 'Registration failed')
            }

            // Save token and user to localStorage
            storage.set('token', data.token)
            storage.setJSON('user', data.user)

            return data
        } catch (error) {
            return rejectWithValue(error.message)
        }
    }
)

// Async thunk for logout
export const logout = createAsyncThunk('auth/logout', async () => {
    // Disconnect socket before logout
    try {
        const { disconnectSocket } = await import('../socketIntegration');
        disconnectSocket();
    } catch (error) {
        logger.error('Error disconnecting socket:', error);
    }

    storage.remove('token')
    storage.remove('user')
    return null
})

// Auth slice
const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null
        },
        setUser: (state, action) => {
            state.user = action.payload
            // Update localStorage when user changes
            if (action.payload) {
                storage.setJSON('user', action.payload)
            }
        },
        updateBalance: (state, action) => {
            if (state.user) {
                state.user.balance = action.payload
                // Update localStorage to persist balance
                storage.setJSON('user', state.user)
            }
        },
    },
    extraReducers: (builder) => {
        builder
            // Login cases
            .addCase(login.pending, (state) => {
                state.isLoading = true
                state.error = null
            })
            .addCase(login.fulfilled, (state, action) => {
                state.isLoading = false
                state.user = action.payload.user
                state.token = action.payload.token
                state.isAuthenticated = true
                state.error = null
            })
            .addCase(login.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload
                state.isAuthenticated = false
            })
            // Register cases
            .addCase(register.pending, (state) => {
                state.isLoading = true
                state.error = null
            })
            .addCase(register.fulfilled, (state, action) => {
                state.isLoading = false
                state.user = action.payload.user
                state.token = action.payload.token
                state.isAuthenticated = true
                state.error = null
            })
            .addCase(register.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload
                state.isAuthenticated = false
            })
            // Logout cases
            .addCase(logout.fulfilled, (state) => {
                state.user = null
                state.token = null
                state.isAuthenticated = false
                state.error = null
            })
            // 🔥 Validate user cases
            .addCase(validateUser.pending, (state) => {
                state.isLoading = true
            })
            .addCase(validateUser.fulfilled, (state, action) => {
                state.isLoading = false
                state.user = action.payload
                state.isAuthenticated = true
            })
            .addCase(validateUser.rejected, (state, action) => {
                state.isLoading = false
                state.user = null
                state.token = null
                state.isAuthenticated = false
                state.error = action.payload
                logger.warn('⚠️ User validation failed:', action.payload)
            })
    },
})

export const { clearError, setUser, updateBalance } = authSlice.actions
export default authSlice.reducer
