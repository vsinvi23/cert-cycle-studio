// CertAxis API Configuration
// This file contains configurable API settings for managing different environments

/**
 * API Configuration for CertAxis
 * Change the API_HOST to point to your target server
 */

// ============================================
// CONFIGURABLE API SETTINGS
// ============================================

// Primary API Host - Change this to switch environments
// Examples:
// - Local development: "localhost:8080"
// - Staging: "staging.certaxis.io"
// - Production: "api.certaxis.io"
// - Custom: "15.206.141.103:8080"
export const API_HOST = "15.206.141.103:8080";

// Protocol (http or https)
export const API_PROTOCOL = "http";

// API version prefix (if applicable)
export const API_VERSION = "";

// ============================================
// DERIVED CONFIGURATION (DO NOT MODIFY)
// ============================================

// Full base URL constructed from above settings
export const API_BASE_URL = 
  import.meta.env.VITE_API_BASE_URL || 
  `${API_PROTOCOL}://${API_HOST}${API_VERSION}`;

// Timeout settings (in milliseconds)
export const API_TIMEOUT = 30000; // 30 seconds

// Retry configuration
export const API_RETRY_COUNT = 3;
export const API_RETRY_DELAY = 1000; // 1 second

// ============================================
// TENANT CONFIGURATION
// ============================================

export interface TenantConfig {
  id: string;
  name: string;
  domain: string;
  plan: "Enterprise" | "Professional" | "Starter";
  apiHost?: string; // Optional: tenant-specific API host
  isActive: boolean;
}

// Default tenants - These can be fetched from API in production
export const DEFAULT_TENANTS: TenantConfig[] = [
  { 
    id: "tenant-001", 
    name: "Acme Corporation", 
    domain: "acme.certaxis.io", 
    plan: "Enterprise",
    isActive: true 
  },
  { 
    id: "tenant-002", 
    name: "TechStart Inc", 
    domain: "techstart.certaxis.io", 
    plan: "Professional",
    isActive: true 
  },
  { 
    id: "tenant-003", 
    name: "Global Systems", 
    domain: "global.certaxis.io", 
    plan: "Enterprise",
    isActive: true 
  },
];

// ============================================
// ENVIRONMENT DETECTION
// ============================================

export const isDevelopment = import.meta.env.DEV;
export const isProduction = import.meta.env.PROD;

// Log configuration in development
if (isDevelopment) {
  console.log("[CertAxis API Config]", {
    host: API_HOST,
    baseUrl: API_BASE_URL,
    protocol: API_PROTOCOL,
  });
}
