/**
 * Auth API functions: login and logout against the real DK API.
 * Login verifies the token, looks up the employee, and returns a User.
 * Uses: @/shared/api/client, ../types/auth.types
 * Exports: login, logout
 */
import { BASE_URL } from "@/shared/api/client";
import type { AuthResponse, LoginCredentials } from "../types/auth.types";

// Shape of what GET /Token returns
interface TokenData {
  Token: string;
  Company: string;
  User: string;
}

// Shape of what GET /general/employee/{number} returns (only what we need)
interface EmployeeData {
  Number: string;
  Name: string;
  Email?: string;
}

/**
 * Makes a GET request with a specific bearer token.
 * Used during login before the token is stored.
 */
async function getWithToken<T>(path: string, token: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Ógilt tókn — athugaðu og reyndu aftur");
  return res.json();
}

/**
 * Logs in using a DK API token.
 * Verifies the token, looks up the employee it belongs to, and returns their details.
 */
export async function login(
  credentials: LoginCredentials,
): Promise<AuthResponse> {
  const { token } = credentials;

  // Step 1 — verify token and get the user + company IDs
  const tokens = await getWithToken<TokenData[]>("/Token", token);
  const tokenData = tokens[0];
  if (!tokenData) throw new Error("Ógilt tókn");

  // Step 2 — get the employee number linked to this user in this company
  const employeeNumber = await getWithToken<string>(
    `/Token/${tokenData.User}/${tokenData.Company}`,
    token,
  );

  // Step 3 — get the employee's full details (name, email, kennitala)
  const employee = await getWithToken<EmployeeData>(
    `/general/employee/${employeeNumber}`,
    token,
  );

  return {
    user: {
      id: employee.Number,
      name: employee.Name,
      email: employee.Email ?? "",
      kennitala: employee.Number,
      role: "standard",
    },
    token,
  };
}

/**
 * Logs out — clears local state only, no API call needed.
 */
export async function logout(): Promise<void> {
  // Nothing to call on the API — the auth store handles clearing localStorage
}
