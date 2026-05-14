/**
 * API functions for timeclock — all backed by the Neon mock DB, scoped per company.
 * Uses: @/shared/api/mockClient, ../types/timeclock.types
 * Exports: fetchTimeclockConfig, fetchIpWhitelist, addIpEntry, removeIpEntry,
 *          fetchEmployeePhones, addEmployeePhone, removeEmployeePhone
 */
import { mockClient } from "@/shared/api/mockClient";
import type {
  TimeclockConfig,
  IpWhitelistEntry,
  EmployeePhoneEntry,
} from "../types/timeclock.types";

export async function fetchTimeclockConfig(): Promise<TimeclockConfig> {
  return mockClient.get<TimeclockConfig>("/timeclock/config");
}

// --- IP Whitelist ---

export async function fetchIpWhitelist(): Promise<IpWhitelistEntry[]> {
  return mockClient.get<IpWhitelistEntry[]>("/timeclock/ips");
}

export async function addIpEntry(
  ip: string,
  label: string,
): Promise<IpWhitelistEntry> {
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
  kennitala: string,
  employeeName: string,
  phone: string,
): Promise<EmployeePhoneEntry> {
  return mockClient.post<EmployeePhoneEntry>("/timeclock/phones", {
    kennitala,
    employeeName,
    phone,
  });
}

export async function removeEmployeePhone(id: string): Promise<void> {
  return mockClient.delete<void>(`/timeclock/phones/${id}`);
}
