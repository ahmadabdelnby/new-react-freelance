import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { API_ENDPOINTS } from '../config'

// Submit a proposal
export const submitProposal = createAsyncThunk(
  'proposals/submit',
  async ({ jobId, proposalData }, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth
      
      const formData = new FormData()
      // Backend expects 'jobId'
      const bidAmount = Number(proposalData.bidAmount)
      const deliveryTime = Number.parseInt(proposalData.deliveryTime, 10)

      console.log('Submitting proposal payload', {
        jobId,
        bidAmount,
        deliveryTime,
        coverLetterLength: proposalData.coverLetter?.length,
        hasMessage: !!proposalData.message,
        attachmentsCount: proposalData.attachments?.length || 0
      })

      formData.append('jobId', jobId)
      formData.append('bidAmount', bidAmount)
      formData.append('deliveryTime', deliveryTime) // ✅ Changed from 'duration' to 'deliveryTime'
      formData.append('coverLetter', proposalData.coverLetter)
      if (proposalData.message) {
        formData.append('message', proposalData.message)
      }
      
      if (proposalData.attachments && proposalData.attachments.length > 0) {
        proposalData.attachments.forEach((file) => {
          formData.append('attachments', file)
        })
      }

      const response = await fetch(API_ENDPOINTS.PROPOSAL_CREATE, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      // Safely parse response (json or text)
      let data
      try {
        data = await response.json()
      } catch (parseErr) {
        const text = await response.text()
        data = { parseErr: parseErr?.message, raw: text }
      }
      
      if (!response.ok) {
        console.error('Proposal submit failed', {
          status: response.status,
          statusText: response.statusText,
          data,
          dataString: (() => {
            try { return JSON.stringify(data) } catch { return String(data) }
          })()
        })
        const validationMessage = Array.isArray(data?.errors)
          ? data.errors.map((err) => `${err.field || 'field'}: ${err.message}`).join(' | ')
          : null
        const serverMessage = data?.message || data?.raw
        const errorText = validationMessage || serverMessage || 'Failed to submit proposal'
        return rejectWithValue(typeof errorText === 'string' ? errorText : String(errorText))
      }

      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// Get proposals for a job (Client view)
export const getJobProposals = createAsyncThunk(
  'proposals/getJobProposals',
  async (jobId, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth
      const response = await fetch(API_ENDPOINTS.PROPOSAL_BY_JOB(jobId), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      
      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to fetch proposals')
      }
      
      // Handle different response structures
      // Backend might return: { proposals: [...] } or just [...]
      const proposalsData = Array.isArray(data) ? data : (data.proposals || data.data || [])
      
      console.log('Fetched proposals:', proposalsData)
      return proposalsData
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// Accept a proposal
export const acceptProposal = createAsyncThunk(
  'proposals/accept',
  async (proposalId, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth
      const response = await fetch(API_ENDPOINTS.PROPOSAL_ACCEPT(proposalId), {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()
      
      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to accept proposal')
      }

      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// Reject a proposal
export const rejectProposal = createAsyncThunk(
  'proposals/reject',
  async (proposalId, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth
      const response = await fetch(API_ENDPOINTS.PROPOSAL_REJECT(proposalId), {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()
      
      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to reject proposal')
      }

      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// Get my proposals (Freelancer view)
export const getMyProposals = createAsyncThunk(
  'proposals/getMyProposals',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth
      const response = await fetch(API_ENDPOINTS.MY_PROPOSALS, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      
      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to fetch my proposals')
      }
      
      // Handle different response structures
      const proposalsData = Array.isArray(data) ? data : (data.proposals || data.data || [])
      
      return proposalsData
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

const proposalsSlice = createSlice({
  name: 'proposals',
  initialState: {
    proposals: [],
    myProposals: [],
    loading: false,
    error: null,
    submitSuccess: false
  },
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearSubmitSuccess: (state) => {
      state.submitSuccess = false
    }
  },
  extraReducers: (builder) => {
    builder
      // Submit proposal
      .addCase(submitProposal.pending, (state) => {
        state.loading = true
        state.error = null
        state.submitSuccess = false
      })
      .addCase(submitProposal.fulfilled, (state, action) => {
        state.loading = false
        state.submitSuccess = true
        state.myProposals.unshift(action.payload)
      })
      .addCase(submitProposal.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Get job proposals
      .addCase(getJobProposals.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getJobProposals.fulfilled, (state, action) => {
        state.loading = false
        state.proposals = action.payload
      })
      .addCase(getJobProposals.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Accept proposal
      .addCase(acceptProposal.fulfilled, (state, action) => {
        const index = state.proposals.findIndex(p => p._id === action.payload._id)
        if (index !== -1) {
          state.proposals[index] = action.payload
        }
      })
      
      // Reject proposal
      .addCase(rejectProposal.fulfilled, (state, action) => {
        const index = state.proposals.findIndex(p => p._id === action.payload._id)
        if (index !== -1) {
          state.proposals[index] = action.payload
        }
      })
      
      // Get my proposals
      .addCase(getMyProposals.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getMyProposals.fulfilled, (state, action) => {
        state.loading = false
        state.myProposals = action.payload
      })
      .addCase(getMyProposals.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  }
})

export const { clearError, clearSubmitSuccess } = proposalsSlice.actions
export default proposalsSlice.reducer
