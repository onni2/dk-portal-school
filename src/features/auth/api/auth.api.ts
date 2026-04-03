/**
 * Auth API: login checks credentials against the backend server.
 * Uses: ../types/auth.types
 * Exports: login, logout
 */
import type { AuthResponse, LoginCredentials } from "../types/auth.types";

const BASE = import.meta.env.VITE_MOCK_API_URL;

export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  const res = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: credentials.username,
      password: credentials.password,
    }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? "Innskráning mistókst");
  }

  return res.json();
}

export async function logout(): Promise<void> {
  // auth store handles clearing localStorage
}

export async function switchCompany(companyId: string): Promise<{ token: string; companyDkToken: string }> {
  const res = await fetch(`${BASE}/auth/switch-company`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("dk-auth-token") ?? ""}`,
    },
    body: JSON.stringify({ companyId }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? "Ekki tókst að skipta um fyrirtæki");
  }

  return res.json();
}