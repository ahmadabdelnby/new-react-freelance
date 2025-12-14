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
      
      if (filters.keyword) queryParams.append('keyword', filters.keyword)
      if (filters.specialty) queryParams.append('specialty', filters.specialty)
      if (filters.minBudget) queryParams.append('minBudget', filters.minBudget)
      if (filters.maxBudget) queryParams.append('maxBudget', filters.maxBudget)
      if (filters.skills && filters.skills.length > 0) {
        queryParams.append('skills', filters.skills.join(','))
      }

      const response = await fetch(`${API_ENDPOINTS.JOBS_SEARCH}?${queryParams}`)
      const data = await response.json()
      return data
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
        return rejectWithValue(data.message || 'Failed to post job')
      }

      return data
    } catch (error) {
      return rejectWithValue(error.message)
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
        state.jobs = action.payload
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
        state.jobs = action.payload
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
        state.currentJob = action.payload
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
