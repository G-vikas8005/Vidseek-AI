import { createContext, useContext, useState, useEffect } from "react";
import * as authService from "../services/auth.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize session on mount
  useEffect(() => {
    async function checkAuth() {
      const storedToken = localStorage.getItem("vidseek_token");
      const storedUser = localStorage.getItem("vidseek_user");

      if (!storedToken && !storedUser) {
        setIsLoading(false);
        return;
      }

      // If we have stored session info, attempt to verify with backend /auth/me
      try {
        const response = await authService.getCurrentUser();
        if (response.data && response.data.user) {
          setUser(response.data.user);
          localStorage.setItem("vidseek_user", JSON.stringify(response.data.user));
        } else if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (err) {
        // TEMPORARY MOCK AUTHENTICATION FALLBACK
        // If Member 3's backend is not running or endpoint returns 404/network error,
        // we fallback gracefully to the stored mock session if token exists.
        console.warn("Backend auth verification failed or unavailable:", err.message);
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch {
            localStorage.removeItem("vidseek_user");
            localStorage.removeItem("vidseek_token");
            setUser(null);
          }
        } else {
          localStorage.removeItem("vidseek_token");
          setUser(null);
        }
      } finally {
        setIsLoading(false);
      }
    }

    checkAuth();
  }, []);

  // Login handler
  const login = async (credentials) => {
    try {
      // Call real backend authentication API
      const response = await authService.loginUser(credentials);
      const data = response.data;

      const authenticatedUser = data.user || {
        id: "user-default",
        email: credentials.email,
        name: credentials.email.split("@")[0],
      };
      const token = data.token || "mock-jwt-token-" + Date.now();

      localStorage.setItem("vidseek_token", token);
      localStorage.setItem("vidseek_user", JSON.stringify(authenticatedUser));
      setUser(authenticatedUser);
      return { success: true };
    } catch (err) {
      // TEMPORARY MOCK AUTHENTICATION
      // If backend is not yet running (network error / ECONNREFUSED), allow demo test login:
      if (!err.response && (err.code === "ERR_NETWORK" || err.message?.includes("Network Error"))) {
        console.warn(
          "TEMPORARY MOCK AUTHENTICATION: Backend not reachable. Using mock authentication."
        );
        const mockUser = {
          id: "mock-" + Date.now(),
          name: credentials.email.split("@")[0] || "Demo User",
          email: credentials.email,
        };
        const mockToken = "mock-jwt-token-" + Date.now();
        localStorage.setItem("vidseek_token", mockToken);
        localStorage.setItem("vidseek_user", JSON.stringify(mockUser));
        setUser(mockUser);
        return { success: true };
      }

      // If backend responded with an error message
      let message = "Unable to sign in. Please try again.";
      if (err.response?.status === 401) {
        message = "Invalid email or password.";
      } else if (err.response?.data?.message) {
        message = err.response.data.message;
      }
      return { success: false, error: message };
    }
  };

  // Register handler
  const register = async ({ name, email, password }) => {
    try {
      // Call real backend authentication API
      const response = await authService.registerUser({ name, email, password });
      const data = response.data;

      const newUser = data.user || {
        id: "user-" + Date.now(),
        name,
        email,
      };
      const token = data.token || "mock-jwt-token-" + Date.now();

      localStorage.setItem("vidseek_token", token);
      localStorage.setItem("vidseek_user", JSON.stringify(newUser));
      setUser(newUser);
      return { success: true };
    } catch (err) {
      // TEMPORARY MOCK AUTHENTICATION
      // If backend is not yet running (network error / ECONNREFUSED), allow demo registration:
      if (!err.response && (err.code === "ERR_NETWORK" || err.message?.includes("Network Error"))) {
        console.warn(
          "TEMPORARY MOCK AUTHENTICATION: Backend not reachable. Using mock registration."
        );
        const mockUser = {
          id: "mock-" + Date.now(),
          name: name || email.split("@")[0],
          email,
        };
        const mockToken = "mock-jwt-token-" + Date.now();
        localStorage.setItem("vidseek_token", mockToken);
        localStorage.setItem("vidseek_user", JSON.stringify(mockUser));
        setUser(mockUser);
        return { success: true };
      }

      let message = "Unable to create your account.";
      if (err.response?.status === 409) {
        message = "This email is already registered.";
      } else if (err.response?.data?.message) {
        message = err.response.data.message;
      }
      return { success: false, error: message };
    }
  };

  // Logout handler
  const logout = async () => {
    try {
      await authService.logoutUser();
    } catch {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem("vidseek_token");
      localStorage.removeItem("vidseek_user");
      setUser(null);
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
