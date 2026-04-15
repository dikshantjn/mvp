import { env } from '../config/clientEnv';
import type { ApiResponse, RefreshResponse } from '../types/api';

const JSON_HEADERS = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
};

export interface SessionStore {
  getAccessToken: () => string | null;
  getRefreshToken: () => string | null;
  setTokens: (tokens: RefreshResponse) => void;
  clear: () => void;
}

export class ApiClient {
  constructor(private readonly sessionStore: SessionStore) {}

  async get<T>(path: string, params?: Record<string, string | number | undefined>) {
    return this.request<T>(path, {
      method: 'GET',
      params,
    });
  }

  async post<T>(path: string, body?: unknown) {
    return this.request<T>(path, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
      headers: JSON_HEADERS,
    });
  }

  async put<T>(path: string, body?: unknown) {
    return this.request<T>(path, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
      headers: JSON_HEADERS,
    });
  }

  async postForm<T>(path: string, formData: FormData) {
    return this.request<T>(path, {
      method: 'POST',
      body: formData,
    });
  }

  private buildUrl(path: string, params?: Record<string, string | number | undefined>) {
    const url = new URL(`${env.apiBaseUrl}${path}`, window.location.origin);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          url.searchParams.set(key, String(value));
        }
      });
    }

    return url.toString();
  }

  private async request<T>(
    path: string,
    init: RequestInit & { params?: Record<string, string | number | undefined> },
    allowRefresh = true,
  ): Promise<T> {
    const headers = new Headers(init.headers);
    const accessToken = this.sessionStore.getAccessToken();

    if (accessToken) {
      headers.set('Authorization', `Bearer ${accessToken}`);
    }

    const response = await fetch(this.buildUrl(path, init.params), {
      ...init,
      headers,
    });

    if (response.status === 401 && allowRefresh) {
      const didRefresh = await this.tryRefresh();
      if (didRefresh) {
        return this.request<T>(path, init, false);
      }
    }

    const payload = (await response.json()) as ApiResponse<T>;

    if (!response.ok || !payload.success) {
      const message = payload.success ? 'Request failed' : payload.error.message;
      throw new Error(message);
    }

    return payload.data;
  }

  private async tryRefresh() {
    const refreshToken = this.sessionStore.getRefreshToken();

    if (!refreshToken) {
      this.sessionStore.clear();
      return false;
    }

    const response = await fetch(this.buildUrl('/api/v1/admin/auth/refresh'), {
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      this.sessionStore.clear();
      return false;
    }

    const payload = (await response.json()) as ApiResponse<RefreshResponse>;
    if (!payload.success) {
      this.sessionStore.clear();
      return false;
    }

    this.sessionStore.setTokens(payload.data);
    return true;
  }
}
