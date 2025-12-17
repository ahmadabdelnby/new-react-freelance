import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { API_ENDPOINTS } from '../config'

// Create portfolio item
export const createPortfolioItem = createAsyncThunk(
  'portfolio/create',
  async (portfolioData, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth
      const response = await fetch(API_ENDPOINTS.PORTFOLIO, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(portfolioData)
      })

      const data = await response.json()

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to create portfolio item')
      }

      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// Get all portfolio items
export const getAllPortfolioItems = createAsyncThunk(
  'portfolio/getAll',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams()

      if (filters.freelancerId) queryParams.append('freelancerId', filters.freelancerId)
      if (filters.skillId) queryParams.append('skillId', filters.skillId)

      const response = await fetch(`${API_ENDPOINTS.PORTFOLIO}?${queryParams}`)
      const data = await response.json()

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to fetch portfolio items')
      }

      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// Get my portfolio items
export const getMyPortfolioItems = createAsyncThunk(
  'portfolio/getMy',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth
      const response = await fetch(API_ENDPOINTS.MY_PORTFOLIO, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to fetch your portfolio')
      }

      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// Get portfolio item by ID
export const getPortfolioItemById = createAsyncThunk(
  'portfolio/getById',
  async (itemId, { rejectWithValue }) => {
    try {
      const response = await fetch(API_ENDPOINTS.PORTFOLIO_BY_ID(itemId))
      const data = await response.json()

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to fetch portfolio item')
      }

      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// Update portfolio item
export const updatePortfolioItem = createAsyncThunk(
  'portfolio/update',
  async ({ itemId, updates }, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth
      const response = await fetch(API_ENDPOINTS.PORTFOLIO_BY_ID(itemId), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      })

      const data = await response.json()

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to update portfolio item')
      }

      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// Delete portfolio item
export const deletePortfolioItem = createAsyncThunk(
  'portfolio/delete',
  async (itemId, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth
      const response = await fetch(API_ENDPOINTS.PORTFOLIO_BY_ID(itemId), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to delete portfolio item')
      }

      return itemId
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// Like portfolio item
export const likePortfolioItem = createAsyncThunk(
  'portfolio/like',
  async (itemId, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth
      const headers = {
        'Content-Type': 'application/json'
      }

      // Add token if available
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(API_ENDPOINTS.LIKE_PORTFOLIO(itemId), {
        method: 'POST',
        headers: headers
      })

      const data = await response.json()

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to like portfolio item')
      }

      // Return the portfolioItem for Redux state update
      return data.portfolioItem
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

const portfolioSlice = createSlice({
  name: 'portfolio',
  initialState: {
    items: [],
    currentItem: null,
    loading: false,
    error: null
  },
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearCurrentItem: (state) => {
      state.currentItem = null
    }
  },
  extraReducers: (builder) => {
    builder
      // Create portfolio item
      .addCase(createPortfolioItem.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createPortfolioItem.fulfilled, (state, action) => {
        state.loading = false
        // Backend returns { message, portfolioItem }
        const newItem = action.payload.portfolioItem || action.payload
        state.items.unshift(newItem)
        state.currentItem = newItem
      })
      .addCase(createPortfolioItem.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Get all portfolio items
      .addCase(getAllPortfolioItems.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getAllPortfolioItems.fulfilled, (state, action) => {
        state.loading = false
        // Backend returns { count, portfolioItems }
        state.items = action.payload.portfolioItems || action.payload
      })
      .addCase(getAllPortfolioItems.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Get my portfolio items
      .addCase(getMyPortfolioItems.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getMyPortfolioItems.fulfilled, (state, action) => {
        state.loading = false
        // Backend returns { count, portfolioItems }
        state.items = action.payload.portfolioItems || action.payload
      })
      .addCase(getMyPortfolioItems.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Get portfolio item by ID
      .addCase(getPortfolioItemById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getPortfolioItemById.fulfilled, (state, action) => {
        state.loading = false
        state.currentItem = action.payload
      })
      .addCase(getPortfolioItemById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Update portfolio item
      .addCase(updatePortfolioItem.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updatePortfolioItem.fulfilled, (state, action) => {
        state.loading = false
        // Backend returns { message, portfolioItem }
        const updatedItem = action.payload.portfolioItem || action.payload
        const index = state.items.findIndex(item => item._id === updatedItem._id)
        if (index !== -1) {
          state.items[index] = updatedItem
        }
        state.currentItem = updatedItem
      })
      .addCase(updatePortfolioItem.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Delete portfolio item
      .addCase(deletePortfolioItem.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deletePortfolioItem.fulfilled, (state, action) => {
        state.loading = false
        state.items = state.items.filter(item => item._id !== action.payload)
        if (state.currentItem?._id === action.payload) {
          state.currentItem = null
        }
      })
      .addCase(deletePortfolioItem.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Like portfolio item
      .addCase(likePortfolioItem.pending, (state) => {
        state.error = null
      })
      .addCase(likePortfolioItem.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item._id === action.payload._id)
        if (index !== -1) {
          state.items[index] = action.payload
        }
        if (state.currentItem?._id === action.payload._id) {
          state.currentItem = action.payload
        }
      })
      .addCase(likePortfolioItem.rejected, (state, action) => {
        state.error = action.payload
      })
  }
})

export const { clearError, clearCurrentItem } = portfolioSlice.actions
export default portfolioSlice.reducer
