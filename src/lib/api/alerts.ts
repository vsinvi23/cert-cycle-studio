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
import type { PaginatedResponse, PaginationParams } from "./types/pagination";
import { buildQueryParams } from "./types/pagination";

export const alertsApi = {
  /**
   * GET /api/alerts/configurations
   * Get all alert configurations with pagination
   */
  getConfigurations: (params: PaginationParams = {}) => {
    const queryString = buildQueryParams({
      page: params.page,
      size: params.size,
      search: params.search,
      sortBy: params.sortBy,
      sortOrder: params.sortOrder,
    });
    return apiRequest<PaginatedResponse<AlertConfiguration> | AlertConfiguration[]>(
      `/api/alerts/configurations${queryString}`
    );
  },

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
   * Get alert history with pagination and date filtering
   */
  getHistory: (params: PaginationParams & { startDate?: string; endDate?: string } = {}) => {
    const queryString = buildQueryParams({
      page: params.page,
      size: params.size,
      search: params.search,
      sortBy: params.sortBy,
      sortOrder: params.sortOrder,
      startDate: params.startDate,
      endDate: params.endDate,
    });
    return apiRequest<PaginatedResponse<AlertHistory> | AlertHistory[]>(
      `/api/alerts/history${queryString}`
    );
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
