import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { API_ENDPOINTS } from '../config'
import logger from '../logger'
import storage from '../storage'

// Initial state
const initialState = {
    user: storage.getJSON('user') || null,
    token: storage.get('token') || null,
    isLoading: false,
    error: null,
    isAuthenticated: !!storage.get('token'),
}

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
    },
})

export const { clearError, setUser } = authSlice.actions
export default authSlice.reducer
