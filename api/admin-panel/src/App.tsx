import '@/assets/css/admin.css';
import { getCurrentUser } from '@/features/auth/authSlice';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import routes from '@/routes';
import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useEffect } from 'react';
import { useRoutes } from 'react-router-dom';

const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const routing = useRoutes(routes);
  
  useEffect(() => {
    if (localStorage.getItem('token')) {
      dispatch(getCurrentUser());
    }
  }, [dispatch]);
  
  return <>{routing}</>;
};

export default App;