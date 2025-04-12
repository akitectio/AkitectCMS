import { useAppSelector } from '@app/store/store';
import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const PublicRoute = () => {
  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  
  useEffect(() => {
    // Check if there's a token in localStorage
    const token = localStorage.getItem('token');
    
    // User is authenticated if either the Redux store has a user or there's a token
    setIsAuthenticated(!!currentUser || !!token);
  }, [currentUser]);

  // Show nothing while checking authentication
  if (isAuthenticated === null) {
    return null;
  }
  
  return isAuthenticated ? <Navigate to={`/dashboard`} /> : <Outlet />;
};

export default PublicRoute;
