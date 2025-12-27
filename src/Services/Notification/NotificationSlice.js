import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { API_ENDPOINTS } from '../config'

// Get notifications for current user
export const getNotifications = createAsyncThunk(
  'notifications/get',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { token, user } = getState().auth
      // Handle nested user object structure
      const actualUser = user?.user || user
      const userId = actualUser?._id || actualUser?.id || actualUser?.userId

      if (!userId) {
        return rejectWithValue('User not authenticated')
      }

      const response = await fetch(API_ENDPOINTS.NOTIFICATIONS.replace(':userId', userId), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to fetch notifications')
      }

      return Array.isArray(data) ? data : (data.notifications || [])
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// Mark notification as read
export const markNotificationAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (notificationId, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth
      const response = await fetch(`${API_ENDPOINTS.NOTIFICATIONS.replace(':userId', '')}${notificationId}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to mark notification as read')
      }

      return notificationId
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// Mark all notifications as read
export const markAllNotificationsAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { token, user } = getState().auth
      // Handle nested user object structure
      const actualUser = user?.user || user
      const userId = actualUser?._id || actualUser?.id || actualUser?.userId

      if (!userId) {
        return rejectWithValue('User not authenticated')
      }

      const response = await fetch(`${API_ENDPOINTS.NOTIFICATIONS.replace(':userId', userId)}/mark-all-read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to mark all notifications as read')
      }

      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: {
    notifications: [],
    loading: false,
    error: null,
    unreadCount: 0
  },
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload)
      if (!action.payload.isRead) {
        state.unreadCount += 1
      }
    },
    updateNotification: (state, action) => {
      const index = state.notifications.findIndex(n => n._id === action.payload._id)
      if (index !== -1) {
        const wasUnread = !state.notifications[index].isRead
        state.notifications[index] = action.payload
        if (wasUnread && action.payload.isRead) {
          state.unreadCount = Math.max(0, state.unreadCount - 1)
        }
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Get notifications
      .addCase(getNotifications.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getNotifications.fulfilled, (state, action) => {
        state.loading = false
        state.notifications = Array.isArray(action.payload) ? action.payload : []
        state.unreadCount = state.notifications.filter(n => !n.isRead).length
      })
      .addCase(getNotifications.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.notifications = []
        state.unreadCount = 0
      })

      // Mark as read
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const notification = state.notifications.find(n => n._id === action.payload)
        if (notification && !notification.isRead) {
          notification.isRead = true
          state.unreadCount = Math.max(0, state.unreadCount - 1)
        }
      })

      // Mark all as read
      .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
        state.notifications = state.notifications.map(n => ({ ...n, isRead: true }))
        state.unreadCount = 0
      })
  }
})

export const { clearError, addNotification, updateNotification } = notificationsSlice.actions
export default notificationsSlice.reducer
