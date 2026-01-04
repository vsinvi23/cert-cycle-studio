import { apiRequest } from "./config";
import type { AuditLog, ComplianceReport } from "./types";

export const reportsApi = {
  /**
   * GET /api/reports/compliance
   * Generate compliance report
   * @param standard - Compliance standard (PCI-DSS, SOC2, GDPR, NIST)
   */
  getComplianceReport: async (standard: "PCI-DSS" | "SOC2" | "GDPR" | "NIST" = "PCI-DSS"): Promise<ComplianceReport> => {
    return apiRequest<ComplianceReport>(`/api/reports/compliance?standard=${encodeURIComponent(standard)}`);
  },

  /**
   * GET /api/reports/inventory
   * Generate certificate inventory report
   * @param format - Report format (JSON, PDF, CSV)
   */
  getInventoryReport: async (format: "JSON" | "PDF" | "CSV" = "JSON"): Promise<string> => {
    return apiRequest<string>(`/api/reports/inventory?format=${encodeURIComponent(format)}`);
  },

  /**
   * GET /api/reports/expiring
   * Expiring certificates report
   * @param days - Number of days to look ahead
   */
  getExpiringReport: async (days: number = 30): Promise<string> => {
    return apiRequest<string>(`/api/reports/expiring?days=${days}`);
  },

  /**
   * GET /api/audit-logs
   * Get audit logs
   * @param startDate - Start date (ISO 8601 format)
   * @param endDate - End date (ISO 8601 format)
   * @param action - Filter by action type
   */
  getAuditLogs: async (startDate?: string, endDate?: string, action?: string): Promise<AuditLog[]> => {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    if (action) params.append("action", action);
    const query = params.toString();
    return apiRequest<AuditLog[]>(`/api/audit-logs${query ? `?${query}` : ""}`);
  },
};
