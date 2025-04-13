import { call, put, takeLatest } from 'redux-saga/effects';
import {
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
  resetPasswordFailure
} from '../reducers/users';
import userService from '@app/services/users';
import { PayloadAction } from '@reduxjs/toolkit';
import { User } from '@app/types/user';
import { toast } from 'react-toastify';

// Worker Sagas
function* fetchUsersSaga(
  action: PayloadAction<{
    page?: number;
    size?: number;
    sortBy?: string;
    direction?: string;
    search?: string;
  }>
) {
  try {
    const response = yield call(userService.getAllUsers, action.payload);
    yield put(
      fetchUsersSuccess({
        users: response.users,
        currentPage: response.currentPage,
        totalItems: response.totalItems,
        totalPages: response.totalPages,
      })
    );
  } catch (error: any) {
    yield put(fetchUsersFailure(error.message || 'Lỗi khi tải danh sách người dùng'));
    toast.error(error.message || 'Lỗi khi tải danh sách người dùng');
  }
}

function* fetchUserSaga(action: PayloadAction<string>) {
  try {
    const response: User = yield call(userService.getUserById, action.payload);
    yield put(fetchUserSuccess(response));
  } catch (error: any) {
    yield put(fetchUserFailure(error.message || 'Lỗi khi tải thông tin người dùng'));
    toast.error(error.message || 'Lỗi khi tải thông tin người dùng');
  }
}

function* createUserSaga(
  action: PayloadAction<{
    username: string;
    email: string;
    password: string;
    fullName: string;
  }>
) {
  try {
    const response: User = yield call(userService.createUser, action.payload);
    yield put(createUserSuccess(response));
    toast.success('Tạo người dùng thành công');
  } catch (error: any) {
    yield put(createUserFailure(error.message || 'Lỗi khi tạo người dùng'));
    toast.error(error.message || 'Lỗi khi tạo người dùng');
  }
}

function* updateUserSaga(
  action: PayloadAction<{
    id: string;
    username: string;
    email: string;
    fullName: string;
  }>
) {
  try {
    const { id, ...userData } = action.payload;
    const response: User = yield call(userService.updateUser, id, userData);
    yield put(updateUserSuccess(response));
    toast.success('Cập nhật người dùng thành công');
  } catch (error: any) {
    yield put(updateUserFailure(error.message || 'Lỗi khi cập nhật người dùng'));
    toast.error(error.message || 'Lỗi khi cập nhật người dùng');
  }
}

function* deleteUserSaga(action: PayloadAction<string>) {
  try {
    yield call(userService.deleteUser, action.payload);
    yield put(deleteUserSuccess({ id: action.payload }));
    toast.success('Xóa người dùng thành công');
  } catch (error: any) {
    yield put(deleteUserFailure(error.message || 'Lỗi khi xóa người dùng'));
    toast.error(error.message || 'Lỗi khi xóa người dùng');
  }
}

function* lockUserSaga(action: PayloadAction<string>) {
  try {
    const response: User = yield call(userService.lockUser, action.payload);
    yield put(lockUserSuccess(response));
    toast.success('Khóa tài khoản thành công');
  } catch (error: any) {
    yield put(lockUserFailure(error.message || 'Lỗi khi khóa tài khoản'));
    toast.error(error.message || 'Lỗi khi khóa tài khoản');
  }
}

function* unlockUserSaga(action: PayloadAction<string>) {
  try {
    const response: User = yield call(userService.unlockUser, action.payload);
    yield put(unlockUserSuccess(response));
    toast.success('Mở khóa tài khoản thành công');
  } catch (error: any) {
    yield put(unlockUserFailure(error.message || 'Lỗi khi mở khóa tài khoản'));
    toast.error(error.message || 'Lỗi khi mở khóa tài khoản');
  }
}

function* resetPasswordSaga(
  action: PayloadAction<{
    id: string;
    newPassword: string;
  }>
) {
  try {
    const { id, newPassword } = action.payload;
    const response: User = yield call(userService.resetUserPassword, id, newPassword);
    yield put(resetPasswordSuccess(response));
    toast.success('Đặt lại mật khẩu thành công');
  } catch (error: any) {
    yield put(resetPasswordFailure(error.message || 'Lỗi khi đặt lại mật khẩu'));
    toast.error(error.message || 'Lỗi khi đặt lại mật khẩu');
  }
}

// Watcher Saga
export default function* usersSaga() {
  yield takeLatest(fetchUsersRequest.type, fetchUsersSaga);
  yield takeLatest(fetchUserRequest.type, fetchUserSaga);
  yield takeLatest(createUserRequest.type, createUserSaga);
  yield takeLatest(updateUserRequest.type, updateUserSaga);
  yield takeLatest(deleteUserRequest.type, deleteUserSaga);
  yield takeLatest(lockUserRequest.type, lockUserSaga);
  yield takeLatest(unlockUserRequest.type, unlockUserSaga);
  yield takeLatest(resetPasswordRequest.type, resetPasswordSaga);
}