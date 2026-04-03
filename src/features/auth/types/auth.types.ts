/**
 * TypeScript types for authentication: user roles, user shape, login credentials, and the login response.
 * Uses: nothing — standalone file
 * Exports: AuthRole, User, CompanyMembership, LoginCredentials, AuthResponse
 */
export type AuthRole = "admin" | "standard" | "accountant";

export interface UserPermissions {
  invoices: boolean;
  subscription: boolean;
  hosting: boolean;
  pos: boolean;
  dkOne: boolean;
  dkPlus: boolean;
  timeclock: boolean;
  users: boolean;
}

export interface CompanyMembership {
  id: string;
  name: string;
  role: AuthRole;
  permissions: UserPermissions;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: AuthRole;
  kennitala?: string;
  phone?: string;
  mustResetPassword?: boolean;
  activeCompanyId?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  companyDkToken?: string;
  companies: CompanyMembership[];
}