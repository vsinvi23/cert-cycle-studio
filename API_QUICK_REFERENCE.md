# CertAxis API - Quick Reference

Quick reference for developers working with the CertAxis API integration.

**Total Endpoints:** 24  
**Categories:** 6

## 🚀 Quick Start

### 1. Authentication
```typescript
import { authApi } from '@/lib/api';

const { token } = await authApi.login({
  username: "admin@admin.com",
  password: "admin123"
});
// Token is automatically stored and used in all subsequent requests
```

### 2. Import APIs
```typescript
import { 
  caApi,              // CA Management
  certificatesApi,    // Certificate Lifecycle
  nmapApi,            // Network Scanning
  discoveryApi,       // Certificate Discovery
  jobsApi             // Background Jobs
} from '@/lib/api';
```

---

## 📋 Common Operations

### Certificate Authority

```typescript
// Create Root CA
await caApi.create({
  commonName: "MyCompany Root CA",
  signatureAlgorithm: "RSA4096",
  validityInDays: 3650,
  alias: "mycompany-root-ca"
});

// List all CAs
const cas = await caApi.list(0, 10);

// Get specific CA
const ca = await caApi.getByAlias("mycompany-root-ca");

// Revoke CA
await caApi.revoke("compromised-ca");

// Delete CA
await caApi.delete("old-test-ca");
```

### User Certificates

```typescript
// Issue user certificate
await certificatesApi.createUserCertificate({
  commonName: "John Doe",
  organization: "MyCompany Inc",
  keyPairAlgorithm: "RSA2048",
  validityInDays: 365,
  alias: "john-doe-cert",
  caAlias: "intermediate-ca",
  password: "securePassword123"
});
```

### Server Certificates

```typescript
// Issue server certificate
const cert = await certificatesApi.issue(
  "api.example.com",
  "intermediate-ca"
);

// Renew certificate
const renewed = await certificatesApi.renew(501);

// Revoke certificate
await certificatesApi.revoke(501, "Key Compromise");
```

### Manual Certificate Management

```typescript
// Add certificate manually
await certificatesApi.add({
  userId: 1,
  certificateName: "example.com SSL",
  certData: "-----BEGIN CERTIFICATE-----\n...\n-----END CERTIFICATE-----"
});

// Get all manual certificates
const manualCerts = await certificatesApi.getAll();

// Get user's certificates
const userCerts = await certificatesApi.getByUser(1);
```

### Network Scanning

```typescript
// Scan network
const results = await nmapApi.scan({
  targets: [
    {
      host: "example.com",
      ports: [{ port: 443 }]
    },
    {
      host: "192.168.1.0/24",
      ports: [
        { port: 443 },
        { start: 8443, end: 8445 }
      ]
    }
  ]
});

// Get all scanned/issued certificates
const allCerts = await nmapApi.getAllCertificates();
```

---

## 🔑 Algorithm Reference

```typescript
// Signature Algorithms for CAs
type CAAlgorithm = 
  | "RSA2048" 
  | "RSA3072" 
  | "RSA4096" 
  | "ECDSA_P256" 
  | "ECDSA_P384";

// Key Pair Algorithms for User Certificates
type KeyPairAlgorithm = 
  | "RSA2048" 
  | "RSA3072" 
  | "RSA4096" 
  | "ECDSA_P256" 
  | "ECDSA_P384";
```

**Recommendations:**
- **Root CA:** RSA4096 or ECDSA_P384 (10-20 years)
- **Intermediate CA:** RSA3072 or ECDSA_P256 (5-10 years)
- **Server Certs:** RSA2048 or ECDSA_P256 (1-2 years)
- **User Certs:** RSA2048 or ECDSA_P256 (1 year)

---

## 📊 Type Reference

### CreateCARequest
```typescript
{
  commonName: string;
  organization?: string;
  organizationalUnit?: string;
  locality?: string;
  state?: string;
  country?: string;
  signatureAlgorithm: CAAlgorithm;
  validityInDays: number;
  alias: string;
}
```

### CreateUserCertificateRequest
```typescript
{
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
```

### NmapScanRequest
```typescript
{
  targets: Array<{
    host: string;
    ports: Array<{
      port?: number;
      start?: number;
      end?: number;
    }>;
  }>;
}
```

---

## ⚠️ Error Handling

```typescript
try {
  await certificatesApi.issue("example.com", "my-ca");
} catch (error) {
  if (error.response?.status === 404) {
    console.error("CA not found");
  } else if (error.response?.status === 401) {
    console.error("Authentication failed");
  } else {
    console.error("Failed to issue certificate");
  }
}
```

**Common Status Codes:**
- `400` - Bad Request (missing/invalid parameters)
- `401` - Unauthorized (invalid/missing token)
- `404` - Not Found (CA/certificate doesn't exist)
- `409` - Conflict (duplicate alias)
- `500` - Internal Server Error

---

## 🔄 Two Storage Systems

### 1. Manual Certificates
```typescript
// Add manually
await certificatesApi.add({...});

// Retrieve
const certs = await certificatesApi.getAll();
// Returns: CertificateResponse[]
```

### 2. Issued/Scanned Certificates
```typescript
// Issue via CA
await certificatesApi.issue("host.com", "ca-alias");

// Scan network
await nmapApi.scan({...});

// Retrieve all
const certs = await nmapApi.getAllCertificates();
// Returns: NmapCertificateScan[]
```

---

## 🔍 Certificate Discovery

```typescript
// LDAP Scan
const ldapResults = await discoveryApi.scanLDAP({
  server: "ldap.example.com",
  port: "389",
  baseDN: "DC=example,DC=com",
  username: "CN=admin,DC=example,DC=com",
  password: "password"
});

// Cloud Scan (AWS/Azure/GCP)
const awsResults = await discoveryApi.scanCloud("aws", {
  accessKeyId: "KEY",
  secretAccessKey: "SECRET",
  region: "us-east-1",
  services: "acm,iam"
});

// Filesystem Scan
const fsResults = await discoveryApi.scanFilesystem("/etc/ssl/certs");

// Schedule recurring discovery
const scheduled = await discoveryApi.schedule({
  name: "Daily Network Scan",
  discoveryType: "NMAP",
  configuration: { targets: [...] },
  schedule: "0 2 * * *"
});

// Get discovery changes
const changes = await discoveryApi.getChanges();
```

---

## 📊 Background Jobs

```typescript
// Get job status
const job = await jobsApi.getById("job-uuid");

// Poll until complete
while (job.status === "RUNNING") {
  await new Promise(r => setTimeout(r, 2000));
  job = await jobsApi.getById("job-uuid");
}

// Get my jobs
const myJobs = await jobsApi.getMyJobs();

// Filter by status
const failedJobs = await jobsApi.getByStatus("FAILED");

// Get running jobs
const runningJobs = await jobsApi.getRunning();

// Get recent jobs (24h)
const recentJobs = await jobsApi.getRecent();
```

---

## 🎯 Component Usage

### IssueCertificateDialog
```tsx
import { IssueCertificateDialog } from '@/components/certificates/IssueCertificateDialog';

<IssueCertificateDialog 
  onSuccess={(request) => {
    console.log('Certificate issued:', request);
    // Refresh your data
  }} 
/>
```

---

## 📁 Import Paths

```typescript
// API Functions
import { 
  caApi, 
  certificatesApi, 
  nmapApi,
  discoveryApi,
  jobsApi
} from '@/lib/api';

// Types
import type { 
  CreateCARequest,
  CreateUserCertificateRequest,
  NmapScanRequest,
  NmapCertificateScan,
  CertificateResponse,
  LDAPScanRequest,
  CloudScanRequest,
  BackgroundJob
} from '@/lib/api/types';

// Components
import { IssueCertificateDialog } from '@/components/certificates/IssueCertificateDialog';
```

---

## 🔧 Configuration

**File:** `src/lib/api/apiConfig.ts`
```typescript
export const API_BASE_URL = "http://15.206.141.103:8080";
export const API_TIMEOUT = 30000;
```

**File:** `src/lib/apiClient.ts`
- Automatic JWT token injection
- Request/response interceptors
- Auto-redirect on 401

---

## 📚 Full Documentation

- **[API_INTEGRATION.md](./API_INTEGRATION.md)** - Complete guide with all endpoints
- **[INTEGRATION_SUMMARY.md](./INTEGRATION_SUMMARY.md)** - Integration status report

---

**Last Updated:** January 5, 2026  
**API Version:** 2.0  
**Server:** http://15.206.141.103:8080
