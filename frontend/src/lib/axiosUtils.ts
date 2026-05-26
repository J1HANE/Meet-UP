import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "axios";

// ── Util: attach auth header ──────────────────────────────────────────────
export const getAuthHeaders = () => {
  const token = localStorage.getItem("meetup_access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ── Util: extract error message from axios error ──────────────────────────
export const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof AxiosError) {
    return (
      error.response?.data?.message ??
      error.response?.data?.error ??
      error.message ??
      fallback
    );
  }
  return fallback;
};

// ── Refresh state ─────────────────────────────────────────────────────────
let isRefreshing = false;
let pendingQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

const flushQueue = (token: string | null, error: unknown = null) => {
  pendingQueue.forEach(({ resolve, reject }) =>
    token ? resolve(token) : reject(error),
  );
  pendingQueue = [];
};

// ── Attach request interceptor to any axios instance ─────────────────────
export const applyAuthInterceptor = (instance: AxiosInstance): void => {
  instance.interceptors.request.use((config) => {
    Object.assign(config.headers, getAuthHeaders());
    return config;
  });
};

// ── Attach response interceptor (401 + refresh) to any axios instance ─────
export const applyRefreshInterceptor = (
  instance: AxiosInstance,
  authBaseUrl: string,
): void => {
  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const original = error.config as InternalAxiosRequestConfig & {
        _retry?: boolean;
      };

      if (error.response?.status !== 401 || original._retry) {
        return Promise.reject(error);
      }

      original._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push({
            resolve: (token) => {
              original.headers.Authorization = `Bearer ${token}`;
              resolve(instance(original));
            },
            reject,
          });
        });
      }

      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem("meetup_refresh_token");
        if (!refreshToken) throw new Error("No refresh token available");

        const { data } = await axios.post(`${authBaseUrl}/refresh`, {
          refreshToken,
        });

        const newToken: string = data.accessToken;
        localStorage.setItem("meetup_access_token", newToken);
        flushQueue(newToken);

        original.headers.Authorization = `Bearer ${newToken}`;
        return instance(original);
      } catch (refreshError) {
        flushQueue(null, refreshError);
        localStorage.removeItem("meetup_access_token");
        localStorage.removeItem("meetup_refresh_token");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    },
  );
};

// ── Factory: create a pre-configured axios instance ──────────────────────
export const createApiClient = (
  baseURL: string,
  authBaseUrl: string,
): AxiosInstance => {
  const instance = axios.create({
    baseURL,
    headers: { "Content-Type": "application/json" },
  });

  applyAuthInterceptor(instance);
  applyRefreshInterceptor(instance, authBaseUrl);

  return instance;
};
