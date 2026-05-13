/**
 * Hosting accounts API for the user management feature — fetches the company's hosting accounts
 * so they can be linked to portal users in the invite and edit modals.
 * Uses: @/shared/api/mockClient
 * Exports: fetchHostingAccounts, HostingAccount
 */
import { mockClient } from "@/shared/api/mockClient";

export interface HostingAccount {
  id: string;
  username: string;
  displayName: string;
}

/** Fetches all hosting accounts for the active company. */
export async function fetchHostingAccounts(): Promise<HostingAccount[]> {
  return mockClient.get<HostingAccount[]>("/hosting/accounts");
}
