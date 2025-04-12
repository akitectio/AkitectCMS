import { all, fork } from 'redux-saga/effects';
import { watchAuthSagas } from './authSaga';
import { watchPermissionsSagas } from './permissionsSaga';
import { watchRolesSagas } from './rolesSaga';

// Root Saga
export default function* rootSaga(): Generator<any, void, any> {
  yield all([
    fork(watchAuthSagas),
    fork(watchPermissionsSagas),
    fork(watchRolesSagas),
    // Add other sagas here
  ]);
}