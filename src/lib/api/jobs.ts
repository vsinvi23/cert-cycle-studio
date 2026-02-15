import apiClient from "../apiClient";
import type { BackgroundJob } from "./types";
import type { PaginatedResponse, JobFilters } from "./types/pagination";
import { buildQueryParams } from "./types/pagination";

export const jobsApi = {
  /**
   * GET /api/jobs/{jobId}
   * Get background job status, progress, and result
   */
  getById: async (jobId: string): Promise<BackgroundJob> => {
    const response = await apiClient.get<BackgroundJob>(`/api/jobs/${jobId}`);
    return response.data;
  },

  /**
   * GET /api/jobs/my-jobs
   * Get all jobs created by the authenticated user with pagination and filters
   * Default: page=0, size=10, sortBy=createdAt, sortOrder=ASC
   */
  getMyJobs: async (params: JobFilters = {}): Promise<PaginatedResponse<BackgroundJob>> => {
    const queryString = buildQueryParams({
      page: params.page ?? 0,
      size: params.size ?? 10,
      status: params.status,
      startDate: params.startDate,
      endDate: params.endDate,
      sortBy: params.sortBy ?? 'createdAt',
      sortOrder: params.sortOrder ?? 'ASC',
    });
    
    const response = await apiClient.get<PaginatedResponse<BackgroundJob>>(`/api/jobs/my-jobs${queryString}`);
    return response.data;
  },

  /**
   * GET /api/jobs/status/{status}
   * Get jobs filtered by status (PENDING, RUNNING, COMPLETED, FAILED) with pagination
   * Default: page=0, size=10, sortBy=createdAt, sortOrder=ASC
   */
  getByStatus: async (
    status: "PENDING" | "RUNNING" | "COMPLETED" | "FAILED",
    params: JobFilters = {}
  ): Promise<PaginatedResponse<BackgroundJob>> => {
    const queryString = buildQueryParams({
      page: params.page ?? 0,
      size: params.size ?? 10,
      startDate: params.startDate,
      endDate: params.endDate,
      sortBy: params.sortBy ?? 'createdAt',
      sortOrder: params.sortOrder ?? 'ASC',
    });
    
    const response = await apiClient.get<PaginatedResponse<BackgroundJob>>(`/api/jobs/status/${status}${queryString}`);
    return response.data;
  },

  /**
   * GET /api/jobs/running (alias for status/RUNNING)
   * Get all currently running jobs for the user with pagination
   * Default: page=0, size=10, sortBy=createdAt, sortOrder=ASC
   */
  getRunning: async (params: JobFilters = {}): Promise<PaginatedResponse<BackgroundJob>> => {
    return jobsApi.getByStatus('RUNNING', params);
  },

  /**
   * GET /api/jobs/recent
   * Get jobs created in the last N hours (default 24) with pagination
   * Default: hours=24, page=0, size=10, sortBy=createdAt, sortOrder=DESC
   */
  getRecent: async (params: JobFilters & { hours?: number } = {}): Promise<PaginatedResponse<BackgroundJob>> => {
    const queryString = buildQueryParams({
      hours: params.hours ?? 24,
      status: params.status,
      page: params.page ?? 0,
      size: params.size ?? 10,
      sortBy: params.sortBy ?? 'createdAt',
      sortOrder: params.sortOrder ?? 'DESC',
    });
    
    const response = await apiClient.get<PaginatedResponse<BackgroundJob>>(`/api/jobs/recent${queryString}`);
    return response.data;
  },
};
