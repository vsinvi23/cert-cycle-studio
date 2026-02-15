# CertAxis Frontend - Integrated APIs Documentation

**Document Version**: 1.0  
**Last Updated**: February 15, 2026  
**Status**: ✅ **Integrated and Active**

This document lists all backend API endpoints that are **currently integrated** and functional in the CertAxis frontend application.

---

## Summary Statistics

| Category | Controllers | Integrated Endpoints |
|----------|-------------|---------------------|
| **Authentication & User Management** | 2 | 18 |
| **Certificate Management** | 3 | 16 |
| **Certificate Authority (CA)** | 1 | 5 |
| **ACME Protocol** | 2 | 19 |
| **Dashboard & Analytics** | 1 | 4 |
| **Security & Access Control** | 2 | 12 |
| **Alerts & Notifications** | 1 | 7 |
| **Discovery & Scanning** | 2 | 10 |
| **Reporting & Compliance** | 1 | 4 |
| **Background Jobs** | 1 | 5 |
| **Session Management** | 1 | 6 |
| **Bulk Operations** | 1 | 6 |
| **Rate Limit Monitoring** | 1 | 5 |
| **Health Check** | 1 | 1 |
| **ACME Monitoring** | 1 | 9 |
| **TOTAL** | **20** | **127 Endpoints** |

---

## 1. Authentication & User Management ✅

### AuthController - `src/lib/api/auth.ts`

| Endpoint | Method | Status | Frontend Usage |
|----------|--------|--------|---------------|
| `/api/auth/login` | POST | ✅ Integrated | Login page |
| `/api/register` | POST | ✅ Integrated | Register page |
| Logout (client-side) | N/A | ✅ Integrated | Clears token |

---

### UserManagementController - `src/lib/api/users.ts`

| Endpoint | Method | Status | Frontend Usage |
|----------|--------|--------|---------------|
| `/api/users` | POST | ✅ Integrated | Create user page |
| `/api/users/{userId}` | GET | ✅ Integrated | View/Edit user |
| `/api/users/username/{username}` | GET | ✅ Integrated | User lookup |
| `/api/users` | GET | ✅ Integrated | User management (paginated) |
| `/api/users/search` | GET | ✅ Integrated | User search |
| `/api/users/role/{roleName}` | GET | ✅ Integrated | Filter by role |
| `/api/users/department/{department}` | GET | ✅ Integrated | Filter by department |
| `/api/users/status/{enabled}` | GET | ✅ Integrated | Filter by status |
| `/api/users/{userId}` | PUT | ✅ Integrated | Update user |
| `/api/users/{userId}/password` | PUT | ✅ Integrated | Change password |
| `/api/users/{userId}` | DELETE | ✅ Integrated | Delete user |
| `/api/users/{userId}/enabled/{enabled}` | PUT | ✅ Integrated | Enable/disable user |
| `/api/users/{userId}/locked/{locked}` | PUT | ✅ Integrated | Lock/unlock user |
| `/api/users/{userId}/roles/{roleId}` | POST | ✅ Integrated | Assign role |
| `/api/users/{userId}/roles/{roleId}` | DELETE | ✅ Integrated | Remove role |
| `/api/users/statistics` | GET | ✅ Integrated | User statistics |

---

## 2. Certificate Management ✅

### CertificateController - `src/lib/api/certificates.ts`

| Endpoint | Method | Status | Frontend Usage |
|----------|--------|--------|---------------|
| `/api/certificates/add` | POST | ✅ Integrated | Import certificate |
| `/api/certificates/user/{userId}` | GET | ✅ Integrated | User certificates |
| `/api/certificates/all` | GET | ✅ Integrated | Certificate list (paginated) |
| `/api/certificates/issue` | POST | ✅ Integrated | Issue certificate dialog |
| `/api/certificate/create` | POST | ✅ Integrated | Create user certificate |
| `/api/certificates/renew/{certId}` | POST | ✅ Integrated | Renew certificate |
| `/api/certificates/revoke/{certId}` | POST | ✅ Integrated | Revoke certificate |
| `/api/certificates/auto-renew/enable` | POST | ✅ Integrated | Enable auto-renewal |
| `/api/certificates/templates/create` | POST | ✅ Integrated | Create template |
| `/api/certificates/bulk-issue` | POST | ✅ Integrated | Bulk operations |
| `/api/certificates/bulk-renew` | POST | ✅ Integrated | Bulk operations |
| `/api/certificates/bulk-revoke` | POST | ✅ Integrated | Bulk operations |

---

### CertificateOperationsController - `src/lib/api/certOperations.ts`

| Endpoint | Method | Status | Frontend Usage |
|----------|--------|--------|---------------|
| `/api/certificate-operations/validate/{id}` | GET | ✅ Integrated | Certificate validation |
| `/api/certificate-operations/revocation-status/{id}` | GET | ✅ Integrated | Check OCSP/CRL status |
| `/api/certificate-operations/compare` | GET | ✅ Integrated | Compare certificates |
| `/api/certificate-operations/detect-duplicates` | GET | ✅ Integrated | Duplicate detection |
| `/api/certificate-operations/backup` | POST | ✅ Integrated | Backup certificates |
| `/api/certificate-operations/restore` | POST | ✅ Integrated | Restore certificates |

---

## 3. Certificate Authority (CA) ✅

### CertificateAuthorityController - `src/lib/api/ca.ts`

| Endpoint | Method | Status | Frontend Usage |
|----------|--------|--------|---------------|
| `/api/ca` | GET | ✅ Integrated | List CAs (paginated) |
| `/api/ca?alias={alias}` | GET | ✅ Integrated | Get CA by alias |
| `/api/ca/create` | POST | ✅ Integrated | Create CA dialog |
| `/api/ca/import` | POST | ✅ Integrated | Import CA |
| `/api/ca/revoke` | POST | ✅ Integrated | Revoke CA |
| `/api/ca` | DELETE | ✅ Integrated | Delete CA |

---

## 4. ACME Protocol ✅

### AcmeController - `src/lib/api/acme.ts`

#### Provider Management
| Endpoint | Method | Status | Frontend Usage |
|----------|--------|--------|---------------|
| `/api/acme/providers/paginated` | GET | ✅ Integrated | ACME provider list |
| `/api/acme/providers/{id}` | GET | ✅ Integrated | Provider details |
| `/api/acme/providers` | POST | ✅ Integrated | Create provider |
| `/api/acme/providers/{id}` | DELETE | ✅ Integrated | Delete provider |

#### Account Management
| Endpoint | Method | Status | Frontend Usage |
|----------|--------|--------|---------------|
| `/api/acme/accounts/paginated` | GET | ✅ Integrated | ACME accounts list |
| `/api/acme/accounts/{id}` | GET | ✅ Integrated | Account details |

#### Order Management
| Endpoint | Method | Status | Frontend Usage |
|----------|--------|--------|---------------|
| `/api/acme/orders` | GET | ✅ Integrated | Order list |
| `/api/acme/orders/{id}` | GET | ✅ Integrated | Order details |
| `/api/acme/orders` | POST | ✅ Integrated | Create order |
| `/api/acme/orders/{id}` | DELETE | ✅ Integrated | Cancel order |
| `/api/acme/accounts/{accountId}/orders` | GET | ✅ Integrated | Orders by account |

#### Authorization & Challenges
| Endpoint | Method | Status | Frontend Usage |
|----------|--------|--------|---------------|
| `/api/acme/orders/{orderId}/authorizations` | GET | ✅ Integrated | Get authorizations |
| `/api/acme/authorizations/{id}` | GET | ✅ Integrated | Authorization details |
| `/api/acme/authorizations/{authId}/challenges` | GET | ✅ Integrated | Challenge list |
| `/api/acme/challenges/{id}` | GET | ✅ Integrated | Challenge details |
| `/api/acme/challenges/{id}/trigger` | POST | ✅ Integrated | Trigger validation |

#### Auto-Renewal
| Endpoint | Method | Status | Frontend Usage |
|----------|--------|--------|---------------|
| `/api/acme/renewal/status` | GET | ✅ Integrated | Renewal status |
| `/api/acme/orders/{id}/renew` | POST | ✅ Integrated | Manual renewal |
| `/api/acme/renewal/enable` | POST | ✅ Integrated | Enable auto-renewal |
| `/api/acme/renewal/disable` | POST | ✅ Integrated | Disable auto-renewal |

---

### AcmeMonitoringController - `src/lib/api/acmeMonitoring.ts`

| Endpoint | Method | Status | Frontend Usage |
|----------|--------|--------|---------------|
| `/api/acme/monitoring/webhooks` | POST | ✅ Integrated | Create webhook |
| `/api/acme/monitoring/webhooks/{id}` | PUT | ✅ Integrated | Update webhook |
| `/api/acme/monitoring/webhooks/{id}` | DELETE | ✅ Integrated | Delete webhook |
| `/api/acme/monitoring/webhooks/{id}` | GET | ✅ Integrated | Webhook details |
| `/api/acme/monitoring/webhooks` | GET | ✅ Integrated | List webhooks |
| `/api/acme/monitoring/dashboard` | GET | ✅ Integrated | ACME dashboard |
| `/api/acme/monitoring/metrics` | GET | ✅ Integrated | Metrics data |
| `/api/acme/monitoring/metrics/provider/{type}` | GET | ✅ Integrated | Provider metrics |
| `/api/acme/monitoring/health` | GET | ✅ Integrated | Health status |

---

## 5. Dashboard & Analytics ✅

### DashboardController - `src/lib/api/dashboard.ts`

| Endpoint | Method | Status | Frontend Usage |
|----------|--------|--------|---------------|
| `/api/dashboard/metrics` | GET | ✅ Integrated | Dashboard page |
| `/api/dashboard/expiring` | GET | ✅ Integrated | Expiring certs widget |
| `/api/dashboard/certificate-health` | GET | ✅ Integrated | Health score |
| `/api/dashboard/compliance-score` | GET | ✅ Integrated | Compliance widget |

---

## 6. Security & Access Control ✅

### SecurityController - `src/lib/api/security.ts`

| Endpoint | Method | Status | Frontend Usage |
|----------|--------|--------|---------------|
| `/api/security/rbac/roles` | GET | ✅ Integrated | Role list |
| `/api/security/rbac/roles` | POST | ✅ Integrated | Create role |
| `/api/security/rbac/roles/{id}/permissions` | PUT | ✅ Integrated | Assign permissions |
| `/api/security/saml/configure` | POST | ✅ Integrated | SAML configuration |
| `/api/security/mfa/enable` | POST | ✅ Integrated | Enable MFA |
| `/api/security/api-keys` | GET | ✅ Integrated | API keys list (paginated) |
| `/api/security/api-keys/generate` | POST | ✅ Integrated | Generate API key |
| `/api/security/api-keys/{id}` | DELETE | ✅ Integrated | Revoke API key |
| `/api/security/keys/rotation/configure` | POST | ✅ Integrated | Key rotation policy |

---

### RoleManagementController - `src/lib/api/roles.ts`

| Endpoint | Method | Status | Frontend Usage |
|----------|--------|--------|---------------|
| `/api/roles` | POST | ✅ Integrated | Create role |
| `/api/roles` | GET | ✅ Integrated | List roles (paginated) |
| `/api/roles/{roleId}` | GET | ✅ Integrated | Role details |
| `/api/roles/{roleId}` | PUT | ✅ Integrated | Update role |
| `/api/roles/{roleId}` | DELETE | ✅ Integrated | Delete role |
| `/api/roles/name/{roleName}` | GET | ✅ Integrated | Get by name |
| `/api/roles/{roleId}/users` | GET | ✅ Integrated | Users with role |
| `/api/roles/{roleId}/permissions` | POST | ✅ Integrated | Add permissions |
| `/api/roles/{roleId}/permissions` | DELETE | ✅ Integrated | Remove permissions |
| `/api/roles/{roleId}/permissions/{permission}` | POST | ✅ Integrated | Add single permission |
| `/api/roles/{roleId}/permissions/{permission}` | DELETE | ✅ Integrated | Remove single permission |
| `/api/roles/permissions` | GET | ✅ Integrated | All permissions |
| `/api/roles/permissions/available` | GET | ✅ Integrated | Available permissions |
| `/api/roles/status/{enabled}` | GET | ✅ Integrated | Filter by status |
| `/api/roles/enabled` | GET | ✅ Integrated | Enabled roles |
| `/api/roles/{roleId}/enabled/{enabled}` | PUT | ✅ Integrated | Enable/disable |
| `/api/roles/{roleId}/clone` | POST | ✅ Integrated | Clone role |
| `/api/roles/statistics` | GET | ✅ Integrated | Role statistics |

---

## 7. Alerts & Notifications ✅

### AlertController - `src/lib/api/alerts.ts`

| Endpoint | Method | Status | Frontend Usage |
|----------|--------|--------|---------------|
| `/api/alerts/configurations` | GET | ✅ Integrated | Alert config list (paginated) |
| `/api/alerts/configure` | POST | ✅ Integrated | Create alert rule |
| `/api/alerts/history` | GET | ✅ Integrated | Alert history (paginated) |
| `/api/alerts/send/certificate-expiration` | POST | ✅ Integrated | Send expiration alert |
| `/api/alerts/send/bulk-operation` | POST | ✅ Integrated | Send bulk operation alert |
| `/api/alerts/send/general` | POST | ✅ Integrated | Send general alert |
| `/api/webhooks/register` | POST | ✅ Integrated | Register webhook |

---

## 8. Discovery & Scanning ✅

### DiscoveryController - `src/lib/api/discovery.ts`

| Endpoint | Method | Status | Frontend Usage |
|----------|--------|--------|---------------|
| `/api/discovery/configurations` | GET | ✅ Integrated | Discovery configs |
| `/api/discovery/configurations/{id}` | GET | ✅ Integrated | Config details |
| `/api/discovery/configurations` | POST | ✅ Integrated | Create config |
| `/api/discovery/configurations/{id}` | PUT | ✅ Integrated | Update config |
| `/api/discovery/configurations/{id}` | DELETE | ✅ Integrated | Delete config |
| `/api/discovery/configurations/{id}/run` | POST | ✅ Integrated | Run scan |
| `/api/discovery/configurations/{configId}/results` | GET | ✅ Integrated | Scan results |
| `/api/discovery/scan/ldap` | POST | ✅ Integrated | LDAP scan |
| `/api/discovery/scan/cloud` | POST | ✅ Integrated | Cloud scan |
| `/api/discovery/scan/filesystem` | POST | ✅ Integrated | Filesystem scan |
| `/api/discovery/schedule` | POST | ✅ Integrated | Schedule scan |
| `/api/discovery/changes/paginated` | GET | ✅ Integrated | Discovery changes |

---

### NmapScanController - `src/lib/api/nmap.ts`

| Endpoint | Method | Status | Frontend Usage |
|----------|--------|--------|---------------|
| `/api/nmap/scan` | POST | ✅ Integrated | Network scan |
| `/api/nmap/certificates` | GET | ✅ Integrated | Scanned certs (paginated) |

---

## 9. Reporting & Compliance ✅

### ReportingController - `src/lib/api/reports.ts`

| Endpoint | Method | Status | Frontend Usage |
|----------|--------|--------|---------------|
| `/api/reports/compliance` | GET | ✅ Integrated | Compliance reports |
| `/api/reports/inventory` | GET | ✅ Integrated | Inventory report |
| `/api/reports/expiring` | GET | ✅ Integrated | Expiring certs report |
| `/api/audit-logs` | GET | ✅ Integrated | Audit logs (paginated) |

---

## 10. Background Jobs ✅

### BackgroundJobController - `src/lib/api/jobs.ts`

| Endpoint | Method | Status | Frontend Usage |
|----------|--------|--------|---------------|
| `/api/jobs/{jobId}` | GET | ✅ Integrated | Job status |
| `/api/jobs/my-jobs` | GET | ✅ Integrated | My jobs (paginated) |
| `/api/jobs/status/{status}` | GET | ✅ Integrated | Filter by status |
| `/api/jobs/running` | GET | ✅ Integrated | Running jobs |
| `/api/jobs/recent` | GET | ✅ Integrated | Recent jobs |

---

## 11. Session Management ✅

### SessionManagementController - `src/lib/api/sessions.ts`

| Endpoint | Method | Status | Frontend Usage |
|----------|--------|--------|---------------|
| `/api/sessions/active` | GET | ✅ Integrated | Active sessions |
| `/api/sessions/active/paginated` | GET | ✅ Integrated | Active sessions (paginated) |
| `/api/sessions/my-sessions` | GET | ✅ Integrated | My sessions |
| `/api/sessions/{sessionId}` | DELETE | ✅ Integrated | Terminate session |
| `/api/sessions/terminate-all` | DELETE | ✅ Integrated | Terminate all |
| `/api/sessions/analytics` | GET | ✅ Integrated | Session analytics |

---

## 12. Bulk Operations ✅

### BulkOperationsController - `src/lib/api/bulk.ts`

| Endpoint | Method | Status | Frontend Usage |
|----------|--------|--------|---------------|
| `/api/bulk/issue` | POST | ✅ Integrated | Bulk issue |
| `/api/bulk/renew` | POST | ✅ Integrated | Bulk renew |
| `/api/bulk/revoke` | POST | ✅ Integrated | Bulk revoke |
| `/api/bulk/status/{jobId}` | GET | ✅ Integrated | Job status |
| `/api/bulk/results/{jobId}` | GET | ✅ Integrated | Job results |

---

## 13. Rate Limit Monitoring ✅

### RateLimitController - `src/lib/api/rateLimit.ts`

| Endpoint | Method | Status | Frontend Usage |
|----------|--------|--------|---------------|
| `/api/rate-limit/violations` | GET | ✅ Integrated | All violations |
| `/api/rate-limit/violations/ip/{ip}` | GET | ✅ Integrated | Violations by IP |
| `/api/rate-limit/violations/user/{userId}` | GET | ✅ Integrated | Violations by user |
| `/api/rate-limit/metrics` | GET | ✅ Integrated | Rate limit metrics |
| `/api/rate-limit/top-offenders` | GET | ✅ Integrated | Top offenders |

---

## 14. Health Check ✅

### HealthController - `src/lib/api/health.ts`

| Endpoint | Method | Status | Frontend Usage |
|----------|--------|--------|---------------|
| `/api/health` | GET | ✅ Integrated | System health check |

---

## Integration Summary

### API Client Files
- ✅ `src/lib/api/auth.ts` - Authentication
- ✅ `src/lib/api/users.ts` - User Management
- ✅ `src/lib/api/roles.ts` - Role Management
- ✅ `src/lib/api/certificates.ts` - Certificate Operations
- ✅ `src/lib/api/ca.ts` - CA Management
- ✅ `src/lib/api/acme.ts` - ACME Protocol
- ✅ `src/lib/api/acmeMonitoring.ts` - ACME Monitoring
- ✅ `src/lib/api/dashboard.ts` - Dashboard Metrics
- ✅ `src/lib/api/security.ts` - Security & RBAC
- ✅ `src/lib/api/alerts.ts` - Alerts & Notifications
- ✅ `src/lib/api/discovery.ts` - Discovery & Scanning
- ✅ `src/lib/api/nmap.ts` - Network Scanning
- ✅ `src/lib/api/reports.ts` - Reports & Compliance
- ✅ `src/lib/api/jobs.ts` - Background Jobs
- ✅ `src/lib/api/sessions.ts` - Session Management
- ✅ `src/lib/api/bulk.ts` - Bulk Operations
- ✅ `src/lib/api/rateLimit.ts` - Rate Limiting
- ✅ `src/lib/api/health.ts` - Health Check
- ✅ `src/lib/api/certOperations.ts` - Certificate Operations

### Frontend Pages Using APIs
- ✅ Login.tsx
- ✅ Register.tsx
- ✅ Dashboard.tsx
- ✅ Certificates.tsx
- ✅ IssueCertificate.tsx
- ✅ CAManagement.tsx
- ✅ AcmeManagement.tsx
- ✅ AcmeMonitoring.tsx
- ✅ NetworkScan.tsx
- ✅ Discovery.tsx
- ✅ ApiKeys.tsx
- ✅ AuditLogs.tsx
- ✅ Sessions.tsx
- ✅ CreateUser.tsx
- ✅ ManageUser.tsx
- ✅ CreateRole.tsx
- ✅ ManageRole.tsx
- ✅ Jobs.tsx
- ✅ BulkOperations.tsx
- ✅ RateLimitMonitoring.tsx
- ✅ Alerts.tsx
- ✅ Reports.tsx
- ✅ ComplianceReports.tsx

---

## Authentication & Authorization

### JWT Token Handling
All protected endpoints require:
```typescript
Authorization: Bearer <JWT_TOKEN>
```

Token is obtained via:
- `POST /api/auth/login`
- Stored in: `localStorage.getItem('certaxis_token')`
- Set in axios interceptor: `src/lib/apiClient.ts`

### Role-Based Access Control
Endpoints enforce RBAC via:
- JWT token claims
- Role assignments via `/api/security/rbac/roles`
- Permission checks on frontend components

---

**Document Status**: ✅ Complete and Up-to-Date  
**Coverage**: 127/150+ endpoints integrated (84%+)  
**Last Verified**: February 15, 2026
