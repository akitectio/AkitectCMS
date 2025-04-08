// Authentication Types
export interface LoginRequest {
    username: string;
    password: string;
  }
  
  export interface AuthUser {
    id: string;
    username: string;
    email: string;
    fullName: string;
    avatarUrl?: string;
    roles: string[];
  }
  
  export interface AuthState {
    user: AuthUser | null;
    token: string | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
  }
  
  // Dashboard Types
  export interface DashboardStats {
    usersCount: number;
    postsCount: number;
    seriesCount: number;
    lessonsCount: number;
    recentVisits: VisitData[];
    contentByCategory: CategoryData[];
  }
  
  export interface VisitData {
    date: string;
    count: number;
  }
  
  export interface CategoryData {
    category: string;
    count: number;
  }
  
  // Post Types
  export interface Post {
    id: string;
    title: string;
    slug: string;
    excerpt?: string;
    content: string;
    status: 'DRAFT' | 'PUBLISHED' | 'SCHEDULED';
    publishedAt?: string;
    featuredImageUrl?: string;
    authorId: string;
    authorName: string;
    categories: Category[];
    tags: Tag[];
    createdAt: string;
    updatedAt: string;
  }
  
  export interface Category {
    id: string;
    name: string;
    slug: string;
  }
  
  export interface Tag {
    id: string;
    name: string;
    slug: string;
  }