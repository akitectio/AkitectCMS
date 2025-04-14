import Categories from '@app/pages/categories/Categories';
import CategoryForm from '@app/pages/categories/CategoryForm';
import React from 'react';
import { Route, Routes } from 'react-router-dom';

const CategoriesRoutes: React.FC = () => (
  <Routes>
    <Route index element={<Categories />} />
    <Route path="add" element={<CategoryForm />} />
    <Route path="edit/:id" element={<CategoryForm />} />
  </Routes>
);

export default CategoriesRoutes;