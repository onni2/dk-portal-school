/**
 * Auth API functions: login and logout.
 * Checks username/password against the portal users store, then uses each
 * user's personal DK Plus token (if set) to fetch their real employee info
 * and derive role from the Merking field.
 * Uses: ../store/users.store (via getState), @/shared/api/client, ../types/auth.types
 * Exports: login, logout
 */
import { compare } from "bcryptjs";
import { delay } from "@/mocks/handlers";
import { usePortalUsersStore } from "@/features/users/store/users.store";
import { BASE_URL } from "@/shared/api/client";
import type { AuthResponse, LoginCredentials } from "../types/auth.types";

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

/**
 * Logs in using username and password against the portal users store.
 * If the matched user has a dkToken, fetches their real DK Plus employee info.
 * Falls back to local data if the DK API is unreachable or times out.
 */
export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  const { username, password } = credentials;

  const users = usePortalUsersStore.getState().users;
  const match = users.find((u) => u.username === username);

  if (!match || !(await compare(password, match.password))) {
    await delay(600); // small delay only for failed logins to prevent brute force
    throw new Error("Rangt notendanafn eða lykilorð");
  }

  if (match.dkToken) {
    try {
      const tokens = await getWithToken<TokenData[]>("/Token", match.dkToken);
      const tokenData = tokens[0];
      if (tokenData) {
        const employeeNumber = await getWithToken<string>(
          `/Token/${tokenData.User}/${tokenData.Company}`,
          match.dkToken,
        );
        const employee = await getWithToken<EmployeeData>(
          `/general/employee/${employeeNumber}`,
          match.dkToken,
        );
        return {
          user: {
            id: employee.Number,
            name: employee.Name,
            email: employee.Email ?? match.email,
            kennitala: employee.Number,
            role: match.role,
            mustResetPassword: match.mustResetPassword,
          },
          token: match.dkToken,
        };
      }
    } catch {
      // DK API unreachable — fall through to local data
    }
  }

  return {
    user: {
      id: match.id,
      name: match.name,
      email: match.email,
      role: match.role,
      mustResetPassword: match.mustResetPassword,
    },
    token: `mock-token-${match.id}`,
  };
}

/**
 * Logs out — clears local state only, no API call needed.
 */
export async function logout(): Promise<void> {
  // Nothing to call on the API — the auth store handles clearing localStorage
}
