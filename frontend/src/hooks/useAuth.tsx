import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { api, type AuthResponse, type UserResponse } from "@/lib/api";

interface AuthContextType {
  user: UserResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateProfile: (data: import("@/lib/api").UpdateProfileRequest) => Promise<void>;
  changePassword: (data: import("@/lib/api").ChangePasswordRequest) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ACCESS_TOKEN_KEY = "meetup_access_token";
const REFRESH_TOKEN_KEY = "meetup_refresh_token";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const getAccessToken = useCallback(() => {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }, []);

  const getRefreshToken = useCallback(() => {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }, []);

  const setTokens = useCallback((response: AuthResponse) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, response.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);
  }, []);

  const clearTokens = useCallback(() => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }, []);

  const refreshUser = useCallback(async () => {
    const token = getAccessToken();
    if (!token) return;

    try {
      const userData = await api.getCurrentUser(token);
      setUser(userData);
    } catch {
      clearTokens();
      setUser(null);
    }
  }, [getAccessToken, clearTokens]);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await api.login({ email, password });
      setTokens(response);

      const userData = await api.getCurrentUser(response.accessToken);
      setUser(userData);
    } finally {
      setIsLoading(false);
    }
  }, [setTokens]);

  const register = useCallback(async (email: string, password: string, displayName: string) => {
    setIsLoading(true);
    try {
      const response = await api.register({ email, password, displayName });
      setTokens(response);

      const userData = await api.getCurrentUser(response.accessToken);
      setUser(userData);
    } finally {
      setIsLoading(false);
    }
  }, [setTokens]);

  const logout = useCallback(async () => {
    const accessToken = getAccessToken();
    const refreshToken = getRefreshToken();

    if (accessToken && refreshToken) {
      try {
        await api.logout(refreshToken, accessToken);
      } catch {
        // Ignore logout errors
      }
    }

    clearTokens();
    setUser(null);
  }, [getAccessToken, getRefreshToken, clearTokens]);

  const updateProfile = useCallback(async (data: import("@/lib/api").UpdateProfileRequest) => {
    const token = getAccessToken();
    if (!token) throw new Error("Not authenticated");

    const updatedUser = await api.updateProfile(token, data);
    setUser(updatedUser);
  }, [getAccessToken]);

  const changePassword = useCallback(async (data: import("@/lib/api").ChangePasswordRequest) => {
    const token = getAccessToken();
    if (!token) throw new Error("Not authenticated");

    await api.changePassword(token, data);
  }, [getAccessToken]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
        updateProfile,
        changePassword,
      }}
    >
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
