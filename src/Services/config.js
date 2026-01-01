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
  GET_CURRENT_BALANCE: `${BASE_URL}/users/balance`,

  // Jobs
  JOBS: `${BASE_URL}/jobs`,
  JOBS_ALL: `${BASE_URL}/jobs`,
  JOBS_CREATE: `${BASE_URL}/jobs`,
  JOB_BY_ID: (id) => `${BASE_URL}/jobs/${id}`,
  JOB_CONTRACT: (jobId) => `${BASE_URL}/jobs/${jobId}/contract`,
  JOBS_SEARCH: `${BASE_URL}/jobs/search`,
  JOBS_BY_CLIENT: (clientId) => `${BASE_URL}/jobs/client/${clientId}`,
  JOBS_FEATURED: `${BASE_URL}/jobs/featured`,
  JOBS_BY_SPECIALTY: (specialtyId) => `${BASE_URL}/jobs/specialty/${specialtyId}`,
  RECOMMEND_FREELANCERS: (jobId) => `${BASE_URL}/jobs/recommend/${jobId}`,

  // Proposals
  PROPOSALS: `${BASE_URL}/proposals`,
  PROPOSAL_CREATE: `${BASE_URL}/proposals`,
  PROPOSAL_BY_ID: (id) => `${BASE_URL}/proposals/${id}`,
  PROPOSAL_BY_JOB: (jobId) => `${BASE_URL}/proposals/job/${jobId}`,
  MY_PROPOSALS: `${BASE_URL}/proposals/mine`,
  PROPOSAL_ACCEPT: (id) => `${BASE_URL}/proposals/${id}/hire`,
  PROPOSAL_REJECT: (id) => `${BASE_URL}/proposals/${id}/reject`,
  WITHDRAW_PROPOSAL: (id) => `${BASE_URL}/proposals/${id}/withdraw`,

  // Contracts
  CONTRACTS: `${BASE_URL}/contracts`,
  CONTRACT_BY_ID: (id) => `${BASE_URL}/contracts/${id}`,
  MY_CONTRACTS: `${BASE_URL}/contracts/mycontracts`,
  COMPLETE_CONTRACT: (id) => `${BASE_URL}/contracts/${id}/complete`,
  UPDATE_HOURS_WORKED: (id) => `${BASE_URL}/contracts/${id}/hours`,
  SUBMIT_WORK: (contractId) => `${BASE_URL}/contracts/${contractId}/submit-work`,
  REVIEW_WORK: (contractId, deliverableId) => `${BASE_URL}/contracts/${contractId}/review/${deliverableId}`,

  // Reviews
  REVIEWS: `${BASE_URL}/reviews`,
  REVIEW_BY_ID: (id) => `${BASE_URL}/reviews/${id}`,
  REVIEWS_BY_REVIEWER: (reviewerId) => `${BASE_URL}/reviews/reviewer/${reviewerId}`,
  REVIEWS_BY_REVIEWEE: (revieweeId) => `${BASE_URL}/reviews/reviewee/${revieweeId}`,
  REVIEWS_BY_CONTRACT: (contractId) => `${BASE_URL}/reviews/contract/${contractId}`,
  CREATE_REVIEW: `${BASE_URL}/reviews`,
  UPDATE_REVIEW: (id) => `${BASE_URL}/reviews/${id}`,
  DELETE_REVIEW: (id) => `${BASE_URL}/reviews/${id}`,
  ADD_REVIEW_REPLY: (id) => `${BASE_URL}/reviews/${id}/reply`,
  UPDATE_REVIEW_REPLY: (id) => `${BASE_URL}/reviews/${id}/reply`,
  DELETE_REVIEW_REPLY: (id) => `${BASE_URL}/reviews/${id}/reply`,

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

  // Funds & PayPal
  CREATE_PAYPAL_ORDER: `${BASE_URL}/funds/paypal/create-order`,
  CAPTURE_PAYPAL_ORDER: `${BASE_URL}/funds/paypal/capture-order`,
  ADD_FUNDS: `${BASE_URL}/funds/add`,
  ADD_FUNDS_MOCK: `${BASE_URL}/funds/add-mock`,

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
  PARSE_CV: `${BASE_URL}/upload/parse-cv`,

  // Chat
  CHAT_CONVERSATIONS: `${BASE_URL}/chat/conversations`,
  CHAT_CONVERSATION_BY_ID: (id) => `${BASE_URL}/chat/conversation/${id}`,
  CHAT_MESSAGES: (conversationId) => `${BASE_URL}/chat/conversation/${conversationId}/messages`,
  CHAT_CREATE_CONVERSATION: `${BASE_URL}/chat/conversation`,
  CHAT_SEND_MESSAGE: (conversationId) => `${BASE_URL}/chat/conversation/${conversationId}/messages`,
  CHAT_MARK_READ: (conversationId) => `${BASE_URL}/chat/conversation/${conversationId}/read`,

  // Job Invitations
  JOB_INVITATIONS_MY_OPEN_JOBS: `${BASE_URL}/job-invitations/my-open-jobs`,
  JOB_INVITATIONS_SEND: `${BASE_URL}/job-invitations/send`,
  JOB_INVITATIONS_MY_INVITATIONS: `${BASE_URL}/job-invitations/my-invitations`,
  JOB_INVITATIONS_UPDATE_STATUS: (id) => `${BASE_URL}/job-invitations/${id}/status`,

  // Payments
  PAYMENTS: `${BASE_URL}/payments`,
  PAYMENT_BY_ID: (id) => `${BASE_URL}/payments/${id}`,
  MY_PAYMENTS: `${BASE_URL}/payments/mine`,
  PROCESS_PAYMENT: (id) => `${BASE_URL}/payments/${id}/process`,
  REFUND_PAYMENT: (id) => `${BASE_URL}/payments/${id}/refund`,

  // Contract Modifications
  CONTRACT_MODIFICATIONS: `${BASE_URL}/contract-modifications`,
  CONTRACT_MODIFICATION_BY_ID: (id) => `${BASE_URL}/contract-modifications/${id}`,
  CONTRACT_MODIFICATIONS_BY_CONTRACT: (contractId) => `${BASE_URL}/contract-modifications/contract/${contractId}`,
  MY_MODIFICATION_REQUESTS: `${BASE_URL}/contract-modifications/my-requests`,
  RESPOND_TO_MODIFICATION: (requestId) => `${BASE_URL}/contract-modifications/${requestId}/respond`,

  // Statistics
  STATISTICS_PLATFORM: `${BASE_URL}/statistics/platform`,
  STATISTICS_GROWTH: `${BASE_URL}/statistics/growth`,
  STATISTICS_DASHBOARD: `${BASE_URL}/statistics/dashboard`,

  // Funds
  ADD_FUNDS: `${BASE_URL}/funds/add`,
};

// Direct exports for backward compatibility
export const {
  REGISTER, LOGIN, PROFILE, UPDATE_PROFILE, CHANGE_PASSWORD,
  FORGOT_PASSWORD, VERIFY_RESET_TOKEN, RESET_PASSWORD,
  CATEGORIES, CATEGORY_BY_ID, COUNTRIES, SPECIALTIES, SPECIALTIES_BY_CATEGORY,
  SKILLS, SKILLS_BY_SPECIALTY,
  USERS, USER_BY_ID, UPDATE_PROFILE_PICTURE, PROFILE_COMPLETION, UPDATE_ONLINE_STATUS,
  JOBS, JOBS_ALL, JOBS_CREATE, JOB_BY_ID, JOBS_SEARCH, JOBS_BY_CLIENT,
  PROPOSALS, PROPOSAL_CREATE, PROPOSAL_BY_ID, PROPOSAL_BY_JOB, MY_PROPOSALS,
  PROPOSAL_ACCEPT, PROPOSAL_REJECT, WITHDRAW_PROPOSAL,
  CONTRACTS, CONTRACT_BY_ID, MY_CONTRACTS, COMPLETE_CONTRACT, UPDATE_HOURS_WORKED,
  SUBMIT_WORK, REVIEW_WORK,
  REVIEWS, REVIEW_BY_ID, REVIEWS_BY_REVIEWER, REVIEWS_BY_REVIEWEE, REVIEWS_BY_CONTRACT,
  CREATE_REVIEW, UPDATE_REVIEW, DELETE_REVIEW,
  NOTIFICATIONS, NOTIFICATION_BY_ID, NOTIFICATION_MARK_READ, NOTIFICATIONS_MARK_ALL_READ,
  NOTIFICATIONS_UNREAD_COUNT, NOTIFICATIONS_DELETE_ALL,
  FAVORITES, MY_FAVORITES, CHECK_FAVORITE,
  PORTFOLIO, PORTFOLIO_BY_ID, MY_PORTFOLIO, LIKE_PORTFOLIO, INCREMENT_PORTFOLIO_VIEWS,
  UPLOAD_PROFILE_PICTURE, UPLOAD_PORTFOLIO_IMAGES, UPLOAD_ATTACHMENTS, DELETE_FILE,
  CHAT_CONVERSATIONS, CHAT_CONVERSATION_BY_ID, CHAT_MESSAGES, CHAT_CREATE_CONVERSATION,
  CHAT_SEND_MESSAGE, CHAT_MARK_READ,
  PAYMENTS, PAYMENT_BY_ID, MY_PAYMENTS, PROCESS_PAYMENT, REFUND_PAYMENT,
  STATISTICS_PLATFORM, STATISTICS_GROWTH, STATISTICS_DASHBOARD,
  ADD_FUNDS
} = API_ENDPOINTS;