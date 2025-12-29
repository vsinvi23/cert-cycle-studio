import { apiRequest } from './config';
import { AcmeWebhook, AcmeMetrics, AcmeDashboardSummary } from './types';

export const acmeMonitoringApi = {
  // Webhook Management
  createWebhook: (webhook: Partial<AcmeWebhook>) =>
    apiRequest<AcmeWebhook>('/api/acme/monitoring/webhooks', {
      method: 'POST',
      body: JSON.stringify(webhook),
    }),

  getAllWebhooks: () =>
    apiRequest<AcmeWebhook[]>('/api/acme/monitoring/webhooks'),

  getWebhookById: (id: number) =>
    apiRequest<AcmeWebhook>(`/api/acme/monitoring/webhooks/${id}`),

  updateWebhook: (id: number, webhook: Partial<AcmeWebhook>) =>
    apiRequest<AcmeWebhook>(`/api/acme/monitoring/webhooks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(webhook),
    }),

  deleteWebhook: (id: number) =>
    apiRequest<void>(`/api/acme/monitoring/webhooks/${id}`, {
      method: 'DELETE',
    }),

  getActiveWebhooks: () =>
    apiRequest<AcmeWebhook[]>('/api/acme/monitoring/webhooks/active'),

  testWebhook: (id: number) =>
    apiRequest<{ success: boolean; message: string }>(`/api/acme/monitoring/webhooks/${id}/test`, {
      method: 'POST',
    }),

  getProblematicWebhooks: () =>
    apiRequest<AcmeWebhook[]>('/api/acme/monitoring/webhooks/problematic'),

  getWebhookEvents: () =>
    apiRequest<string[]>('/api/acme/monitoring/webhooks/events'),

  // Dashboard & Metrics
  getDashboard: () =>
    apiRequest<AcmeDashboardSummary>('/api/acme/monitoring/dashboard'),

  getMetrics: (startDate: string, endDate: string) =>
    apiRequest<AcmeMetrics[]>(`/api/acme/monitoring/metrics?start=${startDate}&end=${endDate}`),

  getLatestMetrics: () =>
    apiRequest<AcmeMetrics>('/api/acme/monitoring/metrics/latest'),

  getMetricsSummary: () =>
    apiRequest<AcmeMetrics>('/api/acme/monitoring/metrics/summary'),

  getWeeklyMetrics: () =>
    apiRequest<AcmeMetrics[]>('/api/acme/monitoring/metrics/week'),

  getMonthlyMetrics: () =>
    apiRequest<AcmeMetrics[]>('/api/acme/monitoring/metrics/month'),

  getMetricsByProvider: (providerType: string) =>
    apiRequest<AcmeMetrics[]>(`/api/acme/monitoring/metrics/provider/${providerType}`),

  getLowPerformanceMetrics: () =>
    apiRequest<AcmeMetrics[]>('/api/acme/monitoring/metrics/low-performance'),

  getProviderComparison: () =>
    apiRequest<Record<string, AcmeMetrics>>('/api/acme/monitoring/metrics/comparison'),

  getHealth: () =>
    apiRequest<{ status: string; details: Record<string, unknown> }>('/api/acme/monitoring/health'),
};
