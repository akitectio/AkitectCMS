import PostForm from '@app/pages/posts/PostForm';
import Posts from '@app/pages/posts/Posts';
import React from 'react';
import { Route, Routes } from 'react-router-dom';

const PostsRoutes: React.FC = () => (
  <Routes>
    <Route index element={<Posts />} />
    <Route path="add" element={<PostForm />} />
    <Route path="edit/:id" element={<PostForm />} />
    <Route path="view/:id" element={<PostForm isView />} />
  </Routes>
);

export default PostsRoutes;