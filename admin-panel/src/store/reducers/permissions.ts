import { Permission } from '@app/types/user';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface PermissionsState {
  items: Permission[];
  selectedPermission: Permission | null;
  loading: boolean;
  creating: boolean;
  updating: boolean;
  deleting: boolean;
  error: string | null;
  success: boolean;
  total: number;
  currentPage: number;
  totalPages: number;
}

const initialState: PermissionsState = {
  items: [],
  selectedPermission: null,
  loading: false,
  creating: false,
  updating: false,
  deleting: false,
  error: null,
  success: false,
  total: 0,
  currentPage: 0,
  totalPages: 0
};

export const permissionsSlice = createSlice({
  name: 'permissions',
  initialState,
  reducers: {
    // Get permissions (list)
    fetchPermissionsRequest: (
      state: PermissionsState,
      action: PayloadAction<{
        page?: number;
        size?: number;
        sortBy?: string;
        direction?: string;
      }>
    ) => {
      state.loading = true;
      state.error = null;
    },
    fetchPermissionsSuccess: (
      state: PermissionsState,
      action: PayloadAction<{
        permissions: Permission[];
        currentPage: number;
        totalItems: number;
        totalPages: number;
      }>
    ) => {
      state.loading = false;
      state.items = action.payload.permissions;
      state.currentPage = action.payload.currentPage;
      state.total = action.payload.totalItems;
      state.totalPages = action.payload.totalPages;
    },
    fetchPermissionsFailure: (
      state: PermissionsState,
      action: PayloadAction<string>
    ) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Get a single permission
    fetchPermissionRequest: (
      state: PermissionsState,
      action: PayloadAction<{ id: number | string }>
    ) => {
      state.loading = true;
      state.error = null;
      state.selectedPermission = null;
    },
    fetchPermissionSuccess: (
      state: PermissionsState,
      action: PayloadAction<Permission>
    ) => {
      state.loading = false;
      state.selectedPermission = action.payload;
    },
    fetchPermissionFailure: (
      state: PermissionsState,
      action: PayloadAction<string>
    ) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Create a permission
    createPermissionRequest: (
      state: PermissionsState,
      action: PayloadAction<{
        name: string;
        description: string;
        module: string;
        key: string;
      }>
    ) => {
      state.creating = true;
      state.error = null;
      state.success = false;
    },
    createPermissionSuccess: (
      state: PermissionsState,
      action: PayloadAction<Permission>
    ) => {
      state.creating = false;
      state.success = true;
      state.items = [...state.items, action.payload];
    },
    createPermissionFailure: (
      state: PermissionsState,
      action: PayloadAction<string>
    ) => {
      state.creating = false;
      state.error = action.payload;
      state.success = false;
    },

    // Update a permission
    updatePermissionRequest: (
      state: PermissionsState,
      action: PayloadAction<{
        id: number | string;
        name: string;
        description: string;
        module: string;
        key: string;
      }>
    ) => {
      state.updating = true;
      state.error = null;
      state.success = false;
    },
    updatePermissionSuccess: (
      state: PermissionsState,
      action: PayloadAction<Permission>
    ) => {
      state.updating = false;
      state.success = true;
      state.items = state.items.map((item) =>
        item.id === action.payload.id ? action.payload : item
      );
      if (state.selectedPermission && state.selectedPermission.id === action.payload.id) {
        state.selectedPermission = action.payload;
      }
    },
    updatePermissionFailure: (
      state: PermissionsState,
      action: PayloadAction<string>
    ) => {
      state.updating = false;
      state.error = action.payload;
      state.success = false;
    },

    // Delete a permission
    deletePermissionRequest: (
      state: PermissionsState,
      action: PayloadAction<{ id: number | string }>
    ) => {
      state.deleting = true;
      state.error = null;
      state.success = false;
    },
    deletePermissionSuccess: (
      state: PermissionsState,
      action: PayloadAction<{ id: number | string }>
    ) => {
      state.deleting = false;
      state.success = true;
      state.items = state.items.filter((item) => item.id !== action.payload.id);
      if (state.selectedPermission && state.selectedPermission.id === action.payload.id) {
        state.selectedPermission = null;
      }
    },
    deletePermissionFailure: (
      state: PermissionsState,
      action: PayloadAction<string>
    ) => {
      state.deleting = false;
      state.error = action.payload;
      state.success = false;
    },

    // Reset states
    resetPermissionState: (state: PermissionsState) => {
      state.error = null;
      state.success = false;
    }
  }
});

export const {
  fetchPermissionsRequest,
  fetchPermissionsSuccess,
  fetchPermissionsFailure,
  fetchPermissionRequest,
  fetchPermissionSuccess,
  fetchPermissionFailure,
  createPermissionRequest,
  createPermissionSuccess,
  createPermissionFailure,
  updatePermissionRequest,
  updatePermissionSuccess,
  updatePermissionFailure,
  deletePermissionRequest,
  deletePermissionSuccess,
  deletePermissionFailure,
  resetPermissionState
} = permissionsSlice.actions;

export default permissionsSlice.reducer;