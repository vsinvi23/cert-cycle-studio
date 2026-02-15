import { apiRequest } from "./config";
import type {
  Role,
  CreateRoleRequest,
  UpdateRoleRequest,
  RoleStatistics,
  AvailablePermissions,
  CloneRoleRequest,
  PaginatedResponse,
  UserResponse,
} from "./types";

/**
 * Role Management APIs
 * Complete RBAC (Role-Based Access Control) implementation
 */
export const rolesApi = {
  /**
   * 1. POST /api/roles
   * Create a new role with permissions
   */
  createRole: async (request: CreateRoleRequest): Promise<Role> => {
    return apiRequest<Role>("/api/roles", {
      method: "POST",
      body: JSON.stringify(request),
    });
  },

  /**
   * 2. GET /api/roles
   * Get all roles with pagination and sorting
   */
  getAllRoles: async (params?: {
    page?: number;
    size?: number;
    sortBy?: string;
    sortOrder?: string;
  }): Promise<PaginatedResponse<Role>> => {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined) queryParams.append("page", params.page.toString());
    if (params?.size !== undefined) queryParams.append("size", params.size.toString());
    if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder);

    const url = `/api/roles${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
    return apiRequest<PaginatedResponse<Role>>(url);
  },

  /**
   * Search roles by name or description
   */
  searchRoles: async (
    searchTerm: string,
    params?: { page?: number; size?: number; sortBy?: string; sortOrder?: string }
  ): Promise<PaginatedResponse<Role>> => {
    const queryParams = new URLSearchParams();
    queryParams.append("searchTerm", searchTerm);
    if (params?.page !== undefined) queryParams.append("page", params.page.toString());
    if (params?.size !== undefined) queryParams.append("size", params.size.toString());
    if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder);

    return apiRequest<PaginatedResponse<Role>>(`/api/roles/search?${queryParams.toString()}`);
  },

  /**
   * 3. GET /api/roles/{roleId}
   * Get role details by ID
   */
  getRoleById: async (roleId: number): Promise<Role> => {
    return apiRequest<Role>(`/api/roles/${roleId}`);
  },

  /**
   * 4. PUT /api/roles/{roleId}
   * Update role information (name, description, permissions)
   */
  updateRole: async (roleId: number, request: UpdateRoleRequest): Promise<Role> => {
    return apiRequest<Role>(`/api/roles/${roleId}`, {
      method: "PUT",
      body: JSON.stringify(request),
    });
  },

  /**
   * 5. DELETE /api/roles/{roleId}
   * Delete a role (cannot delete system roles or roles with assigned users)
   */
  deleteRole: async (roleId: number): Promise<void> => {
    return apiRequest<void>(`/api/roles/${roleId}`, {
      method: "DELETE",
    });
  },

  /**
   * 6. GET /api/roles/name/{roleName}
   * Get role details by name
   */
  getRoleByName: async (roleName: string): Promise<Role> => {
    return apiRequest<Role>(`/api/roles/name/${encodeURIComponent(roleName)}`);
  },

  /**
   * 7. GET /api/roles/{roleId}/users
   * Get all users assigned to a specific role (paginated)
   */
  getUsersByRole: async (
    roleId: number,
    params?: { page?: number; size?: number }
  ): Promise<PaginatedResponse<UserResponse>> => {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined) queryParams.append("page", params.page.toString());
    if (params?.size !== undefined) queryParams.append("size", params.size.toString());

    const url = `/api/roles/${roleId}/users${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    return apiRequest<PaginatedResponse<UserResponse>>(url);
  },

  /**
   * 8. POST /api/roles/{roleId}/permissions
   * Add multiple permissions to a role
   */
  addPermissions: async (roleId: number, permissions: string[]): Promise<Role> => {
    return apiRequest<Role>(`/api/roles/${roleId}/permissions`, {
      method: "POST",
      body: JSON.stringify(permissions),
    });
  },

  /**
   * 9. DELETE /api/roles/{roleId}/permissions
   * Remove multiple permissions from a role
   */
  removePermissions: async (roleId: number, permissions: string[]): Promise<Role> => {
    return apiRequest<Role>(`/api/roles/${roleId}/permissions`, {
      method: "DELETE",
      body: JSON.stringify(permissions),
    });
  },

  /**
   * 10. POST /api/roles/{roleId}/permissions/{permission}
   * Add a single permission to role
   */
  addPermission: async (roleId: number, permission: string): Promise<Role> => {
    return apiRequest<Role>(`/api/roles/${roleId}/permissions/${encodeURIComponent(permission)}`, {
      method: "POST",
    });
  },

  /**
   * 11. DELETE /api/roles/{roleId}/permissions/{permission}
   * Remove a single permission from role
   */
  removePermission: async (roleId: number, permission: string): Promise<Role> => {
    return apiRequest<Role>(`/api/roles/${roleId}/permissions/${encodeURIComponent(permission)}`, {
      method: "DELETE",
    });
  },

  /**
   * 12. GET /api/roles/permissions
   * Get all available permissions in the system
   */
  getAllPermissions: async (): Promise<string[]> => {
    return apiRequest<string[]>("/api/roles/permissions");
  },

  /**
   * 13. GET /api/roles/permissions/available
   * Get all available permissions (alternative endpoint)
   */
  getAvailablePermissions: async (): Promise<AvailablePermissions> => {
    return apiRequest<AvailablePermissions>("/api/roles/permissions/available");
  },

  /**
   * 14. GET /api/roles/status/{enabled}
   * Get roles by enabled/disabled status (paginated)
   */
  getRolesByStatus: async (
    enabled: boolean,
    params?: { page?: number; size?: number }
  ): Promise<PaginatedResponse<Role>> => {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined) queryParams.append("page", params.page.toString());
    if (params?.size !== undefined) queryParams.append("size", params.size.toString());

    const url = `/api/roles/status/${enabled}${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    return apiRequest<PaginatedResponse<Role>>(url);
  },

  /**
   * 15. GET /api/roles/enabled
   * Get all enabled roles (no pagination, for dropdowns)
   */
  getEnabledRoles: async (): Promise<Role[]> => {
    return apiRequest<Role[]>("/api/roles/enabled");
  },

  /**
   * 16. PUT /api/roles/{roleId}/enabled/{enabled}
   * Enable or disable a role
   */
  setRoleEnabled: async (roleId: number, enabled: boolean): Promise<Role> => {
    return apiRequest<Role>(`/api/roles/${roleId}/enabled/${enabled}`, {
      method: "PUT",
    });
  },

  /**
   * 17. POST /api/roles/{roleId}/clone
   * Clone an existing role with a new name
   */
  cloneRole: async (roleId: number, request: CloneRoleRequest): Promise<Role> => {
    return apiRequest<Role>(`/api/roles/${roleId}/clone`, {
      method: "POST",
      body: JSON.stringify(request),
    });
  },

  /**
   * 18. GET /api/roles/statistics
   * Get role usage statistics and analytics
   */
  getRoleStatistics: async (): Promise<RoleStatistics> => {
    return apiRequest<RoleStatistics>("/api/roles/statistics");
  },
};
