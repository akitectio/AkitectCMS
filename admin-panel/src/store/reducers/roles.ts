import { Role } from '@app/types/user';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface RolesState {
  items: Role[];
  selectedRole: Role | null;
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

const initialState: RolesState = {
  items: [],
  selectedRole: null,
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

export const rolesSlice = createSlice({
  name: 'roles',
  initialState,
  reducers: {
    // Get roles (list)
    fetchRolesRequest: (
      state: RolesState,
      action: PayloadAction<{
        page?: number;
        size?: number;
        sortBy?: string;
        direction?: string;
        search?: string;
      }>
    ) => {
      state.loading = true;
      state.error = null;
    },
    fetchRolesSuccess: (
      state: RolesState,
      action: PayloadAction<{
        roles: Role[];
        currentPage: number;
        totalItems: number;
        totalPages: number;
      }>
    ) => {
      state.loading = false;
      state.items = action.payload.roles;
      state.currentPage = action.payload.currentPage;
      state.total = action.payload.totalItems;
      state.totalPages = action.payload.totalPages;
    },
    fetchRolesFailure: (
      state: RolesState,
      action: PayloadAction<string>
    ) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Get a single role
    fetchRoleRequest: (
      state: RolesState,
      action: PayloadAction<string>
    ) => {
      state.loading = true;
      state.error = null;
      state.selectedRole = null;
    },
    fetchRoleSuccess: (
      state: RolesState,
      action: PayloadAction<Role>
    ) => {
      state.loading = false;
      state.selectedRole = action.payload;
    },
    fetchRoleFailure: (
      state: RolesState,
      action: PayloadAction<string>
    ) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Create a role
    createRoleRequest: (
      state: RolesState,
      action: PayloadAction<{
        name: string;
        description: string;
        permissionIds: string[];
      }>
    ) => {
      state.creating = true;
      state.error = null;
      state.success = false;
    },
    createRoleSuccess: (
      state: RolesState,
      action: PayloadAction<Role>
    ) => {
      state.creating = false;
      state.success = true;
      state.items = [...state.items, action.payload];
    },
    createRoleFailure: (
      state: RolesState,
      action: PayloadAction<string>
    ) => {
      state.creating = false;
      state.error = action.payload;
      state.success = false;
    },

    // Update a role
    updateRoleRequest: (
      state: RolesState,
      action: PayloadAction<{
        id: string;
        name: string;
        description: string;
        permissionIds: string[];
      }>
    ) => {
      state.updating = true;
      state.error = null;
      state.success = false;
    },
    updateRoleSuccess: (
      state: RolesState,
      action: PayloadAction<Role>
    ) => {
      state.updating = false;
      state.success = true;
      state.items = state.items.map((item) =>
        item.id === action.payload.id ? action.payload : item
      );
      if (state.selectedRole && state.selectedRole.id === action.payload.id) {
        state.selectedRole = action.payload;
      }
    },
    updateRoleFailure: (
      state: RolesState,
      action: PayloadAction<string>
    ) => {
      state.updating = false;
      state.error = action.payload;
      state.success = false;
    },

    // Delete a role
    deleteRoleRequest: (
      state: RolesState,
      action: PayloadAction<string>
    ) => {
      state.deleting = true;
      state.error = null;
      state.success = false;
    },
    deleteRoleSuccess: (
      state: RolesState,
      action: PayloadAction<{ id: string }>
    ) => {
      state.deleting = false;
      state.success = true;
      state.items = state.items.filter((item) => item.id !== action.payload.id);
      if (state.selectedRole && state.selectedRole.id === action.payload.id) {
        state.selectedRole = null;
      }
    },
    deleteRoleFailure: (
      state: RolesState,
      action: PayloadAction<string>
    ) => {
      state.deleting = false;
      state.error = action.payload;
      state.success = false;
    },

    // Reset states
    resetRoleState: (state: RolesState) => {
      state.error = null;
      state.success = false;
    }
  }
});

export const {
  fetchRolesRequest,
  fetchRolesSuccess,
  fetchRolesFailure,
  fetchRoleRequest,
  fetchRoleSuccess,
  fetchRoleFailure,
  createRoleRequest,
  createRoleSuccess,
  createRoleFailure,
  updateRoleRequest,
  updateRoleSuccess,
  updateRoleFailure,
  deleteRoleRequest,
  deleteRoleSuccess,
  deleteRoleFailure,
  resetRoleState
} = rolesSlice.actions;

export default rolesSlice.reducer;