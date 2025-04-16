import axios from '@app/configs/axiosConfig';
import { Category } from '@app/types/category';
import { CATEGORY_ENDPOINTS } from './apiEndpoints';

// Get all categories
export const getAllCategories = async (): Promise<Category[]> => {
  const response = await axios.get(CATEGORY_ENDPOINTS.GET_ALL);
  return response.data?.categories || [];
};

// Get all categories in tree structure (without pagination)
export const getAllCategoriesTree = async (): Promise<Category[]> => {
  const response = await axios.get(CATEGORY_ENDPOINTS.GET_ALL_TREE);
  return response.data?.categories || [];
};

// Get a category by ID
export const getCategory = async (id: string): Promise<Category> => {
  const response = await axios.get(CATEGORY_ENDPOINTS.GET_BY_ID(id));
  return response.data;
};

// Create a new category
export const createCategory = async (categoryData: Partial<Category>): Promise<Category> => {
  const response = await axios.post(CATEGORY_ENDPOINTS.CREATE, categoryData);
  return response.data;
};

// Update an existing category
export const updateCategory = async (id: string, categoryData: Partial<Category>): Promise<Category> => {
  const response = await axios.put(CATEGORY_ENDPOINTS.UPDATE(id), categoryData);
  return response.data;
};

// Delete a category
export const deleteCategory = async (id: string): Promise<void> => {
  await axios.delete(CATEGORY_ENDPOINTS.DELETE(id));
};

// Search categories with full-text search (Select2-style)
export const searchCategories = async (query: string): Promise<Category[]> => {
  const response = await axios.get(`${CATEGORY_ENDPOINTS.SEARCH}?q=${encodeURIComponent(query)}`);
  return response.data?.categories || [];
};

const categoryService = {
  getAllCategories,
  getAllCategoriesTree,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  searchCategories // Add the new search method
};

export default categoryService;