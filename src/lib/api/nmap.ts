import apiClient from "../apiClient";
import type { NmapCertificateScan, NmapScanRequest } from "./types";
import type { PaginatedResponse, NetworkScanFilters } from "./types/pagination";
import { buildQueryParams } from "./types/pagination";

export const nmapApi = {
  /**
   * POST /api/nmap/scan
   * Scan network for SSL/TLS certificates using Nmap
   */
  scan: async (request: NmapScanRequest): Promise<NmapCertificateScan[]> => {
    const response = await apiClient.post<NmapCertificateScan[]>("/api/nmap/scan", request);
    return response.data;
  },

  /**
   * GET /api/nmap/certificates
   * Get all scanned/issued certificates from NmapCertificateScan table with pagination and search
   */
  getAllCertificates: async (params: NetworkScanFilters = {}): Promise<PaginatedResponse<NmapCertificateScan> | NmapCertificateScan[]> => {
    const queryString = buildQueryParams({
      page: params.page,
      size: params.size,
      search: params.search,
      port: params.port,
      expiryDays: params.expiryDays,
      sortBy: params.sortBy,
      sortOrder: params.sortOrder,
    });
    
    const response = await apiClient.get<PaginatedResponse<NmapCertificateScan>>(`/api/nmap/certificates${queryString}`);
    return response.data;
  },
};
