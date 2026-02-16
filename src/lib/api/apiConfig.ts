// ============================================
// CertAxis API Configuration
// ============================================

// Detect environment
export const isDevelopment = import.meta.env.DEV;
export const isProduction = import.meta.env.PROD;

/**
 * API base URL strategy:
 *
 * - Development:
 *   UI runs locally → call backend directly (EC2 / Docker)
 *
 * - Production:
 *   UI runs behind Nginx → same-origin API (/api)
 */

// ===============================
// API BASE URL (SINGLE SOURCE)
// ===============================

export const API_BASE_URL: string =
  import.meta.env.VITE_API_BASE_URL ??
  (isDevelopment
    ? "http://localhost:8080"  
    : "");                           

// ===============================
// API SETTINGS
// ===============================

export const API_TIMEOUT = 30000; // 30 seconds
export const API_RETRY_COUNT = 3;
export const API_RETRY_DELAY = 1000;

// ===============================
// TENANT CONFIGURATION
// ===============================

export interface TenantConfig {
  id: string;
  name: string;
  domain: string;
  plan: "Enterprise" | "Professional" | "Starter";
  apiHost?: string;
  isActive: boolean;
}

export const DEFAULT_TENANTS: TenantConfig[] = [
  {
    id: "tenant-001",
    name: "Acme Corporation",
    domain: "acme.certaxis.io",
    plan: "Enterprise",
    isActive: true,
  },
  {
    id: "tenant-002",
    name: "TechStart Inc",
    domain: "techstart.certaxis.io",
    plan: "Professional",
    isActive: true,
  },
  {
    id: "tenant-003",
    name: "Global Systems",
    domain: "global.certaxis.io",
    plan: "Enterprise",
    isActive: true,
  },
];

// ===============================
// DEBUG LOG (DEV ONLY)
// ===============================

if (isDevelopment) {
  console.log("[CertAxis API Config]", {
    env: "development",
    apiBaseUrl: API_BASE_URL,
  });
}
