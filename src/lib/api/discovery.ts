import { apiRequest } from "./config";
import type { 
  DiscoveryConfiguration, 
  DiscoveryResult, 
  CreateDiscoveryRequest,
  LDAPScanRequest,
  CloudScanRequest,
  FilesystemScanRequest,
  ScheduleDiscoveryRequest
} from "./types";

export const discoveryApi = {
  /**
   * GET /api/discovery/configurations
   * Get all discovery configurations
   */
  getAll: async (): Promise<DiscoveryConfiguration[]> => {
    return apiRequest<DiscoveryConfiguration[]>("/api/discovery/configurations");
  },

  /**
   * GET /api/discovery/configurations/{id}
   * Get discovery configuration by ID
   */
  getById: async (id: number): Promise<DiscoveryConfiguration> => {
    return apiRequest<DiscoveryConfiguration>(`/api/discovery/configurations/${id}`);
  },

  /**
   * POST /api/discovery/configurations
   * Create discovery configuration
   */
  create: async (request: CreateDiscoveryRequest): Promise<DiscoveryConfiguration> => {
    return apiRequest<DiscoveryConfiguration>("/api/discovery/configurations", {
      method: "POST",
      body: JSON.stringify(request),
    });
  },

  /**
   * PUT /api/discovery/configurations/{id}
   * Update discovery configuration
   */
  update: async (id: number, request: CreateDiscoveryRequest): Promise<DiscoveryConfiguration> => {
    return apiRequest<DiscoveryConfiguration>(`/api/discovery/configurations/${id}`, {
      method: "PUT",
      body: JSON.stringify(request),
    });
  },

  /**
   * DELETE /api/discovery/configurations/{id}
   * Delete discovery configuration
   */
  delete: async (id: number): Promise<void> => {
    return apiRequest<void>(`/api/discovery/configurations/${id}`, {
      method: "DELETE",
    });
  },

  /**
   * POST /api/discovery/configurations/{id}/run
   * Run discovery scan manually
   */
  run: async (id: number): Promise<DiscoveryResult> => {
    return apiRequest<DiscoveryResult>(`/api/discovery/configurations/${id}/run`, {
      method: "POST",
    });
  },

  /**
   * GET /api/discovery/configurations/{configId}/results
   * Get discovery results
   */
  getResults: async (configId: number): Promise<DiscoveryResult[]> => {
    return apiRequest<DiscoveryResult[]>(`/api/discovery/configurations/${configId}/results`);
  },

  /**
   * POST /api/discovery/scan/ldap
   * LDAP/AD certificate discovery
   */
  scanLDAP: async (config: LDAPScanRequest): Promise<string> => {
    return apiRequest<string>("/api/discovery/scan/ldap", {
      method: "POST",
      body: JSON.stringify(config),
    });
  },

  /**
   * POST /api/discovery/scan/cloud
   * Cloud provider scanning (AWS/Azure/GCP)
   */
  scanCloud: async (config: CloudScanRequest): Promise<string> => {
    return apiRequest<string>("/api/discovery/scan/cloud", {
      method: "POST",
      body: JSON.stringify(config),
    });
  },

  /**
   * POST /api/discovery/scan/filesystem
   * Filesystem certificate scanning
   */
  scanFilesystem: async (config: FilesystemScanRequest): Promise<string> => {
    return apiRequest<string>("/api/discovery/scan/filesystem", {
      method: "POST",
      body: JSON.stringify(config),
    });
  },

  /**
   * POST /api/discovery/schedule
   * Schedule recurring discovery
   */
  schedule: async (config: ScheduleDiscoveryRequest): Promise<DiscoveryConfiguration> => {
    return apiRequest<DiscoveryConfiguration>("/api/discovery/schedule", {
      method: "POST",
      body: JSON.stringify(config),
    });
  },

  /**
   * GET /api/discovery/changes
   * Track discovery changes
   */
  getChanges: async (): Promise<string> => {
    return apiRequest<string>("/api/discovery/changes");
  },
};
