/**
 * Maintenance lock API: fetch active locks, lock a route, and unlock a route.
 * Used by the system admin panel and the dashboard maintenance banner.
 * Uses: @/shared/api/mockClient, ../types/maintenance.types
 * Exports: fetchMaintenanceLocks, lockRoute, unlockRoute
 */
import { mockClient } from "@/shared/api/mockClient";
import type { MaintenanceLock } from "../types/maintenance.types";

/** Returns all currently active maintenance locks. */
export async function fetchMaintenanceLocks(): Promise<MaintenanceLock[]> {
  return mockClient.get<MaintenanceLock[]>("/maintenance");
}

/** Locks the given route with a user-visible message. Creates or updates the lock. */
export async function lockRoute(route: string, message: string): Promise<void> {
  await mockClient.post<MaintenanceLock>("/maintenance", { route, message });
}

/** Removes the maintenance lock for the given route. */
export async function unlockRoute(route: string): Promise<void> {
  await mockClient.delete<void>(`/maintenance/${encodeURIComponent(route)}`);
}
