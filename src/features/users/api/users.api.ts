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
  generatedPassword: string;
}

export async function fetchUsers(): Promise<PortalUser[]> {
  return mockClient.get<PortalUser[]>("/users");
}

export async function inviteUser(
  input: InviteUserInput,
): Promise<{ user: PortalUser; generatedPassword: string }> {
  return mockClient.post<InviteResponse>("/users/invite", input);
}

export async function updateUser(
  id: string,
  data: { kennitala?: string; phone?: string },
): Promise<void> {
  return mockClient.patch<void>(`/users/${id}`, data);
}

export async function updateUserHosting(
  id: string,
  hostingUsername: string | null,
): Promise<void> {
  return mockClient.patch<void>(`/users/${id}/hosting`, { hostingUsername });
}

export async function removeUser(id: string): Promise<void> {
  return mockClient.delete<void>(`/users/${id}`);
}

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
