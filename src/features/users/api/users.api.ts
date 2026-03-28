/**
 * Fetches employees from the DK API and merges with stored portal permissions.
 * To connect permissions to a real backend: replace getPermissions/setPermissions
 * with apiClient calls to a portal users endpoint.
 * Uses: @/shared/api/client, ../types/users.types
 * Exports: fetchPortalUsers, updateUserPermissions
 */
import { apiClient } from "@/shared/api/client";
import type { Employee, UserPermissions, PortalUser } from "../types/users.types";

const PERMISSIONS_KEY = "dk-portal-permissions";

const DEFAULT_PERMISSIONS: UserPermissions = {
  invoices: false,
  hosting: false,
  pos: false,
  dkOne: false,
  dkPlus: false,
  timeclock: false,
  users: false,
  subscription: false,
};

function loadPermissions(): Record<string, Partial<UserPermissions>> {
  try {
    const raw = localStorage.getItem(PERMISSIONS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function savePermissions(perms: Record<string, Partial<UserPermissions>>) {
  localStorage.setItem(PERMISSIONS_KEY, JSON.stringify(perms));
}

export async function fetchPortalUsers(): Promise<PortalUser[]> {
  const employees = await apiClient.get<Employee[]>("/general/employee");
  const stored = loadPermissions();
  return employees
    .map((emp) => ({
      ...emp,
      permissions: { ...DEFAULT_PERMISSIONS, ...stored[emp.Number] },
    }))
    .sort((a, b) => a.Name.localeCompare(b.Name, "is"));
}

export async function updateUserPermissions(
  number: string,
  permissions: UserPermissions,
): Promise<void> {
  const stored = loadPermissions();
  stored[number] = permissions;
  savePermissions(stored);
}

// TODO: replace with apiClient.delete(`/portal/users/${number}`) when backend is ready
export async function deleteUser(number: string): Promise<void> {
  const stored = loadPermissions();
  delete stored[number];
  savePermissions(stored);
}
