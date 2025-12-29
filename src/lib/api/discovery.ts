import { apiRequest } from "./config";
import type { DiscoveryConfiguration, DiscoveryResult, CreateDiscoveryRequest } from "./types";

export const discoveryApi = {
  /**
   * Get all discovery configurations
   */
  getAll: async (): Promise<DiscoveryConfiguration[]> => {
    return apiRequest<DiscoveryConfiguration[]>("/api/discovery/configurations");
  },

  /**
   * Get discovery configuration by ID
   */
  getById: async (id: number): Promise<DiscoveryConfiguration> => {
    return apiRequest<DiscoveryConfiguration>(`/api/discovery/configurations/${id}`);
  },

  /**
   * Create discovery configuration
   */
  create: async (request: CreateDiscoveryRequest): Promise<DiscoveryConfiguration> => {
    return apiRequest<DiscoveryConfiguration>("/api/discovery/configurations", {
      method: "POST",
      body: JSON.stringify(request),
    });
  },

  /**
   * Update discovery configuration
   */
  update: async (id: number, request: CreateDiscoveryRequest): Promise<DiscoveryConfiguration> => {
    return apiRequest<DiscoveryConfiguration>(`/api/discovery/configurations/${id}`, {
      method: "PUT",
      body: JSON.stringify(request),
    });
  },

  /**
   * Delete discovery configuration
   */
  delete: async (id: number): Promise<void> => {
    return apiRequest<void>(`/api/discovery/configurations/${id}`, {
      method: "DELETE",
    });
  },

  /**
   * Run discovery scan manually
   */
  run: async (id: number): Promise<DiscoveryResult> => {
    return apiRequest<DiscoveryResult>(`/api/discovery/configurations/${id}/run`, {
      method: "POST",
    });
  },

  /**
   * Get discovery results
   */
  getResults: async (configId: number): Promise<DiscoveryResult[]> => {
    return apiRequest<DiscoveryResult[]>(`/api/discovery/configurations/${configId}/results`);
  },

  /**
   * Scan LDAP/Active Directory for certificates
   */
  scanLDAP: async (config: {
    server: string;
    port: string;
    baseDN: string;
    username: string;
    password: string;
  }): Promise<string> => {
    return apiRequest<string>("/api/discovery/scan/ldap", {
      method: "POST",
      body: JSON.stringify(config),
    });
  },

  /**
   * Scan cloud provider for certificates
   */
  scanCloud: async (provider: string, credentials: Record<string, string>): Promise<string> => {
    return apiRequest<string>(`/api/discovery/scan/cloud?provider=${encodeURIComponent(provider)}`, {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  },

  /**
   * Scan filesystem for certificates
   */
  scanFilesystem: async (path: string): Promise<string> => {
    return apiRequest<string>(`/api/discovery/scan/filesystem?path=${encodeURIComponent(path)}`, {
      method: "POST",
    });
  },

  /**
   * Schedule recurring discovery scan
   */
  schedule: async (config: {
    name: string;
    discoveryType: "LDAP" | "CLOUD" | "FILESYSTEM";
    configuration: Record<string, unknown>;
    schedule: string;
  }): Promise<DiscoveryConfiguration> => {
    return apiRequest<DiscoveryConfiguration>("/api/discovery/schedule", {
      method: "POST",
      body: JSON.stringify(config),
    });
  },

  /**
   * Get certificate discovery changes
   */
  getChanges: async (): Promise<string> => {
    return apiRequest<string>("/api/discovery/changes");
  },
};
