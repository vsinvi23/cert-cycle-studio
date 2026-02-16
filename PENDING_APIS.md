# CertAxis Frontend - Pending API Integration

**Document Version**: 1.0  
**Last Updated**: February 15, 2026  
**Status**: ⏳ **Not Yet Integrated**

This document lists backend API endpoints that are **available but not yet integrated** in the CertAxis frontend application.

---

## Summary Statistics

| Category | Missing Endpoints | Priority |
|----------|------------------|----------|
| **User Management** | 3 | 🔴 High |
| **Certificate Templates** | 0 | ✅ Complete |
| **Integration APIs** | 5 | 🟡 Medium |
| **ACME Monitoring** | 7 | 🟡 Medium |
| **Alert Management** | 4 | 🟡 Medium |
| **Discovery** | 1 | 🟢 Low |
| **Notification Preferences** | 1 | 🟢 Low |
| **ACME Providers (Non-Paginated)** | 2 | 🟢 Low |
| **Role Management** | 1 | 🟢 Low |
| **TOTAL** | **24 Endpoints** | - |

---

## 1. User Management (⏳ 3 endpoints pending)

### Missing Endpoints - `UserManagementController`

| Endpoint | Method | Priority | Notes |
|----------|--------|----------|-------|
| `/api/users/{userId}/activity` | GET | 🔴 High | User activity logs - useful for audit trail |
| `/api/users/{userId}/roles` | PUT | 🔴 High | Bulk assign roles (current implementation adds one at a time) |
| `/api/users/{userId}/enable` | PUT | 🔴 High | Enable user (frontend uses `/enabled/{enabled}` instead) |
| `/api/users/{userId}/disable` | PUT | 🔴 High | Disable user (frontend uses `/enabled/{enabled}` instead) |

**Note**: Frontend currently uses `/api/users/{userId}/enabled/{enabled}` which is functionally equivalent to enable/disable endpoints. Backend should standardize on one approach.

**Recommendation**: 
- Implement user activity logs in a dedicated Activity/Audit tab
- Add bulk role assignment UI to improve UX
- Verify enable/disable vs enabled/{enabled} endpoint consistency with backend team

---

## 2. Integration APIs (⏳ 3 endpoints pending)

### Missing Endpoints - `IntegrationController`

| Endpoint | Method | Priority | Notes |
|----------|--------|----------|-------|
| `/api/integrations/jenkins/configure` | POST | 🟡 Medium | Jenkins CI/CD integration |
| `/api/integrations/kubernetes/configure` | POST | 🟡 Medium | Kubernetes integration |
| `/api/integrations/acme/configure` | POST | 🟡 Medium | ACME configuration (different from provider setup) |
| `/api/integrations/acme/order` | POST | 🟡 Medium | Direct ACME order (legacy) |
| `/api/integrations/acme/validate` | POST | 🟡 Medium | Domain validation (legacy) |

**Recommendation**:
- Create dedicated Integration page
- Add Jenkins and Kubernetes configuration dialogs
- ACME integrations may be superseded by newer `/api/acme/*` endpoints

---

## 3. ACME Monitoring (⏳ 7 endpoints pending)

### Missing Endpoints - `AcmeMonitoringController`

| Endpoint | Method | Priority | Notes |
|----------|--------|----------|-------|
| `/api/acme/monitoring/webhooks/active` | GET | 🟡 Medium | Filter active webhooks |
| `/api/acme/monitoring/webhooks/{id}/test` | POST | ✅ Integrated | Test webhook delivery (UI ready, awaiting backend integration) |
| `/api/acme/monitoring/webhooks/problematic` | GET | 🟡 Medium | Webhooks with high failure rate |
| `/api/acme/monitoring/metrics/latest` | GET | 🟢 Low | Latest metrics snapshot |
| `/api/acme/monitoring/metrics/summary` | GET | 🟢 Low | Summary statistics |
| `/api/acme/monitoring/metrics/week` | GET | 🟢 Low | Last 7 days metrics |
| `/api/acme/monitoring/metrics/month` | GET | 🟢 Low | Last 30 days metrics |
| `/api/acme/monitoring/metrics/low-performance` | GET | 🟢 Low | Low performance metrics |
| `/api/acme/monitoring/metrics/comparison` | GET | 🟢 Low | Provider comparison |

**Recent Updates (Feb 17, 2026)**:
- ✅ **Webhook event selection UI** - Added checkbox UI for selecting webhook events (ORDER_CREATED, ORDER_COMPLETED, etc.)
- ✅ **Webhook events display** - Added Events column in webhook table showing selected events as badges
- ✅ **Events field type safety** - Frontend now properly handles events as `string[]` array (aligned with backend fix)
- ✅ **Webhook test button** - Added test webhook button in UI (ready for backend integration)

**Recommendation**:
- Add webhook testing feature integration once backend endpoint is confirmed working
- Create ACME metrics dashboard with time-series charts
- Implement webhook health monitoring panel

---

## 4. Alert Management (⏳ 2 endpoints pending)

### Missing Endpoints - `AlertController`

| Endpoint | Method | Priority | Notes |
|----------|--------|----------|-------|
| `/api/alerts/configurations/{id}` | GET | 🟡 Medium | Get specific alert configuration |
| `/api/alerts/configurations/{id}` | PUT | 🟡 Medium | Update alert configuration |
| `/api/alerts/configurations/{id}` | DELETE | 🟡 Medium | Delete alert configuration |
| `/api/alerts/test/{id}` | POST | 🟡 Medium | Test alert delivery |

**Recommendation**:
- Add Edit and Delete actions to alert configuration table
- Implement "Test Alert" button for each configuration

---

## 5. Discovery & Scanning (⏳ 1 endpoint pending)

### Missing Endpoints - `DiscoveryController`

| Endpoint | Method | Priority | Notes |
|----------|--------|----------|-------|
| `/api/discovery/changes` | GET | 🟢 Low | Non-paginated discovery changes (paginated version exists) |

**Recommendation**:
- Already using paginated version `/api/discovery/changes/paginated`
- No action needed unless non-paginated version is required

---

## 6. Notification Preferences (⏳ 1 endpoint pending)

### Missing Endpoints - `AlertController`

| Endpoint | Method | Priority | Notes |
|----------|--------|----------|-------|
| `/api/notifications/preferences` | GET | 🟢 Low | User notification preferences |

**Recommendation**:
- Add user notification preferences in profile settings
- Allow users to configure email/SMS/webhook preferences

---

## 7. ACME Providers (⏳ 2 endpoints pending)

### Missing Endpoints - `AcmeController`

| Endpoint | Method | Priority | Notes |
|----------|--------|----------|-------|
| `/api/acme/providers` | GET | 🟢 Low | List all providers (non-paginated) |
| `/api/acme/accounts` | GET | 🟢 Low | List all accounts (non-paginated) |


---

## 8. Role Management (⏳ 1 endpoint pending)

### Missing Endpoints - `RoleManagementController`

| Endpoint | Method | Priority | Notes |
|----------|--------|----------|-------|
| `/api/roles/search` | GET | 🟢 Low | Search roles by name/description (paginated `/api/roles` exists) |

**Recommendation**:
- Frontend uses `/api/roles` with pagination which likely supports filtering
- Dedicated search endpoint is redundant unless specific search functionality is required
**Recommendation**:
- Already using paginated versions:
  - `/api/acme/providers/paginated`
  - `/api/acme/accounts/paginated`
- No action needed unless non-paginated versions are required

---

## Implementation Roadmap

### Phase 1: High Priority (🔴)
**Target**: Sprint 1 (2 weeks)

1. **User Activity Logs**
   - Endpoint: `GET /api/users/{userId}/activity`
   - Page: Add "Activity" tab in User Details page
   - Components: Activity timeline component

2. **Bulk Role Assignment**
   - Endpoint: `PUT /api/users/{userId}/roles`
   - Page: User Management
   - Components: Multi-select role dropdown

**Effort**: 3-5 days

---

### Phase 2: Medium Priority (🟡)
**Target**: Sprint 2 (2 weeks)

1. **ACME Webhook Testing**
   - Endpoint: `POST /api/acme/monitoring/webhooks/{id}/test`
   - Page: ACME Monitoring
   - Components: "Test Webhook" button

2. **ACME Webhook Health**
   - Endpoints: 
     - `GET /api/acme/monitoring/webhooks/active`
     - `GET /api/acme/monitoring/webhooks/problematic`
   - Page: ACME Monitoring
   - Components: Webhook health dashboard

3. **Alert Configuration Management**
   - Endpoints:
     - `GET /api/alerts/configurations/{id}`
     - `PUT /api/alerts/configurations/{id}`
     - `DELETE /api/alerts/configurations/{id}`
     - `POST /api/alerts/test/{id}`
   - Page: Alerts page
   - Components: Edit dialog, Delete confirmation, Test button

4. **Integration Management Page**
   - Endpoints:
     - `POST /api/integrations/jenkins/configure`
     - `POST /api/integrations/kubernetes/configure`
   - New Page: Integrations
   - Components: Jenkins config form, K8s config form

**Effort**: 7-10 days

---

### Phase 3: Low Priority (🟢)
**Target**: Sprint 3 (1-2 weeks)

1. **ACME Metrics Dashboard**
   - Endpoints:
     - `GET /api/acme/monitoring/metrics/latest`
     - `GET /api/acme/monitoring/metrics/summary`
     - `GET /api/acme/monitoring/metrics/week`
     - `GET /api/acme/monitoring/metrics/month`
     - `GET /api/acme/monitoring/metrics/comparison`
   - Page: ACME Monitoring (new tab)
   - Components: Time-series charts, comparison charts

2. **User Notification Preferences**
   - Endpoint: `GET /api/n3
Pending Integration: 27
Deprecated/Redundant: 5 (non-paginated versions + alternate enable/disable)

Integration Coverage: 82.0

---

## API Coverage Summary

### Overall Integration Status
11 | 7 | 61.1
```4 | 11 | 3 | 78.6% |
| **Certificates** | 12 | 12 | 0 | 100% ✅ |
| **CA Management** | 5 | 5 | 0 | 100% ✅ |
| **ACME Protocol** | 23 | 19 | 4 | 82.6% |
| **ACME Monitoring** | 18 | 8 | 10 | 44.4% |
| **Dashboard** | 4 | 4 | 0 | 100% ✅ |
| **Security & RBAC** | 20 | 20 | 0 | 100% ✅ |
| **Alerts** | 8 | 4 | 4 | 50% |
| **Discovery** | 6 | 5 | 1 | 83.3% |
| **Integrations** | 5 | 0 | 5 | 0% ⚠️ |
| **Reports** | 4 | 4 | 0 | 100% ✅ |
| **Jobs** | 5 | 5 | 0 | 100% ✅ |
| **Sessions** | 6 | 6 | 0 | 100% ✅ |
| **Bulk Operations** | 3 | 3 | 0 | 100% ✅ |
| **Automation** | 5 | 5 | 0 | 100% ✅ |
| **Rate Limiting** | 5 | 5 | 0 | 100% ✅ |
| **Health** | 1 | 1 | 0 | 100% ✅ |

**Key Findings**:
- ⚠️ **Integration endpoints** (Jenkins, Kubernetes, ACME) are completely unintegrated
- ✅ **ACME Monitoring** improved to 61% coverage - webhook UI enhanced with event selection
- ⚠️ **Alerts** at 50% - missing individual CRUD operations for configurations
- User Management and Discovery have minor gaps | 87.5% |
| **Certificates** | 16 | 16 | 0 | 100% ✅ |
| **CA Management** | 5 | 5 | 0 | 100% ✅ |
| **ACME Protocol** | 23 | 19 | 4 | 82.6% |
| **ACME Monitoring** | 18 | 9 | 9 | 50% |
| **Dashboard** | 4 | 4 | 0 | 100% ✅ |
| **Security & RBAC** | 21 | 21 | 0 | 100% ✅ |
| **Alerts** | 10 | 7 | 3 | 70% |
| **Discovery** | 13 | 12 | 1 | 92.3% |
| **Reports** | 4 | 4 | 0 | 100% ✅ |
| **Jobs** | 5 | 5 | 0 | 100% ✅ |
| **Sessions** | 6 | 6 | 0 | 100% ✅ |
| **Bulk Operations** | 6 | 6 | 0 | 100% ✅ |
| **Rate Limiting** | 5 | 5 | 0 | 100% ✅ |
| **Health** | 1 | 1 | 0 | 100% ✅ |

---

## Recommendations

### 1. Critical Gaps to Address
- ✅ User activity logging (audit requirement)
- ✅ Bulk role management (UX improvement)
- ✅ Webhook testing (operational efficiency)

### 2. Nice-to-Have Features
- ACME metrics visualization
- Jenkins/Kubernetes integrations
- Advanced webhook monitoring

### 3. Technical Debt
- Clean up redundant non-paginated endpoints
- Consolidate ACME integration vs. provider endpoints
- Document API deprecation strategy

### 4. Quality Improvements
- Add TypeScript types for all pending endpoints
- Implement error handling for new integrations
- Add loading states and error messages
- Write unit tests for new API calls

---

## Next Steps

1. **Review with Product Team**
   - Prioritize missing features based on user feedback
   - Validate implementation roadmap

2. **Backend Coordination**
   - Verify all listed endpoints are production-ready
   - Confirm API contract stability
   - Check for any breaking changes

3. **Frontend Implementation**
   - Create feature branches for each phase
   - Implement TypeScript types first
   - Build UI components incrementally
   - Add comprehensive testing

4. **Documentation**27 endpoints across 3 priority levels  
**Estimated Effort**: 20-30 development days  
**Target Completion**: Q1 2026

---

## Validation Summary ✅

**Validation Date**: February 15, 2026  
**Validated Against**: Backend Controller Documentation v1.0  
**Method**: Cross-reference of 150+ backend endpoints with frontend API integration files

**Critical Gaps Identified**:
1. 🔴 **Integration Module** - 0% coverage (5 endpoints for Jenkins, K8s, ACME)
2. 🟡 **ACME Monitoring** - 44% coverage (10 missing endpoints for webhooks/metrics)
3. 🟡 **Alert Management** - 50% coverage (4 missing CRUD endpoints)
4. 🟡 **User Management** - 79% coverage (3 missing endpoints)

**Action Items**:
1. Confirm with backend team on enable/disable vs enabled/{enabled} endpoint standardization
2. Validate if IntegrationController endpoints are production-ready
3. Prioritize ACME webhook testing and alert CRUD operations
4. Review if non-paginated endpoints should be deprecated
   - Create user guides for new features

---

**Document Status**: ⏳ Pending Implementation  
**Remaining Work**: 24 endpoints across 3 priority levels  
**Estimated Effort**: 13-19 development days  
**Target Completion**: Q1 2026

**Last Updated**: February 17, 2026  
**Recent Fixes**:
- ✅ **Fixed renewal form not triggering API call (Issue #24)** - Completely rewired CreateRenewalDialog to call `certificatesApi.renew()` on submission
- ✅ **Fixed port value missing in certificate creation (Issue #23)** - Added host and port fields to CreateUserCertificateRequest type and API payload
- ✅ Fixed Certificate Templates white screen (Issue #22) - Proper handling of paginated CA response
- ✅ Fixed Certificate Templates not displaying CA count - Added status field parsing from revoked flag
- ✅ **Fixed Certificate Templates not fetching templates** - Added missing `getAllTemplates` API call
- ✅ Fixed CA Management not displaying CAs - Corrected API response property access (results vs content)
- ✅ Added distinguished name parsing for CA fields (CN, O, OU, L, ST, C) across all CA pages
- ✅ Enhanced ACME Webhook UI with event selection checkboxes and display
- ✅ Fixed Network Scan to support smart default ports (443, 8443, 9443)
- ✅ Fixed React key warnings in Certificate Templates SelectItem components
