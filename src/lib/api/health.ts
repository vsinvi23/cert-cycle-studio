import { apiRequest } from "./config";
import type { SystemHealth } from "./types";

export const healthApi = {
  /**
   * Check system health
   */
  check: async (): Promise<SystemHealth> => {
    return apiRequest<SystemHealth>("/api/health");
  },

  /**
   * Get detailed health status
   */
  getDetailed: async (): Promise<SystemHealth> => {
    return apiRequest<SystemHealth>("/api/health/detailed");
  },

  /**
   * Check database connectivity
   */
  checkDatabase: async (): Promise<{ status: string; responseTime: number }> => {
    return apiRequest<{ status: string; responseTime: number }>("/api/health/database");
  },

  /**
   * Check Redis connectivity
   */
  checkRedis: async (): Promise<{ status: string; responseTime: number }> => {
    return apiRequest<{ status: string; responseTime: number }>("/api/health/redis");
  },
};
