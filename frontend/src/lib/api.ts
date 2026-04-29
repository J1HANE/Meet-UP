const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8081/api";

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

class ApiClient {
  private getHeaders(token?: string): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Login failed");
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
      const error = await response.json();
      throw new Error(error.message || "Registration failed");
    }

    return response.json();
  }

  async getCurrentUser(token: string): Promise<UserResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: "GET",
      headers: this.getHeaders(token),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to get user");
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
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: "PATCH",
      headers: this.getHeaders(token),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update profile");
    }

    return response.json();
  }

  async changePassword(token: string, data: ChangePasswordRequest): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
      method: "POST",
      headers: this.getHeaders(token),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to change password");
    }
  }
}

export const api = new ApiClient();
