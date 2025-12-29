import { apiRequest } from "./config";
import type { AuditLog } from "./types";

export const reportsApi = {
  /**
   * Get compliance report
   * @param standard - Compliance standard (PCI-DSS, SOC2, GDPR, NIST)
   */
  getComplianceReport: async (standard: string = "PCI-DSS"): Promise<string> => {
    return apiRequest<string>(`/api/reports/compliance?standard=${encodeURIComponent(standard)}`);
  },

  /**
   * Get certificate inventory report
   * @param format - Report format (json, pdf, csv)
   */
  getInventoryReport: async (format: string = "json"): Promise<string> => {
    return apiRequest<string>(`/api/reports/inventory?format=${encodeURIComponent(format)}`);
  },

  /**
   * Get expiring certificates report
   * @param days - Number of days to look ahead
   * @param format - Report format (json, csv, pdf)
   */
  getExpiringReport: async (days: number = 30, format: string = "json"): Promise<string> => {
    return apiRequest<string>(
      `/api/reports/expiring?days=${days}&format=${encodeURIComponent(format)}`
    );
  },

  /**
   * Get audit logs
   * @param startDate - Start date (ISO 8601 format)
   * @param endDate - End date (ISO 8601 format)
   */
  getAuditLogs: async (startDate?: string, endDate?: string): Promise<AuditLog[]> => {
    let url = "/api/audit-logs";
    const params: string[] = [];
    if (startDate) params.push(`startDate=${encodeURIComponent(startDate)}`);
    if (endDate) params.push(`endDate=${encodeURIComponent(endDate)}`);
    if (params.length > 0) url += `?${params.join("&")}`;
    return apiRequest<AuditLog[]>(url);
  },
};
