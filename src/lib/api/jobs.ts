import { apiRequest } from './config';
import { BackgroundJob } from './types';

export const jobsApi = {
  // Get job by ID
  getById: (jobId: string) =>
    apiRequest<BackgroundJob>(`/api/jobs/${jobId}`),

  // Get current user's jobs
  getMyJobs: () =>
    apiRequest<BackgroundJob[]>('/api/jobs/my-jobs'),

  // Get jobs by status
  getByStatus: (status: string) =>
    apiRequest<BackgroundJob[]>(`/api/jobs/status/${status}`),

  // Get running jobs
  getRunning: () =>
    apiRequest<BackgroundJob[]>('/api/jobs/running'),

  // Get recent jobs (last 24 hours)
  getRecent: () =>
    apiRequest<BackgroundJob[]>('/api/jobs/recent'),
};
