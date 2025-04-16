import ForgetPassword from '@modules/forgot-password/ForgotPassword';
import Login from '@modules/login/Login';
import AntMain from '@modules/main/AntMain'; // Importing new Ant Design layout
import RecoverPassword from '@modules/recover-password/RecoverPassword';
import Blank from '@pages/Blank';
import Dashboard from '@pages/Dashboard';
import Profile from '@pages/profile/Profile';
import SubMenu from '@pages/SubMenu';
import { Route, Routes } from 'react-router-dom';

import CategoriesRoutes from './categories/Routes';
import PermissionsRoutes from './permissions/Routes';
import PostsRoutes from './posts/Routes';
import PrivateRoute from './PrivateRoute';
import PublicRoute from './PublicRoute';
import RolesRoutes from './roles/Routes';
import TagsRoutes from './tags/Routes';
import UsersRoutes from './users/Routes';

const AppRoutes = () => {
  return (
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
        <Route path="/" element={<AntMain />}>
          <Route path="/sub-menu-2" element={<Blank />} />
          <Route path="/sub-menu-1" element={<SubMenu />} />
          <Route path="/blank" element={<Blank />} />
          <Route path="/roles/*" element={<RolesRoutes />} />
          <Route path="/users/*" element={<UsersRoutes />} />
          <Route path="/categories/*" element={<CategoriesRoutes />} />
          <Route path="/permissions/*" element={<PermissionsRoutes />} />
          <Route path="/posts/*" element={<PostsRoutes />} />
          <Route path="/tags/*" element={<TagsRoutes />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/" element={<Dashboard />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;