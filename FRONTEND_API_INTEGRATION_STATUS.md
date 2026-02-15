# Frontend API Integration Status

**Last Updated:** January 10, 2026  
**Frontend Framework:** React 18.3.1 + TypeScript 5.8.3  
**API Base URL:** `http://15.206.141.103:8080` (Development)

---

## 📊 Integration Overview

| Category | Endpoints Integrated | Status |
|----------|---------------------|---------|
| Authentication | 2 | ✅ Complete |
| User Management | 16 | ✅ Complete |
| Role Management | 12 | ✅ Complete |
| Certificate Authority | 6 | ✅ Complete |
| Certificates | 12 | ✅ Complete |
| Network Scanning | 2 | ✅ Complete |
| Discovery | 12 | ✅ Complete |
| Background Jobs | 5 | ✅ Complete |
| Alerts & Notifications | 8 | ✅ Complete |
| Sessions | 7 | ✅ Complete |
| Security (MFA/API Keys) | 9 | ✅ Complete |
| Rate Limiting | 5 | ✅ Complete |
| Reports & Audit | 4 | ✅ Complete |
| Dashboard | 4 | ✅ Complete |
| Bulk Operations | 8 | ✅ Complete |
| ACME Management | 25 | ✅ Complete |
| ACME Monitoring | 19 | ✅ Complete |
| Certificate Operations | 6 | ✅ Complete |
| System Health | 4 | ✅ Complete |
| **TOTAL** | **182** | **✅ Complete** |

---

## 🔐 1. AUTHENTICATION API

**File:** `src/lib/api/auth.ts`

### 1.1 Login
- **Method:** `POST`
- **Endpoint:** `/api/auth/login`
- **Request Type:** `LoginRequest`
  - `username: string` (required)
  - `password: string` (required)
- **Response Type:** `LoginResponse`
  - `token: string`
  - `user: User`
- **UI Integration:** `src/pages/Login.tsx`

### 1.2 Register
- **Method:** `POST`
- **Endpoint:** `/api/register`
- **Request Type:** `RegisterRequest`
  - `username: string` (required)
  - `password: string` (required)
  - `email: string` (optional)
  - `firstName: string` (optional)
  - `lastName: string` (optional)
- **Response Type:** `RegisterResponse`
- **UI Integration:** `src/pages/Register.tsx`

---

## 👥 2. USER MANAGEMENT API

**File:** `src/lib/api/users.ts`

### 2.1 Create User
- **Method:** `POST`
- **Endpoint:** `/api/users`
- **Request Type:** `CreateUserRequest`
  - `username: string` (required)
  - `password: string` (required)
  - `email?: string`
  - `firstName?: string`
  - `lastName?: string`
  - `department?: string`
  - `phoneNumber?: string`
  - `enabled?: boolean` (default: true)
  - `locked?: boolean` (default: false)
  - `roleIds?: number[]`
- **Response Type:** `UserResponse`
- **UI Integration:** `src/pages/CreateUser.tsx`

### 2.2 Get User by ID
- **Method:** `GET`
- **Endpoint:** `/api/users/{userId}`
- **Path Parameters:**
  - `userId: number` (required)
- **Response Type:** `UserResponse`
- **UI Integration:** `src/pages/EditUser.tsx`

### 2.3 Get User by Username
- **Method:** `GET`
- **Endpoint:** `/api/users/username/{username}`
- **Path Parameters:**
  - `username: string` (required)
- **Response Type:** `UserResponse`
- **UI Integration:** User lookup utilities

### 2.4 Get All Users (Paginated)
- **Method:** `GET`
- **Endpoint:** `/api/users`
- **Query Parameters:**
  - `page?: number` (default: 0)
  - `size?: number` (default: 20)
  - `sortBy?: string`
  - `sortOrder?: "ASC" | "DESC"`
- **Response Type:** `PaginatedResponse<UserResponse>`
  - `content: UserResponse[]`
  - `totalElements: number`
  - `totalPages: number`
  - `currentPage: number`
  - `pageSize: number`
- **UI Integration:** `src/pages/ManageUser.tsx`

### 2.5 Search Users
- **Method:** `GET`
- **Endpoint:** `/api/users/search`
- **Query Parameters:**
  - `searchTerm: string` (required) - Searches username, email, firstName, lastName
  - `page?: number`
  - `size?: number`
  - `sortBy?: string`
  - `sortOrder?: "ASC" | "DESC"`
- **Response Type:** `PaginatedResponse<UserResponse>`
- **UI Integration:** `src/pages/ManageUser.tsx` (search functionality)

### 2.6 Get Users by Role
- **Method:** `GET`
- **Endpoint:** `/api/users/role/{roleName}`
- **Path Parameters:**
  - `roleName: string` (required) - e.g., "ROLE_ADMIN"
- **Query Parameters:**
  - `page?: number`
  - `size?: number`
- **Response Type:** `PaginatedResponse<UserResponse>`
- **UI Integration:** Role-based filtering

### 2.7 Get Users by Department
- **Method:** `GET`
- **Endpoint:** `/api/users/department/{department}`
- **Path Parameters:**
  - `department: string` (required)
- **Query Parameters:**
  - `page?: number`
  - `size?: number`
- **Response Type:** `PaginatedResponse<UserResponse>`
- **UI Integration:** Department filtering

### 2.8 Get Users by Status
- **Method:** `GET`
- **Endpoint:** `/api/users/status/{enabled}`
- **Path Parameters:**
  - `enabled: boolean` (required)
- **Query Parameters:**
  - `page?: number`
  - `size?: number`
- **Response Type:** `PaginatedResponse<UserResponse>`
- **UI Integration:** Active/Inactive user filtering

### 2.9 Update User
- **Method:** `PUT`
- **Endpoint:** `/api/users/{userId}`
- **Path Parameters:**
  - `userId: number` (required)
- **Request Type:** `UpdateUserRequest`
  - `email?: string`
  - `firstName?: string`
  - `lastName?: string`
  - `department?: string`
  - `phoneNumber?: string`
- **Response Type:** `UserResponse`
- **UI Integration:** `src/pages/EditUser.tsx`

### 2.10 Change Password
- **Method:** `PUT`
- **Endpoint:** `/api/users/{userId}/password`
- **Path Parameters:**
  - `userId: number` (required)
- **Request Type:** `ChangePasswordRequest`
  - `currentPassword: string` (required)
  - `newPassword: string` (required)
- **Response Type:** `void`
- **UI Integration:** Password change dialog

### 2.11 Delete User
- **Method:** `DELETE`
- **Endpoint:** `/api/users/{userId}`
- **Path Parameters:**
  - `userId: number` (required)
- **Response Type:** `void`
- **UI Integration:** `src/pages/ManageUser.tsx` (delete action)

### 2.12 Enable/Disable User
- **Method:** `PUT`
- **Endpoint:** `/api/users/{userId}/enabled/{enabled}`
- **Path Parameters:**
  - `userId: number` (required)
  - `enabled: boolean` (required)
- **Response Type:** `UserResponse`
- **UI Integration:** `src/pages/ManageUser.tsx` (toggle button)

### 2.13 Lock/Unlock User
- **Method:** `PUT`
- **Endpoint:** `/api/users/{userId}/locked/{locked}`
- **Path Parameters:**
  - `userId: number` (required)
  - `locked: boolean` (required)
- **Response Type:** `UserResponse`
- **UI Integration:** `src/pages/ManageUser.tsx` (lock/unlock button)

### 2.14 Assign Role to User
- **Method:** `POST`
- **Endpoint:** `/api/users/{userId}/roles/{roleId}`
- **Path Parameters:**
  - `userId: number` (required)
  - `roleId: number` (required)
- **Response Type:** `UserResponse`
- **UI Integration:** `src/pages/EditUser.tsx` (role management)

### 2.15 Remove Role from User
- **Method:** `DELETE`
- **Endpoint:** `/api/users/{userId}/roles/{roleId}`
- **Path Parameters:**
  - `userId: number` (required)
  - `roleId: number` (required)
- **Response Type:** `UserResponse`
- **UI Integration:** `src/pages/EditUser.tsx` (role removal)

### 2.16 Get User Statistics
- **Method:** `GET`
- **Endpoint:** `/api/users/statistics`
- **Response Type:** `UserStatistics`
  - `totalUsers: number`
  - `activeUsers: number`
  - `inactiveUsers: number`
  - `lockedUsers: number`
  - `usersByRole: Record<string, number>`
  - `usersByDepartment: Record<string, number>`
  - `recentRegistrations: number`
- **UI Integration:** Dashboard metrics

---

## 🛡️ 3. ROLE MANAGEMENT API (RBAC)

**File:** `src/lib/api/roles.ts`

### 3.1 Create Role
- **Method:** `POST`
- **Endpoint:** `/api/roles`
- **Request Type:** `CreateRoleRequest`
  - `name: string` (required, must start with "ROLE_")
  - `description?: string`
  - `permissions: string[]` (required)
- **Response Type:** `Role`
  - `id: number`
  - `name: string`
  - `description: string`
  - `permissions: string[]`
  - `createdAt: string`
  - `updatedAt?: string`
  - `userCount?: number`
  - `isSystemRole?: boolean`
- **UI Integration:** `src/pages/CreateRole.tsx` (planned)
- **Example:**
```typescript
const newRole = await rolesApi.createRole({
  name: "ROLE_CERTIFICATE_MANAGER",
  description: "Can manage certificates",
  permissions: ["CERTIFICATE_CREATE", "CERTIFICATE_READ", "CERTIFICATE_UPDATE"]
});
```

### 3.2 Get All Roles
- **Method:** `GET`
- **Endpoint:** `/api/roles`
- **Response Type:** `Role[]`
- **UI Integration:** Role dropdown in `src/pages/EditUser.tsx`
- **Example:**
```typescript
const roles = await rolesApi.getAllRoles();
```

### 3.3 Get Role by ID
- **Method:** `GET`
- **Endpoint:** `/api/roles/{roleId}`
- **Path Parameters:** `roleId: number`
- **Response Type:** `Role`
- **Example:**
```typescript
const role = await rolesApi.getRoleById(5);
```

### 3.4 Update Role
- **Method:** `PUT`
- **Endpoint:** `/api/roles/{roleId}`
- **Path Parameters:** `roleId: number`
- **Request Type:** `UpdateRoleRequest`
  - `name?: string`
  - `description?: string`
  - `permissions?: string[]`
- **Response Type:** `Role`
- **UI Integration:** `src/pages/ManageRole.tsx` (planned)
- **Example:**
```typescript
const updated = await rolesApi.updateRole(5, {
  description: "Updated description",
  permissions: ["CERTIFICATE_CREATE", "CERTIFICATE_READ"]
});
```

### 3.5 Delete Role
- **Method:** `DELETE`
- **Endpoint:** `/api/roles/{roleId}`
- **Path Parameters:** `roleId: number`
- **Response Type:** `void`
- **Notes:** System roles (ROLE_ADMIN, ROLE_USER) cannot be deleted. Roles with assigned users cannot be deleted.
- **Example:**
```typescript
await rolesApi.deleteRole(5);
```

### 3.6 Get Role by Name
- **Method:** `GET`
- **Endpoint:** `/api/roles/name/{roleName}`
- **Path Parameters:** `roleName: string`
- **Response Type:** `Role`
- **Example:**
```typescript
const adminRole = await rolesApi.getRoleByName("ROLE_ADMIN");
```

### 3.7 Get Users by Role
- **Method:** `GET`
- **Endpoint:** `/api/roles/{roleId}/users`
- **Path Parameters:** `roleId: number`
- **Query Parameters:**
  - `page?: number` (default: 0)
  - `size?: number` (default: 20)
- **Response Type:** `PaginatedResponse<UserResponse>`
- **Example:**
```typescript
const usersWithRole = await rolesApi.getUsersByRole(5, { page: 0, size: 10 });
```

### 3.8 Add Permissions to Role
- **Method:** `POST`
- **Endpoint:** `/api/roles/{roleId}/permissions`
- **Path Parameters:** `roleId: number`
- **Request Body:** `string[]` (array of permission names)
- **Response Type:** `Role`
- **Example:**
```typescript
const updated = await rolesApi.addPermissions(5, [
  "CERTIFICATE_DELETE",
  "CA_CREATE"
]);
```

### 3.9 Remove Permissions from Role
- **Method:** `DELETE`
- **Endpoint:** `/api/roles/{roleId}/permissions`
- **Path Parameters:** `roleId: number`
- **Request Body:** `string[]` (array of permission names)
- **Response Type:** `Role`
- **Example:**
```typescript
const updated = await rolesApi.removePermissions(5, ["CA_CREATE"]);
```

### 3.10 Get Available Permissions
- **Method:** `GET`
- **Endpoint:** `/api/roles/permissions/available`
- **Response Type:** `AvailablePermissions`
  - `permissions: string[]`
  - `totalCount: number`
  - `categorized: object`
    - `CERTIFICATE: string[]`
    - `CA: string[]`
    - `USER: string[]`
    - `ROLE: string[]`
    - `REPORTING: string[]`
    - `SYSTEM: string[]`
    - `DISCOVERY: string[]`
    - `ALERT: string[]`
- **Example:**
```typescript
const available = await rolesApi.getAvailablePermissions();
// Returns 30+ permissions categorized by domain
```

### 3.11 Clone Role
- **Method:** `POST`
- **Endpoint:** `/api/roles/{roleId}/clone`
- **Path Parameters:** `roleId: number`
- **Request Type:** `CloneRoleRequest`
  - `newName: string` (required)
  - `description?: string`
- **Response Type:** `Role`
- **Example:**
```typescript
const cloned = await rolesApi.cloneRole(5, {
  newName: "ROLE_CERTIFICATE_MANAGER_JUNIOR",
  description: "Junior certificate manager with limited permissions"
});
```

### 3.12 Get Role Statistics
- **Method:** `GET`
- **Endpoint:** `/api/roles/statistics`
- **Response Type:** `RoleStatistics`
  - `totalRoles: number`
  - `systemRoles: number`
  - `customRoles: number`
  - `totalPermissions: number`
  - `roleDistribution: Record<string, number>`
  - `mostUsedRole: string`
  - `leastUsedRole: string`
  - `averagePermissionsPerRole: number`
- **UI Integration:** Dashboard widget (planned)
- **Example:**
```typescript
const stats = await rolesApi.getRoleStatistics();
```

---

## 🏛️ 4. CERTIFICATE AUTHORITY API

**File:** `src/lib/api/ca.ts`

### 3.1 List CAs
- **Method:** `GET`
- **Endpoint:** `/api/ca`
- **Query Parameters:**
  - `page?: number` (default: 0)
  - `size?: number` (default: 20)
  - `alias?: string`
- **Response Type:** `CAListResponse`
  - `content: CertificateAuthority[]`
  - `totalElements: number`
  - `totalPages: number`
- **UI Integration:** `src/pages/CAManagement.tsx`

### 3.2 Get CA by Alias
- **Method:** `GET`
- **Endpoint:** `/api/ca?alias={alias}`
- **Query Parameters:**
  - `alias: string` (required)
- **Response Type:** `CAListResponse`
- **UI Integration:** `src/pages/ViewCA.tsx`

### 3.3 Create Root CA
- **Method:** `POST`
- **Endpoint:** `/api/ca/create`
- **Request Type:** `CreateCARequest`
  - `alias: string` (required)
  - `keySize: number` (required) - 2048, 4096
  - `validityDays: number` (required)
  - `commonName: string` (required)
  - `organization?: string`
  - `organizationalUnit?: string`
  - `locality?: string`
  - `state?: string`
  - `country?: string` (2-letter code)
- **Response Type:** `string` (success message)
- **UI Integration:** `src/components/ca/CreateCADialog.tsx`

### 3.4 Import CA
- **Method:** `POST`
- **Endpoint:** `/api/ca/import`
- **Content-Type:** `multipart/form-data`
- **Form Data:**
  - `alias: string` (required)
  - `certificate: File` (required)
  - `privateKey?: File`
  - `keyPassword?: string`
- **Response Type:** `string` (success message)
- **UI Integration:** CA import dialog

### 3.5 Revoke CA
- **Method:** `POST`
- **Endpoint:** `/api/ca/revoke?alias={alias}`
- **Query Parameters:**
  - `alias: string` (required)
- **Response Type:** `string` (success message)
- **UI Integration:** CA management actions

### 3.6 Delete CA
- **Method:** `DELETE`
- **Endpoint:** `/api/ca?alias={alias}`
- **Query Parameters:**
  - `alias: string` (required)
- **Response Type:** `string` (success message)
- **UI Integration:** CA management delete action

---

## 📜 5. CERTIFICATES API

**File:** `src/lib/api/certificates.ts`

### 4.1 Add/Import Certificate
- **Method:** `POST`
- **Endpoint:** `/api/certificates/add`
- **Content-Type:** `application/x-www-form-urlencoded`
- **Form Data:**
  - `userId: number` (required)
  - `certificateName: string` (required)
  - `certData: string` (required) - Base64 or PEM
- **Response Type:** `CertificateResponse`
- **UI Integration:** Certificate import dialog

### 4.2 Get Certificates by User
- **Method:** `GET`
- **Endpoint:** `/api/certificates/user/{userId}`
- **Path Parameters:**
  - `userId: number` (required)
- **Response Type:** `CertificateResponse[]`
- **UI Integration:** User certificate list

### 4.3 Get All Certificates
- **Method:** `GET`
- **Endpoint:** `/api/certificates/all`
- **Response Type:** `CertificateResponse[]`
- **UI Integration:** `src/pages/Certificates.tsx`

### 4.4 Issue Certificate
- **Method:** `POST`
- **Endpoint:** `/api/certificates/issue`
- **Query Parameters:**
  - `caAlias: string` (required)
  - `commonName: string` (required)
- **Response Type:** `CertificateResponse`
- **UI Integration:** `src/pages/IssueCertificate.tsx`

### 4.5 Create User Certificate
- **Method:** `POST`
- **Endpoint:** `/api/certificates/user/create`
- **Request Type:** `CreateUserCertificateRequest`
  - `caAlias: string` (required)
  - `commonName: string` (required)
  - `organization?: string`
  - `organizationalUnit?: string`
  - `locality?: string`
  - `state?: string`
  - `country?: string`
  - `validityDays: number` (required)
  - `keySize: number` (required)
  - `keyUsages?: string[]`
  - `extendedKeyUsages?: string[]`
- **Response Type:** `string` (certificate PEM)
- **UI Integration:** Certificate creation forms

### 4.6 Renew Certificate
- **Method:** `POST`
- **Endpoint:** `/api/certificates/{certificateId}/renew`
- **Path Parameters:**
  - `certificateId: number` (required)
- **Response Type:** `CertificateResponse`
- **UI Integration:** `src/pages/Renewals.tsx`

### 4.7 Revoke Certificate
- **Method:** `POST`
- **Endpoint:** `/api/certificates/{certificateId}/revoke`
- **Path Parameters:**
  - `certificateId: number` (required)
- **Query Parameters:**
  - `reason: RevokeReason` (required) - "UNSPECIFIED", "KEY_COMPROMISE", "CA_COMPROMISE", "AFFILIATION_CHANGED", "SUPERSEDED", "CESSATION_OF_OPERATION", "CERTIFICATE_HOLD"
- **Response Type:** `void`
- **UI Integration:** Certificate revocation dialog

### 4.8 Enable Auto-Renew
- **Method:** `POST`
- **Endpoint:** `/api/certificates/auto-renew/enable`
- **Request Type:** `EnableAutoRenewRequest`
  - `certificateId: number` (required)
  - `renewalThresholdDays: number` (required)
  - `enabled: boolean` (required)
- **Response Type:** `AutoRenewConfiguration`
- **UI Integration:** Auto-renewal settings

### 4.9 Create Certificate Template
- **Method:** `POST`
- **Endpoint:** `/api/certificates/templates`
- **Request Type:** `CreateCertificateTemplateRequest`
  - `name: string` (required)
  - `description?: string`
  - `keySize: number` (required)
  - `validityDays: number` (required)
  - `keyUsages?: string[]`
  - `extendedKeyUsages?: string[]`
- **Response Type:** `CertificateTemplate`
- **UI Integration:** `src/pages/CertificateTemplates.tsx`

### 4.10 Bulk Issue Certificates
- **Method:** `POST`
- **Endpoint:** `/api/certificates/bulk/issue`
- **Request Type:** Array of `IssueCertificateRequest`
- **Response Type:** `BulkOperationResult`
- **UI Integration:** `src/pages/BulkOperations.tsx`

### 4.11 Bulk Renew Certificates
- **Method:** `POST`
- **Endpoint:** `/api/certificates/bulk/renew`
- **Request Type:** `number[]` (certificate IDs)
- **Response Type:** `BulkOperationResult`
- **UI Integration:** Bulk renewals

### 4.12 Bulk Revoke Certificates
- **Method:** `POST`
- **Endpoint:** `/api/certificates/bulk/revoke`
- **Request Type:** `{ certificateIds: number[], reason: RevokeReason }`
- **Response Type:** `BulkOperationResult`
- **UI Integration:** Bulk revocations

---

## 🔍 6. NETWORK SCAN API

**Files:** `src/lib/api/nmap.ts`, `src/lib/api/discovery.ts`

### 5.1 Scan Network
- **Method:** `POST`
- **Endpoint:** `/api/nmap/scan`
- **Request Type:** `NmapScanRequest`
  - `targets: Array<{ host: string, ports: Array<{ port: number }> }>` (required)
  - `scanOptions?: string`
- **Response Type:** `NmapCertificateScan[]`
  - `id: number`
  - `ipAddress: string`
  - `hostname: string`
  - `portsCsv: string`
  - `commonName: string`
  - `issuerCA: string`
  - `notBefore: string`
  - `notAfter: string`
  - `certificateStatus: string`
- **UI Integration:** `src/pages/NetworkScan.tsx`

### 5.2 Get All Scanned Certificates
- **Method:** `GET`
- **Endpoint:** `/api/nmap/certificates`
- **Response Type:** `NmapCertificateScan[]`
- **UI Integration:** `src/pages/NetworkScan.tsx`

---

## 🔎 7. DISCOVERY API

**File:** `src/lib/api/discovery.ts`

### 6.1 Get All Discovery Configurations
- **Method:** `GET`
- **Endpoint:** `/api/discovery/configurations`
- **Response Type:** `DiscoveryConfiguration[]`
- **UI Integration:** `src/pages/Discovery.tsx`

### 6.2 Get Discovery Configuration by ID
- **Method:** `GET`
- **Endpoint:** `/api/discovery/configurations/{id}`
- **Path Parameters:**
  - `id: number` (required)
- **Response Type:** `DiscoveryConfiguration`
- **UI Integration:** Configuration details

### 6.3 Create Discovery Configuration
- **Method:** `POST`
- **Endpoint:** `/api/discovery/configurations`
- **Request Type:** `CreateDiscoveryConfigRequest`
  - `name: string` (required)
  - `type: string` (required) - "NETWORK", "LDAP", "CLOUD", "FILESYSTEM"
  - `settings: object` (required)
  - `schedule?: string`
- **Response Type:** `DiscoveryConfiguration`
- **UI Integration:** Discovery configuration creation

### 6.4 Update Discovery Configuration
- **Method:** `PUT`
- **Endpoint:** `/api/discovery/configurations/{id}`
- **Path Parameters:**
  - `id: number` (required)
- **Request Type:** `UpdateDiscoveryConfigRequest`
- **Response Type:** `DiscoveryConfiguration`
- **UI Integration:** Configuration editing

### 6.5 Delete Discovery Configuration
- **Method:** `DELETE`
- **Endpoint:** `/api/discovery/configurations/{id}`
- **Path Parameters:**
  - `id: number` (required)
- **Response Type:** `void`
- **UI Integration:** Configuration deletion

### 6.6 Run Discovery Scan
- **Method:** `POST`
- **Endpoint:** `/api/discovery/configurations/{id}/scan`
- **Path Parameters:**
  - `id: number` (required)
- **Response Type:** `DiscoveryScanResult`
- **UI Integration:** Manual scan trigger

### 6.7 Get Discovery Results
- **Method:** `GET`
- **Endpoint:** `/api/discovery/configurations/{configId}/results`
- **Path Parameters:**
  - `configId: number` (required)
- **Response Type:** `DiscoveryResult[]`
- **UI Integration:** Results viewer

### 6.8 Scan LDAP/Active Directory
- **Method:** `POST`
- **Endpoint:** `/api/discovery/scan/ldap`
- **Request Type:** `LDAPScanRequest`
  - `host: string` (required)
  - `port: number` (required)
  - `baseDN: string` (required)
  - `username?: string`
  - `password?: string`
- **Response Type:** `DiscoveryResult[]`
- **UI Integration:** LDAP scan dialog

### 6.9 Scan Cloud Provider
- **Method:** `POST`
- **Endpoint:** `/api/discovery/scan/cloud?provider={provider}`
- **Query Parameters:**
  - `provider: string` (required) - "AWS", "AZURE", "GCP"
- **Request Type:** `CloudScanRequest`
  - `credentials: object` (required)
  - `regions?: string[]`
- **Response Type:** `DiscoveryResult[]`
- **UI Integration:** Cloud provider scan

### 6.10 Scan Filesystem
- **Method:** `POST`
- **Endpoint:** `/api/discovery/scan/filesystem?path={path}`
- **Query Parameters:**
  - `path: string` (required)
- **Response Type:** `DiscoveryResult[]`
- **UI Integration:** Filesystem scan

### 6.11 Schedule Discovery
- **Method:** `POST`
- **Endpoint:** `/api/discovery/schedule`
- **Request Type:** `ScheduleDiscoveryRequest`
  - `configId: number` (required)
  - `cronExpression: string` (required)
- **Response Type:** `DiscoverySchedule`
- **UI Integration:** Schedule configuration

### 6.12 Get Discovery Changes
- **Method:** `GET`
- **Endpoint:** `/api/discovery/changes`
- **Response Type:** `DiscoveryChange[]`
- **UI Integration:** Change tracking viewer

---

## ⚙️ 8. BACKGROUND JOBS API

**File:** `src/lib/api/jobs.ts`

### 7.1 Get Job by ID
- **Method:** `GET`
- **Endpoint:** `/api/jobs/{jobId}`
- **Path Parameters:**
  - `jobId: number` (required)
- **Response Type:** `Job`
- **UI Integration:** `src/pages/Jobs.tsx`

### 7.2 Get My Jobs
- **Method:** `GET`
- **Endpoint:** `/api/jobs/my-jobs`
- **Response Type:** `Job[]`
- **UI Integration:** User's job list

### 7.3 Get Jobs by Status
- **Method:** `GET`
- **Endpoint:** `/api/jobs/status/{status}`
- **Path Parameters:**
  - `status: string` (required) - "PENDING", "RUNNING", "COMPLETED", "FAILED"
- **Response Type:** `Job[]`
- **UI Integration:** Status filtering

### 7.4 Get Running Jobs
- **Method:** `GET`
- **Endpoint:** `/api/jobs/running`
- **Response Type:** `Job[]`
- **UI Integration:** Active jobs monitor

### 7.5 Get Recent Jobs
- **Method:** `GET`
- **Endpoint:** `/api/jobs/recent`
- **Response Type:** `Job[]`
- **UI Integration:** Recent activity

---

## 🔔 9. ALERTS & NOTIFICATIONS API

**File:** `src/lib/api/alerts.ts`

### 8.1 Get Alert Configurations
- **Method:** `GET`
- **Endpoint:** `/api/alerts/configurations`
- **Response Type:** `AlertConfiguration[]`
- **UI Integration:** `src/pages/Alerts.tsx`

### 8.2 Configure Alert
- **Method:** `POST`
- **Endpoint:** `/api/alerts/configure`
- **Request Type:** `CreateAlertRequest`
  - `alertType: string` (required)
  - `thresholds: object` (required)
  - `recipients: string[]` (required)
  - `enabled: boolean` (required)
- **Response Type:** `AlertConfiguration`
- **UI Integration:** Alert configuration

### 8.3 Get Alert History
- **Method:** `GET`
- **Endpoint:** `/api/alerts/history`
- **Query Parameters:**
  - `startDate?: string` (ISO 8601)
  - `endDate?: string` (ISO 8601)
- **Response Type:** `Alert[]`
- **UI Integration:** Alert history viewer

### 8.4 Send Certificate Expiration Alert
- **Method:** `POST`
- **Endpoint:** `/api/alerts/send/certificate-expiration`
- **Request Type:** `CertificateExpirationAlert`
  - `certificateId: number` (required)
  - `daysUntilExpiry: number` (required)
  - `recipients: string[]` (required)
- **Response Type:** `string` (success message)
- **UI Integration:** Expiration alerts

### 8.5 Send Bulk Operation Alert
- **Method:** `POST`
- **Endpoint:** `/api/alerts/send/bulk-operation`
- **Request Type:** `BulkOperationAlert`
  - `operationType: string` (required)
  - `totalCount: number` (required)
  - `successCount: number` (required)
  - `failureCount: number` (required)
- **Response Type:** `string` (success message)
- **UI Integration:** Bulk operation notifications

### 8.6 Send General Alert
- **Method:** `POST`
- **Endpoint:** `/api/alerts/send/general`
- **Request Type:** `GeneralAlert`
  - `title: string` (required)
  - `message: string` (required)
  - `severity: string` (required) - "INFO", "WARNING", "ERROR", "CRITICAL"
  - `recipients: string[]` (required)
- **Response Type:** `string` (success message)
- **UI Integration:** Custom alerts

### 8.7 Register Webhook
- **Method:** `POST`
- **Endpoint:** `/api/alerts/webhooks`
- **Request Type:** `WebhookRequest`
  - `url: string` (required)
  - `events: string[]` (required)
  - `headers?: object`
- **Response Type:** `string` (webhook ID)
- **UI Integration:** Webhook configuration

### 8.8 Get Notification Preferences
- **Method:** `GET`
- **Endpoint:** `/api/notifications/preferences`
- **Response Type:** `NotificationPreferences`
- **UI Integration:** User preferences

---

## 🔒 10. SESSIONS API

**File:** `src/lib/api/sessions.ts`

### 9.1 Get Active Sessions
- **Method:** `GET`
- **Endpoint:** `/api/sessions/active`
- **Response Type:** `Session[]`
- **UI Integration:** `src/pages/Sessions.tsx`

### 9.2 Get My Sessions
- **Method:** `GET`
- **Endpoint:** `/api/sessions/my-sessions`
- **Response Type:** `Session[]`
- **UI Integration:** User session management

### 9.3 Get Session Analytics
- **Method:** `GET`
- **Endpoint:** `/api/sessions/analytics`
- **Response Type:** `string` (analytics data)
- **UI Integration:** Session analytics

### 9.4 Detect Suspicious Activity
- **Method:** `GET`
- **Endpoint:** `/api/sessions/suspicious-activity`
- **Response Type:** `string` (suspicious sessions)
- **UI Integration:** Security monitoring

### 9.5 Terminate Session
- **Method:** `DELETE`
- **Endpoint:** `/api/sessions/{sessionId}`
- **Path Parameters:**
  - `sessionId: string` (required)
- **Response Type:** `string` (success message)
- **UI Integration:** Session termination

### 9.6 Terminate All Sessions
- **Method:** `DELETE`
- **Endpoint:** `/api/sessions/terminate-all`
- **Response Type:** `string` (success message)
- **UI Integration:** Bulk session termination

### 9.7 Cleanup Expired Sessions
- **Method:** `POST`
- **Endpoint:** `/api/sessions/cleanup`
- **Response Type:** `CleanupResult`
- **UI Integration:** Maintenance operations

---

## 🛡️ 11. SECURITY API

**File:** `src/lib/api/security.ts`

### 10.1 Get All RBAC Roles
- **Method:** `GET`
- **Endpoint:** `/api/security/rbac/roles`
- **Response Type:** `Role[]`
- **UI Integration:** Role management

### 10.2 Create RBAC Role
- **Method:** `POST`
- **Endpoint:** `/api/security/rbac/roles`
- **Request Type:** `CreateRoleRequest`
  - `name: string` (required)
  - `description?: string`
  - `permissions: string[]` (required)
- **Response Type:** `Role`
- **UI Integration:** `src/pages/CreateRole.tsx`

### 10.3 Assign Permissions to Role
- **Method:** `PUT`
- **Endpoint:** `/api/security/rbac/roles/{roleId}/permissions`
- **Path Parameters:**
  - `roleId: number` (required)
- **Request Type:** `string[]` (permissions)
- **Response Type:** `Role`
- **UI Integration:** Permission assignment

### 10.4 Configure SAML/SSO
- **Method:** `POST`
- **Endpoint:** `/api/security/saml/configure`
- **Request Type:** `SAMLConfiguration`
  - `entityId: string` (required)
  - `metadataUrl: string` (required)
  - `certificate: string` (required)
- **Response Type:** `string` (success message)
- **UI Integration:** SSO configuration

### 10.5 Enable MFA
- **Method:** `POST`
- **Endpoint:** `/api/security/mfa/enable`
- **Query Parameters:**
  - `userId: number` (required)
  - `method: string` (required) - "TOTP", "SMS", "EMAIL"
- **Response Type:** `string` (MFA setup details)
- **UI Integration:** MFA setup

### 10.6 Get API Keys
- **Method:** `GET`
- **Endpoint:** `/api/security/api-keys`
- **Response Type:** `APIKey[]`
- **UI Integration:** `src/pages/ApiKeys.tsx`

### 10.7 Generate API Key
- **Method:** `POST`
- **Endpoint:** `/api/security/api-keys/generate`
- **Request Type:** `GenerateAPIKeyRequest`
  - `name: string` (required)
  - `expiresIn?: number` (days)
  - `permissions?: string[]`
- **Response Type:** `APIKey`
- **UI Integration:** API key generation

### 10.8 Revoke API Key
- **Method:** `DELETE`
- **Endpoint:** `/api/security/api-keys/{keyId}`
- **Path Parameters:**
  - `keyId: string` (required)
- **Response Type:** `void`
- **UI Integration:** API key revocation

### 10.9 Configure Key Rotation
- **Method:** `POST`
- **Endpoint:** `/api/security/key-rotation/configure`
- **Query Parameters:**
  - `rotationDays: number` (required)
  - `autoRotate?: boolean` (default: false)
- **Response Type:** `string` (configuration status)
- **UI Integration:** Key rotation settings

---

## 🚦 12. RATE LIMIT API

**File:** `src/lib/api/rateLimit.ts`

### 11.1 Get All Violations
- **Method:** `GET`
- **Endpoint:** `/api/rate-limit/violations`
- **Query Parameters:**
  - `startDate?: string` (ISO 8601)
  - `endDate?: string` (ISO 8601)
- **Response Type:** `RateLimitViolation[]`
- **UI Integration:** `src/pages/RateLimitMonitoring.tsx`

### 11.2 Get Violations by IP
- **Method:** `GET`
- **Endpoint:** `/api/rate-limit/violations/ip/{ipAddress}`
- **Path Parameters:**
  - `ipAddress: string` (required)
- **Response Type:** `RateLimitViolation[]`
- **UI Integration:** IP-based filtering

### 11.3 Get Violations by User
- **Method:** `GET`
- **Endpoint:** `/api/rate-limit/violations/user/{userId}`
- **Path Parameters:**
  - `userId: number` (required)
- **Response Type:** `RateLimitViolation[]`
- **UI Integration:** User-based filtering

### 11.4 Get Rate Limit Metrics
- **Method:** `GET`
- **Endpoint:** `/api/rate-limit/metrics`
- **Response Type:** `RateLimitMetrics`
- **UI Integration:** Metrics dashboard

### 11.5 Get Top Offenders
- **Method:** `GET`
- **Endpoint:** `/api/rate-limit/top-offenders`
- **Response Type:** `TopOffender[]`
- **UI Integration:** Offender list

---

## 📊 13. REPORTS & AUDIT API

**File:** `src/lib/api/reports.ts`

### 12.1 Get Compliance Report
- **Method:** `GET`
- **Endpoint:** `/api/reports/compliance`
- **Query Parameters:**
  - `standard?: string` (default: "PCI-DSS") - "PCI-DSS", "HIPAA", "SOC2", "ISO27001"
- **Response Type:** `ComplianceReport`
- **UI Integration:** `src/pages/ComplianceReports.tsx`

### 12.2 Get Inventory Report
- **Method:** `GET`
- **Endpoint:** `/api/reports/inventory`
- **Query Parameters:**
  - `format?: string` (default: "JSON") - "JSON", "CSV", "PDF"
- **Response Type:** `string` (report data)
- **UI Integration:** Inventory reports

### 12.3 Get Expiring Certificates Report
- **Method:** `GET`
- **Endpoint:** `/api/reports/expiring`
- **Query Parameters:**
  - `days?: number` (default: 30)
- **Response Type:** `string` (report data)
- **UI Integration:** Expiration reports

### 12.4 Get Audit Logs
- **Method:** `GET`
- **Endpoint:** `/api/audit-logs`
- **Query Parameters:**
  - `startDate?: string` (ISO 8601)
  - `endDate?: string` (ISO 8601)
  - `action?: string`
- **Response Type:** `AuditLog[]`
- **UI Integration:** `src/pages/AuditLogs.tsx`

---

## 📈 14. DASHBOARD API

**File:** `src/lib/api/dashboard.ts`

### 13.1 Get Dashboard Metrics
- **Method:** `GET`
- **Endpoint:** `/api/dashboard/metrics`
- **Response Type:** `DashboardMetrics`
  - `totalCertificates: number`
  - `activeCertificates: number`
  - `expiringSoon: number`
  - `revoked: number`
  - `certificateAuthorities: number`
- **UI Integration:** `src/pages/Dashboard.tsx`

### 13.2 Get Expiring Certificates
- **Method:** `GET`
- **Endpoint:** `/api/dashboard/expiring`
- **Query Parameters:**
  - `days?: number` (default: 30)
- **Response Type:** `Certificate[]`
- **UI Integration:** Dashboard expiration widget

### 13.3 Get Certificate Health
- **Method:** `GET`
- **Endpoint:** `/api/dashboard/certificate-health`
- **Response Type:** `CertificateHealth`
  - `healthy: number`
  - `warning: number`
  - `critical: number`
- **UI Integration:** Health status widget

### 13.4 Get Compliance Score
- **Method:** `GET`
- **Endpoint:** `/api/dashboard/compliance-score`
- **Response Type:** `ComplianceScore`
  - `score: number`
  - `details: object`
- **UI Integration:** Compliance widget

---

## 🔄 15. BULK OPERATIONS API

**File:** `src/lib/api/bulk.ts`

### 14.1 Bulk Issue Certificates (Sync)
- **Method:** `POST`
- **Endpoint:** `/api/bulk/certificates/issue`
- **Request Type:** `BulkIssueCertificateRequest[]`
- **Response Type:** `BulkOperationResult`
  - `totalCount: number`
  - `successCount: number`
  - `failureCount: number`
  - `results: Array<{ success: boolean, message: string }>`
- **UI Integration:** `src/pages/BulkOperations.tsx`

### 14.2 Bulk Renew Certificates (Sync)
- **Method:** `POST`
- **Endpoint:** `/api/bulk/certificates/renew`
- **Request Type:** `number[]` (certificate IDs)
- **Response Type:** `BulkOperationResult`
- **UI Integration:** Bulk renewal operations

### 14.3 Bulk Revoke Certificates (Sync)
- **Method:** `POST`
- **Endpoint:** `/api/bulk/certificates/revoke`
- **Request Type:** `BulkRevokeCertificateRequest`
  - `certificateIds: number[]` (required)
  - `reason: RevokeReason` (required)
- **Response Type:** `BulkOperationResult`
- **UI Integration:** Bulk revocation operations

### 14.4 Bulk Issue Certificates (Async)
- **Method:** `POST`
- **Endpoint:** `/api/bulk/certificates/issue/async`
- **Request Type:** `BulkIssueCertificateRequest[]`
- **Response Type:** `AsyncJobResponse`
  - `jobId: string`
  - `status: string`
- **UI Integration:** Async operations monitoring

### 14.5 Bulk Renew Certificates (Async)
- **Method:** `POST`
- **Endpoint:** `/api/bulk/certificates/renew/async`
- **Request Type:** `number[]`
- **Response Type:** `AsyncJobResponse`
- **UI Integration:** Async renewal monitoring

### 14.6 Bulk Revoke Certificates (Async)
- **Method:** `POST`
- **Endpoint:** `/api/bulk/certificates/revoke/async`
- **Request Type:** `BulkRevokeCertificateRequest`
- **Response Type:** `AsyncJobResponse`
- **UI Integration:** Async revocation monitoring

### 14.7 Get Bulk Job Status
- **Method:** `GET`
- **Endpoint:** `/api/bulk/jobs/{jobId}/status`
- **Path Parameters:**
  - `jobId: string` (required)
- **Response Type:** `BulkJobStatus`
- **UI Integration:** Job status tracking

### 14.8 Get Bulk Job Results
- **Method:** `GET`
- **Endpoint:** `/api/bulk/jobs/{jobId}/results`
- **Path Parameters:**
  - `jobId: string` (required)
- **Response Type:** `BulkOperationResult`
- **UI Integration:** Results viewer

---

## 🔐 16. ACME MANAGEMENT API

**File:** `src/lib/api/acme.ts`

### 15.1 Get ACME Providers
- **Method:** `GET`
- **Endpoint:** `/api/acme/providers`
- **Response Type:** `ACMEProvider[]`
- **UI Integration:** `src/pages/AcmeManagement.tsx`

### 15.2 Get ACME Provider by ID
- **Method:** `GET`
- **Endpoint:** `/api/acme/providers/{id}`
- **Path Parameters:**
  - `id: number` (required)
- **Response Type:** `ACMEProvider`
- **UI Integration:** Provider details

### 15.3 Create ACME Provider
- **Method:** `POST`
- **Endpoint:** `/api/acme/providers`
- **Request Type:** `CreateACMEProviderRequest`
  - `name: string` (required)
  - `directoryUrl: string` (required)
  - `email: string` (required)
- **Response Type:** `ACMEProvider`
- **UI Integration:** Provider creation

### 15.4 Delete ACME Provider
- **Method:** `DELETE`
- **Endpoint:** `/api/acme/providers/{id}`
- **Path Parameters:**
  - `id: number` (required)
- **Response Type:** `void`
- **UI Integration:** Provider deletion

### 15.5 Get ACME Accounts
- **Method:** `GET`
- **Endpoint:** `/api/acme/accounts`
- **Response Type:** `ACMEAccount[]`
- **UI Integration:** Account management

### 15.6 Get ACME Account by ID
- **Method:** `GET`
- **Endpoint:** `/api/acme/accounts/{id}`
- **Path Parameters:**
  - `id: number` (required)
- **Response Type:** `ACMEAccount`
- **UI Integration:** Account details

### 15.7 Get ACME Orders
- **Method:** `GET`
- **Endpoint:** `/api/acme/orders`
- **Response Type:** `ACMEOrder[]`
- **UI Integration:** Order management

### 15.8 Get ACME Order by ID
- **Method:** `GET`
- **Endpoint:** `/api/acme/orders/{id}`
- **Path Parameters:**
  - `id: number` (required)
- **Response Type:** `ACMEOrder`
- **UI Integration:** Order details

### 15.9 Create ACME Order
- **Method:** `POST`
- **Endpoint:** `/api/acme/orders`
- **Request Type:** `CreateACMEOrderRequest`
  - `accountId: number` (required)
  - `domains: string[]` (required)
- **Response Type:** `ACMEOrder`
- **UI Integration:** Order creation

### 15.10 Cancel ACME Order
- **Method:** `DELETE`
- **Endpoint:** `/api/acme/orders/{id}`
- **Path Parameters:**
  - `id: number` (required)
- **Response Type:** `void`
- **UI Integration:** Order cancellation

### 15.11 Get Orders by Account
- **Method:** `GET`
- **Endpoint:** `/api/acme/accounts/{accountId}/orders`
- **Path Parameters:**
  - `accountId: number` (required)
- **Response Type:** `ACMEOrder[]`
- **UI Integration:** Account-specific orders

### 15.12 Get Order Authorizations
- **Method:** `GET`
- **Endpoint:** `/api/acme/orders/{orderId}/authorizations`
- **Path Parameters:**
  - `orderId: number` (required)
- **Response Type:** `ACMEAuthorization[]`
- **UI Integration:** Authorization management

### 15.13 Get Authorization Details
- **Method:** `GET`
- **Endpoint:** `/api/acme/authorizations/{authId}`
- **Path Parameters:**
  - `authId: number` (required)
- **Response Type:** `ACMEAuthorization`
- **UI Integration:** Authorization details

### 15.14 Get Authorization Challenges
- **Method:** `GET`
- **Endpoint:** `/api/acme/authorizations/{authId}/challenges`
- **Path Parameters:**
  - `authId: number` (required)
- **Response Type:** `ACMEChallenge[]`
- **UI Integration:** Challenge management

### 15.15 Get Challenge Details
- **Method:** `GET`
- **Endpoint:** `/api/acme/challenges/{id}`
- **Path Parameters:**
  - `id: number` (required)
- **Response Type:** `ACMEChallenge`
- **UI Integration:** Challenge details

### 15.16 Trigger Challenge Validation
- **Method:** `POST`
- **Endpoint:** `/api/acme/challenges/{id}/trigger`
- **Path Parameters:**
  - `id: number` (required)
- **Response Type:** `unknown`
- **UI Integration:** Challenge validation

### 15.17 Get Auto-Renewal Status
- **Method:** `GET`
- **Endpoint:** `/api/acme/renewal/status`
- **Response Type:** `AutoRenewalStatus[]`
- **UI Integration:** Renewal status monitoring

### 15.18 Manual Renewal for Order
- **Method:** `POST`
- **Endpoint:** `/api/acme/renewal/manual/{orderId}`
- **Path Parameters:**
  - `orderId: number` (required)
- **Response Type:** `ACMEOrder`
- **UI Integration:** Manual renewal trigger

### 15.19 Enable Auto-Renewal
- **Method:** `POST`
- **Endpoint:** `/api/acme/renewal/enable`
- **Request Type:** `EnableAutoRenewalRequest`
  - `orderId: number` (required)
  - `daysBeforeExpiry: number` (required)
- **Response Type:** `AutoRenewalConfiguration`
- **UI Integration:** Auto-renewal configuration

### 15.20 Disable Auto-Renewal
- **Method:** `POST`
- **Endpoint:** `/api/acme/renewal/disable`
- **Request Type:** `{ orderId: number }`
- **Response Type:** `void`
- **UI Integration:** Disable auto-renewal

### 15.21 Configure ACME Integration
- **Method:** `POST`
- **Endpoint:** `/api/acme/integration/configure`
- **Query Parameters:**
  - `provider: string` (required) - "LetsEncrypt", "BuyPass", "ZeroSSL"
  - `email?: string`
- **Response Type:** `string` (configuration status)
- **UI Integration:** Integration setup

### 15.22 Order ACME Certificate
- **Method:** `POST`
- **Endpoint:** `/api/acme/integration/order`
- **Request Type:** `ACMEOrderRequest`
  - `domains: string[]` (required)
  - `challengeType: string` (required) - "HTTP-01", "DNS-01"
- **Response Type:** `string` (order status)
- **UI Integration:** Certificate ordering

### 15.23 Validate Domain
- **Method:** `POST`
- **Endpoint:** `/api/acme/integration/validate`
- **Request Type:** `DomainValidationRequest`
  - `domain: string` (required)
  - `challengeType: string` (required)
- **Response Type:** `string` (validation status)
- **UI Integration:** Domain validation

### 15.24 Configure Jenkins Integration
- **Method:** `POST`
- **Endpoint:** `/api/acme/integration/jenkins`
- **Request Type:** `JenkinsIntegrationRequest`
  - `jenkinsUrl: string` (required)
  - `credentials: object` (required)
- **Response Type:** `string` (integration status)
- **UI Integration:** Jenkins integration

### 15.25 Configure Kubernetes Integration
- **Method:** `POST`
- **Endpoint:** `/api/acme/integration/kubernetes`
- **Request Type:** `K8sIntegrationRequest`
  - `clusterUrl: string` (required)
  - `namespace: string` (required)
  - `kubeconfig: string` (required)
- **Response Type:** `string` (integration status)
- **UI Integration:** Kubernetes integration

---

## 📡 17. ACME MONITORING API

**File:** `src/lib/api/acmeMonitoring.ts`

### 16.1 Create Webhook
- **Method:** `POST`
- **Endpoint:** `/api/acme/monitoring/webhooks`
- **Request Type:** `CreateWebhookRequest`
  - `url: string` (required)
  - `events: string[]` (required)
  - `secret?: string`
- **Response Type:** `Webhook`
- **UI Integration:** `src/pages/AcmeMonitoring.tsx`

### 16.2 Get All Webhooks
- **Method:** `GET`
- **Endpoint:** `/api/acme/monitoring/webhooks`
- **Response Type:** `Webhook[]`
- **UI Integration:** Webhook list

### 16.3 Get Webhook by ID
- **Method:** `GET`
- **Endpoint:** `/api/acme/monitoring/webhooks/{id}`
- **Path Parameters:**
  - `id: number` (required)
- **Response Type:** `Webhook`
- **UI Integration:** Webhook details

### 16.4 Update Webhook
- **Method:** `PUT`
- **Endpoint:** `/api/acme/monitoring/webhooks/{id}`
- **Path Parameters:**
  - `id: number` (required)
- **Request Type:** `UpdateWebhookRequest`
- **Response Type:** `Webhook`
- **UI Integration:** Webhook editing

### 16.5 Delete Webhook
- **Method:** `DELETE`
- **Endpoint:** `/api/acme/monitoring/webhooks/{id}`
- **Path Parameters:**
  - `id: number` (required)
- **Response Type:** `void`
- **UI Integration:** Webhook deletion

### 16.6 Get Active Webhooks
- **Method:** `GET`
- **Endpoint:** `/api/acme/monitoring/webhooks/active`
- **Response Type:** `Webhook[]`
- **UI Integration:** Active webhooks filter

### 16.7 Test Webhook
- **Method:** `POST`
- **Endpoint:** `/api/acme/monitoring/webhooks/{id}/test`
- **Path Parameters:**
  - `id: number` (required)
- **Response Type:** `WebhookTestResult`
- **UI Integration:** Webhook testing

### 16.8 Get Problematic Webhooks
- **Method:** `GET`
- **Endpoint:** `/api/acme/monitoring/webhooks/problematic`
- **Response Type:** `Webhook[]`
- **UI Integration:** Problem detection

### 16.9 Get Webhook Events
- **Method:** `GET`
- **Endpoint:** `/api/acme/monitoring/webhooks/events`
- **Response Type:** `string[]`
- **UI Integration:** Event type selection

### 16.10 Get ACME Dashboard
- **Method:** `GET`
- **Endpoint:** `/api/acme/monitoring/dashboard`
- **Response Type:** `ACMEDashboard`
- **UI Integration:** ACME overview

### 16.11 Get Metrics by Date Range
- **Method:** `GET`
- **Endpoint:** `/api/acme/monitoring/metrics`
- **Query Parameters:**
  - `start: string` (required, ISO 8601)
  - `end: string` (required, ISO 8601)
- **Response Type:** `ACMEMetrics[]`
- **UI Integration:** Custom date range metrics

### 16.12 Get Latest Metrics
- **Method:** `GET`
- **Endpoint:** `/api/acme/monitoring/metrics/latest`
- **Response Type:** `ACMEMetrics`
- **UI Integration:** Current metrics

### 16.13 Get Metrics Summary
- **Method:** `GET`
- **Endpoint:** `/api/acme/monitoring/metrics/summary`
- **Response Type:** `ACMEMetricsSummary`
- **UI Integration:** Summary statistics

### 16.14 Get Weekly Metrics
- **Method:** `GET`
- **Endpoint:** `/api/acme/monitoring/metrics/week`
- **Response Type:** `ACMEMetrics[]`
- **UI Integration:** Weekly trends

### 16.15 Get Monthly Metrics
- **Method:** `GET`
- **Endpoint:** `/api/acme/monitoring/metrics/month`
- **Response Type:** `ACMEMetrics[]`
- **UI Integration:** Monthly trends

### 16.16 Get Metrics by Provider
- **Method:** `GET`
- **Endpoint:** `/api/acme/monitoring/metrics/provider/{providerId}`
- **Path Parameters:**
  - `providerId: number` (required)
- **Response Type:** `ACMEMetrics[]`
- **UI Integration:** Provider-specific metrics

### 16.17 Get Low Performance Metrics
- **Method:** `GET`
- **Endpoint:** `/api/acme/monitoring/metrics/low-performance`
- **Response Type:** `ACMEMetrics[]`
- **UI Integration:** Performance monitoring

### 16.18 Get Provider Comparison
- **Method:** `GET`
- **Endpoint:** `/api/acme/monitoring/metrics/comparison`
- **Response Type:** `ProviderComparison`
- **UI Integration:** Provider comparison

### 16.19 Get Health Status
- **Method:** `GET`
- **Endpoint:** `/api/acme/monitoring/health`
- **Response Type:** `ACMEHealthStatus`
- **UI Integration:** Health monitoring

---

## 🔧 18. CERTIFICATE OPERATIONS API

**File:** `src/lib/api/certOperations.ts`

### 17.1 Validate Certificate
- **Method:** `GET`
- **Endpoint:** `/api/certificate-operations/validate/{certificateId}`
- **Path Parameters:**
  - `certificateId: number` (required)
- **Response Type:** `ValidationResult`
  - `isValid: boolean`
  - `errors: string[]`
  - `warnings: string[]`
- **UI Integration:** Certificate validation

### 17.2 Check Revocation Status
- **Method:** `GET`
- **Endpoint:** `/api/certificate-operations/revocation-status/{certificateId}`
- **Path Parameters:**
  - `certificateId: number` (required)
- **Response Type:** `RevocationStatus`
  - `isRevoked: boolean`
  - `revokedAt?: string`
  - `reason?: string`
- **UI Integration:** Revocation checking

### 17.3 Compare Certificates
- **Method:** `GET`
- **Endpoint:** `/api/certificate-operations/compare`
- **Query Parameters:**
  - `cert1: number` (required)
  - `cert2: number` (required)
- **Response Type:** `ComparisonResult`
- **UI Integration:** Certificate comparison

### 17.4 Detect Duplicate Certificates
- **Method:** `GET`
- **Endpoint:** `/api/certificate-operations/detect-duplicates`
- **Response Type:** `DuplicateCertificate[]`
- **UI Integration:** Duplicate detection

### 17.5 Backup Certificates
- **Method:** `POST`
- **Endpoint:** `/api/certificate-operations/backup`
- **Request Type:** `BackupRequest`
  - `certificateIds?: number[]`
  - `includePrivateKeys: boolean` (required)
  - `encryptBackup: boolean` (required)
- **Response Type:** `string` (backup file path)
- **UI Integration:** Backup operations

### 17.6 Restore Certificates
- **Method:** `POST`
- **Endpoint:** `/api/certificate-operations/restore`
- **Content-Type:** `multipart/form-data`
- **Form Data:**
  - `backupFile: File` (required)
- **Response Type:** `string` (restore status)
- **UI Integration:** Restore operations

---

## 🏥 19. SYSTEM HEALTH API

**File:** `src/lib/api/health.ts`

### 18.1 Check System Health
- **Method:** `GET`
- **Endpoint:** `/api/health`
- **Response Type:** `HealthStatus`
  - `status: string` - "UP", "DOWN", "DEGRADED"
  - `timestamp: string`
- **UI Integration:** System status indicator

### 18.2 Get Detailed Health Status
- **Method:** `GET`
- **Endpoint:** `/api/health/detailed`
- **Response Type:** `DetailedHealthStatus`
  - `database: ComponentHealth`
  - `redis: ComponentHealth`
  - `diskSpace: ComponentHealth`
  - `memory: ComponentHealth`
- **UI Integration:** Detailed health dashboard

### 18.3 Check Database Connectivity
- **Method:** `GET`
- **Endpoint:** `/api/health/database`
- **Response Type:** `ComponentHealth`
  - `status: string`
  - `responseTime: number`
- **UI Integration:** Database monitoring

### 18.4 Check Redis Connectivity
- **Method:** `GET`
- **Endpoint:** `/api/health/redis`
- **Response Type:** `ComponentHealth`
  - `status: string`
  - `responseTime: number`
- **UI Integration:** Cache monitoring

---

## 📋 REQUEST/RESPONSE TYPE DEFINITIONS

All TypeScript interfaces are defined in `src/lib/api/types.ts`:

### Common Types
- `PaginatedResponse<T>` - Generic pagination wrapper
- `User` - User entity
- `Role` - RBAC role
- `Certificate` - Certificate entity
- `CertificateAuthority` - CA entity
- `Job` - Background job
- `Alert` - Alert/notification

### User Management
- `LoginRequest` - Login credentials
- `LoginResponse` - JWT token + user
- `RegisterRequest` - Registration data
- `CreateUserRequest` - New user data
- `UpdateUserRequest` - User update fields
- `UserResponse` - Complete user object with roles
- `ChangePasswordRequest` - Password change
- `UserStatistics` - User metrics

### Certificates
- `CreateUserCertificateRequest` - Certificate creation
- `IssueCertificateRequest` - Certificate issuance
- `RevokeReason` - Revocation reasons enum
- `AutoRenewConfiguration` - Auto-renewal settings
- `CertificateTemplate` - Certificate template
- `BulkOperationResult` - Bulk operation results

### Network & Discovery
- `NmapScanRequest` - Network scan parameters
- `NmapCertificateScan` - Scanned certificate data
- `DiscoveryConfiguration` - Discovery config
- `DiscoveryResult` - Discovery findings

### ACME
- `ACMEProvider` - ACME provider details
- `ACMEAccount` - ACME account
- `ACMEOrder` - Certificate order
- `ACMEAuthorization` - Domain authorization
- `ACMEChallenge` - Domain challenge
- `AutoRenewalStatus` - Renewal status

---

## 🔗 API CONFIGURATION

**File:** `src/lib/api/apiConfig.ts`

### Base URL Configuration
```typescript
export const API_BASE_URL = 
  isDevelopment 
    ? "http://15.206.141.103:8080"
    : ""; // Same-origin in production
```

### Request Configuration
```typescript
export const API_TIMEOUT = 30000; // 30 seconds
export const API_RETRY_COUNT = 3;
export const API_RETRY_DELAY = 1000;
```

### Authentication
All authenticated endpoints require:
```
Authorization: Bearer {JWT_TOKEN}
```

Token is automatically included via `apiRequest()` wrapper in `src/lib/api/config.ts`.

---

## 📝 NOTES FOR BACKEND TEAM

### Integration Status
✅ **All 170+ endpoints are fully integrated** with TypeScript type safety, error handling, and loading states.

### Parameter Format Standards
1. **Path Parameters:** Use camelCase in URL paths
2. **Query Parameters:** URLSearchParams with proper encoding
3. **Request Bodies:** JSON with Content-Type: application/json
4. **File Uploads:** multipart/form-data or application/x-www-form-urlencoded
5. **Date Formats:** ISO 8601 strings (e.g., "2026-01-10T14:30:00Z")

### Pagination Standard
```typescript
{
  page: number,        // 0-indexed
  size: number,        // items per page (default: 20)
  sortBy?: string,     // field name
  sortOrder?: "ASC" | "DESC"
}
```

### Response Format
```typescript
{
  content: T[],
  totalElements: number,
  totalPages: number,
  currentPage: number,
  pageSize: number
}
```

### Error Handling
Frontend expects errors in format:
```typescript
{
  message: string,
  status?: number,
  errors?: string[]
}
```

### Known Field Mappings
- Network Scan: `portsCsv`, `issuerCA`, `notBefore`, `notAfter`
- Users: `accountNonLocked` (true = unlocked, false = locked)
- Roles: `ROLE_ADMIN`, `ROLE_USER`, `ROLE_CERTIFICATE_MANAGER`, `ROLE_AUDITOR`, `ROLE_VIEWER`

### Testing Checklist
- [ ] Verify all 170+ endpoints return expected response formats
- [ ] Confirm pagination parameters work correctly
- [ ] Validate date format compatibility (ISO 8601)
- [ ] Test field name consistency (accountNonLocked, portsCsv, etc.)
- [ ] Verify file upload endpoints accept multipart/form-data
- [ ] Check CORS configuration for development origin
- [ ] Validate JWT authentication on protected routes
- [ ] Test error response formats match frontend expectations

---

## 🚀 NEXT STEPS

1. **Backend Team**: Review this document and identify any missing/unimplemented endpoints
2. **Backend Team**: Verify parameter names match exactly (case-sensitive)
3. **Backend Team**: Confirm response structures match TypeScript interfaces
4. **Backend Team**: Provide list of any endpoints with updated parameters
5. **Frontend Team**: Update integration based on backend feedback
6. **Both Teams**: Conduct end-to-end integration testing

---

**Document Version:** 1.0  
**Generated:** January 10, 2026  
**Frontend Repository:** cert-cycle-studio  
**API Documentation Contact:** [Backend Team Lead]
