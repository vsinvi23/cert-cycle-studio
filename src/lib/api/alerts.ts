import { apiRequest } from './config';
import { 
  AlertConfiguration, 
  AlertConfigurationRequest, 
  AlertHistory,
  CertificateExpirationAlertRequest,
  BulkOperationAlertRequest,
  GeneralAlertRequest
} from './types';

export const alertsApi = {
  // Configure alert
  configure: (config: AlertConfigurationRequest) =>
    apiRequest<AlertConfiguration>('/api/alerts/configure', {
      method: 'POST',
      body: JSON.stringify(config),
    }),

  // Get alert history
  getHistory: (page = 0, size = 20) =>
    apiRequest<AlertHistory[]>(`/api/alerts/history?page=${page}&size=${size}`),

  // Send certificate expiration alert
  sendExpirationAlert: (request: CertificateExpirationAlertRequest) =>
    apiRequest<string>('/api/alerts/send/certificate-expiration', {
      method: 'POST',
      body: JSON.stringify(request),
    }),

  // Send bulk operation notification
  sendBulkOperationAlert: (request: BulkOperationAlertRequest) =>
    apiRequest<string>('/api/alerts/send/bulk-operation', {
      method: 'POST',
      body: JSON.stringify(request),
    }),

  // Send general alert
  sendGeneralAlert: (request: GeneralAlertRequest) =>
    apiRequest<string>('/api/alerts/send/general', {
      method: 'POST',
      body: JSON.stringify(request),
    }),

  // Register webhook
  registerWebhook: (webhookUrl: string, events: string[]) =>
    apiRequest<string>('/api/webhooks/register', {
      method: 'POST',
      body: JSON.stringify({ webhookUrl, events }),
    }),

  // Get notification preferences
  getNotificationPreferences: () =>
    apiRequest<Record<string, unknown>>('/api/notifications/preferences'),
};
