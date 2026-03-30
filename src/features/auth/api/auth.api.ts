/**
 * Auth API functions: login and logout.
 * Calls the mock backend (Express + PostgreSQL) for username/password auth.
 * If the company has a dkToken, also fetches real DK Plus employee info.
 * Uses: @/shared/api/mockClient, @/shared/api/client, ../types/auth.types
 * Exports: login, logout
 */
import { mockClient } from "@/shared/api/mockClient";
import { BASE_URL } from "@/shared/api/client";
import type { AuthResponse, LoginCredentials, User } from "../types/auth.types";

interface MockLoginResponse {
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
    name: string;
    role: string;
    kennitala?: string;
    phone?: string;
    mustResetPassword: boolean;
    dkToken?: string;
    companyId?: string;
  };
}

interface TokenData {
  Token: string;
  Company: string;
  User: string;
}

interface EmployeeData {
  Number: string;
  Name: string;
  Email?: string;
}

const DK_API_TIMEOUT_MS = 5000;

async function getWithToken<T>(path: string, token: string): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), DK_API_TIMEOUT_MS);
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) throw new Error(`${res.status}`);
    return res.json();
  } finally {
    clearTimeout(timer);
  }
}

export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  const data = await mockClient.post<MockLoginResponse>("/auth/login", credentials);

  // Store JWT so mockClient can use it for subsequent requests
  localStorage.setItem("dk-auth-token", data.token);

  const mockUser = data.user;

  // If the company has a DK Plus token, try to enrich with real employee data
  if (mockUser.dkToken) {
    try {
      const tokens = await getWithToken<TokenData[]>("/Token", mockUser.dkToken);
      const tokenData = tokens[0];
      if (tokenData) {
        const employeeNumber = await getWithToken<string>(
          `/Token/${tokenData.User}/${tokenData.Company}`,
          mockUser.dkToken,
        );
        const employee = await getWithToken<EmployeeData>(
          `/general/employee/${employeeNumber}`,
          mockUser.dkToken,
        );
        const user: User = {
          id: mockUser.id,
          name: employee.Name,
          email: employee.Email ?? mockUser.email,
          kennitala: mockUser.kennitala,
          phone: mockUser.phone,
          role: mockUser.role as User["role"],
          mustResetPassword: mockUser.mustResetPassword,
          companyId: mockUser.companyId,
        };
        return { user, token: data.token };
      }
    } catch {
      // DK API unreachable — fall through to local data
    }
  }

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

  return { user, token: data.token };
}

export async function logout(): Promise<void> {
  // Nothing to call on the API — the auth store handles clearing localStorage
}
