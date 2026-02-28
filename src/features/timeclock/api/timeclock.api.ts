/**
 * API functions for fetching timeclock entries, employee stamp statuses, stamping an employee in or out, and fetching timeclock settings.
 * Uses: @/shared/api/client, ../types/timeclock.types
 * Exports: fetchTimeclockEntries, fetchTimeclockEmployees, stampEmployee, fetchTimeclockSettings, fetchTimeclockWebConfig
 */
import { apiClient } from "@/shared/api/client";
import type {
  TimeclockEntry,
  TimeclockEmployee,
  TimeclockSettings,
  TimeclockWebConfig,
  StampInput,
  StampResponse,
} from "../types/timeclock.types";

/**
 *
 */
export async function fetchTimeclockEntries(): Promise<TimeclockEntry[]> {
  return apiClient.get<TimeclockEntry[]>("/TimeClock/entries");
}

// Fetch clocked-in and clocked-out employees separately and combine them
/**
 *
 */
export async function fetchTimeclockEmployees(): Promise<TimeclockEmployee[]> {
  const [inEmployees, outEmployees] = await Promise.all([
    apiClient.get<TimeclockEmployee[]>("/TimeClock/in"),
    apiClient.get<TimeclockEmployee[]>("/TimeClock/out"),
  ]);
  return [...inEmployees, ...outEmployees];
}

/**
 *
 */
export async function stampEmployee(input: StampInput): Promise<StampResponse> {
  return apiClient.post<StampResponse>(
    `/TimeClock/stamp/${input.employeeNumber}`,
    { comment: input.comment, project: input.project },
  );
}

/**
 *
 */
export async function fetchTimeclockSettings(): Promise<TimeclockSettings> {
  return apiClient.get<TimeclockSettings>("/TimeClock/settings");
}

/**
 *
 */
export async function fetchTimeclockWebConfig(): Promise<TimeclockWebConfig> {
  return apiClient.get<TimeclockWebConfig>("/TimeClock/web/config");
}
