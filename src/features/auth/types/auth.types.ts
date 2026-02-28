/**
 * TypeScript types for authentication: user roles, user shape, login credentials, and the login response.
 * Uses: nothing — standalone file
 * Exports: AuthRole, User, LoginCredentials, AuthResponse
 */
export type AuthRole = "admin" | "standard" | "accountant";

export interface User {
  id: string;
  email: string;
  name: string;
  role: AuthRole;
  kennitala?: string;
}

export interface LoginCredentials {
  token: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
