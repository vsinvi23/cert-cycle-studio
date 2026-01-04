import { apiRequest } from "./config";
import type { 
  Certificate, 
  NmapCertificateScan, 
  NmapScanRequest, 
  CreateUserCertificateRequest,
  AutoRenewConfiguration,
  CertificateTemplate,
  AddCertificateRequest,
  IssueCertificateRequest,
  RevokeReason,
  EnableAutoRenewRequest,
  CreateCertificateTemplateRequest,
  BulkOperationResult
} from "./types";

export const certificatesApi = {
  /**
   * GET /api/certificates/all
   * List all certificates
   */
  getAll: async (): Promise<Certificate[]> => {
    return apiRequest<Certificate[]>("/api/certificates/all");
  },

  /**
   * GET /api/certificates/user/{userId}
   * Get certificates by user ID
   */
  getByUser: async (userId: number): Promise<Certificate[]> => {
    return apiRequest<Certificate[]>(`/api/certificates/user/${userId}`);
  },

  /**
   * POST /api/certificates/add
   * Add certificate manually
   */
  add: async (request: AddCertificateRequest): Promise<Certificate> => {
    return apiRequest<Certificate>("/api/certificates/add", {
      method: "POST",
      body: JSON.stringify(request),
    });
  },

  /**
   * POST /api/certificates/issue
   * Issue new certificate with specified parameters
   */
  issue: async (request: IssueCertificateRequest): Promise<Certificate> => {
    return apiRequest<Certificate>("/api/certificates/issue", {
      method: "POST",
      body: JSON.stringify(request),
    });
  },

  /**
   * POST /api/certificate/create
   * Issue user certificate with full details
   */
  issueUserCertificate: async (request: CreateUserCertificateRequest): Promise<string> => {
    return apiRequest<string>("/api/certificate/create", {
      method: "POST",
      body: JSON.stringify(request),
    });
  },

  /**
   * POST /api/certificates/renew/{certId}
   * Renew an existing certificate
   */
  renew: async (certId: number): Promise<Certificate> => {
    return apiRequest<Certificate>(`/api/certificates/renew/${certId}`, {
      method: "POST",
    });
  },

  /**
   * POST /api/certificates/revoke/{certId}
   * Revoke a certificate
   */
  revoke: async (certId: number, reason: RevokeReason): Promise<void> => {
    return apiRequest<void>(`/api/certificates/revoke/${certId}`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    });
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
