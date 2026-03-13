/**
 * API functions for timeclock settings and web config.
 * IP whitelist and phone numbers use mock data until the backend supports them.
 * Uses: @/shared/api/client, @/mocks/timeclock.mock, ../types/timeclock.types
 * Exports: fetchTimeclockSettings, fetchIpWhitelist, fetchEmployeePhones
 */
import { apiClient } from "@/shared/api/client";
import { delay } from "@/mocks/handlers";
import { MOCK_IP_WHITELIST, MOCK_EMPLOYEE_PHONES } from "@/mocks/timeclock.mock";
import type {
  TimeclockSettings,
  IpWhitelistEntry,
  EmployeePhoneEntry,
} from "../types/timeclock.types";

export async function fetchTimeclockSettings(): Promise<TimeclockSettings> {
  return apiClient.get<TimeclockSettings>("/TimeClock/settings");
}

// --- Mock functions — replace with apiClient calls when backend is ready ---

export async function fetchIpWhitelist(): Promise<IpWhitelistEntry[]> {
  await delay(300);
  return MOCK_IP_WHITELIST;
}

export async function fetchEmployeePhones(): Promise<EmployeePhoneEntry[]> {
  await delay(300);
  return MOCK_EMPLOYEE_PHONES;
}
