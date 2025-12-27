import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { API_ENDPOINTS } from '../config'

// Get user notifications
export const getUserNotifications = createAsyncThunk(
  'notifications/getUser',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth
      const response = await fetch(API_ENDPOINTS.NOTIFICATIONS, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()

      console.log('🔍 Backend Response:', {
        status: response.status,
        ok: response.ok,
        data: data,
        dataType: typeof data,
        hasData: data?.data,
        dataLength: Array.isArray(data?.data) ? data.data.length : 'N/A'
      });

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to fetch notifications')
      }

      // Backend returns { success: true, count: X, data: [...] }
      const notifications = data.data || data;
      console.log('✅ Notifications extracted:', notifications);
      return notifications
    } catch (error) {
      console.error('❌ Error fetching notifications:', error);
      return rejectWithValue(error.message)
    }
  }
)

// Get unread count
export const getUnreadCount = createAsyncThunk(
  'notifications/getUnreadCount',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth
      const response = await fetch(API_ENDPOINTS.NOTIFICATIONS_UNREAD_COUNT, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to fetch unread count')
      }

      return data.count || 0
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// Mark notification as read
export const markAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (notificationId, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth
      const response = await fetch(API_ENDPOINTS.NOTIFICATION_MARK_READ(notificationId), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
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
export const markAllAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth
      const response = await fetch(API_ENDPOINTS.NOTIFICATIONS_MARK_ALL_READ, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
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

// Delete notification
export const deleteNotification = createAsyncThunk(
  'notifications/delete',
  async (notificationId, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth
      const response = await fetch(API_ENDPOINTS.NOTIFICATION_BY_ID(notificationId), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to delete notification')
      }

      return notificationId
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// Delete all notifications
export const deleteAllNotifications = createAsyncThunk(
  'notifications/deleteAll',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth
      const response = await fetch(API_ENDPOINTS.NOTIFICATIONS_DELETE_ALL, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to delete all notifications')
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
    unreadCount: 0,
    loading: false,
    error: null
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
    updateUnreadCount: (state, action) => {
      state.unreadCount = action.payload
    }
  },
  extraReducers: (builder) => {
    builder
      // Get user notifications
      .addCase(getUserNotifications.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getUserNotifications.fulfilled, (state, action) => {
        state.loading = false
        state.notifications = action.payload
      })
      .addCase(getUserNotifications.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Get unread count
      .addCase(getUnreadCount.pending, (state) => {
        state.error = null
      })
      .addCase(getUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload
      })
      .addCase(getUnreadCount.rejected, (state, action) => {
        state.error = action.payload
      })

      // Mark as read
      .addCase(markAsRead.pending, (state) => {
        state.error = null
      })
      .addCase(markAsRead.fulfilled, (state, action) => {
        const notification = state.notifications.find(n => n._id === action.payload)
        if (notification && !notification.isRead) {
          notification.isRead = true
          state.unreadCount = Math.max(0, state.unreadCount - 1)
        }
      })
      .addCase(markAsRead.rejected, (state, action) => {
        state.error = action.payload
      })

      // Mark all as read
      .addCase(markAllAsRead.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.loading = false
        state.notifications = state.notifications.map(n => ({ ...n, isRead: true }))
        state.unreadCount = 0
      })
      .addCase(markAllAsRead.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Delete notification
      .addCase(deleteNotification.pending, (state) => {
        state.error = null
      })
      .addCase(deleteNotification.fulfilled, (state, action) => {
        const notification = state.notifications.find(n => n._id === action.payload)
        if (notification && !notification.isRead) {
          state.unreadCount = Math.max(0, state.unreadCount - 1)
        }
        state.notifications = state.notifications.filter(n => n._id !== action.payload)
      })
      .addCase(deleteNotification.rejected, (state, action) => {
        state.error = action.payload
      })

      // Delete all notifications
      .addCase(deleteAllNotifications.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteAllNotifications.fulfilled, (state) => {
        state.loading = false
        state.notifications = []
        state.unreadCount = 0
      })
      .addCase(deleteAllNotifications.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  }
})

export const { clearError, addNotification, updateUnreadCount } = notificationsSlice.actions
export default notificationsSlice.reducer
