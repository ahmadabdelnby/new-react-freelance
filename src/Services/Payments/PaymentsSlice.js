import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { API_ENDPOINTS } from '../config'

// Create a payment
export const createPayment = createAsyncThunk(
  'payments/create',
  async (paymentData, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth
      const response = await fetch(API_ENDPOINTS.PAYMENTS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(paymentData)
      })

      const data = await response.json()
      
      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to create payment')
      }

      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// Process a payment
export const processPayment = createAsyncThunk(
  'payments/process',
  async (paymentId, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth
      const response = await fetch(API_ENDPOINTS.PROCESS_PAYMENT(paymentId), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      
      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to process payment')
      }

      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// Get all payments (admin only)
export const getAllPayments = createAsyncThunk(
  'payments/getAll',
  async (filters = {}, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth
      const queryParams = new URLSearchParams()
      
      if (filters.status) queryParams.append('status', filters.status)
      
      const response = await fetch(`${API_ENDPOINTS.PAYMENTS}?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      
      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to fetch payments')
      }

      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// Get my payments
export const getMyPayments = createAsyncThunk(
  'payments/getMy',
  async (type, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth
      const queryParams = type ? `?type=${type}` : ''
      
      const response = await fetch(`${API_ENDPOINTS.MY_PAYMENTS}${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      
      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to fetch your payments')
      }

      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// Get payment by ID
export const getPaymentById = createAsyncThunk(
  'payments/getById',
  async (paymentId, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth
      const response = await fetch(API_ENDPOINTS.PAYMENT_BY_ID(paymentId), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      
      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to fetch payment')
      }

      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// Refund a payment
export const refundPayment = createAsyncThunk(
  'payments/refund',
  async ({ paymentId, reason }, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth
      const response = await fetch(API_ENDPOINTS.REFUND_PAYMENT(paymentId), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reason })
      })

      const data = await response.json()
      
      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to refund payment')
      }

      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

const paymentsSlice = createSlice({
  name: 'payments',
  initialState: {
    payments: [],
    currentPayment: null,
    loading: false,
    error: null,
    stats: {
      totalSent: 0,
      totalReceived: 0,
      pending: 0,
      completed: 0
    }
  },
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearCurrentPayment: (state) => {
      state.currentPayment = null
    }
  },
  extraReducers: (builder) => {
    builder
      // Create payment
      .addCase(createPayment.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createPayment.fulfilled, (state, action) => {
        state.loading = false
        state.payments.unshift(action.payload)
        state.currentPayment = action.payload
      })
      .addCase(createPayment.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Process payment
      .addCase(processPayment.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(processPayment.fulfilled, (state, action) => {
        state.loading = false
        const index = state.payments.findIndex(p => p._id === action.payload._id)
        if (index !== -1) {
          state.payments[index] = action.payload
        }
        state.currentPayment = action.payload
      })
      .addCase(processPayment.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Get all payments
      .addCase(getAllPayments.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getAllPayments.fulfilled, (state, action) => {
        state.loading = false
        state.payments = action.payload
      })
      .addCase(getAllPayments.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Get my payments
      .addCase(getMyPayments.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getMyPayments.fulfilled, (state, action) => {
        state.loading = false
        state.payments = action.payload
      })
      .addCase(getMyPayments.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Get payment by ID
      .addCase(getPaymentById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getPaymentById.fulfilled, (state, action) => {
        state.loading = false
        state.currentPayment = action.payload
      })
      .addCase(getPaymentById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Refund payment
      .addCase(refundPayment.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(refundPayment.fulfilled, (state, action) => {
        state.loading = false
        const index = state.payments.findIndex(p => p._id === action.payload._id)
        if (index !== -1) {
          state.payments[index] = action.payload
        }
        state.currentPayment = action.payload
      })
      .addCase(refundPayment.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  }
})

export const { clearError, clearCurrentPayment } = paymentsSlice.actions
export default paymentsSlice.reducer
