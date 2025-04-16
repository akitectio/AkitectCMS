import axios from '@app/configs/axiosConfig';
import { Tag } from '@app/types/post';
import { TAG_ENDPOINTS } from './apiEndpoints';

// Get all tags
export const getAllTags = async (): Promise<Tag[]> => {
  const response = await axios.get(TAG_ENDPOINTS.GET_ALL);
  return response.data?.tags || [];
};

// Get a tag by ID
export const getTag = async (id: string): Promise<Tag> => {
  const response = await axios.get(TAG_ENDPOINTS.GET_BY_ID(id));
  return response.data;
};

// Create a new tag
export const createTag = async (tagData: Partial<Tag>): Promise<Tag> => {
  const response = await axios.post(TAG_ENDPOINTS.CREATE, tagData);
  return response.data;
};

// Update an existing tag
export const updateTag = async (id: string, tagData: Partial<Tag>): Promise<Tag> => {
  const response = await axios.put(TAG_ENDPOINTS.UPDATE(id), tagData);
  return response.data;
};

// Delete a tag
export const deleteTag = async (id: string): Promise<void> => {
  await axios.delete(TAG_ENDPOINTS.DELETE(id));
};

// Search tags (Select2-style)
export const searchTags = async (query: string): Promise<Tag[]> => {
  const response = await axios.get(`${TAG_ENDPOINTS.SEARCH}?q=${encodeURIComponent(query)}`);
  // Ensure we always return an array, even if tags property is undefined
  return response.data?.tags || [];
};

// Create a tag if it doesn't exist
export const createTagIfNotExists = async (name: string): Promise<Tag> => {
  const response = await axios.post(`${TAG_ENDPOINTS.CREATE}`, { name });
  return response.data;
};

const tagService = {
  getAllTags,
  getTag,
  createTag,
  updateTag,
  deleteTag,
  searchTags,
  createTagIfNotExists
};

export default tagService;