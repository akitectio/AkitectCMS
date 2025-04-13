// Removed unused import of User from firebase/auth
// import { User } from 'firebase/auth';

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  LOCKED = 'LOCKED'
}

export interface User {
  id: number;
  username: string;
  email: string;
  name: string;
  fullName?: string;
  photoURL?: string;
  status?: UserStatus;
  metadata?: {
    creationTime: string;
    lastSignInTime?: string;
  };
  roles?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export type IUser = User;

export interface UserCreateRequest {
  username: string;
  email: string;
  password: string;
  fullName: string;
  roleIds: string[];
}

export interface UserUpdateRequest {
  username: string;
  email: string;
  fullName: string;
  roleIds: string[];
}

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
