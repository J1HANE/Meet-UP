import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { type AuthResponse, type UserResponse, authApi } from "@/lib/api";

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
const DEV_AUTH_ENABLED = import.meta.env.VITE_DEV_AUTH === "true";
const DEV_ACCESS_TOKEN = "dev-access-token";
const DEV_REFRESH_TOKEN = "dev-refresh-token";
const DEV_USER: UserResponse = {
  id: "11111111-1111-1111-1111-111111111111",
  email: "dev@meetup.local",
  displayName: "Meeting Host",
  roles: ["admin", "user"],
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(DEV_AUTH_ENABLED ? DEV_USER : null);
  const [isLoading, setIsLoading] = useState(false);

  const getAccessToken = useCallback(() => {
    if (typeof window === 'undefined') return null;
    if (DEV_AUTH_ENABLED) return DEV_ACCESS_TOKEN;
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }, []);

  const getRefreshToken = useCallback(() => {
    if (typeof window === 'undefined') return null;
    if (DEV_AUTH_ENABLED) return DEV_REFRESH_TOKEN;
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }, []);

  const setTokens = useCallback((response: AuthResponse) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(ACCESS_TOKEN_KEY, response.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);
  }, []);

  const clearTokens = useCallback(() => {
    if (typeof window === 'undefined') return;
    if (DEV_AUTH_ENABLED) return;
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }, []);

  const refreshUser = useCallback(async () => {
    if (DEV_AUTH_ENABLED) {
      setUser(DEV_USER);
      return;
    }

    const token = getAccessToken();
    if (!token) return;

    try {
      const response = await authApi.getCurrentUser(token);
      setUser(response.data);
    } catch {
      clearTokens();
      setUser(null);
    }
  }, [getAccessToken, clearTokens]);

  useEffect(() => {
    refreshUser();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    if (DEV_AUTH_ENABLED) {
      setUser(DEV_USER);
      return;
    }

    setIsLoading(true);
    try {
      const response = await authApi.login({ email, password });
      setTokens(response.data);

      const userData = await authApi.getCurrentUser(response.data.accessToken);
      setUser(userData.data);
    } finally {
      setIsLoading(false);
    }
  }, [setTokens]);

  const register = useCallback(async (email: string, password: string, displayName: string) => {
    if (DEV_AUTH_ENABLED) {
      setUser(DEV_USER);
      return;
    }

    setIsLoading(true);
    try {
      const response = await authApi.register({ email, password, displayName });
      setTokens(response.data);

      const userData = await authApi.getCurrentUser(response.data.accessToken);
      setUser(userData.data);
    } finally {
      setIsLoading(false);
    }
  }, [setTokens]);

  const logout = useCallback(async () => {
    if (DEV_AUTH_ENABLED) {
      setUser(DEV_USER);
      return;
    }

    const accessToken = getAccessToken();
    const refreshToken = getRefreshToken();

    if (accessToken && refreshToken) {
      try {
        await authApi.logout(refreshToken, accessToken);
      } catch {
        // Ignore logout errors
      }
    }

    clearTokens();
    setUser(null);
  }, [getAccessToken, getRefreshToken, clearTokens]);

  const updateProfile = useCallback(async (data: import("@/lib/api").UpdateProfileRequest) => {
    if (DEV_AUTH_ENABLED) {
      setUser((currentUser) => ({ ...(currentUser ?? DEV_USER), ...data }));
      return;
    }

    const token = getAccessToken();
    if (!token) throw new Error("Not authenticated");

    const response = await authApi.updateProfile(token, data);
    setUser(response.data);
  }, [getAccessToken]);

  const changePassword = useCallback(async (data: import("@/lib/api").ChangePasswordRequest) => {
    if (DEV_AUTH_ENABLED) return;

    const token = getAccessToken();
    if (!token) throw new Error("Not authenticated");

    await authApi.changePassword(token, data);
  }, [getAccessToken]);

  const sendEmailVerification = useCallback(async () => {
    if (DEV_AUTH_ENABLED) return "dev-email-verification-token";

    const token = getAccessToken();
    if (!token) throw new Error("Not authenticated");

    const response = await authApi.sendEmailVerification(token);
    return response.data.token;
  }, [getAccessToken]);

  const verifyEmail = useCallback(async (token: string) => {
    await authApi.verifyEmail({ token });
  }, []);

  const requestPasswordReset = useCallback(async (email: string) => {
    if (DEV_AUTH_ENABLED) return "dev-password-reset-token";

    const response = await authApi.requestPasswordReset({ email });
    return response.data.token;
  }, []);

  const resetPassword = useCallback(async (token: string, newPassword: string) => {
    if (DEV_AUTH_ENABLED) return;

    await authApi.resetPassword({ token, newPassword });
  }, []);

  const setup2FA = useCallback(async () => {
    if (DEV_AUTH_ENABLED) {
      return {
        secret: "DEV-2FA-SECRET",
        qrCodeUrl: "otpauth://totp/MeetFlow:dev@meetup.local?secret=DEV2FASECRET&issuer=MeetFlow",
      };
    }

    const token = getAccessToken();
    if (!token) throw new Error("Not authenticated");

    const response = await authApi.setup2FA(token);
    return response.data;
  }, [getAccessToken]);

  const enable2FA = useCallback(async (code: string) => {
    if (DEV_AUTH_ENABLED) return;

    const token = getAccessToken();
    if (!token) throw new Error("Not authenticated");

    await authApi.enable2FA(token, { verificationCode: code });
  }, [getAccessToken]);

  const disable2FA = useCallback(async (code: string) => {
    if (DEV_AUTH_ENABLED) return;

    const token = getAccessToken();
    if (!token) throw new Error("Not authenticated");

    await authApi.disable2FA(token, { verificationCode: code });
  }, [getAccessToken]);

  const deleteAccount = useCallback(async () => {
    if (DEV_AUTH_ENABLED) return;

    const token = getAccessToken();
    if (!token) throw new Error("Not authenticated");

    await authApi.deleteAccount(token);
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
