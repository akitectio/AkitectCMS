export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featuredImageUrl?: string;
  status: string;
  publishedAt?: string;
  metaTitle?: string;
  metaDescription?: string;
  featured: boolean;
  allowComments: boolean;
  viewsCount: number;
  createdAt: string;
  updatedAt: string;
  authorId: string;
  authorUsername: string;
  authorFullName?: string;
  categories?: Category[];
  tags?: Tag[];
}

export interface PostFilterParams {
  page?: number;
  size?: number;
  search?: string;
  status?: string;
  categoryId?: string;
  authorId?: string;
}

export interface PostCreateRequest {
  title: string;
  slug?: string;
  content: string;
  excerpt?: string;
  featuredImageUrl?: string;
  status: string;
  metaTitle?: string;
  metaDescription?: string;
  featured?: boolean;
  allowComments?: boolean;
  authorId?: string;
  categoryIds?: string[];
  tagIds?: string[];
}

export interface PostUpdateRequest {
  title: string;
  slug?: string;
  content: string;
  excerpt?: string;
  featuredImageUrl?: string;
  status: string;
  metaTitle?: string;
  metaDescription?: string;
  featured?: boolean;
  allowComments?: boolean;
  categoryIds?: string[];
  tagIds?: string[];
}

export interface PostRevision {
  id: string;
  postId: string;
  revisionNumber: number;
  title: string;
  content: string;
  excerpt?: string;
  createdAt: string;
  createdById: string;
  createdByUsername: string;
  createdByFullName?: string;
}

export interface PostState {
  posts: Post[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  selectedPost: Post | null;
  loading: boolean;
  error: string | null;
}