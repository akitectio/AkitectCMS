import { ConfigProvider } from 'antd';
import { useEffect, useState } from 'react';
import ReactGA from 'react-ga4';
import { useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

import themeConfig from '@app/configs/themeConfig';
import { useWindowSize } from '@app/hooks/useWindowSize';
import AppRoutes from '@app/routes/AppRoutes';
import { getCurrentUser } from '@app/services/auth';
import { calculateWindowSize } from '@app/utils/helpers';
import { setCurrentUser } from '@store/reducers/auth';
import { setWindowSize } from '@store/reducers/ui';
import { useAppSelector } from '@store/store';
import { Loading } from './components/Loading';

import 'antd/dist/reset.css';

const { VITE_NODE_ENV } = import.meta.env;

const App = () => {
  const windowSize = useWindowSize();
  const dispatch = useDispatch();
  const location = useLocation();
  const screenSize = useAppSelector((state) => state.ui.screenSize);

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

  // Remove the unnecessary fetchProfileRequest effect
  
  useEffect(() => {
    const size = calculateWindowSize(windowSize.width);
    if (screenSize !== size) {
      dispatch(setWindowSize(size));
    }
  }, [windowSize, screenSize, dispatch]);

  useEffect(() => {
    const handleResize = () => {
      if (windowSize.width >= 992) {
        dispatch(setWindowSize('lg'));
      } else if (windowSize.width >= 768) {
        dispatch(setWindowSize('md'));
      } else if (windowSize.width >= 576) { 
        dispatch(setWindowSize('sm'));
      } else if (windowSize.width < 576) {
        dispatch(setWindowSize('xs'));
      }
    };
    handleResize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [windowSize.width]);

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
    <ConfigProvider theme={themeConfig}>
      <AppRoutes />
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
    </ConfigProvider>
  );
};

export default App;
