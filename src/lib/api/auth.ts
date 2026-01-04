import { setAuthToken, clearAuthToken, API_BASE_URL } from "./config";
import type { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from "./types";

export const authApi = {
  /**
   * POST /api/auth/login
   * Authenticate user and receive JWT token
   */
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Invalid username or password");
    }

    const data = await response.json();
    setAuthToken(data.token);
    localStorage.setItem("certaxis_token", data.token);
    return data;
  },

  /**
   * POST /api/register
   * Register a new user
   */
  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Registration failed. Username may already exist.");
    }

    return response.json();
  },

  /**
   * Logout user (client-side only - clears token)
   */
  logout: () => {
    clearAuthToken();
    localStorage.removeItem("certaxis_token");
    localStorage.removeItem("user");
  },
};
