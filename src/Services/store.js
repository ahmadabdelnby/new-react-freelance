import { configureStore } from '@reduxjs/toolkit'
import authReducer from './Authentication/AuthSlice'
import categoriesReducer from './Categories/CategoriesSlice'
import jobsReducer from './Jobs/JobsSlice'
import proposalsReducer from './Proposals/ProposalsSlice'
import chatReducer from './Chat/ChatSlice'
import reviewsReducer from './Reviews/ReviewsSlice'
import profileReducer from './Profile/ProfileSlice'
import contractsReducer from './Contracts/ContractsSlice'
import paymentsReducer from './Payments/PaymentsSlice'
import portfolioReducer from './Portfolio/PortfolioSlice'
import notificationsReducer from './Notifications/NotificationsSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    categories: categoriesReducer,
    jobs: jobsReducer,
    proposals: proposalsReducer,
    chat: chatReducer,
    reviews: reviewsReducer,
    profile: profileReducer,
    contracts: contractsReducer,
    payments: paymentsReducer,
    portfolio: portfolioReducer,
    notifications: notificationsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
})

// Make store available globally for cross-slice updates
if (typeof window !== 'undefined') {
  window.__store__ = store
}

export default store
