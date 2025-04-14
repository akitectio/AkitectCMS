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
  ROLES: '/roles',
};

// Add a base path for admin routes if needed
const ADMIN_PREFIX = '/admin';

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

// Admin User Management endpoints
export const ADMIN_USER_ENDPOINTS = {
  BASE: API_PATHS.USERS,
  GET_ALL: `${API_PATHS.USERS}`,
  GET_BY_ID: (id: string | number) => `${API_PATHS.USERS}/${id}`,
  CREATE: `${API_PATHS.USERS}`,
  UPDATE: (id: string | number) => `${API_PATHS.USERS}/${id}`,
  DELETE: (id: string | number) => `${API_PATHS.USERS}/${id}`,
  LOCK: (id: string | number) => `${API_PATHS.USERS}/${id}/lock`,
  UNLOCK: (id: string | number) => `${API_PATHS.USERS}/${id}/unlock`,
  RESET_PASSWORD: (id: string | number) => `${API_PATHS.USERS}/${id}/reset-password`,
  TOGGLE_SUPER_ADMIN: (id: string | number) => `${API_PATHS.USERS}/${id}/toggle-super-admin`,
};

// Permission endpoints
export const PERMISSION_ENDPOINTS = {
  GET_ALL: API_PATHS.PERMISSIONS,
  GET_ALL_TREE: `${API_PATHS.PERMISSIONS}/tree`, // Get all permissions as a tree structure without pagination
  GET_BY_ID: (id: string | number) => `${API_PATHS.PERMISSIONS}/${id}`,
  CREATE: API_PATHS.PERMISSIONS,
  UPDATE: (id: string | number) => `${API_PATHS.PERMISSIONS}/${id}`,
  DELETE: (id: string | number) => `${API_PATHS.PERMISSIONS}/${id}`,
  SEARCH: `${API_PATHS.PERMISSIONS}?search=:query&page=:page&size=:size&sortBy=:sortBy&direction=:direction`,
};

// Role endpoints
export const ROLE_ENDPOINTS = {
  GET_ALL: API_PATHS.ROLES,
  GET_ALL_TREE: `${API_PATHS.ROLES}/tree`, // Get all roles as a tree structure without pagination
  GET_BY_ID: (id: string | number) => `${API_PATHS.ROLES}/${id}`,
  CREATE: API_PATHS.ROLES,
  UPDATE: (id: string | number) => `${API_PATHS.ROLES}/${id}`,
  DELETE: (id: string | number) => `${API_PATHS.ROLES}/${id}`,
  ADD_PERMISSIONS: (id: string | number) => `${API_PATHS.ROLES}/${id}/permissions`,
  REMOVE_PERMISSIONS: (id: string | number) => `${API_PATHS.ROLES}/${id}/permissions`,
  SEARCH: `${API_PATHS.ROLES}?search=:query&page=:page&size=:size&sortBy=:sortBy&direction=:direction`,
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
  GET_ALL: `${API_PATHS.CATEGORIES}`,
  GET_ALL_TREE: `${API_PATHS.CATEGORIES}/tree`, // Get all categories as a tree structure without pagination
  GET_BY_ID: (id: string | number) => `${API_PATHS.CATEGORIES}/${id}`,
  CREATE: `${API_PATHS.CATEGORIES}`,
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

// Add endpoints for session management
export const SESSION_ENDPOINTS = {
  GET_MY_ACTIVE: `${API_PATHS.AUTH}/sessions/my`,
  GET_MY_HISTORY: `${API_PATHS.AUTH}/sessions/my/history`,
  REVOKE_SESSION: (sessionId) => `${API_PATHS.AUTH}/sessions/${sessionId}`,
  REVOKE_OTHER_SESSIONS: `${API_PATHS.AUTH}/sessions/revoke-others`,
  GET_USER_SESSIONS: (userId) => `${ADMIN_PREFIX}${API_PATHS.AUTH}/sessions/user/${userId}`,
  REVOKE_USER_SESSION: (userId, sessionId) => `${ADMIN_PREFIX}${API_PATHS.AUTH}/sessions/user/${userId}/session/${sessionId}`,
};