/**
 * localStorage-based permission storage for portal users.
 * Stores which modules each user can access, keyed by user id.
 * Replace with a real backend call when the API is ready.
 * Uses: ../types/user-permissions.types
 * Exports: loadUserPermissions, saveUserPermissions, DEFAULT_PERMISSIONS
 */
import type { UserPermissions } from "../types/user-permissions.types";

const PERMISSIONS_KEY = "dk-portal-permissions";

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

function loadAll(): Record<string, Partial<UserPermissions>> {
  try {
    const raw = localStorage.getItem(PERMISSIONS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function loadUserPermissions(userId: string): UserPermissions {
  const all = loadAll();
  return { ...DEFAULT_PERMISSIONS, ...all[userId] };
}

export function saveUserPermissions(userId: string, permissions: UserPermissions): void {
  const all = loadAll();
  all[userId] = permissions;
  localStorage.setItem(PERMISSIONS_KEY, JSON.stringify(all));
}
