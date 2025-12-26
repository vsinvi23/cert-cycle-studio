// ============================================
// CertAxis API Types - Based on OpenAPI Spec
// ============================================

// Authentication
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
}

export interface RegisterResponse {
  message: string;
  username: string;
}

// User
export interface User {
  id: number;
  username: string;
}

// Dashboard Metrics
export interface DashboardMetrics {
  totalCertificates: number;
  activeCertificates: number;
  expiredCertificates: number;
  revokedCertificates: number;
  totalCAs: number;
  activeCAs: number;
  expiringIn30Days: number;
  expiringIn7Days: number;
  avgCertificateAgeDays: number;
}

// Expiring Certificate
export interface ExpiringCertificate {
  id: number;
  host: string;
  issuerCA: string;
  expiresAt: string;
  daysUntilExpiry: number;
  algorithm: string;
  severity: "CRITICAL" | "WARNING" | "INFO";
}

// Certificate Health
export interface CertificateHealth {
  healthScore: number;
  weakAlgorithmCount: number;
  strongAlgorithmCount: number;
  algorithmDistribution: Record<string, number>;
  keySizeDistribution: Record<string, number>;
  caDistribution: Record<string, number>;
  oldCertificatesCount: number;
  recentlyIssuedCount: number;
  status: "EXCELLENT" | "GOOD" | "WARNING" | "CRITICAL";
  recommendations: string[];
}

// Compliance Score
export interface ComplianceBreakdown {
  keyLengthScore: number;
  algorithmScore: number;
  validityScore: number;
  lifecycleScore: number;
}

export interface ComplianceViolation {
  certificateId: number;
  host: string;
  violationType: string;
  description: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
}

export interface ComplianceScore {
  overallScore: number;
  compliantCount: number;
  nonCompliantCount: number;
  breakdown: ComplianceBreakdown;
  violations: ComplianceViolation[];
  status: "COMPLIANT" | "PARTIAL" | "NON_COMPLIANT";
}

// Certificate
export interface Certificate {
  id: number;
  host: string;
  issuerCA: string;
  algorithm: string;
  keySize?: number;
  validFrom: string;
  validTo: string;
  status: "ACTIVE" | "EXPIRED" | "REVOKED";
  createdAt: string;
  user?: User;
}

// Nmap Certificate Scan
export interface NmapScanRequest {
  targets: string;
  ports?: string;
}

export interface NmapCertificateScan {
  id: number;
  host: string;
  port: number;
  commonName: string;
  issuer: string;
  validFrom: string;
  validTo: string;
  algorithm: string;
  keySize: number;
  serialNumber: string;
  fingerprint: string;
  subjectAlternativeNames?: string[];
  scanDate: string;
}

// Certificate Authority
export interface CreateCARequest {
  commonName: string;
  organization?: string;
  organizationalUnit?: string;
  locality?: string;
  state?: string;
  country?: string;
  signatureAlgorithm: string;
  validityInDays?: number;
  alias: string;
}

export interface CertificateAuthority {
  id: number;
  alias: string;
  commonName: string;
  organization?: string;
  organizationalUnit?: string;
  locality?: string;
  state?: string;
  country?: string;
  signatureAlgorithm: string;
  validFrom: string;
  validTo: string;
  status: "ACTIVE" | "REVOKED" | "EXPIRED";
  createdAt: string;
}

// User Certificate Request
export interface CreateUserCertificateRequest {
  commonName: string;
  organization?: string;
  organizationalUnit?: string;
  locality?: string;
  state?: string;
  country?: string;
  keyPairAlgorithm: string;
  validityInDays?: number;
  alias: string;
  caAlias: string;
  password: string;
}

// Roles
export interface Role {
  id: number;
  name: string;
  description: string;
  permissions: string[];
  createdAt: string;
}

// Alert Configuration
export interface AlertConfiguration {
  id: number;
  name: string;
  alertType: "EXPIRATION" | "REVOCATION" | "ISSUANCE" | "COMPLIANCE";
  enabled: boolean;
  thresholdDays?: number;
  emailRecipients?: string;
  webhookUrl?: string;
  slackWebhookUrl?: string;
  createdAt: string;
}

export interface AlertConfigurationRequest {
  name: string;
  alertType: "EXPIRATION" | "REVOCATION" | "ISSUANCE" | "COMPLIANCE";
  enabled?: boolean;
  thresholdDays?: number;
  emailRecipients?: string;
  webhookUrl?: string;
  slackWebhookUrl?: string;
}

// Alert History
export interface AlertHistory {
  id: number;
  alertType: string;
  severity: string;
  message: string;
  certificateId?: number;
  certificateHost?: string;
  sentTo: string;
  deliveryStatus: string;
  errorMessage?: string;
  triggeredAt: string;
  sentAt?: string;
}

// Audit Log
export interface AuditLog {
  id: number;
  action: string;
  entityType: string;
  entityId?: number;
  description: string;
  performedBy: string;
  ipAddress?: string;
  beforeState?: string;
  afterState?: string;
  timestamp: string;
  status: string;
  errorMessage?: string;
}

// Discovery
export interface DiscoveryConfiguration {
  id: number;
  name: string;
  discoveryType: "LDAP" | "CLOUD" | "FILESYSTEM";
  configuration: Record<string, string>;
  schedule: string;
  enabled: boolean;
  lastRun?: string;
  nextRun?: string;
  createdAt: string;
}

// Auto Renew Configuration
export interface AutoRenewConfiguration {
  id: number;
  certificateId: number;
  renewBeforeDays: number;
  enabled: boolean;
  maxRetries: number;
  lastRenewalAttempt?: string;
  createdAt: string;
}

// Certificate Template
export interface CertificateTemplate {
  id: number;
  name: string;
  description?: string;
  caAlias: string;
  algorithm: string;
  keySize: number;
  validityDays: number;
  subjectTemplate?: string;
  createdAt: string;
}

// ACME Types
export interface AcmeProvider {
  id: number;
  name: string;
  type: "LETS_ENCRYPT_PRODUCTION" | "LETS_ENCRYPT_STAGING" | "ZEROSSL" | "BUYPASS" | "CUSTOM";
  directoryUrl: string;
  termsOfServiceUrl?: string;
  website?: string;
  isStaging: boolean;
  isActive: boolean;
  rateLimitPerWeek?: number;
  requiresEab: boolean;
  eabKid?: string;
  eabHmacKey?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AcmeOrder {
  id: number;
  orderId: string;
  status: "PENDING" | "PROCESSING" | "READY" | "VALID" | "INVALID" | "EXPIRED";
  domains: string;
  challengeType: "HTTP_01" | "DNS_01" | "TLS_ALPN_01";
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

// Pagination
export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
