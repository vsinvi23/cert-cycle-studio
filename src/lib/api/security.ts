import { apiRequest } from "./config";
import type { Role } from "./types";

export const securityApi = {
  /**
   * Get all roles
   */
  getAllRoles: async (): Promise<Role[]> => {
    return apiRequest<Role[]>("/api/security/rbac/roles");
  },

  /**
   * Create a new role
   */
  createRole: async (role: { name: string; description: string; permissions: string[] }): Promise<Role> => {
    return apiRequest<Role>("/api/security/rbac/roles", {
      method: "POST",
      body: JSON.stringify(role),
    });
  },

  /**
   * Assign permissions to a role
   */
  assignPermissions: async (roleId: number, permissions: Record<string, unknown>): Promise<Role> => {
    return apiRequest<Role>(`/api/security/rbac/roles/${roleId}/permissions`, {
      method: "PUT",
      body: JSON.stringify(permissions),
    });
  },

  /**
   * Enable MFA for user
   */
  enableMFA: async (userId: number, method: "TOTP" | "SMS" | "EMAIL"): Promise<string> => {
    return apiRequest<string>(
      `/api/security/mfa/enable?userId=${userId}&method=${method}`,
      { method: "POST" }
    );
  },

  /**
   * Configure SAML/SSO
   */
  configureSAML: async (config: Record<string, string>): Promise<string> => {
    return apiRequest<string>("/api/security/saml/configure", {
      method: "POST",
      body: JSON.stringify(config),
    });
  },

  /**
   * Generate API key
   */
  generateApiKey: async (config: { name: string; permissions: string[]; validityDays?: number }): Promise<string> => {
    return apiRequest<string>("/api/security/api-keys/generate", {
      method: "POST",
      body: JSON.stringify(config),
    });
  },

  /**
   * Configure key rotation
   */
  configureKeyRotation: async (rotationDays: number, autoRotate: boolean = false): Promise<string> => {
    return apiRequest<string>(
      `/api/security/keys/rotation/configure?rotationDays=${rotationDays}&autoRotate=${autoRotate}`,
      { method: "POST" }
    );
  },
};
