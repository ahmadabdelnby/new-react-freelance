// API Configuration
export const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/Freelancing/api/v1"
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:3000"

// API endpoints
export const API_ENDPOINTS = {
  BASE_URL: BASE_URL.replace('/Freelancing/api/v1', ''),
  // Auth
  REGISTER: `${BASE_URL}/auth/register`,
  LOGIN: `${BASE_URL}/auth/login`,
  PROFILE: `${BASE_URL}/users/profile`,
  UPDATE_PROFILE: `${BASE_URL}/users/profile`,
  CHANGE_PASSWORD: `${BASE_URL}/users/change-password`,

  // Password Reset
  FORGOT_PASSWORD: `${BASE_URL}/auth/forgot-password`,
  VERIFY_RESET_TOKEN: (token) => `${BASE_URL}/auth/verify-reset-token/${token}`,
  RESET_PASSWORD: (token) => `${BASE_URL}/auth/reset-password/${token}`,

  // Categories
  CATEGORIES: `${BASE_URL}/categories`,
  CATEGORIES_ALL: `${BASE_URL}/categories`,
  CATEGORY_BY_ID: (id) => `${BASE_URL}/categories/${id}`,

  // Countries
  COUNTRIES: `${BASE_URL}/countries`,
  COUNTRIES_ALL: `${BASE_URL}/countries`,
  COUNTRIES_SEARCH: (search) => `${BASE_URL}/countries?search=${encodeURIComponent(search)}`,

  // Specialties
  SPECIALTIES: `${BASE_URL}/specialties`,
  SPECIALTIES_ALL: `${BASE_URL}/specialties`,
  SPECIALTIES_BY_CATEGORY: (categoryId) => `${BASE_URL}/specialties/category/${categoryId}`,
  SPECIALTY_BY_ID: (id) => `${BASE_URL}/specialties/${id}`,

  // Skills
  SKILLS: `${BASE_URL}/skills`,
  SKILLS_ALL: `${BASE_URL}/skills`,
  SKILLS_BY_SPECIALTY: (specialtyId) => `${BASE_URL}/skills/specialty/${specialtyId}`,
  SKILL_BY_ID: (id) => `${BASE_URL}/skills/${id}`,

  // Users
  USERS: `${BASE_URL}/users`,
  USER_BY_ID: (id) => `${BASE_URL}/users/${id}`,
  UPDATE_PROFILE_PICTURE: `${BASE_URL}/users/profile/picture`,
  PROFILE_COMPLETION: `${BASE_URL}/users/profile-completion`,
  UPDATE_ONLINE_STATUS: `${BASE_URL}/users/online-status`,

  // Jobs
  JOBS: `${BASE_URL}/jobs`,
  JOBS_ALL: `${BASE_URL}/jobs`,
  JOBS_CREATE: `${BASE_URL}/jobs`,
  JOB_BY_ID: (id) => `${BASE_URL}/jobs/${id}`,
  JOBS_SEARCH: `${BASE_URL}/jobs/search`,
  JOBS_BY_CLIENT: (clientId) => `${BASE_URL}/jobs/client/${clientId}`,
  JOBS_FEATURED: `${BASE_URL}/jobs/featured`,
  JOBS_BY_SPECIALTY: (specialtyId) => `${BASE_URL}/jobs/specialty/${specialtyId}`,

  // Proposals
  PROPOSALS: `${BASE_URL}/proposals`,
  PROPOSAL_CREATE: `${BASE_URL}/proposals`,
  PROPOSAL_BY_ID: (id) => `${BASE_URL}/proposals/${id}`,
  PROPOSAL_BY_JOB: (jobId) => `${BASE_URL}/proposals/job/${jobId}`,
  MY_PROPOSALS: `${BASE_URL}/proposals/mine`,
  PROPOSAL_ACCEPT: (id) => `${BASE_URL}/proposals/${id}/accept`,
  PROPOSAL_REJECT: (id) => `${BASE_URL}/proposals/${id}/reject`,
  WITHDRAW_PROPOSAL: (id) => `${BASE_URL}/proposals/${id}/withdraw`,

  // Contracts
  CONTRACTS: `${BASE_URL}/contracts`,
  CONTRACT_BY_ID: (id) => `${BASE_URL}/contracts/${id}`,
  MY_CONTRACTS: `${BASE_URL}/contracts/mycontracts`,

  // Reviews
  REVIEWS: `${BASE_URL}/reviews`,
  REVIEW_BY_ID: (id) => `${BASE_URL}/reviews/${id}`,
  REVIEWS_BY_REVIEWER: (reviewerId) => `${BASE_URL}/reviews/reviewer/${reviewerId}`,
  REVIEWS_BY_REVIEWEE: (revieweeId) => `${BASE_URL}/reviews/reviewee/${revieweeId}`,
  REVIEWS_BY_CONTRACT: (contractId) => `${BASE_URL}/reviews/contract/${contractId}`,
  CREATE_REVIEW: `${BASE_URL}/reviews`,
  UPDATE_REVIEW: (id) => `${BASE_URL}/reviews/${id}`,
  DELETE_REVIEW: (id) => `${BASE_URL}/reviews/${id}`,

  // Notifications
  NOTIFICATIONS: `${BASE_URL}/notifications`,
  NOTIFICATION_BY_ID: (id) => `${BASE_URL}/notifications/${id}`,
  NOTIFICATION_MARK_READ: (id) => `${BASE_URL}/notifications/${id}/read`,
  NOTIFICATIONS_MARK_ALL_READ: `${BASE_URL}/notifications/mark-all-read`,
  NOTIFICATIONS_UNREAD_COUNT: `${BASE_URL}/notifications/unread-count`,
  NOTIFICATIONS_DELETE_ALL: `${BASE_URL}/notifications/delete-all`,

  // Favorites
  FAVORITES: `${BASE_URL}/favorites`,
  MY_FAVORITES: `${BASE_URL}/favorites/mine`,
  CHECK_FAVORITE: `${BASE_URL}/favorites/check`,

  // Portfolio
  PORTFOLIO: `${BASE_URL}/portfolio`,
  PORTFOLIO_BY_ID: (id) => `${BASE_URL}/portfolio/${id}`,
  MY_PORTFOLIO: `${BASE_URL}/portfolio/mine`,
  LIKE_PORTFOLIO: (id) => `${BASE_URL}/portfolio/${id}/like`,
  INCREMENT_PORTFOLIO_VIEWS: (id) => `${BASE_URL}/portfolio/${id}/view`,
  TOGGLE_PORTFOLIO_FEATURED: (id) => `${BASE_URL}/portfolio/${id}/featured`,

  // Upload
  UPLOAD_PROFILE_PICTURE: `${BASE_URL}/upload/profile-picture`,
  UPLOAD_PORTFOLIO_IMAGES: `${BASE_URL}/upload/portfolio-images`,
  UPLOAD_ATTACHMENTS: `${BASE_URL}/upload/attachments`,
  DELETE_FILE: `${BASE_URL}/upload/delete`,

  // Chat
  CHAT_CONVERSATIONS: `${BASE_URL}/chat/conversations`,
  CHAT_CONVERSATION_BY_ID: (id) => `${BASE_URL}/chat/conversations/${id}`,
  CHAT_MESSAGES: (conversationId) => `${BASE_URL}/chat/conversations/${conversationId}/messages`,
  CHAT_CREATE_CONVERSATION: `${BASE_URL}/chat/conversations`,
  CHAT_SEND_MESSAGE: (conversationId) => `${BASE_URL}/chat/conversations/${conversationId}/messages`,
  CHAT_MARK_READ: (conversationId) => `${BASE_URL}/chat/conversations/${conversationId}/read`,

  // Payments
  PAYMENTS: `${BASE_URL}/payments`,
  PAYMENT_BY_ID: (id) => `${BASE_URL}/payments/${id}`,
  MY_PAYMENTS: `${BASE_URL}/payments/mine`,
  PROCESS_PAYMENT: (id) => `${BASE_URL}/payments/${id}/process`,
  REFUND_PAYMENT: (id) => `${BASE_URL}/payments/${id}/refund`,

  // Statistics
  STATISTICS_PLATFORM: `${BASE_URL}/statistics/platform`,
  STATISTICS_GROWTH: `${BASE_URL}/statistics/growth`,
  STATISTICS_DASHBOARD: `${BASE_URL}/statistics/dashboard`,
};