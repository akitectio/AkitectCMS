import RoleCreate from '@app/pages/roles/RoleCreate';
import RoleEdit from '@app/pages/roles/RoleEdit';
import Roles from '@app/pages/roles/Roles';
import { Route, Routes } from 'react-router-dom';

const RolesRoutes = () => {
  return (
    <Routes>
      <Route path="" element={<Roles />} />
      <Route path="create" element={<RoleCreate />} />
      <Route path=":id/edit" element={<RoleEdit />} />
    </Routes>
  );
};

export default RolesRoutes;