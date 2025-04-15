// Removed unused import of User from firebase/auth
// import { User } from 'firebase/auth';


export enum UserStatus {
  ACTIVE = 'ACTIVE',
  LOCKED = 'LOCKED'
}

// Updated User type to include missing properties
export interface User {
  id: string;
  username: string;
  email: string;
  fullName?: string;
  name?: string;
  avatarUrl?: string | null;
  roleIds?: string[];
  lastLogin?: string;
  status: string;
  superAdmin?: boolean;
}

export type IUser = User;

export interface UserCreateRequest {
  username: string;
  email: string;
  password: string;
  fullName: string;
  roleIds: string[];
  superAdmin?: boolean;
}

export interface UserUpdateRequest {
  username: string;
  email: string;
  fullName: string;
  roleIds: string[];
  superAdmin?: boolean;
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
