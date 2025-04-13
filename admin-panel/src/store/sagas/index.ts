import { all, fork } from 'redux-saga/effects';
import { watchAuthSagas } from './authSaga';
import { watchPermissionsSagas } from './permissionsSaga';
import { watchRolesSagas } from './rolesSaga';
import usersSaga from './users';

// Root Saga
export default function* rootSaga(): Generator<any, void, any> {
  yield all([
    fork(watchAuthSagas),
    fork(watchPermissionsSagas),
    fork(watchRolesSagas),
    fork(usersSaga),
    // Add other sagas here
  ]);
}