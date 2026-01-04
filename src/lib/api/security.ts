import { apiRequest } from "./config";
import type { 
  Role, 
  CreateRoleRequest,
  SAMLConfiguration,
  CreateApiKeyRequest,
  CreateApiKeyResponse
} from "./types";

export const securityApi = {
  // ==================== RBAC ROLES ====================

  /**
   * GET /api/security/rbac/roles
   * List all RBAC roles
   */
  getAllRoles: async (): Promise<Role[]> => {
    return apiRequest<Role[]>("/api/security/rbac/roles");
  },

  /**
   * POST /api/security/rbac/roles
   * Create RBAC role
   */
  createRole: async (role: CreateRoleRequest): Promise<Role> => {
    return apiRequest<Role>("/api/security/rbac/roles", {
      method: "POST",
      body: JSON.stringify(role),
    });
  },

  /**
   * PUT /api/security/rbac/roles/{id}/permissions
   * Assign permissions to role
   */
  assignPermissions: async (roleId: number, permissions: { permissions: string[] }): Promise<Role> => {
    return apiRequest<Role>(`/api/security/rbac/roles/${roleId}/permissions`, {
      method: "PUT",
      body: JSON.stringify(permissions),
    });
  },

  // ==================== SAML/SSO ====================

  /**
   * POST /api/security/saml/configure
   * Configure SAML/SSO integration
   */
  configureSAML: async (config: SAMLConfiguration): Promise<string> => {
    return apiRequest<string>("/api/security/saml/configure", {
      method: "POST",
      body: JSON.stringify(config),
    });
  },

  // ==================== MFA ====================

  /**
   * POST /api/security/mfa/enable
   * Enable Multi-Factor Authentication
   */
  enableMFA: async (userId: number, method: "TOTP" | "SMS" | "EMAIL"): Promise<string> => {
    return apiRequest<string>(`/api/security/mfa/enable?userId=${userId}&method=${method}`, {
      method: "POST",
    });
  },

  // ==================== API KEYS ====================

  /**
   * GET /api/security/api-keys
   * Get all API keys
   */
  getApiKeys: async (): Promise<import("./types").ApiKey[]> => {
    return apiRequest<import("./types").ApiKey[]>("/api/security/api-keys");
  },

  /**
   * POST /api/security/api-keys/generate
   * Generate secure API key
   */
  generateApiKey: async (config: CreateApiKeyRequest): Promise<CreateApiKeyResponse> => {
    return apiRequest<CreateApiKeyResponse>("/api/security/api-keys/generate", {
      method: "POST",
      body: JSON.stringify(config),
    });
  },

  /**
   * DELETE /api/security/api-keys/{id}
   * Revoke an API key
   */
  revokeApiKey: async (keyId: number): Promise<void> => {
    return apiRequest<void>(`/api/security/api-keys/${keyId}`, {
      method: "DELETE",
    });
  },

  // ==================== KEY ROTATION ====================

  /**
   * POST /api/security/keys/rotation/configure
   * Configure key rotation
   */
  configureKeyRotation: async (rotationDays: number, autoRotate: boolean = false): Promise<string> => {
    return apiRequest<string>(`/api/security/keys/rotation/configure?rotationDays=${rotationDays}&autoRotate=${autoRotate}`, {
      method: "POST",
    });
  },
};
