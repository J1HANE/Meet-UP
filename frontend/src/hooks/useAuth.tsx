import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
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
  sendEmailVerification: () => Promise<string>;
  verifyEmail: (token: string) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<string>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  setup2FA: () => Promise<import("@/lib/api").Setup2FAResponse>;
  enable2FA: (code: string) => Promise<void>;
  disable2FA: (code: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
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

  useEffect(() => {
    refreshUser();
  }, []);

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

  const sendEmailVerification = useCallback(async () => {
    const token = getAccessToken();
    if (!token) throw new Error("Not authenticated");

    const response = await api.sendEmailVerification(token);
    return response.token;
  }, [getAccessToken]);

  const verifyEmail = useCallback(async (token: string) => {
    await api.verifyEmail({ token });
  }, []);

  const requestPasswordReset = useCallback(async (email: string) => {
    const response = await api.requestPasswordReset({ email });
    return response.token;
  }, []);

  const resetPassword = useCallback(async (token: string, newPassword: string) => {
    await api.resetPassword({ token, newPassword });
  }, []);

  const setup2FA = useCallback(async () => {
    const token = getAccessToken();
    if (!token) throw new Error("Not authenticated");

    return await api.setup2FA(token);
  }, [getAccessToken]);

  const enable2FA = useCallback(async (code: string) => {
    const token = getAccessToken();
    if (!token) throw new Error("Not authenticated");

    await api.enable2FA(token, { verificationCode: code });
  }, [getAccessToken]);

  const disable2FA = useCallback(async (code: string) => {
    const token = getAccessToken();
    if (!token) throw new Error("Not authenticated");

    await api.disable2FA(token, { verificationCode: code });
  }, [getAccessToken]);

  const deleteAccount = useCallback(async () => {
    const token = getAccessToken();
    if (!token) throw new Error("Not authenticated");

    await api.deleteAccount(token);
    clearTokens();
    setUser(null);
  }, [getAccessToken, clearTokens]);

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
        sendEmailVerification,
        verifyEmail,
        requestPasswordReset,
        resetPassword,
        setup2FA,
        enable2FA,
        disable2FA,
        deleteAccount,
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
