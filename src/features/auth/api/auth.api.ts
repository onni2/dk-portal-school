/**
 * Auth API functions: login and logout.
 * Calls the mock backend (Express + PostgreSQL) for username/password auth.
 * Uses: @/shared/api/mockClient, ../types/auth.types
 * Exports: login, logout, switchCompany
 */
import { mockClient } from "@/shared/api/mockClient";
import type { AuthResponse, LoginCredentials, User, CompanyMembership } from "../types/auth.types";

interface MockLoginResponse {
  token: string;
  companyDkToken?: string | null;
  user: {
    id: string;
    username: string;
    email: string;
    name: string;
    role: string;
    kennitala?: string;
    phone?: string;
    mustResetPassword: boolean;
    companyId?: string;
  };
  companies: CompanyMembership[];
}

const BASE = import.meta.env.VITE_MOCK_API_URL;

export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  const data = await mockClient.post<MockLoginResponse>("/auth/login", credentials);

  // Store JWT for mockClient (Express backend)
  localStorage.setItem("dk-auth-token", data.token);
  // Store company DK Plus token for apiClient (api.dkplus.is)
  if (data.companyDkToken) {
    localStorage.setItem("dk-company-token", data.companyDkToken);
  }

  const mockUser = data.user;

  const user: User = {
    id: mockUser.id,
    name: mockUser.name,
    email: mockUser.email,
    kennitala: mockUser.kennitala,
    phone: mockUser.phone,
    role: mockUser.role as User["role"],
    mustResetPassword: mockUser.mustResetPassword,
    companyId: mockUser.companyId,
  };

  return { user, token: data.token, companies: data.companies ?? [] };
}

export async function logout(): Promise<void> {
  // Nothing to call on the API — the auth store handles clearing localStorage
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