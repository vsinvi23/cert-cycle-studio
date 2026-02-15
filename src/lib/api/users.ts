import { apiRequest } from "./config";
import type {
  User,
  UserResponse,
  CreateUserRequest,
  UpdateUserRequest,
  ChangePasswordRequest,
  UserStatistics,
  PaginatedResponse,
} from "./types";

/**
 * User Management APIs
 * Complete implementation of all 18 user management endpoints
 */
export const usersApi = {
  /**
   * 1. POST /api/users
   * Create new user account with profile information and optional role assignments
   */
  createUser: async (request: CreateUserRequest): Promise<UserResponse> => {
    return apiRequest<UserResponse>("/api/users", {
      method: "POST",
      body: JSON.stringify(request),
    });
  },

  /**
   * 2. GET /api/users/{userId}
   * Retrieve complete user information including profile data and assigned roles
   */
  getUserById: async (userId: number): Promise<UserResponse> => {
    return apiRequest<UserResponse>(`/api/users/${userId}`);
  },

  /**
   * 3. GET /api/users/username/{username}
   * Retrieve user information by username
   */
  getUserByUsername: async (username: string): Promise<UserResponse> => {
    return apiRequest<UserResponse>(`/api/users/username/${encodeURIComponent(username)}`);
  },

  /**
   * 4. GET /api/users
   * Retrieve paginated list of all users with sorting support
   */
  getAllUsers: async (params?: {
    page?: number;
    size?: number;
    sortBy?: string;
    sortOrder?: "ASC" | "DESC";
  }): Promise<PaginatedResponse<UserResponse>> => {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined) queryParams.append("page", params.page.toString());
    if (params?.size !== undefined) queryParams.append("size", params.size.toString());
    if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder);

    const url = `/api/users${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
    return apiRequest<PaginatedResponse<UserResponse>>(url);
  },

  /**
   * 5. GET /api/users/search
   * Search users by username, email, first name, or last name
   */
  searchUsers: async (params: {
    searchTerm: string;
    page?: number;
    size?: number;
    sortBy?: string;
    sortOrder?: "ASC" | "DESC";
  }): Promise<PaginatedResponse<UserResponse>> => {
    const queryParams = new URLSearchParams();
    queryParams.append("searchTerm", params.searchTerm);
    if (params.page !== undefined) queryParams.append("page", params.page.toString());
    if (params.size !== undefined) queryParams.append("size", params.size.toString());
    if (params.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);

    return apiRequest<PaginatedResponse<UserResponse>>(`/api/users/search?${queryParams.toString()}`);
  },

  /**
   * 6. GET /api/users/role/{roleName}
   * Retrieve paginated list of users with a specific role
   */
  getUsersByRole: async (
    roleName: string,
    params?: { page?: number; size?: number; sortBy?: string; sortOrder?: "ASC" | "DESC" }
  ): Promise<PaginatedResponse<UserResponse>> => {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined) queryParams.append("page", params.page.toString());
    if (params?.size !== undefined) queryParams.append("size", params.size.toString());
    if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder);

    const url = `/api/users/role/${encodeURIComponent(roleName)}${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    return apiRequest<PaginatedResponse<UserResponse>>(url);
  },

  /**
   * 7. GET /api/users/department/{department}
   * Retrieve paginated list of users in a specific department
   */
  getUsersByDepartment: async (
    department: string,
    params?: { page?: number; size?: number; sortBy?: string; sortOrder?: "ASC" | "DESC" }
  ): Promise<PaginatedResponse<UserResponse>> => {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined) queryParams.append("page", params.page.toString());
    if (params?.size !== undefined) queryParams.append("size", params.size.toString());
    if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder);

    const url = `/api/users/department/${encodeURIComponent(department)}${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    return apiRequest<PaginatedResponse<UserResponse>>(url);
  },

  /**
   * 8. GET /api/users/status/{enabled}
   * Retrieve users filtered by enabled/disabled status
   */
  getUsersByStatus: async (
    enabled: boolean,
    params?: { page?: number; size?: number; sortBy?: string; sortOrder?: "ASC" | "DESC" }
  ): Promise<PaginatedResponse<UserResponse>> => {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined) queryParams.append("page", params.page.toString());
    if (params?.size !== undefined) queryParams.append("size", params.size.toString());
    if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder);

    const url = `/api/users/status/${enabled}${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
    return apiRequest<PaginatedResponse<UserResponse>>(url);
  },

  /**
   * 9. PUT /api/users/{userId}
   * Update user profile information and account settings
   */
  updateUser: async (userId: number, request: UpdateUserRequest): Promise<UserResponse> => {
    return apiRequest<UserResponse>(`/api/users/${userId}`, {
      method: "PUT",
      body: JSON.stringify(request),
    });
  },

  /**
   * 10. PUT /api/users/{userId}/password
   * Change user password
   */
  changePassword: async (userId: number, request: ChangePasswordRequest): Promise<void> => {
    return apiRequest<void>(`/api/users/${userId}/password`, {
      method: "PUT",
      body: JSON.stringify(request),
    });
  },

  /**
   * 11. DELETE /api/users/{userId}
   * Permanently delete user account
   */
  deleteUser: async (userId: number): Promise<void> => {
    return apiRequest<void>(`/api/users/${userId}`, {
      method: "DELETE",
    });
  },

  /**
   * 12. PUT /api/users/{userId}/enabled/{enabled}
   * Enable or disable user account
   */
  setUserEnabled: async (userId: number, enabled: boolean): Promise<UserResponse> => {
    return apiRequest<UserResponse>(`/api/users/${userId}/enabled/${enabled}`, {
      method: "PUT",
    });
  },

  /**
   * 13. PUT /api/users/{userId}/locked/{locked}
   * Lock or unlock user account
   */
  setUserLocked: async (userId: number, locked: boolean): Promise<UserResponse> => {
    return apiRequest<UserResponse>(`/api/users/${userId}/locked/${locked}`, {
      method: "PUT",
    });
  },

  /**
   * 14. POST /api/users/{userId}/roles/{roleId}
   * Assign a role to user for RBAC permissions
   */
  assignRole: async (userId: number, roleId: number): Promise<UserResponse> => {
    return apiRequest<UserResponse>(`/api/users/${userId}/roles/${roleId}`, {
      method: "POST",
    });
  },

  /**
   * 15. DELETE /api/users/{userId}/roles/{roleId}
   * Remove a role assignment from user
   */
  removeRole: async (userId: number, roleId: number): Promise<UserResponse> => {
    return apiRequest<UserResponse>(`/api/users/${userId}/roles/${roleId}`, {
      method: "DELETE",
    });
  },

  /**
   * 16. GET /api/users/statistics
   * Retrieve comprehensive user statistics
   */
  getStatistics: async (): Promise<UserStatistics> => {
    return apiRequest<UserStatistics>("/api/users/statistics");
  },

  /**
   * 17. POST /api/register (Public endpoint - handled in auth.ts)
   * Self-service user registration
   */
  // This is handled by authApi.register() in auth.ts

  /**
   * 18. POST /api/auth/login (Public endpoint - handled in auth.ts)
   * Authenticate user and receive JWT token
   */
  // This is handled by authApi.login() in auth.ts
};
