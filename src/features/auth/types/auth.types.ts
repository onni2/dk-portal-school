export type AuthRole = "admin" | "standard" | "accountant";

export interface User {
  id: string;
  email: string;
  name: string;
  role: AuthRole;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
