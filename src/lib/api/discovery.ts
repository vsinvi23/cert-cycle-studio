import { apiRequest } from "./config";
import type { DiscoveryConfiguration } from "./types";

export const discoveryApi = {
  /**
   * Scan LDAP/Active Directory for certificates
   */
  scanLDAP: async (config: {
    server: string;
    port: string;
    baseDN: string;
    username: string;
    password: string;
  }): Promise<string> => {
    return apiRequest<string>("/api/discovery/scan/ldap", {
      method: "POST",
      body: JSON.stringify(config),
    });
  },

  /**
   * Scan cloud provider for certificates
   * @param provider - Cloud provider (aws, azure, gcp)
   */
  scanCloud: async (provider: string, credentials: Record<string, string>): Promise<string> => {
    return apiRequest<string>(`/api/discovery/scan/cloud?provider=${encodeURIComponent(provider)}`, {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  },

  /**
   * Scan filesystem for certificates
   */
  scanFilesystem: async (path: string): Promise<string> => {
    return apiRequest<string>(`/api/discovery/scan/filesystem?path=${encodeURIComponent(path)}`, {
      method: "POST",
    });
  },

  /**
   * Schedule recurring discovery scan
   */
  schedule: async (config: {
    name: string;
    discoveryType: "LDAP" | "CLOUD" | "FILESYSTEM";
    configuration: Record<string, unknown>;
    schedule: string;
  }): Promise<DiscoveryConfiguration> => {
    return apiRequest<DiscoveryConfiguration>("/api/discovery/schedule", {
      method: "POST",
      body: JSON.stringify(config),
    });
  },

  /**
   * Get certificate discovery changes
   */
  getChanges: async (): Promise<string> => {
    return apiRequest<string>("/api/discovery/changes");
  },
};
