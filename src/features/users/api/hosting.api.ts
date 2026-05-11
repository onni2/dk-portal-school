// src/features/users/api/hosting.api.ts
/**
 * Hosting accounts API — fetches the company's hosting accounts for the invite modal.
 * Uses: @/shared/api/mockClient
 * Exports: fetchHostingAccounts, HostingAccount
 */
import { mockClient } from "@/shared/api/mockClient";

export interface HostingAccount {
  id: string;
  username: string;
  displayName: string;
}

// 
export async function fetchHostingAccounts(): Promise<HostingAccount[]> {
  return mockClient.get<HostingAccount[]>("/hosting/accounts");
}
