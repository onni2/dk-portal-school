/**
 * HTTP client for the local mock backend (Express + PostgreSQL via Docker).
 * Always sends the JWT token stored in localStorage.
 * Exports: mockClient, MOCK_API_URL
 */

export const MOCK_API_URL =
  import.meta.env.VITE_MOCK_API_URL ?? "http://localhost:3001";

/** Reads the JWT token from localStorage and returns appropriate fetch headers. */
function authHeaders(): Record<string, string> {
  const token = localStorage.getItem("dk-auth-token");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

/** Throws a structured error if the response is not OK; handles 204 No Content as undefined. */
async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let message = res.statusText;
    let data: unknown = null;
    try {
      const body = await res.json();
      if (body.message) message = body.message;
      data = body;
    } catch {
      // keep statusText
    }
    throw { message, status: res.status, data };
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const mockClient = {
  get<T>(path: string): Promise<T> {
    return fetch(`${MOCK_API_URL}${path}`, {
      headers: authHeaders(),
    }).then(handleResponse<T>);
  },

  post<T>(path: string, body: unknown): Promise<T> {
    return fetch(`${MOCK_API_URL}${path}`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(body),
    }).then(handleResponse<T>);
  },

  put<T>(path: string, body: unknown): Promise<T> {
    return fetch(`${MOCK_API_URL}${path}`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(body),
    }).then(handleResponse<T>);
  },

  patch<T>(path: string, body: unknown): Promise<T> {
    return fetch(`${MOCK_API_URL}${path}`, {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify(body),
    }).then(handleResponse<T>);
  },

  delete<T>(path: string): Promise<T> {
    return fetch(`${MOCK_API_URL}${path}`, {
      method: "DELETE",
      headers: authHeaders(),
    }).then(handleResponse<T>);
  },
};
