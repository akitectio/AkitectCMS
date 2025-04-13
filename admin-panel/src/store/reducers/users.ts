import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User, UserStatus } from '@app/types/user';

export interface UsersState {
  items: User[];
  selectedUser: User | null;
  loading: boolean;
  creating: boolean;
  updating: boolean;
  deleting: boolean;
  locking: boolean;
  unlocking: boolean;
  resettingPassword: boolean;
  error: string | null;
  success: boolean;
  total: number;
  currentPage: number;
  totalPages: number;
}

const initialState: UsersState = {
  items: [],
  selectedUser: null,
  loading: false,
  creating: false,
  updating: false,
  deleting: false,
  locking: false,
  unlocking: false,
  resettingPassword: false,
  error: null,
  success: false,
  total: 0,
  currentPage: 0,
  totalPages: 0,
};

export const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    // Fetch users list
    fetchUsersRequest: (
      state: UsersState,
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
    fetchUsersSuccess: (
      state: UsersState,
      action: PayloadAction<{
        users: User[];
        currentPage: number;
        totalItems: number;
        totalPages: number;
      }>
    ) => {
      state.loading = false;
      state.items = action.payload.users;
      state.currentPage = action.payload.currentPage;
      state.total = action.payload.totalItems;
      state.totalPages = action.payload.totalPages;
    },
    fetchUsersFailure: (state: UsersState, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Fetch a single user
    fetchUserRequest: (state: UsersState, action: PayloadAction<string>) => {
      state.loading = true;
      state.error = null;
      state.selectedUser = null;
    },
    fetchUserSuccess: (state: UsersState, action: PayloadAction<User>) => {
      state.loading = false;
      state.selectedUser = action.payload;
    },
    fetchUserFailure: (state: UsersState, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Create a user
    createUserRequest: (
      state: UsersState,
      action: PayloadAction<{ username: string; email: string; password: string; fullName: string }>
    ) => {
      state.creating = true;
      state.error = null;
      state.success = false;
    },
    createUserSuccess: (state: UsersState, action: PayloadAction<User>) => {
      state.creating = false;
      state.success = true;
      state.items = [...state.items, action.payload];
    },
    createUserFailure: (state: UsersState, action: PayloadAction<string>) => {
      state.creating = false;
      state.error = action.payload;
      state.success = false;
    },

    // Update a user
    updateUserRequest: (
      state: UsersState,
      action: PayloadAction<{ id: string; username: string; email: string; fullName: string }>
    ) => {
      state.updating = true;
      state.error = null;
      state.success = false;
    },
    updateUserSuccess: (state: UsersState, action: PayloadAction<User>) => {
      state.updating = false;
      state.success = true;
      state.items = state.items.map((item) =>
        item.id === action.payload.id ? action.payload : item
      );
      if (state.selectedUser && state.selectedUser.id === action.payload.id) {
        state.selectedUser = action.payload;
      }
    },
    updateUserFailure: (state: UsersState, action: PayloadAction<string>) => {
      state.updating = false;
      state.error = action.payload;
      state.success = false;
    },

    // Delete a user
    deleteUserRequest: (state: UsersState, action: PayloadAction<string>) => {
      state.deleting = true;
      state.error = null;
      state.success = false;
    },
    deleteUserSuccess: (state: UsersState, action: PayloadAction<{ id: string }>) => {
      state.deleting = false;
      state.success = true;
      state.items = state.items.filter((item) => item.id !== action.payload.id);
      if (state.selectedUser && state.selectedUser.id === action.payload.id) {
        state.selectedUser = null;
      }
    },
    deleteUserFailure: (state: UsersState, action: PayloadAction<string>) => {
      state.deleting = false;
      state.error = action.payload;
      state.success = false;
    },

    // Lock a user
    lockUserRequest: (state: UsersState, action: PayloadAction<string>) => {
      state.locking = true;
      state.error = null;
      state.success = false;
    },
    lockUserSuccess: (state: UsersState, action: PayloadAction<User>) => {
      state.locking = false;
      state.success = true;
      state.items = state.items.map((item) =>
        item.id === action.payload.id ? action.payload : item
      );
      if (state.selectedUser && state.selectedUser.id === action.payload.id) {
        state.selectedUser = action.payload;
      }
    },
    lockUserFailure: (state: UsersState, action: PayloadAction<string>) => {
      state.locking = false;
      state.error = action.payload;
      state.success = false;
    },

    // Unlock a user
    unlockUserRequest: (state: UsersState, action: PayloadAction<string>) => {
      state.unlocking = true;
      state.error = null;
      state.success = false;
    },
    unlockUserSuccess: (state: UsersState, action: PayloadAction<User>) => {
      state.unlocking = false;
      state.success = true;
      state.items = state.items.map((item) =>
        item.id === action.payload.id ? action.payload : item
      );
      if (state.selectedUser && state.selectedUser.id === action.payload.id) {
        state.selectedUser = action.payload;
      }
    },
    unlockUserFailure: (state: UsersState, action: PayloadAction<string>) => {
      state.unlocking = false;
      state.error = action.payload;
      state.success = false;
    },

    // Reset password
    resetPasswordRequest: (
      state: UsersState,
      action: PayloadAction<{ id: string; newPassword: string }>
    ) => {
      state.resettingPassword = true;
      state.error = null;
      state.success = false;
    },
    resetPasswordSuccess: (state: UsersState, action: PayloadAction<User>) => {
      state.resettingPassword = false;
      state.success = true;
    },
    resetPasswordFailure: (state: UsersState, action: PayloadAction<string>) => {
      state.resettingPassword = false;
      state.error = action.payload;
      state.success = false;
    },

    // Reset state
    resetUserState: (state: UsersState) => {
      state.error = null;
      state.success = false;
    },
  },
});

export const {
  fetchUsersRequest,
  fetchUsersSuccess,
  fetchUsersFailure,
  fetchUserRequest,
  fetchUserSuccess,
  fetchUserFailure,
  createUserRequest,
  createUserSuccess,
  createUserFailure,
  updateUserRequest,
  updateUserSuccess,
  updateUserFailure,
  deleteUserRequest,
  deleteUserSuccess,
  deleteUserFailure,
  lockUserRequest,
  lockUserSuccess,
  lockUserFailure,
  unlockUserRequest,
  unlockUserSuccess,
  unlockUserFailure,
  resetPasswordRequest,
  resetPasswordSuccess,
  resetPasswordFailure,
  resetUserState,
} = usersSlice.actions;

export default usersSlice.reducer;