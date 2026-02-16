import { apiRequest } from "./config";
import apiClient from "../apiClient";
import type { 
  DiscoveryConfiguration, 
  DiscoveryResult, 
  CreateDiscoveryRequest,
  LDAPScanRequest,
  LDAPScanResponse,
  CloudScanRequest,
  CloudScanResponse,
  FilesystemScanResponse,
  ScheduleDiscoveryRequest,
  ScheduledDiscovery,
  DiscoveryChange
} from "./types";
import type { PaginatedResponse, DiscoveryFilters } from "./types/pagination";
import { buildQueryParams } from "./types/pagination";

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
   * Scan LDAP/Active Directory for certificates
   */
  scanLDAP: async (config: LDAPScanRequest): Promise<LDAPScanResponse> => {
    const response = await apiClient.post<LDAPScanResponse>("/api/discovery/scan/ldap", config);
    return response.data;
  },

  /**
   * POST /api/discovery/scan/cloud
   * Scan cloud provider for certificates (AWS/Azure/GCP)
   */
  scanCloud: async (provider: "aws" | "azure" | "gcp", config: CloudScanRequest): Promise<CloudScanResponse> => {
    const response = await apiClient.post<CloudScanResponse>(
      `/api/discovery/scan/cloud?provider=${provider}`, 
      config
    );
    return response.data;
  },

  /**
   * POST /api/discovery/scan/filesystem
   * Scan filesystem directories for certificate files
   */
  scanFilesystem: async (path: string): Promise<FilesystemScanResponse> => {
    const response = await apiClient.post<FilesystemScanResponse>(
      `/api/discovery/scan/filesystem?path=${encodeURIComponent(path)}`
    );
    return response.data;
  },

  /**
   * POST /api/discovery/schedule
   * Schedule recurring discovery scans
   */
  schedule: async (config: ScheduleDiscoveryRequest): Promise<ScheduledDiscovery> => {
    const response = await apiClient.post<ScheduledDiscovery>("/api/discovery/schedule", config);
    return response.data;
  },

  /**
   * GET /api/discovery/changes/paginated
   * Get tracked changes from certificate discovery scans with pagination and filters
   */
  getChanges: async (params: DiscoveryFilters = {}): Promise<PaginatedResponse<DiscoveryChange> | DiscoveryChange[]> => {
    const queryString = buildQueryParams({
      page: params.page,
      size: params.size,
      changeType: params.changeType,
      host: params.host,
      startDate: params.startDate,
      endDate: params.endDate,
      sortBy: params.sortBy,
      sortOrder: params.sortOrder,
    });
    
    const response = await apiClient.get<PaginatedResponse<DiscoveryChange>>(`/api/discovery/changes/paginated${queryString}`);
    return response.data;
  },
};
