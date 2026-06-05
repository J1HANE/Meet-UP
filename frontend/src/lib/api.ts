const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8085/api";
const CONTEXT_API_URL = import.meta.env.VITE_CONTEXT_API_URL || "http://localhost:8085/api/context";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  displayName: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: {
    id: string;
    email: string;
    displayName: string;
    roles: string[];
  };
}

export interface UserResponse {
  id: string;
  email: string;
  displayName: string;
  roles: string[];
  tweenIds: string[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
  bio?: string;
  location?: string;
  recoveryEmail?: string;
  avatarUrl?: string;
  phone?: string;
  topics?: string[];
  meetingReminders?: boolean;
  taskDigest?: boolean;
  profileVisibility?: boolean;
  twoFactorEnabled?: boolean;
  emailVerified?: boolean;
}

export interface UpdateProfileRequest {
  displayName?: string;
  bio?: string;
  location?: string;
  recoveryEmail?: string;
  avatarUrl?: string;
  phone?: string;
  topics?: string[];
  meetingReminders?: boolean;
  taskDigest?: boolean;
  profileVisibility?: boolean;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface RequestPasswordResetRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface Enable2FARequest {
  verificationCode: string;
}

export interface Disable2FARequest {
  verificationCode: string;
}

export interface Setup2FAResponse {
  secret: string;
  qrCodeUrl: string;
}

export interface CreateMeetingContextRequest {
  meetingId: string;
  participantIds: string[];
  tweenGroupIds: string[];
  status?: string;
}

export interface CreateDecisionRequest {
  text: string;
  attributedSpeakerId: string;
}

export interface TranscriptChunk {
  speakerId: string;
  text: string;
  timestamp: string;
}

export interface Decision {
  text: string;
  attributedSpeakerId: string;
  meetingId: string;
  timestamp: string;
}

export interface MeetingContextResponse {
  id: string;
  meetingId: string;
  participantIds: string[];
  tweenGroupIds: string[];
  transcript: TranscriptChunk[];
  decisions: Decision[];
  tasksRef: string[];
  topics: string[];
  summary: string | null;
  status: "LIVE" | "COMPLETE";
  createdAt: string;
  updatedAt: string;
}

class ApiClient {
  private async getErrorMessage(response: Response, fallback: string): Promise<string> {
    const error = await response.json().catch(() => ({}));
    return error.message || fallback;
  }

  private getHeaders(token?: string): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
  }

  private async fetchWithRefresh(url: string, options: RequestInit, token?: string): Promise<Response> {
    let response = await fetch(url, options);

    // If 401, try to refresh token
    if (response.status === 401 && token) {
      const refreshToken = localStorage.getItem("meetup_refresh_token");
      if (refreshToken) {
        try {
          const refreshResponse = await this.refreshToken(refreshToken);
          localStorage.setItem("meetup_access_token", refreshResponse.accessToken);
          localStorage.setItem("meetup_refresh_token", refreshResponse.refreshToken);

          // Retry original request with new token
          options.headers = this.getHeaders(refreshResponse.accessToken);
          response = await fetch(url, options);
        } catch (error) {
          // Refresh failed, clear tokens
          localStorage.removeItem("meetup_access_token");
          localStorage.removeItem("meetup_refresh_token");
          throw error;
        }
      }
    }

    return response;
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(await this.getErrorMessage(response, "Login failed"));
    }

    return response.json();
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(await this.getErrorMessage(response, "Registration failed"));
    }

    return response.json();
  }

  async getCurrentUser(token: string): Promise<UserResponse> {
    const response = await this.fetchWithRefresh(
      `${API_BASE_URL}/auth/me`,
      { method: "GET", headers: this.getHeaders(token) },
      token
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to get user");
    }

    return response.json();
  }

  async getUserByEmail(token: string, email: string): Promise<UserResponse> {
    const response = await this.fetchWithRefresh(
      `${API_BASE_URL}/auth/users/by-email?email=${encodeURIComponent(email)}`,
      { method: "GET", headers: this.getHeaders(token) },
      token
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Failed to find user by email");
    }

    return response.json();
  }

  async logout(refreshToken: string, accessToken: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      headers: this.getHeaders(accessToken),
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Logout failed");
    }
  }

  async updateProfile(token: string, data: UpdateProfileRequest): Promise<UserResponse> {
    const response = await this.fetchWithRefresh(
      `${API_BASE_URL}/auth/me`,
      { method: "PATCH", headers: this.getHeaders(token), body: JSON.stringify(data) },
      token
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update profile");
    }

    return response.json();
  }

  async changePassword(token: string, data: ChangePasswordRequest): Promise<void> {
    const response = await this.fetchWithRefresh(
      `${API_BASE_URL}/auth/change-password`,
      { method: "POST", headers: this.getHeaders(token), body: JSON.stringify(data) },
      token
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to change password");
    }
  }

  async getBriefing(user: UserResponse, meetingId: string): Promise<MeetingContextResponse> {
    const response = await fetch(`${CONTEXT_API_URL}/briefing?meetingId=${meetingId}`, {
      method: "GET",
      headers: this.getContextHeaders(user),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Failed to fetch briefing");
    }

    return response.json();
  }

  async getDecisions(user: UserResponse, groupId: string): Promise<Decision[]> {
    const response = await fetch(`${CONTEXT_API_URL}/decisions?groupId=${groupId}`, {
      method: "GET",
      headers: this.getContextHeaders(user),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Failed to fetch decisions");
    }

    return response.json();
  }

  async updateSummary(user: UserResponse, meetingId: string, summary: string): Promise<void> {
    const response = await fetch(`${CONTEXT_API_URL}/${meetingId}/summary`, {
      method: "PATCH",
      headers: this.getContextHeaders(user),
      body: JSON.stringify({ summary }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Failed to update summary");
    }
  }

  // Auth Service - Missing Methods
  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Token refresh failed");
    }

    return response.json();
  }

  async sendEmailVerification(token: string): Promise<{ token: string }> {
    const response = await this.fetchWithRefresh(
      `${API_BASE_URL}/auth/send-verification-email`,
      { method: "POST", headers: this.getHeaders(token) },
      token
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to send verification email");
    }

    return response.json();
  }

  async verifyEmail(data: VerifyEmailRequest): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/auth/verify-email`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Email verification failed");
    }
  }

  async requestPasswordReset(data: RequestPasswordResetRequest): Promise<{ token: string }> {
    const response = await fetch(`${API_BASE_URL}/auth/request-password-reset`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to request password reset");
    }

    return response.json();
  }

  async resetPassword(data: ResetPasswordRequest): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Password reset failed");
    }
  }

  async setup2FA(token: string): Promise<Setup2FAResponse> {
    const response = await this.fetchWithRefresh(
      `${API_BASE_URL}/auth/2fa/setup`,
      { method: "POST", headers: this.getHeaders(token) },
      token
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to setup 2FA");
    }

    return response.json();
  }

  async enable2FA(token: string, data: Enable2FARequest): Promise<void> {
    const response = await this.fetchWithRefresh(
      `${API_BASE_URL}/auth/2fa/enable`,
      { method: "POST", headers: this.getHeaders(token), body: JSON.stringify(data) },
      token
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to enable 2FA");
    }
  }

  async disable2FA(token: string, data: Disable2FARequest): Promise<void> {
    const response = await this.fetchWithRefresh(
      `${API_BASE_URL}/auth/2fa/disable`,
      { method: "POST", headers: this.getHeaders(token), body: JSON.stringify(data) },
      token
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to disable 2FA");
    }
  }

  async deleteAccount(token: string): Promise<void> {
    const response = await this.fetchWithRefresh(
      `${API_BASE_URL}/auth/me`,
      { method: "DELETE", headers: this.getHeaders(token) },
      token
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to delete account");
    }
  }

  async getAllUsers(token: string): Promise<UserResponse[]> {
    const response = await this.fetchWithRefresh(
      `${API_BASE_URL}/auth/users`,
      { method: "GET", headers: this.getHeaders(token) },
      token
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to get users");
    }

    return response.json();
  }

  async searchUsers(token: string, query: string, limit: number = 10, offset: number = 0): Promise<UserResponse[]> {
    const response = await this.fetchWithRefresh(
      `${API_BASE_URL}/auth/users/search?query=${query}&limit=${limit}&offset=${offset}`,
      { method: "GET", headers: this.getHeaders(token) },
      token
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to search users");
    }

    return response.json();
  }

  // Context Service - Missing Methods
  async createMeetingContext(user: UserResponse, data: CreateMeetingContextRequest): Promise<MeetingContextResponse> {
    const response = await fetch(`${CONTEXT_API_URL}`, {
      method: "POST",
      headers: this.getContextHeaders(user),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Failed to create meeting context");
    }

    return response.json();
  }

  async getMeetingContext(user: UserResponse, meetingId: string): Promise<MeetingContextResponse> {
    const response = await fetch(`${CONTEXT_API_URL}/${meetingId}`, {
      method: "GET",
      headers: this.getContextHeaders(user),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Failed to get meeting context");
    }

    return response.json();
  }

  async deleteMeetingContext(user: UserResponse, meetingId: string): Promise<void> {
    const response = await fetch(`${CONTEXT_API_URL}/${meetingId}`, {
      method: "DELETE",
      headers: this.getContextHeaders(user),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Failed to delete meeting context");
    }
  }

  async addTranscriptChunk(user: UserResponse, meetingId: string, chunk: TranscriptChunk): Promise<MeetingContextResponse> {
    const response = await fetch(`${CONTEXT_API_URL}/${meetingId}/transcript`, {
      method: "POST",
      headers: this.getContextHeaders(user),
      body: JSON.stringify(chunk),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Failed to add transcript chunk");
    }

    return response.json();
  }

  async addDecision(user: UserResponse, meetingId: string, data: CreateDecisionRequest): Promise<MeetingContextResponse> {
    const response = await fetch(`${CONTEXT_API_URL}/${meetingId}/decisions`, {
      method: "POST",
      headers: this.getContextHeaders(user),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Failed to add decision");
    }

    return response.json();
  }

  async addTaskReference(user: UserResponse, meetingId: string, taskId: string): Promise<MeetingContextResponse> {
    const response = await fetch(`${CONTEXT_API_URL}/${meetingId}/tasks`, {
      method: "POST",
      headers: this.getContextHeaders(user),
      body: JSON.stringify({ taskId }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Failed to add task reference");
    }

    return response.json();
  }

  async updateMeetingStatus(user: UserResponse, meetingId: string, status: string): Promise<MeetingContextResponse> {
    const response = await fetch(`${CONTEXT_API_URL}/${meetingId}/status`, {
      method: "PATCH",
      headers: this.getContextHeaders(user),
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Failed to update meeting status");
    }

    return response.json();
  }

  async searchContexts(user: UserResponse, query: string, groupId?: string, status?: string, limit: number = 10, offset: number = 0): Promise<MeetingContextResponse[]> {
    let url = `${CONTEXT_API_URL}/search?query=${query}&limit=${limit}&offset=${offset}`;
    if (groupId) url += `&groupId=${groupId}`;
    if (status) url += `&status=${status}`;

    const response = await fetch(url, {
      method: "GET",
      headers: this.getContextHeaders(user),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Failed to search contexts");
    }

    return response.json();
  }

  private getContextHeaders(user: UserResponse): HeadersInit {
    const token = (typeof window !== "undefined" && localStorage.getItem("meetup_access_token")) || "";
    return {
      "Content-Type": "application/json",
      "Authorization": token ? `Bearer ${token}` : "",
      "X-User-Id": user.id,
      "X-User-Email": user.email,
      "X-User-Roles": user.roles.join(","),
      "X-User-TweenIds": user.tweenIds.join(","),
    };
  }
}

export const api = new ApiClient();

export const authApi = {
  login: (data: LoginRequest) => api.login(data),
  register: (data: RegisterRequest) => api.register(data),
  logout: (refreshToken: string, accessToken: string) => api.logout(refreshToken, accessToken),
  refreshToken: (refreshToken: string) => api.refreshToken(refreshToken),
  getCurrentUser: (token: string) => api.getCurrentUser(token),
  getUserByEmail: (token: string, email: string) => api.getUserByEmail(token, email),
  updateProfile: (token: string, data: UpdateProfileRequest) => api.updateProfile(token, data),
  changePassword: (token: string, data: ChangePasswordRequest) => api.changePassword(token, data),
  sendEmailVerification: (token: string) => api.sendEmailVerification(token),
  verifyEmail: (data: VerifyEmailRequest) => api.verifyEmail(data),
  requestPasswordReset: (data: RequestPasswordResetRequest) => api.requestPasswordReset(data),
  resetPassword: (data: ResetPasswordRequest) => api.resetPassword(data),
  setup2FA: (token: string) => api.setup2FA(token),
  enable2FA: (token: string, data: Enable2FARequest) => api.enable2FA(token, data),
  disable2FA: (token: string, data: Disable2FARequest) => api.disable2FA(token, data),
  deleteAccount: (token: string) => api.deleteAccount(token),
};
