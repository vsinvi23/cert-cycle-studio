import { apiRequest } from "./config";
import type { 
  CertificateAuthority, 
  CreateCARequest
} from "./types";

export const caApi = {
  /**
   * GET /api/ca
   * List all Certificate Authorities with optional filtering and pagination
   */
  list: async (page: number = 0, size: number = 20, alias?: string): Promise<CertificateAuthority[]> => {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("size", size.toString());
    if (alias) params.append("alias", alias);
    return apiRequest<CertificateAuthority[]>(`/api/ca?${params.toString()}`);
  },

  /**
   * GET /api/ca
   * Get CA by alias
   */
  getByAlias: async (alias: string): Promise<CertificateAuthority> => {
    return apiRequest<CertificateAuthority>(`/api/ca?alias=${encodeURIComponent(alias)}`);
  },

  /**
   * POST /api/ca/create
   * Create a new Certificate Authority
   */
  create: async (request: CreateCARequest): Promise<string> => {
    return apiRequest<string>("/api/ca/create", {
      method: "POST",
      body: JSON.stringify(request),
    });
  },

  /**
   * POST /api/ca/import
   * Import external CA certificate
   */
  import: async (alias: string, certificate: string, privateKey?: string, keyPassword?: string): Promise<string> => {
    const params = new URLSearchParams();
    params.append("alias", alias);
    if (keyPassword) params.append("keyPassword", keyPassword);
    
    return apiRequest<string>(`/api/ca/import?${params.toString()}`, {
      method: "POST",
      body: JSON.stringify({ certificate, privateKey }),
    });
  },

  /**
   * POST /api/ca/revoke
   * Revoke Certificate Authority
   */
  revoke: async (alias: string): Promise<string> => {
    return apiRequest<string>(`/api/ca/revoke?alias=${encodeURIComponent(alias)}`, {
      method: "POST",
    });
  },

  /**
   * DELETE /api/ca
   * Delete Certificate Authority by alias
   */
  delete: async (alias: string): Promise<string> => {
    return apiRequest<string>(`/api/ca?alias=${encodeURIComponent(alias)}`, {
      method: "DELETE",
    });
  },
};
