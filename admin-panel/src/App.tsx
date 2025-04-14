import { useWindowSize } from '@app/hooks/useWindowSize';
import { setWindowSize } from '@app/store/reducers/ui';
import { calculateWindowSize } from '@app/utils/helpers';
import { useEffect, useState } from 'react';
import ReactGA from 'react-ga4';
import { useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';



import { getCurrentUser } from '@app/services/auth';
import { setCurrentUser } from '@store/reducers/auth';
import { useAppDispatch, useAppSelector } from '@store/store';
import { Loading } from './components/Loading';
import AppRoutes from './routes/AppRoutes';

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
    </>
  );
};

export default App;
