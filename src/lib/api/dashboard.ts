import { apiRequest } from "./config";
import type { DashboardMetrics, ExpiringCertificate, CertificateHealth, ComplianceScore } from "./types";

export const dashboardApi = {
  /**
   * Get dashboard metrics
   */
  getMetrics: async (): Promise<DashboardMetrics> => {
    return apiRequest<DashboardMetrics>("/api/dashboard/metrics");
  },

  /**
   * Get expiring certificates
   * @param days - Number of days to look ahead (default: 30)
   */
  getExpiringCertificates: async (days: number = 30): Promise<ExpiringCertificate[]> => {
    return apiRequest<ExpiringCertificate[]>(`/api/dashboard/expiring?days=${days}`);
  },

  /**
   * Get certificate health status
   */
  getCertificateHealth: async (): Promise<CertificateHealth> => {
    return apiRequest<CertificateHealth>("/api/dashboard/certificate-health");
  },

  /**
   * Get compliance score
   */
  getComplianceScore: async (): Promise<ComplianceScore> => {
    return apiRequest<ComplianceScore>("/api/dashboard/compliance-score");
  },
};
