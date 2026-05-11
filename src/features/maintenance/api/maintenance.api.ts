import { mockClient } from "@/shared/api/mockClient";
import type { MaintenanceLock } from "../types/maintenance.types";

export async function fetchMaintenanceLocks(): Promise<MaintenanceLock[]> {
  return mockClient.get<MaintenanceLock[]>("/maintenance");
}

export async function lockRoute(route: string, message: string): Promise<void> {
  await mockClient.post<MaintenanceLock>("/maintenance", { route, message });
}

export async function unlockRoute(route: string): Promise<void> {
  await mockClient.delete<void>(`/maintenance/${encodeURIComponent(route)}`);
}
