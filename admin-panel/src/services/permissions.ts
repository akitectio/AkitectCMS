import {
    Permission,
    PermissionCreateRequest,
    PermissionUpdateRequest
} from '@app/types/user';
import apiService from './api';
import { PERMISSION_ENDPOINTS } from './apiEndpoints';

interface GetAllPermissionsParams {
  page?: number;
  size?: number;
  sortBy?: string;
  direction?: string;
  search?: string;
}

interface PermissionsResponse {
  permissions: Permission[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
}

/**
 * Get all permissions with pagination and sorting
 * @param params Parameters for pagination and sorting
 * @returns A promise with the permissions data and pagination info
 */
export const getAllPermissions = async (
  params: GetAllPermissionsParams = {}
): Promise<PermissionsResponse> => {
  const { page = 0, size = 10, sortBy = 'name', direction = 'asc', search = '' } = params;
  
  const queryParams = new URLSearchParams();
  queryParams.append('page', page.toString());
  queryParams.append('size', size.toString());
  queryParams.append('sortBy', sortBy);
  queryParams.append('direction', direction);
  
  if (search) {
    queryParams.append('search', search);
  }
  
  const url = `${PERMISSION_ENDPOINTS.GET_ALL}?${queryParams.toString()}`;
  return await apiService.get<PermissionsResponse>(url);
};

/**
 * Get a permission by ID
 * @param id The ID of the permission to retrieve
 * @returns A promise with the permission data
 */
export const getPermissionById = async (id: number | string): Promise<Permission> => {
  return await apiService.get<Permission>(PERMISSION_ENDPOINTS.GET_BY_ID(id));
};

/**
 * Create a new permission
 * @param data The permission data to create
 * @returns A promise with the created permission
 */
export const createPermission = async (data: PermissionCreateRequest): Promise<Permission> => {
  return await apiService.post<Permission>(PERMISSION_ENDPOINTS.CREATE, data);
};

/**
 * Update an existing permission
 * @param id The ID of the permission to update
 * @param data The permission data to update
 * @returns A promise with the updated permission
 */
export const updatePermission = async (
  id: number | string, 
  data: PermissionUpdateRequest
): Promise<Permission> => {
  return await apiService.put<Permission>(PERMISSION_ENDPOINTS.UPDATE(id), data);
};

/**
 * Delete a permission
 * @param id The ID of the permission to delete
 * @returns A promise with the result
 */
export const deletePermission = async (id: number | string): Promise<void> => {
  return await apiService.delete(PERMISSION_ENDPOINTS.DELETE(id));
};