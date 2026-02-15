import { apiRequest } from './config';
import { UserSession } from './types';
import type { PaginatedResponse, SessionFilters } from './types/pagination';
import { buildQueryParams } from './types/pagination';

export const sessionsApi = {
  // Get active sessions with pagination and search
  getActive: (params: SessionFilters = {}): Promise<PaginatedResponse<UserSession> | UserSession[]> => {
    const queryString = buildQueryParams({
      page: params.page,
      size: params.size,
      search: params.search,
      userId: params.userId,
      startDate: params.startDate,
      endDate: params.endDate,
      sortBy: params.sortBy,
      sortOrder: params.sortOrder,
    });
    
    return apiRequest<PaginatedResponse<UserSession>>(`/api/sessions/active/paginated${queryString}`);
  },

  // Get my sessions (current user) with pagination
  getMySessions: (params: SessionFilters = {}): Promise<PaginatedResponse<UserSession> | UserSession[]> => {
    const queryString = buildQueryParams({
      page: params.page,
      size: params.size,
      active: params.active,
      startDate: params.startDate,
      endDate: params.endDate,
      sortBy: params.sortBy,
      sortOrder: params.sortOrder,
    });
    
    return apiRequest<PaginatedResponse<UserSession>>(`/api/sessions/my-sessions/paginated${queryString}`);
  },

  // Get session analytics
  getAnalytics: () =>
    apiRequest<any>('/api/sessions/analytics'),

  // Detect suspicious activity
  detectSuspiciousActivity: () =>
    apiRequest<any>('/api/sessions/suspicious-activity'),

  // Terminate session
  terminate: (sessionId: number) =>
    apiRequest<string>(`/api/sessions/${sessionId}`, {
      method: 'DELETE',
    }),

  // Terminate all sessions except current
  terminateAll: () =>
    apiRequest<string>('/api/sessions/terminate-all', {
      method: 'DELETE',
    }),

  // Clean up expired sessions
  cleanup: () =>
    apiRequest<{ message: string; sessionsRemoved: number }>('/api/sessions/cleanup', {
      method: 'POST',
    }),
};
