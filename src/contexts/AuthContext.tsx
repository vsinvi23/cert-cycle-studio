import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { authApi, clearAuthToken, setAuthToken, getAuthToken, setLogoutCallback, isTokenExpired } from "@/lib/api";

interface User {
  id: string;
  username: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    try {
      authApi.logout();
    } catch {
      // Ignore logout API errors
    }
    setUser(null);
    clearAuthToken();
  }, []);

  // Register logout callback for API config to use
  useEffect(() => {
    setLogoutCallback(logout);
  }, [logout]);

  // Check for existing session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("certaxis_token") || localStorage.getItem("authToken");
    
    if (storedUser && storedToken) {
      // Check if token is expired
      if (isTokenExpired(storedToken)) {
        // Token expired, clear everything
        clearAuthToken();
        setIsLoading(false);
        return;
      }
      
      try {
        setUser(JSON.parse(storedUser));
        setAuthToken(storedToken);
      } catch {
        clearAuthToken();
      }
    }
    setIsLoading(false);
  }, []);

  // Set up token expiration check interval
  useEffect(() => {
    const checkTokenExpiration = () => {
      const token = getAuthToken();
      if (token && isTokenExpired(token)) {
        logout();
        window.location.href = '/login';
      }
    };

    // Check every minute
    const interval = setInterval(checkTokenExpiration, 60000);
    
    return () => clearInterval(interval);
  }, [logout]);

  const login = async (username: string, password: string) => {
    try {
      // Call the CertAxis login API
      const response = await authApi.login({ username, password });
      
      // Save the token immediately
      setAuthToken(response.token);
      
      // Create user object from successful login
      const loggedInUser: User = {
        id: "1",
        username,
        name: username,
      };
      
      setUser(loggedInUser);
      localStorage.setItem("user", JSON.stringify(loggedInUser));
    } catch (error) {
      // Clear any existing token on failed login
      clearAuthToken();
      throw error;
    }
  };

  const register = async (username: string, password: string) => {
    try {
      // Call the CertAxis register API
      await authApi.register({ username, password });
      
      // After successful registration, log the user in
      await login(username, password);
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
