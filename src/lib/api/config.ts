// CertAxis API Configuration
// Import base URL from centralized config
import { API_BASE_URL, API_TIMEOUT } from "./apiConfig";

// Re-export for backward compatibility
export { API_BASE_URL };

// Token management
let authToken: string | null = null;
let logoutCallback: (() => void) | null = null;

export const setLogoutCallback = (callback: () => void) => {
  logoutCallback = callback;
};

export const setAuthToken = (token: string | null) => {
  authToken = token;
  if (token) {
    localStorage.setItem("authToken", token);
    localStorage.setItem("certaxis_token", token);
  } else {
    localStorage.removeItem("authToken");
    localStorage.removeItem("certaxis_token");
  }
};

export const getAuthToken = (): string | null => {
  if (!authToken) {
    authToken = localStorage.getItem("authToken") || localStorage.getItem("certaxis_token");
  }
  return authToken;
};

export const clearAuthToken = () => {
  authToken = null;
  localStorage.removeItem("authToken");
  localStorage.removeItem("certaxis_token");
  localStorage.removeItem("user");
};

// Check if token is expired (JWT format)
export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp * 1000; // Convert to milliseconds
    return Date.now() >= exp;
  } catch {
    return true; // If we can't parse the token, consider it expired
  }
};

// Handle token expiration - triggers logout
const handleTokenExpired = () => {
  clearAuthToken();
  if (logoutCallback) {
    logoutCallback();
  }
  // Redirect to login page
  window.location.href = '/login';
};

// API request helper with authentication
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  
  // Check if token is expired before making request
  if (token && isTokenExpired(token)) {
    handleTokenExpired();
    throw new ApiError(401, "Token expired", { message: "Your session has expired. Please login again." });
  }
  
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Handle 401 Unauthorized - token expired or invalid
  if (response.status === 401) {
    handleTokenExpired();
    throw new ApiError(401, "Unauthorized", { message: "Your session has expired. Please login again." });
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      response.status,
      errorData.message || response.statusText,
      errorData
    );
  }

  // Handle empty responses
  const text = await response.text();
  if (!text) {
    return {} as T;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text as unknown as T;
  }
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}
