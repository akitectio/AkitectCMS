import {
  Role,
  RoleCreateRequest,
  RoleUpdateRequest
} from '@app/types/user';
import apiService from './api';
import { ROLE_ENDPOINTS } from './apiEndpoints';

interface GetAllRolesParams {
  page?: number;
  size?: number;
  sortBy?: string;
  direction?: string;
  search?: string;
}

interface RolesResponse {
  roles: Role[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
}

/**
 * Get all roles with pagination and sorting
 * @param params Parameters for pagination and sorting
 * @returns A promise with the roles data and pagination info
 */
export const getAllRoles = async (
  params: GetAllRolesParams = {}
): Promise<RolesResponse> => {
  const { page = 0, size = 10, sortBy = 'name', direction = 'asc', search = '' } = params;
  
  const queryParams = new URLSearchParams();
  queryParams.append('page', page.toString());
  queryParams.append('size', size.toString());
  queryParams.append('sortBy', sortBy);
  queryParams.append('direction', direction);
  
  if (search) {
    queryParams.append('search', search);
  }
  
  const url = `${ROLE_ENDPOINTS.GET_ALL}?${queryParams.toString()}`;
  return await apiService.get<RolesResponse>(url);
};

/**
 * Get a role by ID
 * @param id The ID of the role to retrieve
 * @returns A promise with the role data
 */
export const getRoleById = async (id: number | string): Promise<Role> => {
  return await apiService.get<Role>(ROLE_ENDPOINTS.GET_BY_ID(id));
};

/**
 * Create a new role
 * @param data The role data to create
 * @returns A promise with the created role
 */
export const createRole = async (data: RoleCreateRequest): Promise<Role> => {
  return await apiService.post<Role>(ROLE_ENDPOINTS.CREATE, data);
};

/**
 * Update an existing role
 * @param id The ID of the role to update
 * @param data The role data to update
 * @returns A promise with the updated role
 */
export const updateRole = async (
  id: number | string, 
  data: RoleUpdateRequest
): Promise<Role> => {
  return await apiService.put<Role>(ROLE_ENDPOINTS.UPDATE(id), data);
};

/**
 * Delete a role
 * @param id The ID of the role to delete
 * @returns A promise with the result
 */
export const deleteRole = async (id: number | string): Promise<void> => {
  return await apiService.delete(ROLE_ENDPOINTS.DELETE(id));
};

/**
 * Add permissions to a role
 * @param roleId The ID of the role
 * @param permissionIds Array of permission IDs to add
 */
export const addPermissionsToRole = async (
  roleId: number | string,
  permissionIds: string[]  // Changed from number[] to string[]
): Promise<void> => {
  return await apiService.post(ROLE_ENDPOINTS.ADD_PERMISSIONS(roleId), { permissionIds });
};

/**
 * Remove permissions from a role
 * @param roleId The ID of the role
 * @param permissionIds Array of permission IDs to remove
 */
export const removePermissionsFromRole = async (
  roleId: number | string,
  permissionIds: string[]  // Changed from number[] to string[]
): Promise<void> => {
  return await apiService.post(ROLE_ENDPOINTS.REMOVE_PERMISSIONS(roleId), { permissionIds });
};

/**
 * Search roles with query, pagination, and sorting
 * @param query The search query
 * @param page The page number
 * @param size The number of items per page
 * @param sortBy The field to sort by
 * @param direction The sort direction (asc/desc)
 * @returns A promise with the roles data and pagination info
 */
export const searchRoles = async (
  query: string,
  page: number = 0,
  size: number = 10,
  sortBy: string = 'name',
  direction: string = 'asc'
): Promise<RolesResponse> => {
  const url = ROLE_ENDPOINTS.SEARCH
    .replace(':query', encodeURIComponent(query))
    .replace(':page', page.toString())
    .replace(':size', size.toString())
    .replace(':sortBy', sortBy)
    .replace(':direction', direction);

  return await apiService.get<RolesResponse>(url);
};

/**
 * Search permissions with query, pagination, and sorting
 * @param query The search query
 * @param page The page number
 * @param size The number of items per page
 * @param sortBy The field to sort by
 * @param direction The sort direction (asc/desc)
 * @returns A promise with the permissions data and pagination info
 */
export const searchPermissions = async (
  query: string,
  page: number = 0,
  size: number = 20,
  sortBy: string = 'createdAt',
  direction: string = 'desc'
): Promise<any> => {
  const url = PERMISSION_ENDPOINTS.SEARCH
    .replace(':query', encodeURIComponent(query))
    .replace(':page', page.toString())
    .replace(':size', size.toString())
    .replace(':sortBy', sortBy)
    .replace(':direction', direction);

  return await apiService.get<any>(url);
};