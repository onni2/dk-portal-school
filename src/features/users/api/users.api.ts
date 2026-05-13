// src/features/users/api/users.api.ts
/**
 * Portal user management for the active company:
 * fetch members, invite users, update own profile fields,
 * remove users, and reset passwords.
 *
 * Backend resolves the active company from the authenticated user/JWT.
 * Backend stores per-company module access on user_companies.
 *
 * Hosting account linking belongs to:
 * @/features/hosting/api/hosting.api
 *
 * Uses: @/shared/api/mockClient, ../types/users.types
 * Exports: fetchUsers, inviteUser, updateUser, removeUser, resetPassword
 */
import { mockClient } from "@/shared/api/mockClient";
import type { InviteUserInput, PortalUser } from "../types/users.types";

interface InviteResponse {
  user: PortalUser;
  generatedPassword: string;
}

function requireId(id: string, label: string): void {
  if (!id) {
    throw new Error(`${label} is required`);
  }
}

/** Fetches all portal users for the active company. */
export async function fetchUsers(): Promise<PortalUser[]> {
  return mockClient.get<PortalUser[]>("/users");
}

/**
 * Invite a new portal user into the active company.
 *
 * Backend:
 * - creates a standard portal user in portal_users
 * - creates company membership in user_companies
 * - stores initial module permissions on user_companies
 *
 * Hosting account linking is not handled here.
 * Hosting linking belongs to the Hosting module.
 */
export async function inviteUser(
  input: InviteUserInput,
): Promise<InviteResponse> {
  return mockClient.post<InviteResponse>("/users/invite", input);
}

/**
 * Update profile fields.
 *
 * Current backend only allows the logged-in user to update their own record.
 */
export async function updateUser(
  id: string,
  data: { kennitala?: string; phone?: string },
): Promise<void> {
  requireId(id, "User id");

  return mockClient.patch<void>(`/users/${id}`, data);
}

/**
 * Remove a portal user from the active company.
 *
 * Backend prevents removing yourself and elevated users.
 */
export async function removeUser(id: string): Promise<void> {
  requireId(id, "User id");

  return mockClient.delete<void>(`/users/${id}`);
}

/**
 * Reset password for a user.
 *
 * Backend allows:
 * - self reset with currentPassword
 * - elevated user reset without currentPassword
 */
export async function resetPassword(
  userId: string,
  newPassword: string,
  currentPassword?: string,
): Promise<void> {
  requireId(userId, "User id");

  if (!newPassword) {
    throw new Error("New password is required");
  }

  return mockClient.post<void>(`/users/${userId}/reset-password`, {
    currentPassword,
    newPassword,
  });
}