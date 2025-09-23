// API Endpoints Configuration
export const API_ENDPOINTS = {
  // Authentication
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  LOGOUT: '/api/auth/logout',
  REFRESH_TOKEN: '/api/auth/refresh',
  VERIFY_TOKEN: '/api/auth/verify',
  
  // OAuth
  OAUTH_GOOGLE: '/api/auth/oauth/google',
  OAUTH_GITHUB: '/api/auth/oauth/github',
  
  // User Management
  GET_PROFILE: '/api/user/profile',
  UPDATE_PROFILE: '/api/user/profile',
  CHANGE_PASSWORD: '/api/user/change-password',
  
  // Services (for future use)
  SERVICES: '/api/services',
  APPOINTMENTS: '/api/appointments',
  PROJECTS: '/api/projects',
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user_data',
  REMEMBER_ME: 'remember_me',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'Invalid email or password',
  USER_NOT_FOUND: 'User not found',
  EMAIL_ALREADY_EXISTS: 'Email already exists',
  WEAK_PASSWORD: 'Password must be at least 8 characters long',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to access this resource',
  SESSION_EXPIRED: 'Your session has expired. Please login again.',
  VALIDATION_ERROR: 'Please check your input and try again',
} as const;

// Validation Rules
export const VALIDATION_RULES = {
  EMAIL: {
    REQUIRED: 'Email is required',
    INVALID: 'Please enter a valid email address',
  },
  PASSWORD: {
    REQUIRED: 'Password is required',
    MIN_LENGTH: 'Password must be at least 8 characters long',
    PATTERN: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
  },
  NAME: {
    REQUIRED: 'Name is required',
    MIN_LENGTH: 'Name must be at least 2 characters long',
  },
  PHONE: {
    REQUIRED: 'Phone number is required',
    INVALID: 'Please enter a valid phone number',
  },
} as const;