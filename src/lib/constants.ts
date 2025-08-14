// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/v1/';
export const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT || '10000'); // 10 seconds

// Auth Constants
export const TOKEN_REFRESH_INTERVAL = parseInt(
  import.meta.env.VITE_TOKEN_REFRESH_INTERVAL || '300000' // 5 minutes
);
export const CACHE_DURATION = parseInt(
  import.meta.env.VITE_CACHE_TIME || '3600000' // 1 hour
);

// Storage Keys (Prevents typos)
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'terra_token',
  REFRESH_TOKEN: 'terra_refresh_token',
  USER_DATA: 'terra_user_data'
} as const;

// Error Messages (Centralized for easy i18n)
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Server unavailable. Please check your connection.',
  UNAUTHORIZED: 'Session expired. Redirecting to login...',
  DEFAULT: 'An unexpected error occurred'
};

// API Tag Types (For RTK Query cache)
export const TAG_TYPES = {
  ORGANIZATION: 'Organization',
  ESG: 'ESG',
  USER: 'User',
  STAKEHOLDER: 'Stakeholder'
} as const;

// Pagination Defaults (For large datasets)
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 25,
  MAX_PAGE_SIZE: 100
};