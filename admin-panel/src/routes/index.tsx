// ...existing routes...

// Profile routes
const Profile = lazy(() => import('@app/pages/profile/Profile'));
const EditProfile = lazy(() => import('@app/pages/profile/EditProfile'));
const ChangePassword = lazy(() => import('@app/pages/profile/ChangePassword'));
const SessionManagement = lazy(() => import('@app/pages/profile/SessionManagement')); // Add new import

// ...other imports...

export const routes: RouteConfig[] = [
  // ...existing routes...
  {
    path: '/profile',
    element: <Profile />
  },
  {
    path: '/profile/edit',
    element: <EditProfile />
  },
  {
    path: '/profile/change-password',
    element: <ChangePassword />
  },
  {
    path: '/profile/sessions',
    element: <SessionManagement />
  },
  // ...other routes...