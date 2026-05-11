export type AuthRole = "user" | "super_admin" | "god";
export type CompanyRole = "admin" | "user";

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
  createdAt?: string;
  role: CompanyRole;
  permissions: UserPermissions;
}

export interface User {
  id: string;
  username?: string;
  email: string;
  name: string;
  role: AuthRole;
  kennitala?: string;
  phone?: string;
  hostingUsername?: string;
  mustResetPassword?: boolean;
  companyId?: string;
  companyRole?: CompanyRole;
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
