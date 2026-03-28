/**
 * Portal user management: invite and remove users from the local store.
 * Uses localStorage via the portal users store — no backend required.
 * Uses: ../store/users.store, ../types/users.types
 * Exports: fetchUsers, inviteUser, updateUser, removeUser
 */
import { usePortalUsersStore } from "../store/users.store";
import type { InviteUserInput, PortalUser } from "../types/users.types";

export async function fetchUsers(): Promise<PortalUser[]> {
  return usePortalUsersStore.getState().users;
}

export async function inviteUser(
  input: InviteUserInput,
): Promise<{ user: PortalUser; generatedPassword: string }> {
  const newUser: PortalUser = {
    id: crypto.randomUUID(),
    username: input.username,
    email: input.email,
    name: input.name,
    role: input.role,
    password: "dk",
    status: "active",
    mustResetPassword: true,
    createdAt: new Date().toISOString(),
    kennitala: input.kennitala,
  };

  usePortalUsersStore.getState().addUser(newUser);

  // Password is empty — user sets their own in Settings on first login
  return { user: newUser, generatedPassword: "" };
}

export async function updateUser(
  id: string,
  data: Partial<PortalUser>,
): Promise<void> {
  usePortalUsersStore.getState().updateUser(id, data);
}

export async function removeUser(id: string): Promise<void> {
  usePortalUsersStore.getState().removeUser(id);
}

export async function resetPassword(
  userId: string,
  newPassword: string,
  currentPassword?: string,
): Promise<void> {
  const { users, updateUser } = usePortalUsersStore.getState();
  const user = users.find((u) => u.id === userId);
  if (!user) throw new Error("Notandi finnst ekki");

  // Verify current password only if one is already set
  if (user.password && currentPassword !== user.password) {
    throw new Error("Rangt núverandi lykilorð");
  }

  updateUser(userId, { password: newPassword, mustResetPassword: false });
}
