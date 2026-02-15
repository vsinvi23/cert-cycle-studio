import { apiRequest } from "./config";
import apiClient from "../apiClient";
import type { 
  Certificate, 
  NmapCertificateScan, 
  NmapScanRequest, 
  CreateUserCertificateRequest,
  AutoRenewConfiguration,
  CertificateTemplate,
  AddCertificateRequest,
  CertificateResponse,
  IssueCertificateRequest,
  RevokeReason,
  EnableAutoRenewRequest,
  CreateCertificateTemplateRequest,
  BulkOperationResult
} from "./types";
import type { PaginatedResponse, CertificateFilters } from "./types/pagination";
import { buildQueryParams } from "./types/pagination";

export const certificatesApi = {
  /**
   * POST /api/certificates/add
   * Manually add/import an existing certificate (Form Data)
   */
  add: async (request: AddCertificateRequest): Promise<CertificateResponse> => {
    const formData = new FormData();
    formData.append('userId', request.userId.toString());
    formData.append('certificateName', request.certificateName);
    formData.append('certData', request.certData);
    
    const response = await apiClient.post<CertificateResponse>("/api/certificates/add", formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  },

  /**
   * GET /api/certificates/user/{userId}
   * Get certificates by user ID
   */
  getByUser: async (userId: number): Promise<CertificateResponse[]> => {
    const response = await apiClient.get<CertificateResponse[]>(`/api/certificates/user/${userId}`);
    return response.data;
  },

  /**
   * GET /api/certificates/all
   * List all manually added/imported certificates with pagination, search, and filters
   * Supports: pagination, sorting, searching (name/CN/subject), filtering (user, expiry status)
   */
  getAll: async (params: CertificateFilters = {}): Promise<PaginatedResponse<CertificateResponse> | CertificateResponse[]> => {
    try {
      // Build query string with all parameters
      const queryString = buildQueryParams({
        page: params.page,
        size: params.size,
        search: params.search,
        expiryStatus: params.expiryStatus,
        userId: params.userId,
        sortBy: params.sortBy,
        sortOrder: params.sortOrder,
      });
      
      console.log('[API] Calling /api/certificates/all with query:', queryString);
      
      const response = await apiClient.get<PaginatedResponse<CertificateResponse>>(`/api/certificates/all${queryString}`);
      console.log('[API] Response received:', response.data);
      return response.data;
    } catch (error: any) {
      // If pagination fails (backend doesn't support it yet), try without parameters
      if (params && Object.keys(params).length > 0 && (error.response?.status === 400 || error.response?.status === 404)) {
        console.warn("[API] Pagination not supported, falling back to simple GET");
        const response = await apiClient.get<CertificateResponse[]>('/api/certificates/all');
        return response.data;
      }
      throw error;
    }
  },

  /**
   * POST /api/certificates/issue
   * Issue new certificate for a host/domain
   */
  issue: async (request: IssueCertificateRequest): Promise<NmapCertificateScan> => {
    const params = new URLSearchParams();
    params.append('host', request.host);
    params.append('commonName', request.commonName);
    params.append('caAlias', request.caAlias);
    
    if (request.port) params.append('port', request.port.toString());
    if (request.organization) params.append('organization', request.organization);
    if (request.organizationalUnit) params.append('organizationalUnit', request.organizationalUnit);
    if (request.locality) params.append('locality', request.locality);
    if (request.state) params.append('state', request.state);
    if (request.country) params.append('country', request.country);
    if (request.validityDays) params.append('validityDays', request.validityDays.toString());
    if (request.keySize) params.append('keySize', request.keySize.toString());
    
    const response = await apiClient.post<NmapCertificateScan>(
      `/api/certificates/issue?${params.toString()}`
    );
    return response.data;
  },

  /**
   * POST /api/certificate/create
   * Create user certificate with full details (signed by CA)
   */
  createUserCertificate: async (request: CreateUserCertificateRequest): Promise<string> => {
    const response = await apiClient.post<string>("/api/certificate/create", request);
    return response.data;
  },

  /**
   * POST /api/certificates/renew/{certId}
   * Renew an existing certificate
   */
  renew: async (certId: number): Promise<NmapCertificateScan> => {
    const response = await apiClient.post<NmapCertificateScan>(`/api/certificates/renew/${certId}`);
    return response.data;
  },

  /**
   * POST /api/certificates/revoke/{certId}
   * Revoke a certificate with reason
   */
  revoke: async (certId: number, reason: string): Promise<void> => {
    const response = await apiClient.post<void>(
      `/api/certificates/revoke/${certId}?reason=${encodeURIComponent(reason)}`
    );
    return response.data;
  },

  /**
   * POST /api/certificates/auto-renew/enable
   * Enable auto-renewal for certificate
   */
  enableAutoRenew: async (request: EnableAutoRenewRequest): Promise<AutoRenewConfiguration> => {
    return apiRequest<AutoRenewConfiguration>("/api/certificates/auto-renew/enable", {
      method: "POST",
      body: JSON.stringify(request),
    });
  },

  /**
   * POST /api/certificates/templates/create
   * Create a reusable certificate template
   */
  createTemplate: async (template: CreateCertificateTemplateRequest): Promise<CertificateTemplate> => {
    return apiRequest<CertificateTemplate>("/api/certificates/templates/create", {
      method: "POST",
      body: JSON.stringify(template),
    });
  },

  /**
   * POST /api/certificates/bulk-issue
   * Bulk certificate issuance
   */
  bulkIssue: async (certificates: Array<{ commonName: string; organization?: string }>): Promise<BulkOperationResult> => {
    return apiRequest<BulkOperationResult>("/api/certificates/bulk-issue", {
      method: "POST",
      body: JSON.stringify({ certificates }),
    });
  },

  /**
   * POST /api/certificates/bulk-renew
   * Bulk renewal
   */
  bulkRenew: async (certificateIds: number[]): Promise<BulkOperationResult> => {
    return apiRequest<BulkOperationResult>("/api/certificates/bulk-renew", {
      method: "POST",
      body: JSON.stringify({ certificateIds }),
    });
  },

  /**
   * POST /api/certificates/bulk-revoke
   * Bulk revocation
   */
  bulkRevoke: async (certificateIds: number[], reason?: RevokeReason): Promise<BulkOperationResult> => {
    return apiRequest<BulkOperationResult>("/api/certificates/bulk-revoke", {
      method: "POST",
      body: JSON.stringify({ certificateIds, reason }),
    });
  },
};

export const networkScanApi = {
  /**
   * POST /api/nmap/scan
   * Scan network for SSL/TLS certificates
   */
  scan: async (request: NmapScanRequest): Promise<NmapCertificateScan[]> => {
    return apiRequest<NmapCertificateScan[]>("/api/nmap/scan", {
      method: "POST",
      body: JSON.stringify(request),
    });
  },

  /**
   * GET /api/nmap/certificates
   * Get all scanned certificates
   */
  getAllCertificates: async (): Promise<NmapCertificateScan[]> => {
    return apiRequest<NmapCertificateScan[]>("/api/nmap/certificates");
  },
};

export const certificateOperationsApi = {
  /**
   * GET /api/certificate-operations/validate/{id}
   * X.509 certificate validation
   */
  validate: async (certificateId: number): Promise<string> => {
    return apiRequest<string>(`/api/certificate-operations/validate/${certificateId}`);
  },

  /**
   * GET /api/certificate-operations/revocation-status/{id}
   * OCSP/CRL checking
   */
  checkRevocationStatus: async (certificateId: number): Promise<string> => {
    return apiRequest<string>(`/api/certificate-operations/revocation-status/${certificateId}`);
  },

  /**
   * GET /api/certificate-operations/compare
   * Compare two certificates
   */
  compare: async (certId1: number, certId2: number): Promise<string> => {
    return apiRequest<string>(
      `/api/certificate-operations/compare?certId1=${certId1}&certId2=${certId2}`
    );
  },

  /**
   * GET /api/certificate-operations/detect-duplicates
   * Detect duplicate certificates
   */
  detectDuplicates: async (): Promise<string> => {
    return apiRequest<string>("/api/certificate-operations/detect-duplicates");
  },

  /**
   * POST /api/certificate-operations/backup
   * Backup certificates
   */
  backup: async (certificateIds: number[], includePrivateKeys?: boolean): Promise<string> => {
    return apiRequest<string>("/api/certificate-operations/backup", {
      method: "POST",
      body: JSON.stringify({ certificateIds, includePrivateKeys }),
    });
  },

  /**
   * POST /api/certificate-operations/restore
   * Restore certificates from backup
   */
  restore: async (backupFile: File): Promise<string> => {
    const formData = new FormData();
    formData.append("backupFile", backupFile);
    
    return apiRequest<string>("/api/certificate-operations/restore", {
      method: "POST",
      body: formData,
      headers: {}, // Let browser set Content-Type for multipart
    });
  },
};
