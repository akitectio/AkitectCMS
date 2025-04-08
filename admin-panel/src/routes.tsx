import AdminLayout from '@/components/layout/AdminLayout';
import React, { lazy, Suspense } from 'react';
import { Navigate, RouteObject } from 'react-router-dom';

// Lazy loading các pages
const Login = lazy(() => import('@/pages/auth/Login'));
const Dashboard = lazy(() => import('@/pages/dashboard/Dashboard'));

// Loading component
const PageLoading = () => (
  <div className="text-center p-5">
    <div className="spinner-border text-primary" role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
  </div>
);

// Auth guard
const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    // Redirect to login if not authenticated
    return <Navigate to="/admin/login" replace />;
  }
  
  return <>{children}</>;
};

const routes: RouteObject[] = [
  {
    path: '/admin/login',
    element: (
      <Suspense fallback={<PageLoading />}>
        <Login />
      </Suspense>
    )
  },
  {
    path: '/admin',
    element: (
      <RequireAuth>
        <AdminLayout />
      </RequireAuth>
    ),
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<PageLoading />}>
            <Dashboard />
          </Suspense>
        )
      },
      // Các routes khác sẽ được thêm ở đây
      {
        path: '*',
        element: <Navigate to="/admin" replace />
      }
    ]
  }
];

export default routes;