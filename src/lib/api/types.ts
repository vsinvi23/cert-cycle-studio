// ============================================
// CertAxis API Types - Based on OpenAPI Spec v2
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
  password?: string;
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
  certificateName?: string;
  certData?: string;
  subject?: string;
  commonName?: string;
  host?: string;
  issuerCA?: string;
  issuer?: string;
  algorithm?: string;
  keySize?: number;
  validFrom: string;
  validTo: string;
  serialNumber?: string;
  status: "ACTIVE" | "EXPIRED" | "REVOKED";
  createdAt: string;
  createdBy?: User;
  expired?: boolean;
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
  teamsWebhookUrl?: string;
  createdAt: string;
}

export interface AlertConfigurationRequest {
  id?: number;
  name: string;
  alertType: "EXPIRATION" | "REVOCATION" | "ISSUANCE" | "COMPLIANCE";
  enabled?: boolean;
  thresholdDays?: number;
  emailRecipients?: string;
  webhookUrl?: string;
  slackWebhookUrl?: string;
  teamsWebhookUrl?: string;
}

export interface CertificateExpirationAlertRequest {
  certificateId: string;
  hostname: string;
  daysUntilExpiry: number;
  alertConfigId: number;
}

export interface BulkOperationAlertRequest {
  operationType: "ISSUE" | "RENEW" | "REVOKE";
  totalCount: number;
  successCount: number;
  failedCount: number;
  alertConfigId: number;
}

export interface GeneralAlertRequest {
  subject: string;
  message: string;
  alertConfigId: number;
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

// Bulk Operations
export interface BulkIssueRequest {
  certificateRequests: string[];
}

export interface BulkRenewRequest {
  certificateIds: number[];
}

export interface BulkRevokeRequest {
  certificateIds: number[];
  reason?: string;
}

export interface BulkOperationResult {
  totalCount: number;
  successCount: number;
  failedCount: number;
  results: Array<{
    id: number;
    success: boolean;
    error?: string;
  }>;
}

// Background Jobs
export interface BackgroundJob {
  id: number;
  jobId: string;
  jobType: string;
  status: "PENDING" | "RUNNING" | "COMPLETED" | "FAILED";
  progress: number;
  result?: string;
  createdBy: number;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  finished: boolean;
  durationSeconds?: number;
  running: boolean;
}

// Session Management
export interface UserSession {
  id: number;
  userId: number;
  sessionToken: string;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
  lastActivityAt: string;
  expiresAt: string;
  isActive: boolean;
}

// Rate Limit
export interface RateLimitViolation {
  id: number;
  ipAddress: string;
  userId?: number;
  endpoint: string;
  method: string;
  violationType: string;
  userTier?: string;
  violatedAt: string;
  userAgent?: string;
  notes?: string;
}

export interface RateLimitMetrics {
  totalViolations: number;
  violationsByEndpoint: Record<string, number>;
  violationsByIp: Record<string, number>;
  topOffenders: Array<{
    ip: string;
    count: number;
  }>;
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

export interface CreateAcmeProviderRequest {
  name: string;
  type: "LETS_ENCRYPT_PRODUCTION" | "LETS_ENCRYPT_STAGING" | "ZEROSSL" | "BUYPASS" | "CUSTOM";
  directoryUrl?: string;
  isStaging?: boolean;
  isActive?: boolean;
  eabKid?: string;
  eabHmacKey?: string;
  description?: string;
}

export interface AcmeAccount {
  id: number;
  email: string;
  acmeServerUrl: string;
  accountUrl: string;
  privateKey: string;
  publicKey: string;
  status: string;
  termsAgreed: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
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

export interface CreateAcmeOrderRequest {
  providerId: number;
  accountId: number;
  domains: string[];
  challengeType?: "HTTP_01" | "DNS_01" | "TLS_ALPN_01";
  notes?: string;
}

export interface AcmeAuthorization {
  id: number;
  domain: string;
  status: "PENDING" | "PROCESSING" | "VALID" | "INVALID" | "EXPIRED" | "REVOKED";
  expiresAt: string;
  authorizationUrl: string;
  isWildcard: boolean;
  createdAt: string;
  updatedAt: string;
  challenges: AcmeChallenge[];
}

export interface AcmeChallenge {
  id: number;
  type: "HTTP_01" | "DNS_01" | "TLS_ALPN_01";
  status: "PENDING" | "PROCESSING" | "VALID" | "INVALID";
  token: string;
  challengeUrl: string;
  validatedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ACME Monitoring
export interface AcmeWebhook {
  id: number;
  name: string;
  url: string;
  events: string[];
  secretKey?: string;
  isActive: boolean;
  lastTriggered?: string;
  failureCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AcmeMetrics {
  id: number;
  metricDate: string;
  providerType: string;
  ordersCreated: number;
  ordersSucceeded: number;
  ordersFailed: number;
  ordersPending: number;
  challengesValidated: number;
  challengesFailed: number;
  avgIssuanceTime: number;
  minIssuanceTime: number;
  maxIssuanceTime: number;
  renewalsAttempted: number;
  renewalsSucceeded: number;
  renewalsFailed: number;
  http01Challenges: number;
  dns01Challenges: number;
  tlsAlpn01Challenges: number;
  apiRequestsTotal: number;
  apiRequestsFailed: number;
  rateLimitHits: number;
  successRate: number;
}

export interface AcmeDashboardSummary {
  totalOrders: number;
  activeProviders: number;
  pendingChallenges: number;
  successRate: number;
  recentOrders: AcmeOrder[];
}

// Certificate Operations
export interface CertificateValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  validFrom: string;
  validTo: string;
  issuer: string;
  subject: string;
}

export interface CertificateComparisonResult {
  areSame: boolean;
  differences: string[];
}

// Pagination
export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

// API Key Management
export interface ApiKey {
  id: number;
  name: string;
  keyPrefix: string;
  permissions: string[];
  expiresAt?: string;
  lastUsedAt?: string;
  lastUsedIp?: string;
  enabled: boolean;
  createdAt: string;
  createdBy: string;
}

export interface CreateApiKeyRequest {
  name: string;
  permissions: string[];
  expiresInDays?: number;
}

export interface CreateApiKeyResponse {
  id: number;
  name: string;
  keyPlainText: string;
  keyPrefix: string;
  permissions: string[];
  expiresAt?: string;
}

// Session Analytics
export interface SessionAnalytics {
  totalSessions: number;
  activeSessions: number;
  deviceBreakdown: Record<string, number>;
  ipAddresses: string[];
  averageSessionDuration: number;
  loginFrequency: Record<string, number>;
}

export interface SuspiciousActivity {
  userId: number;
  username: string;
  uniqueIps: number;
  ipAddresses: string[];
  lastActivityAt: string;
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
}

// Discovery Configuration
export interface CreateDiscoveryRequest {
  name: string;
  discoveryType: "LDAP" | "CLOUD" | "FILESYSTEM" | "NETWORK";
  configuration: Record<string, string>;
  schedule?: string;
  enabled?: boolean;
}

export interface DiscoveryResult {
  id: number;
  configurationId: number;
  certificatesFound: number;
  newCertificates: number;
  existingCertificates: number;
  status: "COMPLETED" | "FAILED" | "RUNNING";
  startedAt: string;
  completedAt?: string;
  details: Record<string, unknown>[];
}

// Certificate Template
export interface CreateCertificateTemplateRequest {
  name: string;
  description?: string;
  caAlias: string;
  algorithm: string;
  keySize: number;
  validityDays: number;
  subjectTemplate?: string;
}

// System Health
export interface SystemHealth {
  status: "UP" | "DOWN" | "DEGRADED";
  uptime: number;
  version: string;
  database: {
    status: "UP" | "DOWN";
    responseTime: number;
  };
  redis?: {
    status: "UP" | "DOWN";
    responseTime: number;
  };
  acme?: {
    status: "UP" | "DOWN";
    activeProviders: number;
  };
}

// Compliance Report
export interface ComplianceReport {
  reportDate: string;
  standard: string;
  overallCompliance: number;
  findings: {
    compliant: number;
    nonCompliant: number;
    warnings: number;
  };
  requirements: Array<{
    requirement: string;
    status: string;
    details: string;
  }>;
  nonCompliantCertificates: Array<{
    id: number;
    domain: string;
    issue: string;
    remediation: string;
  }>;
}
