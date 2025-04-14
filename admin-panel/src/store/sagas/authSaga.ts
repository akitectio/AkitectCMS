import { toast } from 'react-toastify';
import { call, put, takeLatest } from 'redux-saga/effects';

import { loginByAuth } from '@app/services/auth';
import { loginFailure, loginRequest, loginSuccess, resetForm } from '@app/store/reducers/auth';
import { IUser } from '@app/types/user';

// Auth Saga
export function* handleLogin(action: ReturnType<typeof loginRequest>): Generator<any, void, any> {
  try {
    const { username, password } = action.payload;
    // Call the API
    const result: { token: string; user: IUser } = yield call(loginByAuth, username, password);
    
    // Update the store with the user data
    yield put(loginSuccess(result.user));
    
    // Show success message
    toast.success('Login is succeed!');
    
    // Redirect to dashboard after successful login
    window.location.href = '/dashboard';
  } catch (error: any) {
    // Extract proper error message from response
    let errorMessage = 'Login failed';
    
    if (error.response?.data) {
      // Extract message from the API error response format
      const { message } = error.response.data;
      if (message) {
        errorMessage = message;
      }
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    // Update the store with the error
    yield put(loginFailure(errorMessage));
    
    // Reset the form values
    yield put(resetForm());
    
    // Show error message from API
    toast.error(errorMessage);
  }
}

// Auth Sagas
export function* watchAuthSagas() {
  yield takeLatest(loginRequest.type, handleLogin);
}