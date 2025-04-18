import { UUID } from 'crypto';
import { User } from './user';

export interface Category  {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parent?: Category | null;
  children?: Category[];
  metaTitle?: string;
  metaDescription?: string;
  featured: boolean;
  displayOrder: number;
  createdBy?: User;
  parentId? : UUID | null;
  posts?: any[]; // We can define a Post interface if needed later
  series?: any[]; // We can define a Series interface if needed later
}

export interface CategoryState {
  categories: Category[];
}