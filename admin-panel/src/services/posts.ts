import axios from '@app/configs/axiosConfig';
import { Post, PostCreateRequest, PostFilterParams, PostUpdateRequest } from '@app/types/post';
import { POST_ENDPOINTS } from './apiEndpoints';

// Get all posts with optional filtering
export const getAllPosts = async (params?: PostFilterParams): Promise<{
  posts: Post[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}> => {
  const queryParams = new URLSearchParams();
  
  if (params) {
    if (params.page !== undefined) queryParams.append('page', params.page.toString());
    if (params.size !== undefined) queryParams.append('size', params.size.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.status) queryParams.append('status', params.status);
    if (params.categoryId) queryParams.append('categoryId', params.categoryId);
    if (params.authorId) queryParams.append('authorId', params.authorId);
  }

  const url = `${POST_ENDPOINTS.GET_ALL}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
  const response = await axios.get(url);
  return response.data;
};

// Get a post by ID
export const getPost = async (id: string): Promise<Post> => {
  const response = await axios.get(POST_ENDPOINTS.GET_BY_ID(id));
  return response.data;
};

// Create a new post
export const createPost = async (postData: PostCreateRequest): Promise<Post> => {
  const response = await axios.post(POST_ENDPOINTS.CREATE, postData);
  return response.data;
};

// Update an existing post
export const updatePost = async (id: string, postData: PostUpdateRequest): Promise<Post> => {
  const response = await axios.put(POST_ENDPOINTS.UPDATE(id), postData);
  return response.data;
};

// Delete a post
export const deletePost = async (id: string): Promise<void> => {
  await axios.delete(POST_ENDPOINTS.DELETE(id));
};

// Get featured posts
export const getFeaturedPosts = async (): Promise<Post[]> => {
  const response = await axios.get(POST_ENDPOINTS.FEATURED);
  return response.data.posts;
};

// Get posts by category
export const getPostsByCategory = async (categoryId: string, params?: PostFilterParams): Promise<{
  posts: Post[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}> => {
  const queryParams = new URLSearchParams();
  
  if (params) {
    if (params.page !== undefined) queryParams.append('page', params.page.toString());
    if (params.size !== undefined) queryParams.append('size', params.size.toString());
  }

  const url = `${POST_ENDPOINTS.BY_CATEGORY(categoryId)}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
  const response = await axios.get(url);
  return response.data;
};

// Search posts
export const searchPosts = async (query: string, params?: PostFilterParams): Promise<{
  posts: Post[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}> => {
  const queryParams = new URLSearchParams({ query });
  
  if (params) {
    if (params.page !== undefined) queryParams.append('page', params.page.toString());
    if (params.size !== undefined) queryParams.append('size', params.size.toString());
    if (params.status) queryParams.append('status', params.status);
    if (params.categoryId) queryParams.append('categoryId', params.categoryId);
    if (params.authorId) queryParams.append('authorId', params.authorId);
  }

  const url = `${POST_ENDPOINTS.SEARCH}?${queryParams.toString()}`;
  const response = await axios.get(url);
  return response.data;
};

const postService = {
  getAllPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  getFeaturedPosts,
  getPostsByCategory,
  searchPosts
};

export default postService;