import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authApi, clearAuthToken, setAuthToken, getAuthToken } from "@/lib/api";

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

  // Check for existing session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("certaxis_token") || localStorage.getItem("authToken");
    
    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
        setAuthToken(storedToken);
      } catch {
        localStorage.removeItem("user");
        localStorage.removeItem("certaxis_token");
        localStorage.removeItem("authToken");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    try {
      // Call the CertAxis login API
      const response = await authApi.login({ username, password });
      
      // Create user object from successful login
      const loggedInUser: User = {
        id: "1", // The API doesn't return user ID in login response
        username,
        name: username,
      };
      
      setUser(loggedInUser);
      localStorage.setItem("user", JSON.stringify(loggedInUser));
      localStorage.setItem("certaxis_token", response.token);
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

  const logout = () => {
    authApi.logout();
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("certaxis_token");
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
