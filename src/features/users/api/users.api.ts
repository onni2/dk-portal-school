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

/**
 * Fetch portal users for the active company.
 *
 * Backend returns permissions on each user from user_companies.
 */
export async function fetchUsers(): Promise<PortalUser[]> {
  return mockClient.get<PortalUser[]>("/users");
}

/**
 * Invite a new portal user into the active company.
 *
 * input.permissions is saved by the backend to user_companies,
 * constrained by company_licences.
 *
 * input.hostingUsername may be used by the backend during invite
 * if Hosting is enabled for the company.
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
 * Remove a portal user.
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