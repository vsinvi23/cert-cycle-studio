import { apiRequest } from './config';
import { 
  BulkIssueRequest, 
  BulkRenewRequest, 
  BulkRevokeRequest,
  BulkOperationResult 
} from './types';

export const bulkApi = {
  // Bulk issue certificates (sync)
  issueCertificates: (request: BulkIssueRequest) =>
    apiRequest<BulkOperationResult>('/api/certificates/bulk-issue', {
      method: 'POST',
      body: JSON.stringify(request),
    }),

  // Bulk renew certificates (sync)
  renewCertificates: (request: BulkRenewRequest) =>
    apiRequest<BulkOperationResult>('/api/certificates/bulk-renew', {
      method: 'POST',
      body: JSON.stringify(request),
    }),

  // Bulk revoke certificates (sync)
  revokeCertificates: (request: BulkRevokeRequest) =>
    apiRequest<BulkOperationResult>('/api/certificates/bulk-revoke', {
      method: 'POST',
      body: JSON.stringify(request),
    }),

  // Bulk issue certificates (async - returns job ID)
  issueAsync: (request: BulkIssueRequest) =>
    apiRequest<{ jobId: string }>('/api/bulk/issue', {
      method: 'POST',
      body: JSON.stringify(request),
    }),

  // Bulk renew certificates (async - returns job ID)
  renewAsync: (request: BulkRenewRequest) =>
    apiRequest<{ jobId: string }>('/api/bulk/renew', {
      method: 'POST',
      body: JSON.stringify(request),
    }),

  // Bulk revoke certificates (async - returns job ID)
  revokeAsync: (request: BulkRevokeRequest) =>
    apiRequest<{ jobId: string }>('/api/bulk/revoke', {
      method: 'POST',
      body: JSON.stringify(request),
    }),
};
