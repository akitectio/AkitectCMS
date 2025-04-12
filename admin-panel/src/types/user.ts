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
  id: string;  // Changed from number to string to match UUID format
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface PermissionCreateRequest {
  name: string;
  description: string;
}

export interface PermissionUpdateRequest {
  name?: string;
  description?: string;
}

export interface Role {
  id: string;  // Changed from number to string to match UUID format
  name: string;
  description: string;
  permissionIds?: string[];  // Changed from permissions to permissionIds to match API response
  createdAt: string;
  updatedAt: string;
}

export interface RoleCreateRequest {
  name: string;
  description: string;
  permissionIds?: string[];  // Changed from permissions to permissionIds and from number[] to string[]
}

export interface RoleUpdateRequest {
  name?: string;
  description?: string;
  permissionIds?: string[];  // Changed from permissions to permissionIds and from number[] to string[]
}
