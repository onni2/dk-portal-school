/**
 * Auth API functions: login and logout.
 * Calls the mock backend (Express + PostgreSQL) for username/password auth.
 * Uses: @/shared/api/mockClient, ../types/auth.types
 * Exports: login, logout
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
    activeCompanyId?: string;
  };
  companies: CompanyMembership[];
}

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
    companyId: mockUser.companyId ?? mockUser.activeCompanyId,
  };

  return { user, token: data.token, companies: data.companies ?? [] };
}

export async function logout(): Promise<void> {
  // Nothing to call on the API — the auth store handles clearing localStorage
}

export async function forgotPassword(username: string): Promise<void> {
  return mockClient.post<void>("/auth/forgot-password", { username });
}

export async function resetPasswordWithToken(token: string, newPassword: string): Promise<void> {
  return mockClient.post<void>("/auth/reset-password-token", { token, newPassword });
}