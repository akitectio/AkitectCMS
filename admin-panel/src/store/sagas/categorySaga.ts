import { createCategory as createCategoryService, updateCategory as updateCategoryService } from '@app/services/categories';
import { Category } from '@app/types/category';
import { createCategory, updateCategory } from '@store/reducers/category';
import { call, takeLatest } from 'redux-saga/effects';

// Worker saga: Create category
function* handleCreateCategory(action: { payload: Category }): Generator<any, void, any> {
  try {
    const response = yield call(createCategoryService, action.payload);
    console.log('Category created:', response);
  } catch (error) {
    console.error('Error creating category:', error);
  }
}

// Worker saga: Update category
function* handleUpdateCategory(action: { payload: Category }): Generator<any, void, any> {
  try {
    const response = yield call(updateCategoryService, action.payload.id, action.payload);
    console.log('Category updated:', response);
  } catch (error) {
    console.error('Error updating category:', error);
  }
}

// Watcher saga
export default function* categorySaga(): Generator<any, void, any> {
  yield takeLatest(createCategory, handleCreateCategory);
  yield takeLatest(updateCategory, handleUpdateCategory);
}