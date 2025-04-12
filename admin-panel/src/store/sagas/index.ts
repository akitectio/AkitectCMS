import { all, fork } from 'redux-saga/effects';
import { watchAuthSagas } from './authSaga';
import { watchPermissionsSagas } from './permissionsSaga';

// Root Saga
export default function* rootSaga(): Generator<any, void, any> {
  yield all([
    fork(watchAuthSagas),
    fork(watchPermissionsSagas),
    // Add other sagas here
  ]);
}