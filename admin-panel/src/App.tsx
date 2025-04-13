import { useWindowSize } from '@app/hooks/useWindowSize';
import { setWindowSize } from '@app/store/reducers/ui';
import { calculateWindowSize } from '@app/utils/helpers';
import ForgetPassword from '@modules/forgot-password/ForgotPassword';
import Login from '@modules/login/Login';
import Main from '@modules/main/Main';
import RecoverPassword from '@modules/recover-password/RecoverPassword';
import { useEffect, useState } from 'react';
import ReactGA from 'react-ga4';
import { Route, Routes, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

import Permissions from '@app/pages/permissions/Permissions';
import RoleCreate from '@app/pages/roles/RoleCreate';
import RoleEdit from '@app/pages/roles/RoleEdit';
import Roles from '@app/pages/roles/Roles';
import { UserForm, UserProfile, Users } from '@app/pages/users';
import Blank from '@pages/Blank';
import Dashboard from '@pages/Dashboard';
import Profile from '@pages/profile/Profile';
import SubMenu from '@pages/SubMenu';

import PrivateRoute from './routes/PrivateRoute';
import PublicRoute from './routes/PublicRoute';

import { getCurrentUser } from '@app/services/auth';
import { setCurrentUser } from '@store/reducers/auth';
import { useAppDispatch, useAppSelector } from '@store/store';
import { Loading } from './components/Loading';

const { VITE_NODE_ENV } = import.meta.env;

const App = () => {
  const windowSize = useWindowSize();
  const screenSize = useAppSelector((state) => state.ui.screenSize);
  const dispatch = useAppDispatch();
  const location = useLocation();

  const [isAppLoading, setIsAppLoading] = useState(true);

  // Initialize user from localStorage token
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (token) {
          // If token exists, try to get the current user
          const user = await getCurrentUser();
          if (user) {
            // Update Redux store with user data
            dispatch(setCurrentUser(user));
          }
        }
      } catch (error) {
        console.error('Failed to initialize user:', error);
        // If there's an error (like invalid token), clear the token
        localStorage.removeItem('token');
      } finally {
        // Either way, we're done loading
        setIsAppLoading(false);
      }
    };

    initializeAuth();
  }, [dispatch]);

  useEffect(() => {
    const size = calculateWindowSize(windowSize.width);
    if (screenSize !== size) {
      dispatch(setWindowSize(size));
    }
  }, [windowSize]);

  useEffect(() => {
    if (location && location.pathname && VITE_NODE_ENV === 'production') {
      ReactGA.send({
        hitType: 'pageview',
        page: location.pathname,
      });
    }
  }, [location]);

  if (isAppLoading) {
    return <Loading />;
  }

  return (
    <>
      <Routes>
        <Route path="/login" element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
        </Route>
        <Route path="/register" element={<PublicRoute />}>
        </Route>
        <Route path="/forgot-password" element={<PublicRoute />}>
          <Route path="/forgot-password" element={<ForgetPassword />} />
        </Route>
        <Route path="/recover-password" element={<PublicRoute />}>
          <Route path="/recover-password" element={<RecoverPassword />} />
        </Route>
        <Route path="/" element={<PrivateRoute />}>
          <Route path="/" element={<Main />}>
            <Route path="/sub-menu-2" element={<Blank />} />
            <Route path="/sub-menu-1" element={<SubMenu />} />
            <Route path="/blank" element={<Blank />} />
            <Route path="/permissions" element={<Permissions />} />
            <Route path="/roles" element={<Roles />} />
            <Route path="/roles/create" element={<RoleCreate />} />
            <Route path="/roles/:id/edit" element={<RoleEdit />} />
            <Route path="/users" element={<Users />} />
            <Route path="/users/create" element={<UserForm />} />
            <Route path="/users/edit/:id" element={<UserForm />} />
            <Route path="/users/profile/:id" element={<UserProfile />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/" element={<Dashboard />} />
          </Route>
        </Route>
      </Routes>
      <ToastContainer
        autoClose={3000}
        draggable={false}
        position="top-right"
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnHover
      />
    </>
  );
};

export default App;
