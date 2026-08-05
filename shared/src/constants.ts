/**
 * DevTrack AI Centralized Constants
 */

export const APP_NAME = 'DevTrack AI';

export enum UserRole {
  GUEST = 'guest',
  USER = 'user',
  ADMIN = 'admin',
}

export enum ProjectStatus {
  PLANNING = 'planning',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  PAUSED = 'paused',
}

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
}

export enum DsaDifficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
}

// Route Definitions (Frontend and Backend version prefix)
export const ROUTES = {
  HOME: '/',
  FEATURES: '/features',
  ABOUT: '/about',
  FAQ: '/faq',
  CONTACT: '/contact',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  RESUME: '/resume',
  ATS: '/ats',
  PORTFOLIO: '/portfolio',
  PROJECTS: '/projects',
  DSA: '/dsa',
  INTERVIEW: '/interview',
  AI: '/ai',
  ANALYTICS: '/analytics',
  SETTINGS: '/settings',
  
  ADMIN: '/admin',
  ADMIN_USERS: '/admin/users',
  ADMIN_SYSTEM: '/admin/system',
};

export const API_BASE = '/api/v1';

export const API_ROUTES = {
  HEALTH: `${API_BASE}/health`,
  AUTH: {
    REGISTER: `${API_BASE}/auth/register`,
    LOGIN: `${API_BASE}/auth/login`,
    LOGOUT: `${API_BASE}/auth/logout`,
    SESSION: `${API_BASE}/auth/session`,
    FORGOT: `${API_BASE}/auth/forgot-password`,
    RESET: `${API_BASE}/auth/reset-password`,
  },
  PROFILE: `${API_BASE}/profile`,
  RESUMES: `${API_BASE}/resumes`,
  PROJECTS: `${API_BASE}/projects`,
  DSA: `${API_BASE}/dsa`,
  INTERVIEWS: `${API_BASE}/interviews`,
  AI: `${API_BASE}/ai`,
  ANALYTICS: `${API_BASE}/analytics`,
  SETTINGS: `${API_BASE}/settings`,
};

// Design & System Tokens
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
};

export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  XXL: 1536,
};

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
};

export const LIMITS = {
  MAX_FILE_SIZE_BYTES: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf'],
};

export const MESSAGES = {
  ERROR: {
    GENERIC: 'Something went wrong. Please try again.',
    UNAUTHORIZED: 'You must be logged in to access this page.',
    FORBIDDEN: 'You do not have permission to perform this action.',
    NOT_FOUND: 'The requested resource was not found.',
    VALIDATION: 'Please correct the highlighted errors.',
  },
  SUCCESS: {
    SAVED: 'Changes saved successfully.',
    DELETED: 'Resource deleted successfully.',
    CREATED: 'Resource created successfully.',
  },
};

export const PERMISSIONS = {
  READ_ADMIN: 'admin:read',
  WRITE_ADMIN: 'admin:write',
  MANAGE_USERS: 'users:manage',
  USE_AI: 'ai:use',
};
