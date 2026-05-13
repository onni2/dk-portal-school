// src/features/users/api/permissions.api.ts
/**
 * User module access for a portal user in the active company.
 *
 * Frontend calls user permission endpoints.
 * Backend stores these flags on user_companies for:
 * user_id + active company_id.
 *
 * The active company is resolved on the backend from the authenticated user/JWT,
 * so this API does not send companyId explicitly.
 *
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

export async function loadUserPermissions(
  userId: string,
): Promise<UserPermissions> {
  if (!userId) {
    throw new Error("userId is required to load user permissions");
  }

  return mockClient.get<UserPermissions>(`/users/${userId}/permissions`);
}

export async function saveUserPermissions(
  userId: string,
  permissions: UserPermissions,
): Promise<void> {
  if (!userId) {
    throw new Error("userId is required to save user permissions");
  }

  return mockClient.put<void>(`/users/${userId}/permissions`, permissions);
}