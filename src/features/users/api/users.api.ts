/**
 * Portal user management: invite, remove, and password reset.
 * All operations update the Zustand users store (local DB).
 * Uses: @/mocks/handlers, ../store/users.store, ../types/users.types
 * Exports: fetchUsers, inviteUser, removeUser, resetPassword
 */
import { hash } from "bcryptjs";
import { delay } from "@/mocks/handlers";
import { usePortalUsersStore } from "../store/users.store";
import type { InviteUserInput, PortalUser } from "../types/users.types";

function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

/**
 * Generates a random 12-character password that satisfies strong password rules:
 * uppercase, lowercase, digit, and special character.
 */
function generatePassword(): string {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghjkmnpqrstuvwxyz";
  const digits = "23456789";
  const special = "!@#$%&*";
  const all = upper + lower + digits + special;

  const required = [
    upper[Math.floor(Math.random() * upper.length)],
    lower[Math.floor(Math.random() * lower.length)],
    digits[Math.floor(Math.random() * digits.length)],
    special[Math.floor(Math.random() * special.length)],
  ];
  const rest = Array.from(
    { length: 8 },
    () => all[Math.floor(Math.random() * all.length)],
  );

  return [...required, ...rest].sort(() => Math.random() - 0.5).join("");
}

export async function fetchUsers(): Promise<PortalUser[]> {
  await delay(400);
  return usePortalUsersStore.getState().users;
}

export async function inviteUser(
  input: InviteUserInput,
): Promise<{ user: PortalUser; generatedPassword: string }> {
  await delay(600);

  const users = usePortalUsersStore.getState().users;
  if (users.some((u) => u.username === input.username)) {
    throw new Error("Notendanafn er þegar í notkun");
  }

  const generatedPassword = generatePassword();
  const user: PortalUser = {
    id: generateId(),
    username: input.username,
    password: await hash(generatedPassword, 10),
    email: input.email,
    name: input.name,
    role: input.role,
    status: "pending",
    mustResetPassword: true,
    createdAt: new Date().toISOString(),
  };

  usePortalUsersStore.getState().addUser(user);
  return { user, generatedPassword };
}

export async function removeUser(id: string): Promise<void> {
  await delay(400);
  usePortalUsersStore.getState().removeUser(id);
}

export async function resetPassword(
  userId: string,
  newPassword: string,
): Promise<void> {
  await delay(600);
  const hashed = await hash(newPassword, 10);
  usePortalUsersStore.getState().updateUser(userId, {
    password: hashed,
    mustResetPassword: false,
    status: "active",
  });
}
