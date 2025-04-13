import { User, UserCreateRequest, UserUpdateRequest } from '@app/types/user';
import apiService from './api';
import { ADMIN_USER_ENDPOINTS } from './apiEndpoints';

// Define interfaces for API requests and responses
interface GetAllUsersParams {
  page?: number;
  size?: number;
  sortBy?: string;
  direction?: string;
  search?: string;
}

interface UsersResponse {
  users: User[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
}

/**
 * Get all users with pagination, sorting, and search
 * @param params Parameters for pagination, sorting, and search
 * @returns A promise with the users data and pagination info
 */
export const getAllUsers = async (
  params: GetAllUsersParams = {}
): Promise<UsersResponse> => {
  const { page = 0, size = 10, sortBy = 'id', direction = 'asc', search = '' } = params;
  
  const queryParams = new URLSearchParams();
  queryParams.append('page', page.toString());
  queryParams.append('size', size.toString());
  queryParams.append('sortBy', sortBy);
  queryParams.append('direction', direction);
  
  if (search) {
    queryParams.append('search', search);
  }
  
  const url = `${ADMIN_USER_ENDPOINTS.GET_ALL}?${queryParams.toString()}`;
  return await apiService.get<UsersResponse>(url);
};

/**
 * Get a user by ID
 * @param id The ID of the user to retrieve
 * @returns A promise with the user data
 */
export const getUserById = async (id: string | number): Promise<User> => {
  return await apiService.get<User>(ADMIN_USER_ENDPOINTS.GET_BY_ID(id));
};

/**
 * Create a new user
 * @param data The user data to create
 * @returns A promise with the created user
 */
export const createUser = async (data: UserCreateRequest): Promise<User> => {
  return await apiService.post<User>(ADMIN_USER_ENDPOINTS.CREATE, data);
};

/**
 * Update an existing user
 * @param id The ID of the user to update
 * @param data The user data to update
 * @returns A promise with the updated user
 */
export const updateUser = async (
  id: string | number, 
  data: UserUpdateRequest
): Promise<User> => {
  return await apiService.put<User>(ADMIN_USER_ENDPOINTS.UPDATE(id), data);
};

/**
 * Delete a user
 * @param id The ID of the user to delete
 * @returns A promise with the result
 */
export const deleteUser = async (id: string | number): Promise<void> => {
  return await apiService.delete(ADMIN_USER_ENDPOINTS.DELETE(id));
};

/**
 * Lock a user account
 * @param id The ID of the user to lock
 * @returns A promise with the updated user
 */
export const lockUser = async (id: string | number): Promise<User> => {
  return await apiService.put<User>(ADMIN_USER_ENDPOINTS.LOCK(id), {});
};

/**
 * Unlock a user account
 * @param id The ID of the user to unlock
 * @returns A promise with the updated user
 */
export const unlockUser = async (id: string | number): Promise<User> => {
  return await apiService.put<User>(ADMIN_USER_ENDPOINTS.UNLOCK(id), {});
};

/**
 * Reset a user's password
 * @param id The ID of the user
 * @param newPassword The new password
 * @returns A promise with the updated user
 */
export const resetUserPassword = async (
  id: string | number,
  newPassword: string
): Promise<User> => {
  const queryParams = new URLSearchParams();
  queryParams.append('newPassword', newPassword);
  const url = `${ADMIN_USER_ENDPOINTS.RESET_PASSWORD(id)}?${queryParams.toString()}`;
  return await apiService.put<User>(url, {});
};

/**
 * Check if a username or email is available
 * @param username The username to check (optional)
 * @param email The email to check (optional)
 * @param excludeUserId User ID to exclude from check (for updates)
 * @returns A promise with the availability status
 */
export const checkAvailability = async (
  params: { 
    username?: string; 
    email?: string; 
    excludeUserId?: string 
  }
): Promise<{ usernameAvailable?: boolean; emailAvailable?: boolean }> => {
  const { username, email, excludeUserId } = params;
  
  const queryParams = new URLSearchParams();
  if (username) queryParams.append('username', username);
  if (email) queryParams.append('email', email);
  if (excludeUserId) queryParams.append('excludeUserId', excludeUserId);
  
  const url = `${ADMIN_USER_ENDPOINTS.BASE}/check-availability?${queryParams.toString()}`;
  return await apiService.get<{ usernameAvailable?: boolean; emailAvailable?: boolean }>(url);
};

/**
 * Toggle the superAdmin status of a user
 * @param id The ID of the user
 * @param isSuperAdmin The new superAdmin status
 * @returns A promise with the updated user
 */
export const toggleSuperAdmin = async (
  id: string | number,
  isSuperAdmin: boolean
): Promise<User> => {
  const url = `${ADMIN_USER_ENDPOINTS.TOGGLE_SUPER_ADMIN(id)}`;
  return await apiService.put<User>(url, { superAdmin: isSuperAdmin });
};

const userService = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  lockUser,
  unlockUser,
  resetUserPassword,
  checkAvailability,
  toggleSuperAdmin
};

export default userService;