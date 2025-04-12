import { toast } from 'react-toastify';
import { call, put, takeLatest } from 'redux-saga/effects';

import {
    createPermission,
    deletePermission,
    getAllPermissions,
    getPermissionById,
    updatePermission
} from '@app/services/permissions';
import {
    createPermissionFailure,
    createPermissionRequest,
    createPermissionSuccess,
    deletePermissionFailure,
    deletePermissionRequest,
    deletePermissionSuccess,
    fetchPermissionFailure,
    fetchPermissionRequest,
    fetchPermissionSuccess,
    fetchPermissionsFailure,
    fetchPermissionsRequest,
    fetchPermissionsSuccess,
    updatePermissionFailure,
    updatePermissionRequest,
    updatePermissionSuccess
} from '@app/store/reducers/permissions';
import { Permission } from '@app/types/user';

// Fetch permissions list
export function* handleFetchPermissions(
  action: ReturnType<typeof fetchPermissionsRequest>
): Generator<any, void, any> {
  try {
    const { page = 0, size = 100, sortBy = 'name', direction = 'asc' } = action.payload;
    
    // Call the API
    const response = yield call(getAllPermissions, {
      page,
      size,
      sortBy,
      direction
    });
    
    // Check if response is an array (direct permissions data)
    const permissions = Array.isArray(response) 
      ? response 
      : response.permissions || response.content || response.data || [];
    
    // Get pagination data or use defaults
    const paginationData = !Array.isArray(response) ? {
      currentPage: response.currentPage || response.number || page,
      totalItems: response.totalItems || response.totalElements || permissions.length,
      totalPages: response.totalPages || Math.ceil(permissions.length / size) || 1
    } : {
      currentPage: page,
      totalItems: permissions.length,
      totalPages: Math.ceil(permissions.length / size) || 1
    };
    
    // Update the store
    yield put(fetchPermissionsSuccess({
      permissions,
      currentPage: paginationData.currentPage,
      totalItems: paginationData.totalItems,
      totalPages: paginationData.totalPages
    }));
  } catch (error: any) {
    // Extract error message
    const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch permissions';
    
    // Update the store with the error
    yield put(fetchPermissionsFailure(errorMessage));
    
    // Show error message
    toast.error(errorMessage);
  }
}

// Fetch single permission
export function* handleFetchPermission(
  action: ReturnType<typeof fetchPermissionRequest>
): Generator<any, void, any> {
  try {
    const { id } = action.payload;
    
    // Call the API
    const response: Permission = yield call(getPermissionById, id);
    
    // Update the store
    yield put(fetchPermissionSuccess(response));
  } catch (error: any) {
    // Extract error message
    const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch permission details';
    
    // Update the store with the error
    yield put(fetchPermissionFailure(errorMessage));
    
    // Show error message
    toast.error(errorMessage);
  }
}

// Create permission
export function* handleCreatePermission(
  action: ReturnType<typeof createPermissionRequest>
): Generator<any, void, any> {
  try {
    const permissionData = action.payload;
    
    // Call the API
    const response: Permission = yield call(createPermission, permissionData);
    
    // Update the store
    yield put(createPermissionSuccess(response));
    
    // Show success message
    toast.success('Permission created successfully');
  } catch (error: any) {
    // Extract error message
    const errorMessage = error.response?.data?.message || error.message || 'Failed to create permission';
    
    // Update the store with the error
    yield put(createPermissionFailure(errorMessage));
    
    // Show error message
    toast.error(errorMessage);
  }
}

// Update permission
export function* handleUpdatePermission(
  action: ReturnType<typeof updatePermissionRequest>
): Generator<any, void, any> {
  try {
    const { id, ...permissionData } = action.payload;
    
    // Call the API
    const response: Permission = yield call(updatePermission, id, permissionData);
    
    // Update the store
    yield put(updatePermissionSuccess(response));
    
    // Show success message
    toast.success('Permission updated successfully');
  } catch (error: any) {
    // Extract error message
    const errorMessage = error.response?.data?.message || error.message || 'Failed to update permission';
    
    // Update the store with the error
    yield put(updatePermissionFailure(errorMessage));
    
    // Show error message
    toast.error(errorMessage);
  }
}

// Delete permission
export function* handleDeletePermission(
  action: ReturnType<typeof deletePermissionRequest>
): Generator<any, void, any> {
  try {
    const { id } = action.payload;
    
    // Call the API
    yield call(deletePermission, id);
    
    // Update the store
    yield put(deletePermissionSuccess({ id }));
    
    // Show success message
    toast.success('Permission deleted successfully');
  } catch (error: any) {
    // Extract error message
    const errorMessage = error.response?.data?.message || error.message || 'Failed to delete permission';
    
    // Update the store with the error
    yield put(deletePermissionFailure(errorMessage));
    
    // Show error message
    toast.error(errorMessage);
  }
}

// Permissions Sagas
export function* watchPermissionsSagas() {
  yield takeLatest(fetchPermissionsRequest.type, handleFetchPermissions);
  yield takeLatest(fetchPermissionRequest.type, handleFetchPermission);
  yield takeLatest(createPermissionRequest.type, handleCreatePermission);
  yield takeLatest(updatePermissionRequest.type, handleUpdatePermission);
  yield takeLatest(deletePermissionRequest.type, handleDeletePermission);
}