import { Category } from '@app/types/category';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CategoryState {
  categories: Category[];
  loading: boolean;
  error: string | null;
}

const initialState: CategoryState = {
  categories: [],
  loading: false,
  error: null,
};

export const categorySlice = createSlice({
  name: 'category',
  initialState,
  reducers: {
    fetchCategoriesRequest: (state: CategoryState) => {
      state.loading = true;
      state.error = null;
    },
    fetchCategoriesSuccess: (
      state: CategoryState,
      action: PayloadAction<Category[]>
    ) => {
      state.categories = action.payload;
      state.loading = false;
    },
    fetchCategoriesFailure: (
      state: CategoryState,
      action: PayloadAction<string>
    ) => {
      state.loading = false;
      state.error = action.payload;
    },
    createCategory: (
      state: CategoryState,
      action: PayloadAction<Category>
    ) => {
      state.categories.push(action.payload);
    },
    updateCategory: (
      state: CategoryState,
      action: PayloadAction<Category>
    ) => {
      const index = state.categories.findIndex(
        (category) => category.id === action.payload.id
      );
      if (index !== -1) {
        state.categories[index] = action.payload;
      }
    },
    deleteCategory: (
      state: CategoryState,
      action: PayloadAction<number | string>
    ) => {
      state.categories = state.categories.filter(
        (category) => category.id !== action.payload
      );
    },
  },
});

export const {
  fetchCategoriesRequest,
  fetchCategoriesSuccess,
  fetchCategoriesFailure,
  createCategory,
  updateCategory,
  deleteCategory,
} = categorySlice.actions;

export default categorySlice.reducer;
