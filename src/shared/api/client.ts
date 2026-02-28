/**
 * HTTP client that wraps fetch with auth headers and error handling.
 * Reads the token from localStorage after login, falls back to the env token for development.
 * Uses: ./types
 * Exports: apiClient, BASE_URL
 */
import type { ApiError } from "./types";

export const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "https://api.dkplus.is/api/v1";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 *
 */
function authHeaders(): Record<string, string> {
  // Only use the stored token if it looks like a real UUID — guards against
  // stale mock tokens (e.g. "mock-token-u1-...") that the real API rejects.
  const stored = localStorage.getItem("dk-auth-token");
  const token =
    (stored && UUID_RE.test(stored) ? stored : null) ??
    import.meta.env.VITE_API_TOKEN ??
    "";
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

/**
 *
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let message = response.statusText;
    try {
      const body = await response.json();
      if (body.Message) message = body.Message;
    } catch {
      // keep statusText
    }
    const error: ApiError = { message, status: response.status };
    throw error;
  }
  return response.json() as Promise<T>;
}

export const apiClient = {
  get<T>(path: string): Promise<T> {
    return fetch(`${BASE_URL}${path}`, {
      headers: authHeaders(),
    }).then(handleResponse<T>);
  },

  post<T>(path: string, body: unknown): Promise<T> {
    return fetch(`${BASE_URL}${path}`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(body),
    }).then(handleResponse<T>);
  },

  put<T>(path: string, body: unknown): Promise<T> {
    return fetch(`${BASE_URL}${path}`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(body),
    }).then(handleResponse<T>);
  },

  delete<T>(path: string): Promise<T> {
    return fetch(`${BASE_URL}${path}`, {
      method: "DELETE",
      headers: authHeaders(),
    }).then(handleResponse<T>);
  },

  async getBlob(path: string): Promise<Blob> {
    const response = await fetch(`${BASE_URL}${path}`, {
      headers: authHeaders(),
    });
    if (!response.ok) {
      const error = { message: response.statusText, status: response.status };
      throw error;
    }
    return response.blob();
  },
};
