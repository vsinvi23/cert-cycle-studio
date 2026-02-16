import { apiRequest } from "./config";
import type { 
  AcmeProvider, 
  AcmeOrder, 
  AcmeAccount,
  AcmeAuthorization,
  AcmeChallenge,
  CreateAcmeProviderRequest,
  CreateAcmeOrderRequest,
  AcmeRenewalStatus,
  EnableAcmeRenewalRequest,
  DisableAcmeRenewalRequest
} from "./types";
import type { PaginatedResponse, AcmeProviderFilters, AcmeAccountFilters } from "./types/pagination";
import { buildQueryParams } from "./types/pagination";

export const acmeApi = {
  // ==================== PROVIDER MANAGEMENT ====================
  
  /**
   * GET /api/acme/providers/paginated
   * List all ACME providers with pagination, search, and enabled status filtering
   * Supports: pagination, sorting, searching (name/description/URL), filtering (enabled)
   */
  getProviders: async (params: AcmeProviderFilters = {}): Promise<PaginatedResponse<AcmeProvider> | AcmeProvider[]> => {
    const queryString = buildQueryParams({
      page: params.page,
      size: params.size,
      search: params.search,
      enabled: params.enabled,
      sortBy: params.sortBy,
      sortOrder: params.sortOrder,
    });
    
    return apiRequest<PaginatedResponse<AcmeProvider>>(`/api/acme/providers/paginated${queryString}`);
  },

  /**
   * GET /api/acme/providers/{id}
   * Get ACME provider by ID
   */
  getProvider: async (id: number): Promise<AcmeProvider> => {
    return apiRequest<AcmeProvider>(`/api/acme/providers/${id}`);
  },

  /**
   * POST /api/acme/providers
   * Create ACME provider
   */
  createProvider: async (provider: CreateAcmeProviderRequest): Promise<AcmeProvider> => {
    return apiRequest<AcmeProvider>("/api/acme/providers", {
      method: "POST",
      body: JSON.stringify(provider),
    });
  },

  /**
   * DELETE /api/acme/providers/{id}
   * Delete ACME provider
   */
  deleteProvider: async (id: number): Promise<void> => {
    return apiRequest<void>(`/api/acme/providers/${id}`, {
      method: "DELETE",
    });
  },

  // ==================== ACCOUNT MANAGEMENT ====================

  /**
   * GET /api/acme/accounts/paginated
   * List all ACME accounts with pagination and filters
   * Supports: pagination, sorting, filtering (provider ID, account status)
   */
  getAccounts: async (params: AcmeAccountFilters = {}): Promise<PaginatedResponse<AcmeAccount> | AcmeAccount[]> => {
    const queryString = buildQueryParams({
      page: params.page,
      size: params.size,
      providerId: params.providerId,
      status: params.status,
      sortBy: params.sortBy,
      sortDir: params.sortDir,
    });
    
    return apiRequest<PaginatedResponse<AcmeAccount>>(`/api/acme/accounts/paginated${queryString}`);
  },

  /**
   * GET /api/acme/accounts/{id}
   * Get ACME account by ID
   */
  getAccount: async (id: number): Promise<AcmeAccount> => {
    return apiRequest<AcmeAccount>(`/api/acme/accounts/${id}`);
  },

  // ==================== ORDER MANAGEMENT ====================

  /**
   * GET /api/acme/orders
   * List all ACME orders
   */
  getOrders: async (): Promise<AcmeOrder[]> => {
    return apiRequest<AcmeOrder[]>("/api/acme/orders");
  },

  /**
   * GET /api/acme/orders/{id}
   * Get ACME order by ID
   */
  getOrder: async (id: number): Promise<AcmeOrder> => {
    return apiRequest<AcmeOrder>(`/api/acme/orders/${id}`);
  },

  /**
   * POST /api/acme/orders
   * Create ACME order
   */
  createOrder: async (order: CreateAcmeOrderRequest): Promise<AcmeOrder> => {
    return apiRequest<AcmeOrder>("/api/acme/orders", {
      method: "POST",
      body: JSON.stringify(order),
    });
  },

  /**
   * DELETE /api/acme/orders/{id}
   * Cancel ACME order
   */
  cancelOrder: async (id: number): Promise<void> => {
    return apiRequest<void>(`/api/acme/orders/${id}`, {
      method: "DELETE",
    });
  },

  /**
   * GET /api/acme/accounts/{accountId}/orders
   * Get orders by account
   */
  getOrdersByAccount: async (accountId: number): Promise<AcmeOrder[]> => {
    return apiRequest<AcmeOrder[]>(`/api/acme/accounts/${accountId}/orders`);
  },

  // ==================== AUTHORIZATION & CHALLENGE ====================

  /**
   * GET /api/acme/orders/{orderId}/authorizations
   * Get authorizations for order
   */
  getOrderAuthorizations: async (orderId: number): Promise<AcmeAuthorization[]> => {
    return apiRequest<AcmeAuthorization[]>(`/api/acme/orders/${orderId}/authorizations`);
  },

  /**
   * GET /api/acme/authorizations/{id}
   * Get authorization details
   */
  getAuthorization: async (id: number): Promise<AcmeAuthorization> => {
    return apiRequest<AcmeAuthorization>(`/api/acme/authorizations/${id}`);
  },

  /**
   * GET /api/acme/authorizations/{authId}/challenges
   * Get challenges for authorization
   */
  getAuthorizationChallenges: async (authId: number): Promise<AcmeChallenge[]> => {
    return apiRequest<AcmeChallenge[]>(`/api/acme/authorizations/${authId}/challenges`);
  },

  /**
   * GET /api/acme/challenges/{id}
   * Get challenge details
   */
  getChallenge: async (id: number): Promise<AcmeChallenge> => {
    return apiRequest<AcmeChallenge>(`/api/acme/challenges/${id}`);
  },

  /**
   * POST /api/acme/challenges/{id}/trigger
   * Trigger challenge validation
   */
  triggerChallenge: async (id: number): Promise<unknown> => {
    return apiRequest(`/api/acme/challenges/${id}/trigger`, {
      method: "POST",
    });
  },

  // ==================== AUTO-RENEWAL ====================

  /**
   * GET /api/acme/renewal/status
   * Get auto-renewal status
   */
  getRenewalStatus: async (): Promise<AcmeRenewalStatus> => {
    return apiRequest<AcmeRenewalStatus>("/api/acme/renewal/status");
  },

  /**
   * POST /api/acme/orders/{id}/renew
   * Manual renewal for specific order
   */
  manualRenewal: async (orderId: number): Promise<Record<string, string>> => {
    return apiRequest<Record<string, string>>(`/api/acme/orders/${orderId}/renew`, {
      method: "POST",
    });
  },

  /**
   * POST /api/acme/renewal/enable
   * Enable auto-renewal
   */
  enableAutoRenewal: async (request: EnableAcmeRenewalRequest): Promise<Record<string, string>> => {
    return apiRequest<Record<string, string>>("/api/acme/renewal/enable", {
      method: "POST",
      body: JSON.stringify(request),
    });
  },

  /**
   * POST /api/acme/renewal/disable
   * Disable auto-renewal
   */
  disableAutoRenewal: async (request: DisableAcmeRenewalRequest): Promise<Record<string, string>> => {
    return apiRequest<Record<string, string>>("/api/acme/renewal/disable", {
      method: "POST",
      body: JSON.stringify(request),
    });
  },
};

export const integrationsApi = {
  /**
   * POST /api/integrations/acme/configure
   * Configure ACME integration
   */
  configureAcme: async (email: string, acmeServerUrl?: string): Promise<string> => {
    const params = new URLSearchParams();
    params.append("email", email);
    if (acmeServerUrl) params.append("acmeServerUrl", acmeServerUrl);
    
    return apiRequest<string>(`/api/integrations/acme/configure?${params.toString()}`, {
      method: "POST",
    });
  },

  /**
   * POST /api/integrations/acme/order
   * Order certificate via ACME
   */
  orderAcmeCertificate: async (domains: string[]): Promise<string> => {
    return apiRequest<string>("/api/integrations/acme/order", {
      method: "POST",
      body: JSON.stringify({ domains }),
    });
  },

  /**
   * POST /api/integrations/acme/validate
   * Validate domain ownership
   */
  validateDomain: async (domain: string, challengeType: "HTTP-01" | "DNS-01" | "TLS-ALPN-01"): Promise<string> => {
    return apiRequest<string>("/api/integrations/acme/validate", {
      method: "POST",
      body: JSON.stringify({ domain, challengeType }),
    });
  },

  /**
   * POST /api/integrations/jenkins/configure
   * Configure Jenkins CI/CD integration
   */
  configureJenkins: async (config: { jenkinsUrl: string; apiToken: string; jobName: string }): Promise<string> => {
    return apiRequest<string>("/api/integrations/jenkins/configure", {
      method: "POST",
      body: JSON.stringify(config),
    });
  },

  /**
   * POST /api/integrations/kubernetes/configure
   * Configure Kubernetes integration
   */
  configureKubernetes: async (config: { kubeconfig: string; namespace?: string }): Promise<string> => {
    return apiRequest<string>("/api/integrations/kubernetes/configure", {
      method: "POST",
      body: JSON.stringify(config),
    });
  },
};
