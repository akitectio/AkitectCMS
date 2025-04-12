// Removed unused import of User from firebase/auth
// import { User } from 'firebase/auth';

export interface User {
  id: number;
  username: string;
  email: string;
  name: string;
  photoURL?: string;
  metadata?: {
    creationTime: string;
    lastSignInTime?: string;
  };
  roles?: string[];
}

export type IUser = User;

export interface Permission {
  id: number;
  name: string;
  description: string;
  module: string; // The module/section this permission applies to
  key: string; // Unique identifier for this permission (e.g., "users.create")
  createdAt: string;
  updatedAt: string;
}

export interface PermissionCreateRequest {
  name: string;
  description: string;
  module: string;
  key: string;
}

export interface PermissionUpdateRequest {
  name?: string;
  description?: string;
  module?: string;
  key?: string;
}
