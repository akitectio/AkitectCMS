import { toast } from 'react-toastify';
import { call, put, takeLatest } from 'redux-saga/effects';

import {
    createRole,
    deleteRole,
    getAllRoles,
    getRoleById,
    updateRole
} from '@app/services/roles';
import {
    createRoleFailure,
    createRoleRequest,
    createRoleSuccess,
    deleteRoleFailure,
    deleteRoleRequest,
    deleteRoleSuccess,
    fetchRoleFailure,
    fetchRoleRequest,
    fetchRoleSuccess,
    fetchRolesFailure,
    fetchRolesRequest,
    fetchRolesSuccess,
    updateRoleFailure,
    updateRoleRequest,
    updateRoleSuccess
} from '@app/store/reducers/roles';
import { Role } from '../../types/role';

// Fetch roles list
export function* handleFetchRoles(
  action: ReturnType<typeof fetchRolesRequest>
): Generator<any, void, any> {
  try {
    const { page = 0, size = 10, sortBy = 'name', direction = 'asc' } = action.payload;
    
    // Call the API
    const response = yield call(getAllRoles, {
      page,
      size,
      sortBy,
      direction
    });
    
    // Check if response is an array (direct roles data)
    const roles = Array.isArray(response) 
      ? response 
      : response.roles || response.content || response.data || [];
    
    // Get pagination data or use defaults
    const paginationData = !Array.isArray(response) ? {
      currentPage: response.currentPage || response.number || page,
      totalItems: response.totalItems || response.totalElements || roles.length,
      totalPages: response.totalPages || Math.ceil(roles.length / size) || 1
    } : {
      currentPage: page,
      totalItems: roles.length,
      totalPages: Math.ceil(roles.length / size) || 1
    };
    
    // Update the store
    yield put(fetchRolesSuccess({
      roles,
      currentPage: paginationData.currentPage,
      totalItems: paginationData.totalItems,
      totalPages: paginationData.totalPages
    }));
  } catch (error: any) {
    // Extract error message
    const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch roles';
    
    // Update the store with the error
    yield put(fetchRolesFailure(errorMessage));
    
    // Show error message
    toast.error(errorMessage);
  }
}

// Fetch single role
export function* handleFetchRole(
  action: ReturnType<typeof fetchRoleRequest>
): Generator<any, void, any> {
  try {
    // ID is passed directly as payload in the updated reducer
    const id = action.payload;
    
    // Call the API
    const response: Role = yield call(getRoleById, id);
    
    // Update the store
    yield put(fetchRoleSuccess(response));
  } catch (error: any) {
    // Extract error message
    const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch role details';
    
    // Update the store with the error
    yield put(fetchRoleFailure(errorMessage));
    
    // Show error message
    toast.error(errorMessage);
  }
}

// Create role
export function* handleCreateRole(
  action: ReturnType<typeof createRoleRequest>
): Generator<any, void, any> {
  try {
    const roleData = action.payload;
    
    // Call the API
    const response: Role = yield call(createRole, roleData);
    
    // Update the store
    yield put(createRoleSuccess(response));
    
    // Show success message
    toast.success('Role created successfully');
  } catch (error: any) {
    // Extract error message
    const errorMessage = error.response?.data?.message || error.message || 'Failed to create role';
    
    // Update the store with the error
    yield put(createRoleFailure(errorMessage));
    
    // Show error message
    toast.error(errorMessage);
  }
}

// Update role
export function* handleUpdateRole(
  action: ReturnType<typeof updateRoleRequest>
): Generator<any, void, any> {
  try {
    const { id, ...roleData } = action.payload;
    
    // Đảm bảo cấu trúc dữ liệu đúng trước khi gửi đi
    const formattedData = {
      name: roleData.name,
      description: roleData.description,
      permissionIds: roleData.permissionIds || []
    };
    
    // Call the API
    const response: Role = yield call(updateRole, id, formattedData);
    
    // Update the store
    yield put(updateRoleSuccess(response));
    
    // Show success message
    toast.success('Role updated successfully');
  } catch (error: any) {
    // Extract error message
    const errorMessage = error.response?.data?.message || error.message || 'Failed to update role';
    
    // Log detailed error information for debugging
    console.error('Update role error:', error);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    
    // Update the store with the error
    yield put(updateRoleFailure(errorMessage));
    
    // Show error message
    toast.error(errorMessage);
  }
}

// Delete role
export function* handleDeleteRole(
  action: ReturnType<typeof deleteRoleRequest>
): Generator<any, void, any> {
  try {
    // ID is passed directly as payload in the updated reducer
    const id = action.payload;
    
    // Call the API
    yield call(deleteRole, id);
    
    // Update the store
    yield put(deleteRoleSuccess({ id }));
    
    // Show success message
    toast.success('Role deleted successfully');
  } catch (error: any) {
    // Extract error message
    const errorMessage = error.response?.data?.message || error.message || 'Failed to delete role';
    
    // Update the store with the error
    yield put(deleteRoleFailure(errorMessage));
    
    // Show error message
    toast.error(errorMessage);
  }
}

// Roles Sagas
export function* watchRolesSagas() {
  yield takeLatest(fetchRolesRequest.type, handleFetchRoles);
  yield takeLatest(fetchRoleRequest.type, handleFetchRole);
  yield takeLatest(createRoleRequest.type, handleCreateRole);
  yield takeLatest(updateRoleRequest.type, handleUpdateRole);
  yield takeLatest(deleteRoleRequest.type, handleDeleteRole);
}