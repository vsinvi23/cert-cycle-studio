import { apiRequest } from './config';
import { CertificateValidationResult, CertificateComparisonResult } from './types';

export const certOperationsApi = {
  // Validate certificate
  validate: (certId: number) =>
    apiRequest<CertificateValidationResult>(`/api/certificate-operations/validate/${certId}`),

  // Check revocation status
  checkRevocationStatus: (certId: number) =>
    apiRequest<{ isRevoked: boolean; reason?: string }>(`/api/certificate-operations/revocation-status/${certId}`),

  // Compare two certificates
  compare: (certId1: number, certId2: number) =>
    apiRequest<CertificateComparisonResult>(`/api/certificate-operations/compare?cert1=${certId1}&cert2=${certId2}`),

  // Detect duplicate certificates
  detectDuplicates: () =>
    apiRequest<Array<{ ids: number[]; reason: string }>>('/api/certificate-operations/detect-duplicates'),

  // Backup certificates
  backup: (certificateIds: number[]) =>
    apiRequest<string>('/api/certificate-operations/backup', {
      method: 'POST',
      body: JSON.stringify({ certificateIds }),
    }),

  // Restore certificates from backup
  restore: (backupData: Record<string, unknown>) =>
    apiRequest<string>('/api/certificate-operations/restore', {
      method: 'POST',
      body: JSON.stringify(backupData),
    }),
};
