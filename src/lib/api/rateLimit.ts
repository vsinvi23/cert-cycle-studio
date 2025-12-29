import { apiRequest } from './config';
import { RateLimitViolation, RateLimitMetrics } from './types';

export const rateLimitApi = {
  // Get all violations
  getAllViolations: (since?: string, until?: string) => {
    const params = new URLSearchParams();
    if (since) params.append('since', since);
    if (until) params.append('until', until);
    const query = params.toString();
    return apiRequest<RateLimitViolation[]>(`/api/rate-limit/violations${query ? `?${query}` : ''}`);
  },

  // Get violations by IP
  getViolationsByIp: (ip: string) =>
    apiRequest<RateLimitViolation[]>(`/api/rate-limit/violations/ip/${ip}`),

  // Get violations by user
  getViolationsByUser: (userId: number) =>
    apiRequest<RateLimitViolation[]>(`/api/rate-limit/violations/user/${userId}`),

  // Get rate limit metrics
  getMetrics: () =>
    apiRequest<RateLimitMetrics>('/api/rate-limit/metrics'),

  // Get top offenders
  getTopOffenders: () =>
    apiRequest<Array<{ ip: string; count: number }>>('/api/rate-limit/top-offenders'),
};
