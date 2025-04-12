import { IUser } from '@app/types/user';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AuthState {
  currentUser: IUser | null;
  loading: boolean;
  error: string | null;
  formValues: {
    username: string;
    password: string;
  };
}

const initialState: AuthState = {
  currentUser: null,
  loading: false,
  error: null,
  formValues: {
    username: '',
    password: '',
  },
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginRequest: (
      state: AuthState,
      action: PayloadAction<{ username: string; password: string }>
    ) => {
      state.loading = true;
      state.error = null;
      // Store the form values in state
      state.formValues = action.payload;
    },
    loginSuccess: (
      state: AuthState,
      { payload }: { payload: IUser | null }
    ) => {
      state.currentUser = payload;
      state.loading = false;
      state.error = null;
    },
    loginFailure: (
      state: AuthState,
      { payload }: { payload: string }
    ) => {
      state.loading = false;
      state.error = payload;
    },
    resetForm: (state: AuthState) => {
      // Reset form values when login fails
      state.formValues = {
        username: '',
        password: '',
      };
    },
    setCurrentUser: (
      state: AuthState,
      { payload }: { payload: IUser | null }
    ) => {
      state.currentUser = payload;
    },
  },
});

export const { loginRequest, loginSuccess, loginFailure, resetForm, setCurrentUser } = authSlice.actions;

export default authSlice.reducer;
