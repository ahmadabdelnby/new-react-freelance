import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { API_ENDPOINTS } from '../config'

// Fetch all jobs
export const fetchJobs = createAsyncThunk(
  'jobs/fetchJobs',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(API_ENDPOINTS.JOBS_ALL)
      const data = await response.json()
      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// Search jobs with filters
export const searchJobs = createAsyncThunk(
  'jobs/searchJobs',
  async (filters, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams()

      // Map frontend filter names to backend parameter names
      if (filters.keyword) queryParams.append('search', filters.keyword) // Backend expects 'search' not 'keyword'
      if (filters.specialty) queryParams.append('specialty', filters.specialty)
      if (filters.minBudget) queryParams.append('minBudget', filters.minBudget)
      if (filters.maxBudget) queryParams.append('maxBudget', filters.maxBudget)
      if (filters.skills && filters.skills.length > 0) {
        queryParams.append('skills', filters.skills.join(','))
      }

      const response = await fetch(`${API_ENDPOINTS.JOBS_SEARCH}?${queryParams}`)
      const data = await response.json()

      // Backend returns {jobs: [...], pagination: {...}}, extract jobs array
      return data.jobs || data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// Get job by ID
export const fetchJobById = createAsyncThunk(
  'jobs/fetchJobById',
  async (jobId, { rejectWithValue }) => {
    try {
      const response = await fetch(API_ENDPOINTS.JOB_BY_ID(jobId))
      const data = await response.json()
      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// Post a new job
export const postJob = createAsyncThunk(
  'jobs/postJob',
  async (jobData, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth

      if (!token) {
        return rejectWithValue('You must be logged in to post a job')
      }

      const response = await fetch(API_ENDPOINTS.JOBS_CREATE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(jobData)
      })

      const data = await response.json()

      if (!response.ok) {
        // Handle validation errors
        if (data.errors && Array.isArray(data.errors)) {
          const errorMessages = data.errors.map(err => err.message).join(', ')
          return rejectWithValue(errorMessages)
        }
        return rejectWithValue(data.message || 'Failed to post job')
      }

      return data
    } catch (error) {
      return rejectWithValue(error.message || 'Network error. Please try again.')
    }
  }
)

const jobsSlice = createSlice({
  name: 'jobs',
  initialState: {
    jobs: [],
    currentJob: null,
    loading: false,
    error: null,
    searchFilters: {
      keyword: '',
      specialty: '',
      minBudget: '',
      maxBudget: '',
      skills: []
    }
  },
  reducers: {
    setSearchFilters: (state, action) => {
      state.searchFilters = { ...state.searchFilters, ...action.payload }
    },
    clearSearchFilters: (state) => {
      state.searchFilters = {
        keyword: '',
        specialty: '',
        minBudget: '',
        maxBudget: '',
        skills: []
      }
    },
    clearCurrentJob: (state) => {
      state.currentJob = null
    },
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch all jobs
      .addCase(fetchJobs.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.loading = false
        state.jobs = Array.isArray(action.payload) ? action.payload : (action.payload.data || [])
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Search jobs
      .addCase(searchJobs.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(searchJobs.fulfilled, (state, action) => {
        state.loading = false
        state.jobs = Array.isArray(action.payload) ? action.payload : (action.payload.data || [])
      })
      .addCase(searchJobs.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Fetch job by ID
      .addCase(fetchJobById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchJobById.fulfilled, (state, action) => {
        state.loading = false
        state.currentJob = action.payload.data || action.payload
      })
      .addCase(fetchJobById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Post job
      .addCase(postJob.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(postJob.fulfilled, (state, action) => {
        state.loading = false
        state.jobs.unshift(action.payload)
      })
      .addCase(postJob.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  }
})

export const { setSearchFilters, clearSearchFilters, clearCurrentJob, clearError } = jobsSlice.actions
export default jobsSlice.reducer
