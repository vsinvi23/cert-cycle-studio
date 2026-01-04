import { apiRequest } from "./config";
import type { 
  AlertConfiguration, 
  AlertConfigurationRequest, 
  AlertHistory,
  CertificateExpirationAlertRequest,
  BulkOperationAlertRequest,
  GeneralAlertRequest,
  WebhookRegistration
} from "./types";

export const alertsApi = {
  /**
   * POST /api/alerts/configure
   * Configure alert
   */
  configure: (config: AlertConfigurationRequest) =>
    apiRequest<AlertConfiguration>("/api/alerts/configure", {
      method: "POST",
      body: JSON.stringify(config),
    }),

  /**
   * GET /api/alerts/history
   * Get alert history
   */
  getHistory: (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    const query = params.toString();
    return apiRequest<AlertHistory[]>(`/api/alerts/history${query ? `?${query}` : ""}`);
  },

  /**
   * POST /api/alerts/send/certificate-expiration
   * Send certificate expiration alert
   */
  sendExpirationAlert: (request: CertificateExpirationAlertRequest) =>
    apiRequest<string>("/api/alerts/send/certificate-expiration", {
      method: "POST",
      body: JSON.stringify(request),
    }),

  /**
   * POST /api/alerts/send/bulk-operation
   * Send bulk operation notification
   */
  sendBulkOperationAlert: (request: BulkOperationAlertRequest) =>
    apiRequest<string>("/api/alerts/send/bulk-operation", {
      method: "POST",
      body: JSON.stringify(request),
    }),

  /**
   * POST /api/alerts/send/general
   * Send general alert
   */
  sendGeneralAlert: (request: GeneralAlertRequest) =>
    apiRequest<string>("/api/alerts/send/general", {
      method: "POST",
      body: JSON.stringify(request),
    }),

  /**
   * POST /api/webhooks/register
   * Register webhook
   */
  registerWebhook: (webhook: WebhookRegistration) =>
    apiRequest<string>("/api/webhooks/register", {
      method: "POST",
      body: JSON.stringify(webhook),
    }),

  /**
   * GET /api/notifications/preferences
   * Get notification preferences
   */
  getNotificationPreferences: () =>
    apiRequest<Record<string, unknown>>("/api/notifications/preferences"),
};
