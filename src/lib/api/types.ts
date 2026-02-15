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
  username: string;
  email: string;
  roles?: string[];
  permissions?: string[];
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
  email: string;
  role: string;
  password?: string;
}

// User Management - Complete Types
export interface UserResponse {
  id: number;
  username: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  enabled: boolean;
  accountNonExpired?: boolean;
  accountNonLocked: boolean;
  credentialsNonExpired?: boolean;
  roles: Role[];
  department?: string;
  phoneNumber?: string;
  createdAt: string;
  updatedAt?: string;
  lastLoginAt?: string | null;
  lastLogin?: string | null;
  createdBy?: string | null;
  updatedBy?: string | null;
  lastLoginIp?: string | null;
  failedLoginAttempts: number;
  lockedUntil?: string | null;
}

export interface CreateUserRequest {
  username: string;
  password: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  enabled?: boolean;
  roleIds?: number[];
  department?: string;
  phoneNumber?: string;
}

export interface UpdateUserRequest {
  email?: string;
  firstName?: string;
  lastName?: string;
  enabled?: boolean;
  department?: string;
  phoneNumber?: string;
}

export interface ChangePasswordRequest {
  currentPassword?: string; // Optional for admin, required for self-service
  newPassword: string;
  confirmPassword: string;
}

export interface UserStatistics {
  totalUsers: number;
  enabledUsers: number;
  disabledUsers: number;
  lockedUsers: number;
  activePercentage: number;
  usersByRole: Record<string, number>;
  usersByDepartment: Record<string, number>;
  recentlyCreated: number;
  lastUpdated: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      sorted: boolean;
      unsorted: boolean;
    };
  };
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
  size: number;
  number: number;
  numberOfElements: number;
}

// CA List Response
export interface CAInfo {
  alias: string;
  subject: string;
  notBefore: string;
  notAfter: string;
  algorithm: string;
  keySize: number;
  signatureAlgorithm: string;
  hasPrivateKey: boolean;
}

export interface CAListResponse {
  total: number;
  page: number;
  size: number;
  results: CAInfo[];
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
  healthScore?: number;
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
  alias?: string;
  certificateName?: string;
  certData?: string;
  subject?: string;
  commonName?: string;
  host?: string;
  issuerCA?: string;
  issuer?: string;
  organization?: string;
  algorithm?: string;
  keySize?: number;
  validFrom: string;
  validTo: string;
  serialNumber?: string;
  status: "ACTIVE" | "EXPIRED" | "REVOKED";
  createdAt: string;
  updatedAt?: string;
  createdBy?: User;
  expired?: boolean;
}

// Certificate Add Request (Manual Import)
export interface AddCertificateRequest {
  userId: number;
  certificateName: string;
  certData: string;
}

// Certificate Response (from manual add)
export interface CertificateResponse {
  id: number;
  certificateName: string;
  certData: string;
  subject?: string;
  commonName?: string;
  validFrom?: string;
  validTo?: string;
  serialNumber?: string;
  issuer?: string;
  createdAt: string;
  updatedAt?: string;
  createdBy?: User;
  user?: User; // Legacy support
  expired?: boolean;
}

// Issue Certificate Request
export interface IssueCertificateRequest {
  host: string;
  port?: number;
  commonName: string;
  organization?: string;
  organizationalUnit?: string;
  locality?: string;
  state?: string;
  country?: string;
  caAlias: string;
  algorithm?: "RSA" | "ECDSA";
  keySize?: number;
  validityDays?: number;
  subjectAlternativeNames?: string[];
}

// Revoke Reason
export type RevokeReason = 
  | "KEY_COMPROMISE" 
  | "CA_COMPROMISE" 
  | "AFFILIATION_CHANGED" 
  | "SUPERSEDED" 
  | "CESSATION_OF_OPERATION";

// Nmap Certificate Scan Types
export interface NmapPortSpec {
  port?: number;
  start?: number;
  end?: number;
}

export interface NmapTargetRequest {
  host: string;
  ports: NmapPortSpec[];
}

export interface NmapScanRequest {
  targets: NmapTargetRequest[];
}

export interface NmapCertificateScan {
  id: number;
  host: string;
  portsCsv: string;
  algorithm: string | null;
  notBefore: string | null;
  notAfter: string | null;
  publicKeyInfo: string | null;
  publicKeySize: number | null;
  fingerprintSha256: string | null;
  pem: string | null;
  altNames: string | null;
  createdAt: string;
  createdBy: string;
  issuerCA: string | null;
  renewedFromId: number | null;
  renewedBy: string | null;
  revokedAt: string | null;
  revokedBy: string | null;
  revokedReason: string | null;
  crlUrl: string | null;
  ocspUrl: string | null;
  error: string | null;
  processExitCode: number;
}

// Certificate Authority
export interface CreateCARequest {
  commonName: string;
  organization?: string;
  organizationalUnit?: string;
  locality?: string;
  state?: string;
  country?: string;
  signatureAlgorithm: "RSA2048" | "RSA3072" | "RSA4096" | "ECDSA_P256" | "ECDSA_P384";
  validityInDays?: number; // default: 3650
  alias: string;
}

export interface ImportCARequest {
  alias: string;
  certificate: string;
  privateKey?: string;
  keyPassword?: string;
}

export interface CertificateAuthority {
  id?: number;
  alias: string;
  commonName?: string;
  distinguishedName?: string;
  organization?: string;
  organizationalUnit?: string;
  locality?: string;
  state?: string;
  country?: string;
  signatureAlgorithm?: string;
  keyAlgorithm?: string;
  keySize?: number;
  validFrom?: string;
  validTo?: string;
  issuedAt?: string;
  expiresAt?: string;
  status?: "ACTIVE" | "REVOKED" | "EXPIRED";
  revoked?: boolean;
  createdAt?: string;
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
  updatedAt?: string;
  userCount?: number;
  isSystemRole?: boolean;
}

export interface CreateRoleRequest {
  name: string;
  description?: string;
  permissions: string[];
}

export interface UpdateRoleRequest {
  name?: string;
  description?: string;
  permissions?: string[];
}

export interface CloneRoleRequest {
  newName: string;
  description?: string;
}

export interface RoleStatistics {
  totalRoles: number;
  systemRoles: number;
  customRoles: number;
  totalPermissions: number;
  roleDistribution: Record<string, number>;
  mostUsedRole: string;
  leastUsedRole: string;
  averagePermissionsPerRole: number;
}

export interface AvailablePermissions {
  permissions: string[];
  totalCount: number;
  categorized: {
    CERTIFICATE: string[];
    CA: string[];
    USER: string[];
    ROLE: string[];
    REPORTING: string[];
    SYSTEM: string[];
    DISCOVERY: string[];
    ALERT: string[];
  };
}

// Alert Configuration
export interface AlertConfiguration {
  id: number;
  name: string;
  alertType: "EXPIRATION" | "REVOCATION" | "ISSUANCE" | "COMPLIANCE" | "RENEWAL" | "SECURITY" | string;
  enabled: boolean;
  thresholdDays?: number;
  emailRecipients?: string;
  webhookUrl?: string;
  slackWebhookUrl?: string;
  teamsWebhookUrl?: string;
  createdAt: string;
}

export interface AlertConfigurationRequest {
  name: string;
  alertType: "EXPIRATION" | "REVOCATION" | "ISSUANCE" | "COMPLIANCE" | "RENEWAL" | "SECURITY" | string;
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
  alertType: "EXPIRATION" | "REVOCATION" | "ISSUANCE" | "COMPLIANCE" | "RENEWAL" | "SECURITY" | string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO" | string;
  message: string;
  certificateId?: number;
  certificateHost?: string;
  sentTo: string;
  deliveryStatus: "DELIVERED" | "PENDING" | "FAILED" | string;
  errorMessage?: string | null;
  triggeredAt: string;
  sentAt?: string | null;
}

// Webhook Registration
export interface WebhookRegistration {
  url: string;
  events: string[];
  secret?: string;
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

// Discovery Scan Requests
export interface LDAPScanRequest {
  server: string;
  port: string;
  baseDN: string;
  username: string;
  password: string;
  useSSL?: string;
  searchFilter?: string;
}

export interface LDAPScanResponse {
  status: string;
  certificatesFound: number;
  scanDuration: string;
  certificates: Array<{
    dn: string;
    subject: string;
    issuer: string;
    notBefore: string;
    notAfter: string;
    serialNumber: string;
    algorithm: string;
    keySize: number;
  }>;
  errors: string[];
}

export interface CloudScanRequest {
  // AWS
  accessKeyId?: string;
  secretAccessKey?: string;
  region?: string;
  services?: string;
  // Azure
  subscriptionId?: string;
  clientId?: string;
  clientSecret?: string;
  tenantId?: string;
  resources?: string;
  // GCP
  projectId?: string;
  serviceAccountKey?: string;
}

export interface CloudScanResponse {
  status: string;
  provider: string;
  region?: string;
  certificatesFound: number;
  scanDuration: string;
  certificates: Array<{
    certificateArn?: string;
    domainName: string;
    subjectAlternativeNames?: string[];
    status: string;
    type?: string;
    keyAlgorithm: string;
    notBefore: string;
    notAfter: string;
    inUseBy?: string[];
    renewalEligibility?: string;
  }>;
  errors: string[];
}

export interface FilesystemScanResponse {
  status: string;
  path: string;
  filesScanned: number;
  certificatesFound: number;
  scanDuration: string;
  certificates: Array<{
    filePath: string;
    fileName: string;
    fileSize: string;
    fileType: string;
    subject: string;
    issuer: string;
    notBefore: string;
    notAfter: string;
    algorithm: string;
    keySize: number;
    lastModified: string;
  }>;
  errors: Array<{
    file: string;
    error: string;
  }>;
}

export interface ScheduleDiscoveryRequest {
  name: string;
  discoveryType: "NMAP" | "LDAP" | "CLOUD_AWS" | "CLOUD_AZURE" | "CLOUD_GCP" | "FILESYSTEM";
  configuration: any;
  schedule: string;
  enabled?: boolean;
  notifyOnCompletion?: boolean;
  notifyOnErrors?: boolean;
  notificationEmail?: string;
}

export interface ScheduledDiscovery {
  id: number;
  name: string;
  discoveryType: string;
  configuration: any;
  schedule: string;
  enabled: boolean;
  nextRunTime: string;
  lastRunTime: string | null;
  lastRunStatus: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface DiscoveryChange {
  changeId: number;
  changeType: "NEW_CERTIFICATE" | "CERTIFICATE_EXPIRED" | "CERTIFICATE_RENEWED" | "CERTIFICATE_REMOVED" | "CERTIFICATE_MODIFIED";
  timestamp: string;
  discoveryType: string;
  certificate?: any;
  oldCertificate?: any;
  newCertificate?: any;
  details: string;
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

export interface EnableAutoRenewRequest {
  certificateId: number;
  renewBeforeDays?: number;
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

export interface CreateCertificateTemplateRequest {
  name: string;
  description?: string;
  caAlias?: string;
  algorithm?: string;
  keySize?: number;
  validityDays?: number;
  subjectTemplate?: string;
}

// Bulk Operations
export interface BulkIssueRequest {
  certificates?: Array<{
    commonName: string;
    organization?: string;
    caAlias?: string;
  }>;
  certificateRequests?: string[]; // Legacy support
}

export interface BulkRenewRequest {
  certificateIds: number[];
}

export interface BulkRevokeRequest {
  certificateIds: number[];
  reason?: RevokeReason;
}

export interface BulkOperationResult {
  totalRequested: number;
  totalCount: number; // Legacy
  successful: number;
  successCount: number; // Legacy
  failed: number;
  failedCount: number; // Legacy
  results: Array<{
    id: number;
    status: "SUCCESS" | "FAILED";
    success?: boolean;
    message?: string;
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
  result?: any;
  errorMessage?: string;
  createdBy: number;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  finished?: boolean;
  durationSeconds?: number;
  running?: boolean;
}

// Session Management
export interface UserSession {
  id: number;
  userId: number;
  username?: string;
  sessionToken: string;
  ipAddress: string;
  userAgent: string;
  active: boolean;
  createdAt: string;
  lastActivityAt: string;
  expiresAt: string;
  terminatedAt?: string | null;
  expired: boolean;
  valid: boolean;
}

export interface SessionAnalytics {
  totalSessions: number;
  currentActiveSessions: UserSession[];
  terminatedSessions: number;
  activeSessions: number;
  averageSessionDurationMinutes: number;
  uniqueIpAddresses: number;
  username: string;
  expiredSessions: number;
  deviceBreakdown?: Record<string, number>;
  ipAddresses?: string[];
  loginFrequency?: Record<string, number>;
}

export interface SuspiciousActivity {
  multipleIpAddresses: boolean;
  recentSessionCount: number;
  unusualSessionCount: boolean;
  suspiciousConcurrentSessions: boolean;
  activeConcurrentSessions: number;
  suspicious: boolean;
  uniqueIpAddresses: number;
  username: string;
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

// ACME Provider Types
export interface AcmeProvider {
  id: number;
  name: string;
  directoryUrl: string;
  providerType?: "LETS_ENCRYPT" | "ZEROSSL" | "BUYPASS" | "GOOGLE_TRUST";
  type: "LETS_ENCRYPT_PRODUCTION" | "LETS_ENCRYPT_STAGING" | "ZEROSSL" | "BUYPASS" | "CUSTOM"; // Legacy
  description?: string;
  isActive: boolean;
  isStaging?: boolean;
  requiresEab?: boolean;
  termsOfServiceUrl?: string;
  website?: string;
  rateLimitPerWeek?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateAcmeProviderRequest {
  name: string;
  type: "LETS_ENCRYPT_PRODUCTION" | "LETS_ENCRYPT_STAGING" | "ZEROSSL" | "BUYPASS" | "CUSTOM";
  directoryUrl?: string;
  description?: string;
  isStaging?: boolean;
  isActive?: boolean;
  eabKid?: string;
  eabHmacKey?: string;
}

// ACME Account
export interface AcmeAccount {
  id: number;
  providerId: number;
  email: string;
  accountUrl: string;
  status: string;
  termsAgreed: boolean;
  createdAt: string;
  updatedAt?: string;
}

// ACME Order
export interface AcmeOrder {
  id: number;
  orderId: string;
  accountId: number;
  orderUrl?: string;
  status: "PENDING" | "PROCESSING" | "VALID" | "INVALID" | "READY" | "EXPIRED";
  domains: string | string[];
  challengeType?: "HTTP_01" | "DNS_01" | "TLS_ALPN_01";
  expiresAt?: string;
  notBefore?: string;
  notAfter?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateAcmeOrderRequest {
  providerId: number;
  accountId: number;
  domains: string[];
  challengeType?: "HTTP_01" | "DNS_01" | "TLS_ALPN_01";
  notes?: string;
}

// ACME Authorization
export interface AcmeAuthorization {
  id: number;
  orderId: number;
  domain: string;
  status: "PENDING" | "PROCESSING" | "VALID" | "INVALID" | "EXPIRED" | "REVOKED";
  authorizationUrl: string;
  isWildcard: boolean;
  expiresAt: string;
  createdAt: string;
  challenges?: AcmeChallenge[];
}

// ACME Challenge
export interface AcmeChallenge {
  id: number;
  authorizationId: number;
  type: "HTTP_01" | "DNS_01" | "TLS_ALPN_01";
  status: "PENDING" | "PROCESSING" | "VALID" | "INVALID";
  token: string;
  challengeUrl: string;
  validatedAt?: string;
  createdAt: string;
}

// ACME Renewal
export interface AcmeRenewalStatus {
  enabled: boolean;
  ordersEnabledForAutoRenewal: number;
  nextRenewalCheck?: string;
}

export interface EnableAcmeRenewalRequest {
  orderId: number;
  daysBeforeExpiry?: number;
}

export interface DisableAcmeRenewalRequest {
  orderId: number;
}

// ACME Monitoring - Webhooks
export interface AcmeWebhook {
  id: number;
  name?: string;
  url: string;
  events: string[];
  secret?: string;
  isActive: boolean;
  lastTriggered?: string;
  failureCount: number;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateAcmeWebhookRequest {
  url: string;
  events: ("ORDER_CREATED" | "ORDER_COMPLETED" | "ORDER_FAILED" | "CHALLENGE_VALIDATED" | "CERTIFICATE_ISSUED")[];
  secret?: string;
}

export interface UpdateAcmeWebhookRequest {
  url?: string;
  events?: string[];
  isActive?: boolean;
}

// ACME Monitoring - Metrics
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

export interface AcmeHealthStatus {
  status: "HEALTHY" | "DEGRADED" | "UNHEALTHY";
  providers: Array<{
    name: string;
    status: string;
    lastCheck: string;
  }>;
}

// Security
export interface SAMLConfiguration {
  entityId: string;
  ssoUrl: string;
  certificate: string;
  attributeMapping?: Record<string, string>;
}

export interface MFAEnableRequest {
  method: "TOTP" | "SMS" | "EMAIL";
}

export interface KeyRotationConfig {
  rotationPeriodDays: number;
  autoRotate: boolean;
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
  expiryDays?: number;
  validityDays?: number; // Alias
  scopes?: string[];
  permissions?: string[]; // Alias
}

export interface CreateApiKeyResponse {
  id: number;
  name: string;
  keyPlainText: string;
  keyPrefix: string;
  permissions: string[];
  expiresAt?: string;
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

export interface BackupRequest {
  certificateIds: number[];
  includePrivateKeys?: boolean;
}

// Integrations
export interface JenkinsConfig {
  jenkinsUrl: string;
  apiToken: string;
  jobName: string;
}

export interface KubernetesConfig {
  kubeconfig: string;
  namespace?: string;
}

// System Health
export interface SystemHealth {
  status: "UP" | "DOWN" | "DEGRADED";
  timestamp: string;
  uptime?: number;
  version?: string;
  database?: {
    status: "UP" | "DOWN";
    responseTime?: number;
  };
  redis?: {
    status: "UP" | "DOWN";
    responseTime?: number;
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

// Pagination
export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
