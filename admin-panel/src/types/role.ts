export interface Role {
  id: string;
  name: string;
  permissions: string[];
}

export interface RoleCreateRequest {
  name: string;
  permissions: string[];
}

export interface RoleUpdateRequest {
  id: string;
  name: string;
  permissions: string[];
}