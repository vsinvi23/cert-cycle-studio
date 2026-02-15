/**
 * Shared pagination types for all API responses
 * Based on Spring Boot PageImpl format
 */

/**
 * Spring Boot PageImpl response structure
 */
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
  sort?: {
    sorted: boolean;
    unsorted: boolean;
    empty: boolean;
  };
}

/**
 * Common pagination request parameters
 */
export interface PaginationParams {
  page?: number;
  size?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC' | 'asc' | 'desc';
}

/**
 * Certificate-specific filters
 */
export interface CertificateFilters extends PaginationParams {
  search?: string;
  expiryStatus?: 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED';
  userId?: number;
}

/**
 * Network scan certificate filters
 */
export interface NetworkScanFilters extends PaginationParams {
  search?: string;
  port?: string;
  expiryDays?: number;
}

/**
 * Discovery changes filters
 */
export interface DiscoveryFilters extends PaginationParams {
  startDate?: string;
  endDate?: string;
  changeType?: 'NEW' | 'EXPIRED' | 'RENEWED' | 'REMOVED' | 'ADDED' | 'MODIFIED';
  host?: string;
}

/**
 * User filters
 */
export interface UserFilters extends PaginationParams {
  searchTerm?: string;
  department?: string;
  enabled?: boolean;
}

/**
 * Role filters
 */
export interface RoleFilters extends PaginationParams {
  searchTerm?: string;
  enabled?: boolean;
}

/**
 * Session filters
 */
export interface SessionFilters extends PaginationParams {
  userId?: number;
  search?: string;
  startDate?: string;
  endDate?: string;
  active?: boolean;
}

/**
 * Jobs filters
 */
export interface JobFilters extends PaginationParams {
  status?: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  startDate?: string;
  endDate?: string;
  hours?: number;
}

/**
 * ACME provider filters
 */
export interface AcmeProviderFilters extends PaginationParams {
  search?: string;
  enabled?: boolean;
}

/**
 * ACME account filters
 */
export interface AcmeAccountFilters extends PaginationParams {
  providerId?: number;
  status?: 'VALID' | 'DEACTIVATED' | 'REVOKED';
  sortDir?: 'ASC' | 'DESC';
}

/**
 * Alert configuration filters
 */
export interface AlertConfigFilters {
  page?: number;
  size?: number;
  sort?: string[];
}

/**
 * Audit log filters
 */
export interface AuditLogFilters {
  startDate?: string;
  endDate?: string;
  page?: number;
  size?: number;
  sort?: string[];
}

/**
 * Helper to build URL query parameters
 */
export function buildQueryParams(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        // Handle array parameters (e.g., sort)
        value.forEach(v => searchParams.append(key, String(v)));
      } else {
        searchParams.append(key, String(value));
      }
    }
  });
  
  const query = searchParams.toString();
  console.log('[buildQueryParams] Input:', params);
  console.log('[buildQueryParams] Output:', query);
  return query ? `?${query}` : '';
}

/**
 * Helper to extract content from paginated or non-paginated response
 */
export function extractContent<T>(response: PaginatedResponse<T> | T[]): T[] {
  if (Array.isArray(response)) {
    return response;
  }
  
  if (response && typeof response === 'object' && 'content' in response) {
    return Array.isArray(response.content) ? response.content : [];
  }
  
  return [];
}

/**
 * Helper to get pagination metadata
 */
export function getPaginationMeta<T>(
  response: PaginatedResponse<T> | T[]
): {
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  isFirst: boolean;
  isLast: boolean;
} {
  if (Array.isArray(response)) {
    return {
      totalElements: response.length,
      totalPages: 1,
      currentPage: 0,
      pageSize: response.length,
      isFirst: true,
      isLast: true,
    };
  }
  
  if (response && typeof response === 'object' && 'content' in response) {
    return {
      totalElements: response.totalElements || 0,
      totalPages: response.totalPages || 1,
      currentPage: response.number || 0,
      pageSize: response.size || 20,
      isFirst: response.first || false,
      isLast: response.last || false,
    };
  }
  
  return {
    totalElements: 0,
    totalPages: 0,
    currentPage: 0,
    pageSize: 20,
    isFirst: true,
    isLast: true,
  };
}
