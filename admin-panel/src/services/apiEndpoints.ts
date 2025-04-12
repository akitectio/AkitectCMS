/**
 * API Endpoints
 * Centralized location for all API endpoints
 */

// Base API paths
const API_PATHS = {
  AUTH: '/auth',
  USERS: '/users',
  POSTS: '/posts',
  CATEGORIES: '/categories',
  MEDIA: '/media',
  SETTINGS: '/settings',
  PERMISSIONS: '/permissions',
};

// Auth endpoints
export const AUTH_ENDPOINTS = {
  LOGIN: `${API_PATHS.AUTH}/login`,
  REGISTER: `${API_PATHS.AUTH}/register`,
  LOGOUT: `${API_PATHS.AUTH}/logout`,
  REFRESH_TOKEN: `${API_PATHS.AUTH}/refresh-token`,
  FORGOT_PASSWORD: `${API_PATHS.AUTH}/forgot-password`,
  RESET_PASSWORD: `${API_PATHS.AUTH}/reset-password`,
  VERIFY_EMAIL: `${API_PATHS.AUTH}/verify-email`,
};

// User endpoints
export const USER_ENDPOINTS = {
  GET_ALL: API_PATHS.USERS,
  GET_BY_ID: (id: string | number) => `${API_PATHS.USERS}/${id}`,
  CREATE: API_PATHS.USERS,
  UPDATE: (id: string | number) => `${API_PATHS.USERS}/${id}`,
  DELETE: (id: string | number) => `${API_PATHS.USERS}/${id}`,
  PROFILE: `${API_PATHS.USERS}/profile`,
  UPDATE_PROFILE: `${API_PATHS.USERS}/profile`,
  CHANGE_PASSWORD: `${API_PATHS.USERS}/change-password`,
};

// Permission endpoints
export const PERMISSION_ENDPOINTS = {
  GET_ALL: API_PATHS.PERMISSIONS,
  GET_BY_ID: (id: string | number) => `${API_PATHS.PERMISSIONS}/${id}`,
  CREATE: API_PATHS.PERMISSIONS,
  UPDATE: (id: string | number) => `${API_PATHS.PERMISSIONS}/${id}`,
  DELETE: (id: string | number) => `${API_PATHS.PERMISSIONS}/${id}`,
};

// Post endpoints
export const POST_ENDPOINTS = {
  GET_ALL: API_PATHS.POSTS,
  GET_BY_ID: (id: string | number) => `${API_PATHS.POSTS}/${id}`,
  CREATE: API_PATHS.POSTS,
  UPDATE: (id: string | number) => `${API_PATHS.POSTS}/${id}`,
  DELETE: (id: string | number) => `${API_PATHS.POSTS}/${id}`,
  FEATURED: `${API_PATHS.POSTS}/featured`,
  BY_CATEGORY: (categoryId: string | number) => `${API_PATHS.POSTS}/category/${categoryId}`,
  SEARCH: `${API_PATHS.POSTS}/search`,
};

// Category endpoints
export const CATEGORY_ENDPOINTS = {
  GET_ALL: API_PATHS.CATEGORIES,
  GET_BY_ID: (id: string | number) => `${API_PATHS.CATEGORIES}/${id}`,
  CREATE: API_PATHS.CATEGORIES,
  UPDATE: (id: string | number) => `${API_PATHS.CATEGORIES}/${id}`,
  DELETE: (id: string | number) => `${API_PATHS.CATEGORIES}/${id}`,
};

// Media endpoints
export const MEDIA_ENDPOINTS = {
  UPLOAD: `${API_PATHS.MEDIA}/upload`,
  GET_ALL: API_PATHS.MEDIA,
  GET_BY_ID: (id: string | number) => `${API_PATHS.MEDIA}/${id}`,
  DELETE: (id: string | number) => `${API_PATHS.MEDIA}/${id}`,
};

// Settings endpoints
export const SETTINGS_ENDPOINTS = {
  GET_ALL: API_PATHS.SETTINGS,
  UPDATE: API_PATHS.SETTINGS,
  GET_BY_KEY: (key: string) => `${API_PATHS.SETTINGS}/${key}`,
  UPDATE_BY_KEY: (key: string) => `${API_PATHS.SETTINGS}/${key}`,
};