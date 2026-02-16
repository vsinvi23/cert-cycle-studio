# CertAxis API - Pagination and Search Guide

This document provides comprehensive documentation for all CertAxis APIs that support pagination and search functionality.

---

## Table of Contents
1. [Overview](#overview)
2. [Pagination Response Format](#pagination-response-format)
3. [User Management APIs](#user-management-apis)
4. [Role Management APIs](#role-management-apis)
5. [Audit Logs APIs](#audit-logs-apis)
6. [Alert Management APIs](#alert-management-apis)
7. [Common Parameters](#common-parameters)
8. [Frontend Implementation Examples](#frontend-implementation-examples)

---

## Overview

CertAxis uses **Spring Boot PageImpl** format for all paginated responses. This ensures consistency across all endpoints and provides rich metadata for pagination controls.

### Key Features:
- ✅ Consistent pagination across all endpoints
- ✅ Search/filter support
- ✅ Sorting capabilities (ASC/DESC)
- ✅ Total count and page metadata
- ✅ Zero-based page numbering

---

## Pagination Response Format

All paginated endpoints return the following structure:

```typescript
{
  "content": T[],              // Array of actual data
  "pageable": {
    "pageNumber": number,      // Current page (0-based)
    "pageSize": number,        // Items per page
    "offset": number,          // Total offset
    "paged": boolean,
    "unpaged": boolean,
    "sort": {
      "sorted": boolean,
      "unsorted": boolean,
      "empty": boolean
    }
  },
  "totalElements": number,     // Total items across all pages
  "totalPages": number,        // Total number of pages
  "last": boolean,             // Is this the last page?
  "first": boolean,            // Is this the first page?
  "numberOfElements": number,  // Items in current page
  "size": number,              // Page size
  "number": number,            // Current page number
  "empty": boolean             // Is the page empty?
}
```

### TypeScript Interface:

```typescript
export interface PaginatedResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    offset: number;
    paged: boolean;
    unpaged: boolean;
    sort: {
      sorted: boolean;
      unsorted: boolean;
      empty: boolean;
    };
  };
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
  numberOfElements: number;
  size: number;
  number: number;
  empty: boolean;
}
```

---

## User Management APIs

### 1. Get All Users (Paginated)

**Endpoint:** `GET /api/users`

**Description:** Retrieve paginated list of all users with optional sorting.

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | number | No | 0 | Page number (0-based) |
| `size` | number | No | 20 | Items per page (max: 100) |
| `sortBy` | string | No | "id" | Field to sort by (e.g., "username", "email", "createdAt") |
| `sortOrder` | string | No | "ASC" | Sort direction: "ASC" or "DESC" |

**Example Request:**
```
GET /api/users?page=0&size=10&sortBy=username&sortOrder=ASC
```

**Example Response:**
```json
{
  "content": [
    {
      "id": 1,
      "username": "admin",
      "email": "admin@example.com",
      "firstName": "Admin",
      "lastName": "User",
      "enabled": true,
      "roles": [
        {
          "id": 1,
          "name": "ROLE_ADMIN",
          "description": "Administrator role"
        }
      ],
      "createdAt": "2026-01-06T21:29:53.159006Z"
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 10,
    "offset": 0,
    "paged": true,
    "unpaged": false
  },
  "totalElements": 25,
  "totalPages": 3,
  "first": true,
  "last": false,
  "numberOfElements": 10,
  "size": 10,
  "number": 0,
  "empty": false
}
```

**Frontend Usage:**
```typescript
import { usersApi } from "@/lib/api";

// Get first page with 10 users, sorted by username
const response = await usersApi.getAllUsers({
  page: 0,
  size: 10,
  sortBy: "username",
  sortOrder: "ASC"
});

// Extract users from response
const users = response.content;
const totalUsers = response.totalElements;
const totalPages = response.totalPages;
```

---

### 2. Search Users

**Endpoint:** `GET /api/users/search`

**Description:** Search users by username, email, first name, or last name with pagination.

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `searchTerm` | string | **Yes** | - | Search query (matches username, email, firstName, lastName) |
| `page` | number | No | 0 | Page number (0-based) |
| `size` | number | No | 20 | Items per page |
| `sortBy` | string | No | "id" | Field to sort by |
| `sortOrder` | string | No | "ASC" | Sort direction: "ASC" or "DESC" |

**Example Request:**
```
GET /api/users/search?searchTerm=john&page=0&size=10&sortBy=lastName&sortOrder=ASC
```

**Example Response:**
```json
{
  "content": [
    {
      "id": 5,
      "username": "johndoe",
      "email": "john.doe@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "enabled": true,
      "roles": [
        {
          "id": 2,
          "name": "ROLE_USER",
          "description": "Standard user"
        }
      ]
    }
  ],
  "totalElements": 3,
  "totalPages": 1,
  "numberOfElements": 3
}
```

**Frontend Usage:**
```typescript
// Search for users matching "john"
const results = await usersApi.searchUsers({
  searchTerm: "john",
  page: 0,
  size: 10,
  sortBy: "lastName",
  sortOrder: "ASC"
});

const matchedUsers = results.content;
```

---

### 3. Get Users by Role

**Endpoint:** `GET /api/users/role/{roleName}`

**Description:** Get all users assigned to a specific role with pagination.

**Path Parameters:**
- `roleName` (string) - Role name (e.g., "ROLE_ADMIN", "ROLE_USER")

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | number | No | 0 | Page number (0-based) |
| `size` | number | No | 20 | Items per page |

**Example Request:**
```
GET /api/users/role/ROLE_ADMIN?page=0&size=10
```

**Frontend Usage:**
```typescript
// Get all admin users
const adminUsers = await usersApi.getUsersByRole("ROLE_ADMIN", {
  page: 0,
  size: 20
});

const admins = adminUsers.content;
const totalAdmins = adminUsers.totalElements;
```

---

## Role Management APIs

### 1. Get All Roles (Paginated)

**Endpoint:** `GET /api/roles`

**Description:** Retrieve all roles with pagination support.

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | number | No | 0 | Page number (0-based) |
| `size` | number | No | 20 | Items per page |

**Example Request:**
```
GET /api/roles?page=0&size=20
```

**Example Response:**
```json
{
  "content": [
    {
      "id": 1,
      "name": "ROLE_ADMIN",
      "description": "Administrator role with full system access",
      "permissions": [
        "CERT_READ",
        "CERT_CREATE",
        "CERT_UPDATE",
        "CERT_DELETE",
        "USER_MANAGE",
        "SYSTEM_CONFIG"
      ],
      "enabled": true,
      "createdAt": "2026-01-06T21:29:53.159006Z",
      "isSystemRole": true,
      "userCount": 5
    }
  ],
  "totalElements": 3,
  "totalPages": 1,
  "numberOfElements": 3
}
```

**Frontend Usage:**
```typescript
import { rolesApi } from "@/lib/api";

const response = await rolesApi.getAllRoles();

// IMPORTANT: Extract content from paginated response
const roles = response.content || [];
const totalRoles = response.totalElements;
```

---

### 2. Get Users by Role ID

**Endpoint:** `GET /api/roles/{roleId}/users`

**Description:** Get all users assigned to a specific role by role ID.

**Path Parameters:**
- `roleId` (number) - Role identifier

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | number | No | 0 | Page number (0-based) |
| `size` | number | No | 20 | Items per page |

**Example Request:**
```
GET /api/roles/1/users?page=0&size=10
```

**Frontend Usage:**
```typescript
// Get all users with role ID 1
const response = await rolesApi.getUsersByRole(1, {
  page: 0,
  size: 10
});

const users = response.content;
const totalUsers = response.totalElements;
```

---

## Audit Logs APIs

### Get Audit Logs (Filtered)

**Endpoint:** `GET /api/audit-logs`

**Description:** Retrieve audit logs with optional filtering by user, entity, and action type.

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `username` | string | No | - | Filter by username who performed the action |
| `entityType` | string | No | - | Filter by entity type (e.g., "CERTIFICATE", "USER", "ROLE") |
| `action` | string | No | - | Filter by action type (e.g., "CREATE", "UPDATE", "DELETE") |
| `page` | number | No | 0 | Page number (0-based) |
| `size` | number | No | 20 | Items per page |

**Example Request:**
```
GET /api/audit-logs?username=admin&entityType=CERTIFICATE&action=CREATE&page=0&size=20
```

**Example Response:**
```json
{
  "content": [
    {
      "id": 1,
      "action": "CREATE",
      "entityType": "CERTIFICATE",
      "entityId": "cert-123",
      "performedBy": "admin",
      "timestamp": "2026-01-10T10:30:00Z",
      "ipAddress": "192.168.1.100",
      "status": "SUCCESS",
      "details": "Created certificate for example.com"
    }
  ],
  "totalElements": 417,
  "totalPages": 21,
  "numberOfElements": 20
}
```

**Frontend Usage:**
```typescript
import { reportsApi } from "@/lib/api";

const logs = await reportsApi.getAuditLogs({
  username: "admin",
  entityType: "CERTIFICATE",
  action: "CREATE"
});

// Extract logs from paginated response
const auditLogs = logs.content || [];
```

---

## Alert Management APIs

### Get Alert History

**Endpoint:** `GET /api/alerts/history`

**Description:** Retrieve alert history with optional time-based filtering.

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `startDate` | string | No | - | Filter alerts from this date (ISO 8601 format) |
| `endDate` | string | No | - | Filter alerts until this date (ISO 8601 format) |
| `page` | number | No | 0 | Page number (0-based) |
| `size` | number | No | 20 | Items per page |

**Example Request:**
```
GET /api/alerts/history?startDate=2026-01-01T00:00:00Z&endDate=2026-01-10T23:59:59Z&page=0&size=50
```

**Example Response:**
```json
{
  "content": [
    {
      "id": 1,
      "type": "EXPIRY_WARNING",
      "severity": "WARNING",
      "message": "Certificate example.com will expire in 7 days",
      "timestamp": "2026-01-10T08:00:00Z",
      "acknowledged": false
    }
  ],
  "totalElements": 45,
  "totalPages": 1,
  "numberOfElements": 45
}
```

**Frontend Usage:**
```typescript
import { alertsApi } from "@/lib/api";

const history = await alertsApi.getAlertHistory({
  startDate: "2026-01-01T00:00:00Z",
  endDate: "2026-01-10T23:59:59Z"
});

const alerts = history.content || [];
```

---

## Common Parameters

### Standard Query Parameters

All paginated endpoints support these standard parameters:

| Parameter | Type | Default | Range | Description |
|-----------|------|---------|-------|-------------|
| `page` | number | 0 | 0 - ∞ | Zero-based page index |
| `size` | number | 20 | 1 - 100 | Number of items per page |
| `sortBy` | string | "id" | - | Field name to sort by |
| `sortOrder` | string | "ASC" | ASC, DESC | Sort direction |

### Sort Fields by Entity

**Users:**
- `id`, `username`, `email`, `firstName`, `lastName`, `createdAt`, `lastLoginAt`

**Roles:**
- `id`, `name`, `createdAt`, `updatedAt`

**Audit Logs:**
- `id`, `timestamp`, `action`, `entityType`, `performedBy`

**Alerts:**
- `id`, `timestamp`, `severity`, `type`

---

## Frontend Implementation Examples

### 1. Handling Paginated Responses

```typescript
// CORRECT: Extract content from paginated response
const fetchData = async () => {
  try {
    const response = await usersApi.getAllUsers({ page: 0, size: 10 });
    
    // Extract content array from Spring Boot PageImpl
    if (response && typeof response === 'object' && 'content' in response) {
      setUsers(Array.isArray(response.content) ? response.content : []);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } else {
      // Fallback for non-paginated responses
      setUsers(Array.isArray(response) ? response : []);
    }
  } catch (error) {
    console.error("Failed to fetch users:", error);
    setUsers([]); // Always set empty array on error
  }
};
```

### 2. Pagination Controls Component

```typescript
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function PaginationControls({ currentPage, totalPages, onPageChange }: PaginationProps) {
  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 0}
      >
        Previous
      </Button>
      <span>
        Page {currentPage + 1} of {totalPages}
      </span>
      <Button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages - 1}
      >
        Next
      </Button>
    </div>
  );
}
```

### 3. Search with Debouncing

```typescript
import { useState, useEffect } from "react";
import { usersApi } from "@/lib/api";

function UserSearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // Debounce search
  useEffect(() => {
    if (!searchTerm) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await usersApi.searchUsers({
          searchTerm,
          page: 0,
          size: 10
        });
        setResults(response.content || []);
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setLoading(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [searchTerm]);

  return (
    <div>
      <Input
        placeholder="Search users..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      {loading && <p>Searching...</p>}
      {results.map(user => (
        <div key={user.id}>{user.username}</div>
      ))}
    </div>
  );
}
```

### 4. Table with Sorting

```typescript
function UserTable() {
  const [users, setUsers] = useState([]);
  const [sortBy, setSortBy] = useState("username");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("ASC");
  const [page, setPage] = useState(0);

  const fetchUsers = async () => {
    const response = await usersApi.getAllUsers({
      page,
      size: 20,
      sortBy,
      sortOrder
    });
    setUsers(response.content || []);
  };

  useEffect(() => {
    fetchUsers();
  }, [page, sortBy, sortOrder]);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "ASC" ? "DESC" : "ASC");
    } else {
      setSortBy(field);
      setSortOrder("ASC");
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead onClick={() => handleSort("username")}>
            Username {sortBy === "username" && (sortOrder === "ASC" ? "↑" : "↓")}
          </TableHead>
          <TableHead onClick={() => handleSort("email")}>
            Email {sortBy === "email" && (sortOrder === "ASC" ? "↑" : "↓")}
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map(user => (
          <TableRow key={user.id}>
            <TableCell>{user.username}</TableCell>
            <TableCell>{user.email}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

---

## Best Practices

### ✅ DO:
- Always extract `content` array from paginated responses
- Handle empty responses gracefully with fallback to empty array
- Use debouncing for search inputs (300-500ms)
- Display loading states during API calls
- Show pagination controls when `totalPages > 1`
- Validate page numbers (0-based, within totalPages range)
- Cache responses when appropriate (consider SWR or React Query)

### ❌ DON'T:
- Don't assume API returns arrays directly
- Don't use negative page numbers
- Don't request page size > 100
- Don't make multiple simultaneous requests for the same data
- Don't forget error handling and loading states
- Don't mutate response objects directly

---

## Error Handling

### Common Errors:

**400 Bad Request:**
- Invalid page number (< 0)
- Invalid page size (< 1 or > 100)
- Invalid sort field name
- Missing required search parameters

**401 Unauthorized:**
- Missing or invalid JWT token
- Expired authentication

**403 Forbidden:**
- Insufficient permissions for the requested resource

**500 Internal Server Error:**
- Database connection issues
- Server configuration errors

### Error Handling Example:

```typescript
try {
  const response = await usersApi.getAllUsers({ page: 0, size: 10 });
  setUsers(response.content || []);
} catch (error: any) {
  if (error.status === 401) {
    // Redirect to login
    navigate("/login");
  } else if (error.status === 403) {
    toast({
      title: "Access Denied",
      description: "You don't have permission to view users",
      variant: "destructive"
    });
  } else {
    toast({
      title: "Error",
      description: error.message || "Failed to load users",
      variant: "destructive"
    });
  }
  setUsers([]);
}
```

---

## Summary

This guide covers all paginated and searchable APIs in the CertAxis system:

| API Category | Endpoints | Pagination | Search | Sort |
|-------------|-----------|------------|--------|------|
| **User Management** | 3 | ✅ | ✅ | ✅ |
| **Role Management** | 2 | ✅ | ❌ | ❌ |
| **Audit Logs** | 1 | ✅ | ✅ (filter) | ✅ |
| **Alerts** | 1 | ✅ | ✅ (date range) | ❌ |

**Total:** 7 endpoints with full pagination support

---

*Last Updated: January 10, 2026*  
*Version: 1.0*  
*CertAxis PKI Lifecycle Manager*
