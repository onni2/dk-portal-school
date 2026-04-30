/**
 * Hosting API functions — all call the mock Express backend.
 * NOTE: This is a mock/prototype. Actions update the DB but do not
 * connect to a real hosted environment service.
 * Uses: @/shared/api/mockClient, ../types/hosting.types
 * Exports: fetchHostingAccounts, createHostingAccount, deleteHostingAccount,
 *          resetHostingPassword, restartHostingService
 */
import { mockClient } from "@/shared/api/mockClient";
import type {
  CreateHostingAccountPayload,
  HostingAccount,
} from "../types/hosting.types";

export async function fetchHostingAccounts(): Promise<HostingAccount[]> {
  return mockClient.get<HostingAccount[]>("/hosting/accounts");
}

export async function createHostingAccount(
  payload: CreateHostingAccountPayload,
): Promise<{ account: HostingAccount; tempPassword: string }> {
  return mockClient.post("/hosting/accounts", payload);
}

export async function deleteHostingAccount(id: string): Promise<void> {
  return mockClient.delete(`/hosting/accounts/${id}`);
}

export async function resetHostingPassword(
  id: string,
): Promise<{ tempPassword: string }> {
  return mockClient.post(`/hosting/accounts/${id}/reset-password`, {});
}

export async function restartHostingService(
  id: string,
): Promise<{ restarted: string }> {
  return mockClient.post(`/hosting/accounts/${id}/restart`, {});
}
