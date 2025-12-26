import { apiRequest } from "./config";
import type { CertificateAuthority, CreateCARequest, PaginatedResponse } from "./types";

export const caApi = {
  /**
   * List all Certificate Authorities
   */
  list: async (page: number = 0, size: number = 10, alias?: string): Promise<PaginatedResponse<CertificateAuthority> | CertificateAuthority[]> => {
    let url = `/api/ca?page=${page}&size=${size}`;
    if (alias) {
      url += `&alias=${encodeURIComponent(alias)}`;
    }
    return apiRequest<PaginatedResponse<CertificateAuthority> | CertificateAuthority[]>(url);
  },

  /**
   * Get CA by alias
   */
  getByAlias: async (alias: string): Promise<CertificateAuthority> => {
    return apiRequest<CertificateAuthority>(`/api/ca?alias=${encodeURIComponent(alias)}`);
  },

  /**
   * Create a new Root CA
   */
  create: async (request: CreateCARequest): Promise<string> => {
    return apiRequest<string>("/api/ca/create", {
      method: "POST",
      body: JSON.stringify(request),
    });
  },

  /**
   * Import Root CA
   */
  import: async (alias: string, certificate: string, privateKey?: string, keyPassword?: string): Promise<string> => {
    let url = `/api/ca/import?alias=${encodeURIComponent(alias)}`;
    if (keyPassword) {
      url += `&keyPassword=${encodeURIComponent(keyPassword)}`;
    }
    return apiRequest<string>(url, {
      method: "POST",
      body: JSON.stringify({ certificate, privateKey }),
    });
  },

  /**
   * Revoke CA
   */
  revoke: async (alias: string): Promise<string> => {
    return apiRequest<string>(`/api/ca/revoke?alias=${encodeURIComponent(alias)}`, {
      method: "POST",
    });
  },

  /**
   * Delete CA
   */
  delete: async (alias: string): Promise<string> => {
    return apiRequest<string>(`/api/ca?alias=${encodeURIComponent(alias)}`, {
      method: "DELETE",
    });
  },
};
