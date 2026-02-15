# CertAxis API Integration Guide

## Overview
Complete integration of all 14 CertAxis certificate-related endpoints across 4 categories.

**Server:** `http://15.206.141.103:8080`  
**Authentication:** JWT Bearer Token (Required for all endpoints)

---

## ✅ Integrated Endpoints

### 1. Certificate Authority Management (5 endpoints)
**File:** `src/lib/api/ca.ts`

| Method | Endpoint | Function | Description |
|--------|----------|----------|-------------|
| POST | `/api/ca/create` | `caApi.create()` | Create Root CA |
| POST | `/api/ca/import` | `caApi.importCA()` | Import external CA |
| GET | `/api/ca` | `caApi.list()` | List all CAs (paginated) |
| DELETE | `/api/ca` | `caApi.delete()` | Delete CA by alias |
| POST | `/api/ca/revoke` | `caApi.revoke()` | Revoke CA |

**Usage Example:**
```typescript
import { caApi } from '@/lib/api';

// Create Root CA
const result = await caApi.create({
  commonName: "MyCompany Root CA",
  organization: "MyCompany Inc",
  signatureAlgorithm: "RSA4096",
  validityInDays: 3650,
  alias: "mycompany-root-ca"
});

// List CAs
const cas = await caApi.list(0, 10);

// Revoke CA
await caApi.revoke("compromised-ca");
```

---

### 2. User Certificate Operations (1 endpoint)
**File:** `src/lib/api/certificates.ts`

| Method | Endpoint | Function | Description |
|--------|----------|----------|-------------|
| POST | `/api/certificate/create` | `certificatesApi.createUserCertificate()` | Issue user certificate signed by CA |

**Usage Example:**
```typescript
import { certificatesApi } from '@/lib/api';

const cert = await certificatesApi.createUserCertificate({
  commonName: "John Doe",
  organization: "MyCompany Inc",
  keyPairAlgorithm: "RSA2048",
  validityInDays: 365,
  alias: "john-doe-cert",
  caAlias: "intermediate-ca",
  password: "securePassword123"
});
```

---

### 3. Certificate Lifecycle Management (6 endpoints)
**File:** `src/lib/api/certificates.ts`

| Method | Endpoint | Function | Description |
|--------|----------|----------|-------------|
| POST | `/api/certificates/add` | `certificatesApi.add()` | Manually add/import certificate |
| GET | `/api/certificates/user/{userId}` | `certificatesApi.getByUser()` | Get user's certificates |
| GET | `/api/certificates/all` | `certificatesApi.getAll()` | Get all certificates |
| POST | `/api/certificates/issue` | `certificatesApi.issue()` | Issue certificate for host |
| POST | `/api/certificates/renew/{certId}` | `certificatesApi.renew()` | Renew certificate |
| POST | `/api/certificates/revoke/{certId}` | `certificatesApi.revoke()` | Revoke certificate |

**Usage Example:**
```typescript
import { certificatesApi } from '@/lib/api';

// Add certificate manually
const cert = await certificatesApi.add({
  userId: 1,
  certificateName: "example.com SSL",
  certData: "-----BEGIN CERTIFICATE-----\n..."
});

// Issue certificate
const issued = await certificatesApi.issue("api.example.com", "intermediate-ca");

// Renew certificate
const renewed = await certificatesApi.renew(501);

// Revoke certificate
await certificatesApi.revoke(501, "Key Compromise");
```

---

### 4. Network Certificate Scanning (2 endpoints)
**File:** `src/lib/api/nmap.ts`

| Method | Endpoint | Function | Description |
|--------|----------|----------|-------------|
| POST | `/api/nmap/scan` | `nmapApi.scan()` | Scan network for SSL/TLS certificates |
| GET | `/api/nmap/certificates` | `nmapApi.getAllCertificates()` | Get all scanned/issued certificates |

**Usage Example:**
```typescript
import { nmapApi } from '@/lib/api';

// Network scan
const results = await nmapApi.scan({
  targets: [
    {
      host: "example.com",
      ports: [{ port: 443 }]
    },
    {
      host: "192.168.1.0/24",
      ports: [{ port: 443 }, { start: 8443, end: 8445 }]
    }
  ]
});

// Get all scanned certificates
const allCerts = await nmapApi.getAllCertificates();
```

---

### 5. Certificate Discovery (5 endpoints)
**File:** `src/lib/api/discovery.ts`

| Method | Endpoint | Function | Description |
|--------|----------|----------|-------------|
| POST | `/api/discovery/scan/ldap` | `discoveryApi.scanLDAP()` | Scan LDAP/Active Directory |
| POST | `/api/discovery/scan/cloud` | `discoveryApi.scanCloud()` | Scan cloud provider (AWS/Azure/GCP) |
| POST | `/api/discovery/scan/filesystem` | `discoveryApi.scanFilesystem()` | Scan filesystem directories |
| POST | `/api/discovery/schedule` | `discoveryApi.schedule()` | Schedule recurring discovery |
| GET | `/api/discovery/changes` | `discoveryApi.getChanges()` | Get discovery changes |

**Usage Example:**
```typescript
import { discoveryApi } from '@/lib/api';

// LDAP Scan
const ldapResults = await discoveryApi.scanLDAP({
  server: "ldap.example.com",
  port: "389",
  baseDN: "DC=example,DC=com",
  username: "CN=admin,DC=example,DC=com",
  password: "password"
});

// Cloud Scan (AWS)
const awsResults = await discoveryApi.scanCloud("aws", {
  accessKeyId: "YOUR_ACCESS_KEY",
  secretAccessKey: "YOUR_SECRET_KEY",
  region: "us-east-1",
  services: "acm,iam"
});

// Filesystem Scan
const fsResults = await discoveryApi.scanFilesystem("/etc/ssl/certs");

// Schedule recurring scan
const scheduled = await discoveryApi.schedule({
  name: "Daily Network Scan",
  discoveryType: "NMAP",
  configuration: {
    targets: [{ host: "10.0.0.0/24", ports: [{ port: 443 }] }]
  },
  schedule: "0 2 * * *"
});

// Get changes
const changes = await discoveryApi.getChanges();
```

---

### 6. Background Job Management (5 endpoints)
**File:** `src/lib/api/jobs.ts`

| Method | Endpoint | Function | Description |
|--------|----------|----------|-------------|
| GET | `/api/jobs/{jobId}` | `jobsApi.getById()` | Get job status and result |
| GET | `/api/jobs/my-jobs` | `jobsApi.getMyJobs()` | Get user's jobs |
| GET | `/api/jobs/status/{status}` | `jobsApi.getByStatus()` | Filter jobs by status |
| GET | `/api/jobs/running` | `jobsApi.getRunning()` | Get running jobs |
| GET | `/api/jobs/recent` | `jobsApi.getRecent()` | Get recent jobs (24h) |

**Usage Example:**
```typescript
import { jobsApi } from '@/lib/api';

// Poll job status
const job = await jobsApi.getById("job-uuid");
console.log(`Status: ${job.status}, Progress: ${job.progress}%`);

// Get all my jobs
const myJobs = await jobsApi.getMyJobs();

// Get failed jobs
const failedJobs = await jobsApi.getByStatus("FAILED");

// Get running jobs
const runningJobs = await jobsApi.getRunning();

// Get recent jobs
const recentJobs = await jobsApi.getRecent();
```

---

## 📋 Type Definitions

All TypeScript types are defined in `src/lib/api/types.ts`:

### Key Types:
- `CreateCARequest` - Root CA creation
- `CreateUserCertificateRequest` - User certificate creation
- `AddCertificateRequest` - Manual certificate import
- `CertificateResponse` - Certificate response
- `NmapScanRequest` - Network scan request
- `NmapCertificateScan` - Scanned certificate details
- `CAListResponse` - CA list response
- `LDAPScanRequest` / `LDAPScanResponse` - LDAP discovery
- `CloudScanRequest` / `CloudScanResponse` - Cloud discovery
- `FilesystemScanResponse` - Filesystem discovery
- `ScheduleDiscoveryRequest` / `ScheduledDiscovery` - Scheduled scans
- `DiscoveryChange` - Discovery change tracking
- `BackgroundJob` - Job status and tracking

---

## 🔐 Authentication

All endpoints require JWT authentication:

```typescript
import { authApi } from '@/lib/api';

// Login
const auth = await authApi.login({
  username: "admin@admin.com",
  password: "admin123"
});

// Token is automatically stored and used in subsequent requests
// via apiClient interceptors in src/lib/apiClient.ts
```

---

## 🚀 Component Integration

### IssueCertificateDialog
**Location:** `src/components/certificates/IssueCertificateDialog.tsx`

✅ **Integrated with:**
- `certificatesApi.createUserCertificate()` - Issues user certificates
- `caApi.list()` - Fetches available CAs for dropdown

**Usage:**
```tsx
import { IssueCertificateDialog } from '@/components/certificates/IssueCertificateDialog';

<IssueCertificateDialog onSuccess={(request) => {
  console.log('Certificate issued:', request);
}} />
```

---

## 📊 Complete Endpoint Summary

| Category | Endpoints | File | Status |
|----------|-----------|------|--------|
| CA Management | 5 | `ca.ts` | ✅ Complete |
| User Certificates | 1 | `certificates.ts` | ✅ Complete |
| Certificate Lifecycle | 6 | `certificates.ts` | ✅ Complete |
| Network Scanning | 2 | `nmap.ts` | ✅ Complete |
| Certificate Discovery | 5 | `discovery.ts` | ✅ Complete |
| Background Jobs | 5 | `jobs.ts` | ✅ Complete |
| **TOTAL** | **24** | | **✅ All Integrated** |

---

## 🔄 Two Certificate Storage Systems

CertAxis uses **TWO** separate storage systems:

1. **Certificate Table** (`/api/certificates/all`)
   - Manually added/imported certificates
   - Use `certificatesApi.add()` to add
   - Returns `CertificateResponse[]`

2. **NmapCertificateScan Table** (`/api/nmap/certificates`)
   - Issued certificates (via `/api/certificates/issue`)
   - Scanned certificates (via `/api/nmap/scan`)
   - Returns `NmapCertificateScan[]`

---

## 🛠️ Configuration

**API Base URL:** Configured in `src/lib/api/apiConfig.ts`

```typescript
export const API_BASE_URL = "http://15.206.141.103:8080";
export const API_TIMEOUT = 30000;
```

**Axios Client:** `src/lib/apiClient.ts`
- Automatic JWT token injection
- Request/response interceptors
- 401 unauthorized handling
- Auto-redirect to login on token expiration

---

## 📝 Algorithm Selection Guide

| Use Case | Recommended Algorithm | Validity |
|----------|----------------------|----------|
| Root CA | RSA4096, ECDSA_P384 | 10-20 years |
| Intermediate CA | RSA3072, ECDSA_P256 | 5-10 years |
| Server SSL/TLS | RSA2048, ECDSA_P256 | 1-2 years |
| User Certificates | RSA2048, ECDSA_P256 | 1 year |
| IoT Devices | ECDSA_P256 | 2-5 years |

---

## 🎯 Common Workflows

### Workflow 1: Setup PKI and Issue Certificate

```typescript
// 1. Create Root CA
await caApi.create({
  commonName: "Acme Root CA",
  organization: "Acme Corp",
  signatureAlgorithm: "RSA4096",
  validityInDays: 7300,
  alias: "acme-root-ca"
});

// 2. Create Intermediate CA
await certificatesApi.createUserCertificate({
  commonName: "Acme Intermediate CA",
  organization: "Acme Corp",
  keyPairAlgorithm: "RSA3072",
  validityInDays: 3650,
  alias: "acme-intermediate-ca",
  caAlias: "acme-root-ca",
  password: "SecurePassword123"
});

// 3. Issue Server Certificate
await certificatesApi.issue("www.example.com", "acme-intermediate-ca");
```

### Workflow 2: Certificate Renewal

```typescript
// Get all certificates
const certs = await nmapApi.getAllCertificates();

// Find expiring certificates (within 30 days)
const expiringThreshold = new Date();
expiringThreshold.setDate(expiringThreshold.getDate() + 30);

const expiring = certs.filter(cert => 
  new Date(cert.notAfter) < expiringThreshold && !cert.revokedAt
);

// Renew each
for (const cert of expiring) {
  await certificatesApi.renew(cert.id);
}
```

### Workflow 3: Network Discovery

```typescript
// Scan network
const discovered = await nmapApi.scan({
  targets: [{
    host: "192.168.1.0/24",
    ports: [{ port: 443 }]
  }]
});

// Import specific certificates
for (const cert of discovered) {
  if (cert.host.includes("important.com")) {
    await certificatesApi.add({
      userId: 1,
      certificateName: `Discovered: ${cert.host}`,
      certData: cert.pem
    });
  }
}
```

---

## ✅ Integration Status

**Last Updated:** January 5, 2026  
**Version:** 1.0.0  
**Status:** All 14 endpoints integrated and tested  
**TypeScript:** Full type safety ✅  
**Error Handling:** Complete ✅  
**Components:** IssueCertificateDialog updated ✅

---

## 📞 Support

For API documentation, refer to the complete CertAxis API documentation provided by the backend team.

**Server:** http://15.206.141.103:8080  
**API Version:** 2.0  
**Authentication:** JWT Bearer Token
