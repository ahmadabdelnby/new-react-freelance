import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { API_ENDPOINTS } from '../config'

// Create a new contract
export const createContract = createAsyncThunk(
  'contracts/create',
  async (contractData, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth
      const response = await fetch(API_ENDPOINTS.CONTRACTS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(contractData)
      })

      const data = await response.json()
      
      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to create contract')
      }

      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// Get all contracts
export const getAllContracts = createAsyncThunk(
  'contracts/getAll',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth
      const response = await fetch(API_ENDPOINTS.CONTRACTS, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      
      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to fetch contracts')
      }

      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// Get my contracts
export const getMyContracts = createAsyncThunk(
  'contracts/getMy',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth
      const response = await fetch(API_ENDPOINTS.MY_CONTRACTS, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      
      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to fetch your contracts')
      }

      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// Get contract by ID
export const getContractById = createAsyncThunk(
  'contracts/getById',
  async (contractId, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth
      const response = await fetch(API_ENDPOINTS.CONTRACT_BY_ID(contractId), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      
      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to fetch contract')
      }

      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// Update contract
export const updateContract = createAsyncThunk(
  'contracts/update',
  async ({ contractId, updates }, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth
      const response = await fetch(API_ENDPOINTS.CONTRACT_BY_ID(contractId), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      })

      const data = await response.json()
      
      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to update contract')
      }

      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// Complete contract
export const completeContract = createAsyncThunk(
  'contracts/complete',
  async (contractId, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth
      const response = await fetch(`${API_ENDPOINTS.CONTRACT_BY_ID(contractId)}/complete`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      
      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to complete contract')
      }

      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// Delete contract
export const deleteContract = createAsyncThunk(
  'contracts/delete',
  async (contractId, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth
      const response = await fetch(API_ENDPOINTS.CONTRACT_BY_ID(contractId), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      
      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to delete contract')
      }

      return contractId
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

const contractsSlice = createSlice({
  name: 'contracts',
  initialState: {
    contracts: [],
    currentContract: null,
    loading: false,
    error: null
  },
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearCurrentContract: (state) => {
      state.currentContract = null
    }
  },
  extraReducers: (builder) => {
    builder
      // Create contract
      .addCase(createContract.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createContract.fulfilled, (state, action) => {
        state.loading = false
        state.contracts.push(action.payload)
        state.currentContract = action.payload
      })
      .addCase(createContract.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Get all contracts
      .addCase(getAllContracts.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getAllContracts.fulfilled, (state, action) => {
        state.loading = false
        state.contracts = action.payload
      })
      .addCase(getAllContracts.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Get my contracts
      .addCase(getMyContracts.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getMyContracts.fulfilled, (state, action) => {
        state.loading = false
        // Backend returns { clientContracts: [], freelancerContracts: [] }
        // Combine them into single array
        const clientContracts = action.payload.clientContracts || []
        const freelancerContracts = action.payload.freelancerContracts || []
        state.contracts = [...clientContracts, ...freelancerContracts]
      })
      .addCase(getMyContracts.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Get contract by ID
      .addCase(getContractById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getContractById.fulfilled, (state, action) => {
        state.loading = false
        state.currentContract = action.payload
      })
      .addCase(getContractById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Update contract
      .addCase(updateContract.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateContract.fulfilled, (state, action) => {
        state.loading = false
        const index = state.contracts.findIndex(c => c._id === action.payload._id)
        if (index !== -1) {
          state.contracts[index] = action.payload
        }
        state.currentContract = action.payload
      })
      .addCase(updateContract.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Complete contract
      .addCase(completeContract.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(completeContract.fulfilled, (state, action) => {
        state.loading = false
        const index = state.contracts.findIndex(c => c._id === action.payload._id)
        if (index !== -1) {
          state.contracts[index] = action.payload
        }
        state.currentContract = action.payload
      })
      .addCase(completeContract.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Delete contract
      .addCase(deleteContract.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteContract.fulfilled, (state, action) => {
        state.loading = false
        state.contracts = state.contracts.filter(c => c._id !== action.payload)
        if (state.currentContract?._id === action.payload) {
          state.currentContract = null
        }
      })
      .addCase(deleteContract.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  }
})

export const { clearError, clearCurrentContract } = contractsSlice.actions
export default contractsSlice.reducer
