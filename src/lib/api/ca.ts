import { apiRequest } from "./config";
import apiClient from "../apiClient";
import type { 
  CertificateAuthority, 
  CreateCARequest,
  CAListResponse
} from "./types";

export const caApi = {
  /**
   * GET /api/ca
   * List all Certificate Authorities with optional filtering and pagination
   */
  list: async (options?: {
    page?: number;
    size?: number;
    alias?: string;
    sortBy?: string;
    sortOrder?: "ASC" | "DESC";
  }): Promise<CAListResponse> => {
    const params = new URLSearchParams();
    params.append("page", (options?.page ?? 0).toString());
    params.append("size", (options?.size ?? 10).toString());
    if (options?.alias) params.append("alias", options.alias);
    if (options?.sortBy) params.append("sortBy", options.sortBy);
    if (options?.sortOrder) params.append("sortOrder", options.sortOrder);
    
    const response = await apiClient.get<CAListResponse>(`/api/ca?${params.toString()}`);
    return response.data;
  },

  /**
   * GET /api/ca
   * Get CA by alias
   */
  getByAlias: async (alias: string): Promise<CAListResponse> => {
    const response = await apiClient.get<CAListResponse>(`/api/ca?alias=${encodeURIComponent(alias)}`);
    return response.data;
  },

  /**
   * POST /api/ca/create
   * Create a new Root Certificate Authority
   */
  create: async (request: CreateCARequest): Promise<string> => {
    const response = await apiClient.post<string>("/api/ca/create", request);
    return response.data;
  },

  /**
   * POST /api/ca/import
   * Import external CA certificate (multipart/form-data)
   */
  importCA: async (
    alias: string, 
    certificateFile: File, 
    privateKeyFile?: File, 
    keyPassword?: string
  ): Promise<string> => {
    const formData = new FormData();
    formData.append("alias", alias);
    formData.append("certificate", certificateFile);
    if (privateKeyFile) {
      formData.append("privateKey", privateKeyFile);
    }
    if (keyPassword) {
      formData.append("keyPassword", keyPassword);
    }
    
    const response = await apiClient.post<string>("/api/ca/import", formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * POST /api/ca/revoke
   * Revoke Certificate Authority
   */
  revoke: async (alias: string): Promise<string> => {
    const response = await apiClient.post<string>(`/api/ca/revoke?alias=${encodeURIComponent(alias)}`);
    return response.data;
  },

  /**
   * DELETE /api/ca
   * Delete Certificate Authority by alias
   */
  delete: async (alias: string): Promise<string> => {
    const response = await apiClient.delete<string>(`/api/ca?alias=${encodeURIComponent(alias)}`);
    return response.data;
  },
};
