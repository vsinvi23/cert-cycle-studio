// Export all API modules
export * from "./config";
export * from "./types";
export { authApi } from "./auth";
export { dashboardApi } from "./dashboard";
export { certificatesApi, networkScanApi, certificateOperationsApi } from "./certificates";
export { caApi } from "./ca";
export { reportsApi, alertsApi } from "./reports";
export { securityApi } from "./security";
export { discoveryApi } from "./discovery";
export { acmeApi, integrationsApi } from "./acme";

// Health check
import { apiRequest } from "./config";

export const healthApi = {
  check: async (): Promise<{ status: string }> => {
    return apiRequest<{ status: string }>("/api/health");
  },
};
