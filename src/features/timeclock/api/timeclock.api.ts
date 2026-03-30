/**
 * API functions for timeclock settings and web config.
 * IP whitelist and phone numbers are stored in the mock backend (Neon DB), scoped per company.
 * Uses: @/shared/api/client, @/shared/api/mockClient, ../types/timeclock.types
 * Exports: fetchTimeclockSettings, fetchIpWhitelist, addIpEntry, removeIpEntry,
 *          fetchEmployeePhones, addEmployeePhone, removeEmployeePhone
 */
import { apiClient } from "@/shared/api/client";
import { mockClient } from "@/shared/api/mockClient";
import type {
  TimeclockSettings,
  IpWhitelistEntry,
  EmployeePhoneEntry,
} from "../types/timeclock.types";

export async function fetchTimeclockSettings(): Promise<TimeclockSettings> {
  return apiClient.get<TimeclockSettings>("/TimeClock/settings");
}

// --- IP Whitelist ---

export async function fetchIpWhitelist(): Promise<IpWhitelistEntry[]> {
  return mockClient.get<IpWhitelistEntry[]>("/timeclock/ips");
}

export async function addIpEntry(ip: string, label: string): Promise<IpWhitelistEntry> {
  return mockClient.post<IpWhitelistEntry>("/timeclock/ips", { ip, label });
}

export async function removeIpEntry(id: string): Promise<void> {
  return mockClient.delete<void>(`/timeclock/ips/${id}`);
}

// --- Employee Phones ---

export async function fetchEmployeePhones(): Promise<EmployeePhoneEntry[]> {
  return mockClient.get<EmployeePhoneEntry[]>("/timeclock/phones");
}

export async function addEmployeePhone(
  employeeNumber: string,
  employeeName: string,
  phone: string,
): Promise<EmployeePhoneEntry> {
  return mockClient.post<EmployeePhoneEntry>("/timeclock/phones", { employeeNumber, employeeName, phone });
}

export async function removeEmployeePhone(id: string): Promise<void> {
  return mockClient.delete<void>(`/timeclock/phones/${id}`);
}
