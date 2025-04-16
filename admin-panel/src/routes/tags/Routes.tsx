import { Tags } from '@app/pages/tags';
import { Route, Routes } from 'react-router-dom';

const TagsRoutes = () => {
  return (
    <Routes>
      <Route path="" element={<Tags />} />
    </Routes>
  );
};

export default TagsRoutes;