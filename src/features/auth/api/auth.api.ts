/**
 * Auth API: login checks credentials against the portal users store (localStorage).
 * The DK API token (VITE_API_TOKEN) is shared for all users — apiClient uses it automatically.
 * Uses: @/features/users/store/users.store, ../types/auth.types
 * Exports: login, logout
 */
import { usePortalUsersStore } from "@/features/users/store/users.store";
import type { AuthResponse, LoginCredentials } from "../types/auth.types";

export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  const { users } = usePortalUsersStore.getState();

  const found = users.find(
    (u) => u.username === credentials.username || u.email === credentials.username,
  );

  if (!found) {
    throw new Error("Notandi finnst ekki");
  }

  // Empty password = not yet set, any input accepted (user must set password in Settings)
  if (found.password && found.password !== credentials.password) {
    throw new Error("Rangt lykilorð");
  }

  const user = {
    id: found.id,
    name: found.name,
    email: found.email,
    kennitala: found.kennitala,
    role: found.role,
    mustResetPassword: !found.password, // redirect to settings if no password set
  };

  // Store a mock token — apiClient falls back to VITE_API_TOKEN for DK API calls
  const token = `mock-token-${found.id}`;
  localStorage.setItem("dk-auth-token", token);

  return { user, token };
}

export async function logout(): Promise<void> {
  // auth store handles clearing localStorage
}
