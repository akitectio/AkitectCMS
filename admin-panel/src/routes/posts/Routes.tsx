import CreatePost from '@app/pages/posts/CreatePost';
import EditPost from '@app/pages/posts/EditPost';
import PostList from '@app/pages/posts/PostList';
import { Route, Routes } from 'react-router-dom';

const PostsRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<PostList />} />
      <Route path="/create" element={<CreatePost />} />
      <Route path="/edit/:id" element={<EditPost />} />
    </Routes>
  );
};

export default PostsRoutes;