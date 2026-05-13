/**
 * Portal user management: invite, remove, update, and password reset.
 * All operations call the mock backend API (Express + PostgreSQL via Neon).
 * Uses: @/shared/api/mockClient, ../types/users.types
 * Exports: fetchUsers, inviteUser, updateUser, removeUser, resetPassword
 */
import { mockClient } from "@/shared/api/mockClient";
import type { InviteUserInput, PortalUser } from "../types/users.types";

interface InviteResponse {
  user: PortalUser;
}

/** Fetches all portal users for the active company. */
export async function fetchUsers(): Promise<PortalUser[]> {
  return mockClient.get<PortalUser[]>("/users");
}

/** Invites a new user. The backend creates the account and sends a password-reset email. */
export async function inviteUser(
  input: InviteUserInput,
): Promise<{ user: PortalUser }> {
  return mockClient.post<InviteResponse>("/users/invite", input);
}

/** Updates a user's kennitala or phone number. */
export async function updateUser(
  id: string,
  data: { kennitala?: string; phone?: string },
): Promise<void> {
  return mockClient.patch<void>(`/users/${id}`, data);
}

/** Links or unlinks a hosting account username from a portal user. Pass null to remove the link. */
export async function updateUserHosting(
  id: string,
  hostingUsername: string | null,
): Promise<void> {
  return mockClient.patch<void>(`/users/${id}/hosting`, { hostingUsername });
}

/** Permanently removes a portal user from the company. */
export async function removeUser(id: string): Promise<void> {
  return mockClient.delete<void>(`/users/${id}`);
}

/** Resets a user's password. Requires `currentPassword` only when the user is resetting their own. */
export async function resetPassword(
  userId: string,
  newPassword: string,
  currentPassword?: string,
): Promise<void> {
  return mockClient.post<void>(`/users/${userId}/reset-password`, {
    currentPassword,
    newPassword,
  });
}
