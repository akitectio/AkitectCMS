import UserForm from '@app/pages/users/UserForm';
import Users from '@app/pages/users/Users';
import { Route, Routes } from 'react-router-dom';

const UsersRoutes = () => {
  return (
    <Routes>
      <Route path="" element={<Users />} />
      <Route path="create" element={<UserForm />} />
      <Route path=":id/edit" element={<UserForm />} />
    </Routes>
  );
};

export default UsersRoutes;