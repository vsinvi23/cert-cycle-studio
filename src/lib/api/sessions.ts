import { apiRequest } from './config';
import { UserSession } from './types';

export const sessionsApi = {
  // Get active sessions
  getActive: () =>
    apiRequest<UserSession[]>('/api/sessions/active'),

  // Get session analytics
  getAnalytics: () =>
    apiRequest<string>('/api/sessions/analytics'),

  // Detect suspicious activity
  detectSuspiciousActivity: () =>
    apiRequest<string>('/api/sessions/suspicious-activity'),

  // Terminate session
  terminate: (sessionId: number) =>
    apiRequest<string>(`/api/sessions/${sessionId}/terminate`, {
      method: 'DELETE',
    }),

  // Terminate all sessions except current
  terminateAll: () =>
    apiRequest<string>('/api/sessions/terminate-all', {
      method: 'DELETE',
    }),
};
