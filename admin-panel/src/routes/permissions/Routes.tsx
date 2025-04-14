import Permissions from '@app/pages/permissions/Permissions';
import { Route, Routes } from 'react-router-dom';

const PermissionsRoutes = () => {
  return (
    <Routes>
      <Route path="" element={<Permissions />} />
    </Routes>
  );
};

export default PermissionsRoutes;