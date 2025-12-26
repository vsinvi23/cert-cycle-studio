import { apiRequest } from "./config";
import type { 
  Certificate, 
  NmapCertificateScan, 
  NmapScanRequest, 
  CreateUserCertificateRequest,
  AutoRenewConfiguration,
  CertificateTemplate
} from "./types";

export const certificatesApi = {
  /**
   * Get all certificates
   */
  getAll: async (): Promise<Certificate[]> => {
    return apiRequest<Certificate[]>("/api/certificates/all");
  },

  /**
   * Get certificates by user ID
   */
  getByUser: async (userId: number): Promise<Certificate[]> => {
    return apiRequest<Certificate[]>(`/api/certificates/user/${userId}`);
  },

  /**
   * Issue a new certificate
   */
  issue: async (host: string, caAlias: string): Promise<NmapCertificateScan> => {
    return apiRequest<NmapCertificateScan>(
      `/api/certificates/issue?host=${encodeURIComponent(host)}&caAlias=${encodeURIComponent(caAlias)}`,
      { method: "POST" }
    );
  },

  /**
   * Issue user certificate with full details
   */
  issueUserCertificate: async (request: CreateUserCertificateRequest): Promise<string> => {
    return apiRequest<string>("/api/certificate/create", {
      method: "POST",
      body: JSON.stringify(request),
    });
  },

  /**
   * Add certificate manually
   */
  add: async (userId: number, certificateName: string, certData: string): Promise<Certificate> => {
    return apiRequest<Certificate>(
      `/api/certificates/add?userId=${userId}&certificateName=${encodeURIComponent(certificateName)}&certData=${encodeURIComponent(certData)}`,
      { method: "POST" }
    );
  },

  /**
   * Renew certificate
   */
  renew: async (certId: number): Promise<NmapCertificateScan> => {
    return apiRequest<NmapCertificateScan>(`/api/certificates/renew/${certId}`, {
      method: "POST",
    });
  },

  /**
   * Revoke certificate
   */
  revoke: async (certId: number, reason: string): Promise<void> => {
    return apiRequest<void>(
      `/api/certificates/revoke/${certId}?reason=${encodeURIComponent(reason)}`,
      { method: "POST" }
    );
  },

  /**
   * Enable auto-renewal for certificate
   */
  enableAutoRenew: async (certificateId: number, renewBeforeDays: number = 30): Promise<AutoRenewConfiguration> => {
    return apiRequest<AutoRenewConfiguration>("/api/certificates/auto-renew/enable", {
      method: "POST",
      body: JSON.stringify({ certificateId, renewBeforeDays }),
    });
  },

  /**
   * Bulk issue certificates
   */
  bulkIssue: async (hosts: string[], templateId?: number): Promise<string> => {
    return apiRequest<string>("/api/certificates/bulk-issue", {
      method: "POST",
      body: JSON.stringify({ hosts, templateId }),
    });
  },

  /**
   * Bulk renew certificates
   */
  bulkRenew: async (certificateIds: number[]): Promise<string> => {
    return apiRequest<string>("/api/certificates/bulk-renew", {
      method: "POST",
      body: JSON.stringify({ certificateIds }),
    });
  },

  /**
   * Bulk revoke certificates
   */
  bulkRevoke: async (certificateIds: number[], reason?: string): Promise<string> => {
    return apiRequest<string>("/api/certificates/bulk-revoke", {
      method: "POST",
      body: JSON.stringify({ certificateIds, reason }),
    });
  },

  /**
   * Create certificate template
   */
  createTemplate: async (template: Omit<CertificateTemplate, "id" | "createdAt">): Promise<CertificateTemplate> => {
    return apiRequest<CertificateTemplate>("/api/certificates/templates/create", {
      method: "POST",
      body: JSON.stringify(template),
    });
  },
};

export const networkScanApi = {
  /**
   * Scan network for certificates
   */
  scan: async (request: NmapScanRequest): Promise<NmapCertificateScan[]> => {
    return apiRequest<NmapCertificateScan[]>("/api/nmap/scan", {
      method: "POST",
      body: JSON.stringify(request),
    });
  },

  /**
   * Get all scanned/issued certificates
   */
  getAllCertificates: async (): Promise<NmapCertificateScan[]> => {
    return apiRequest<NmapCertificateScan[]>("/api/nmap/certificates");
  },
};

export const certificateOperationsApi = {
  /**
   * Validate certificate
   */
  validate: async (certificateId: number): Promise<string> => {
    return apiRequest<string>(`/api/certificate-operations/validate/${certificateId}`);
  },

  /**
   * Check revocation status
   */
  checkRevocationStatus: async (certificateId: number): Promise<string> => {
    return apiRequest<string>(`/api/certificate-operations/revocation-status/${certificateId}`);
  },

  /**
   * Compare two certificates
   */
  compare: async (cert1Id: number, cert2Id: number): Promise<string> => {
    return apiRequest<string>(
      `/api/certificate-operations/compare?cert1Id=${cert1Id}&cert2Id=${cert2Id}`
    );
  },

  /**
   * Detect duplicate certificates
   */
  detectDuplicates: async (): Promise<string> => {
    return apiRequest<string>("/api/certificate-operations/detect-duplicates");
  },

  /**
   * Backup certificates
   */
  backup: async (certificateIds: number[]): Promise<string> => {
    return apiRequest<string>(
      `/api/certificate-operations/backup?certificateIds=${certificateIds.join(",")}`,
      { method: "POST" }
    );
  },

  /**
   * Restore certificates from backup
   */
  restore: async (backupData: Record<string, unknown>): Promise<string> => {
    return apiRequest<string>("/api/certificate-operations/restore", {
      method: "POST",
      body: JSON.stringify(backupData),
    });
  },
};
