import { apiRequest } from "./config";
import type { AcmeProvider, AcmeOrder } from "./types";

export const acmeApi = {
  /**
   * List all ACME providers
   */
  getProviders: async (): Promise<AcmeProvider[]> => {
    return apiRequest<AcmeProvider[]>("/api/acme/providers");
  },

  /**
   * Create ACME provider
   */
  createProvider: async (provider: {
    name: string;
    type: "LETS_ENCRYPT_PRODUCTION" | "LETS_ENCRYPT_STAGING" | "ZEROSSL" | "BUYPASS" | "CUSTOM";
    directoryUrl?: string;
    isStaging?: boolean;
    isActive?: boolean;
    eabKid?: string;
    eabHmacKey?: string;
    description?: string;
  }): Promise<AcmeProvider> => {
    return apiRequest<AcmeProvider>("/api/acme/providers", {
      method: "POST",
      body: JSON.stringify(provider),
    });
  },

  /**
   * List all ACME orders
   */
  getOrders: async (): Promise<AcmeOrder[]> => {
    return apiRequest<AcmeOrder[]>("/api/acme/orders");
  },

  /**
   * Create ACME order
   */
  createOrder: async (order: {
    providerId: number;
    accountId: number;
    domains: string[];
    challengeType?: "HTTP_01" | "DNS_01" | "TLS_ALPN_01";
    notes?: string;
  }): Promise<AcmeOrder> => {
    return apiRequest<AcmeOrder>("/api/acme/orders", {
      method: "POST",
      body: JSON.stringify(order),
    });
  },

  /**
   * Manual renewal for specific order
   */
  manualRenewal: async (orderId: number): Promise<Record<string, string>> => {
    return apiRequest<Record<string, string>>(`/api/acme/orders/${orderId}/renew`, {
      method: "POST",
    });
  },

  /**
   * Trigger challenge validation
   */
  triggerChallenge: async (challengeId: number): Promise<unknown> => {
    return apiRequest(`/api/acme/challenges/${challengeId}/trigger`, {
      method: "POST",
    });
  },

  /**
   * Enable auto-renewal
   */
  enableAutoRenewal: async (): Promise<Record<string, string>> => {
    return apiRequest<Record<string, string>>("/api/acme/renewal/enable", {
      method: "POST",
    });
  },

  /**
   * Disable auto-renewal
   */
  disableAutoRenewal: async (): Promise<Record<string, string>> => {
    return apiRequest<Record<string, string>>("/api/acme/renewal/disable", {
      method: "POST",
    });
  },
};

export const integrationsApi = {
  /**
   * Configure ACME protocol (Let's Encrypt, etc.)
   */
  configureAcme: async (email: string, acmeServerUrl?: string): Promise<string> => {
    let url = `/api/integrations/acme/configure?email=${encodeURIComponent(email)}`;
    if (acmeServerUrl) {
      url += `&acmeServerUrl=${encodeURIComponent(acmeServerUrl)}`;
    }
    return apiRequest<string>(url, { method: "POST" });
  },

  /**
   * Order certificate via ACME
   */
  orderAcmeCertificate: async (domains: string[], validationType: string = "HTTP-01"): Promise<string> => {
    const params = domains.map(d => `domains=${encodeURIComponent(d)}`).join("&");
    return apiRequest<string>(
      `/api/integrations/acme/order?${params}&validationType=${encodeURIComponent(validationType)}`,
      { method: "POST" }
    );
  },

  /**
   * Validate domain ownership
   */
  validateDomain: async (orderId: string, validationType: string, proofData: Record<string, string>): Promise<string> => {
    return apiRequest<string>(
      `/api/integrations/acme/validate?orderId=${encodeURIComponent(orderId)}&validationType=${encodeURIComponent(validationType)}`,
      {
        method: "POST",
        body: JSON.stringify(proofData),
      }
    );
  },

  /**
   * Configure Jenkins CI/CD integration
   */
  configureJenkins: async (config: { jenkinsUrl: string; apiToken: string; jobName: string }): Promise<string> => {
    return apiRequest<string>("/api/integrations/jenkins/configure", {
      method: "POST",
      body: JSON.stringify(config),
    });
  },

  /**
   * Configure Kubernetes integration
   */
  configureKubernetes: async (config: { clusterUrl: string; serviceAccountToken: string; namespace: string }): Promise<string> => {
    return apiRequest<string>("/api/integrations/kubernetes/configure", {
      method: "POST",
      body: JSON.stringify(config),
    });
  },
};
