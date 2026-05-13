/**
 * User permissions: load and save which modules a user can access.
 * All operations call the mock backend API (Express + PostgreSQL via Neon).
 * Uses: @/shared/api/mockClient, ../types/user-permissions.types
 * Exports: loadUserPermissions, saveUserPermissions, DEFAULT_PERMISSIONS
 */
import { mockClient } from "@/shared/api/mockClient";
import type { UserPermissions } from "../types/user-permissions.types";

export const DEFAULT_PERMISSIONS: UserPermissions = {
  invoices: false,
  subscription: false,
  hosting: false,
  pos: false,
  dkOne: false,
  dkPlus: false,
  timeclock: false,
  users: false,
};

/** Fetches the module permission flags for a specific user. */
export async function loadUserPermissions(userId: string): Promise<UserPermissions> {
  return mockClient.get<UserPermissions>(`/users/${userId}/permissions`);
}

/** Saves the full set of module permission flags for a user. */
export async function saveUserPermissions(userId: string, permissions: UserPermissions): Promise<void> {
  return mockClient.put<void>(`/users/${userId}/permissions`, permissions);
}
