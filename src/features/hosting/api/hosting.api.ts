/**
 * Hosting API functions.
 *
 * Hosting is split into two areas:
 *
 * 1. Hosting Management
 *    Used by admins/users with hosting management permission.
 *    These calls operate on hosting accounts for the active company.
 *
 * 2. MyHosting
 *    Used by the currently logged-in portal user.
 *    These calls operate on the hosting account connected to the logged-in user.
 *
 * Uses: @/shared/api/mockClient, ../types/hosting.types
 */

import { mockClient } from "@/shared/api/mockClient";
import type {
  CreateHostingAccountPayload,
  HostingAccount,
  HostingLogEntry,
} from "../types/hosting.types";

/**
 * Hosting Management:
 * Fetch all hosting accounts for the active company.
 */
export async function fetchHostingAccounts(): Promise<HostingAccount[]> {
  return mockClient.get<HostingAccount[]>("/hosting/accounts");
}

/**
 * Hosting Management:
 * Create a new hosting account.
 *
 * payload may optionally include portalUserId if the account should be
 * connected to a portal user immediately.
 */
export async function createHostingAccount(
  payload: CreateHostingAccountPayload,
): Promise<{
  account: HostingAccount;
  tempPassword: string;
  linkedPortalUserId: string | null;
}> {
  return mockClient.post("/hosting/accounts", payload);
}

/**
 * Hosting Management:
 * Soft-delete a hosting account.
 */
export async function deleteHostingAccount(id: string): Promise<{ ok: true }> {
  return mockClient.delete(`/hosting/accounts/${id}`);
}

/**
 * Hosting Management:
 * Reset hosting account password and receive a temporary password.
 */
export async function resetHostingPassword(
  id: string,
): Promise<{ tempPassword: string }> {
  return mockClient.post(`/hosting/accounts/${id}/reset-password`, {});
}

/**
 * Hosting Management:
 * Link an existing hosting account to a portal user.
 */
export async function linkPortalUserToHostingAccount(
  hostingAccountId: string,
  userId: string,
): Promise<{
  account: HostingAccount;
  linkedPortalUserId: string;
}> {
  return mockClient.post(`/hosting/accounts/${hostingAccountId}/link-user`, {
    userId,
  });
}

/**
 * Hosting Management:
 * Remove the link between a hosting account and a portal user.
 */
export async function unlinkPortalUserFromHostingAccount(
  hostingAccountId: string,
  userId: string,
): Promise<{ ok: true }> {
  return mockClient.post(`/hosting/accounts/${hostingAccountId}/unlink-user`, {
    userId,
  });
}

/**
 * Hosting Management:
 * Fetch login history for a specific hosting account (admin view).
 */
export async function fetchHostingAccountLog(id: string): Promise<HostingLogEntry[]> {
  return mockClient.get<HostingLogEntry[]>(`/hosting/accounts/${id}/log`);
}

/**
 * MyHosting:
 * Fetch the hosting account connected to the logged-in portal user.
 */
export async function fetchMyHostingAccount(): Promise<HostingAccount> {
  return mockClient.get<HostingAccount>("/hosting/me");
}

/**
 * MyHosting:
 * Fetch login history for the logged-in user's hosting account.
 */
export async function fetchMyHostingLog(): Promise<HostingLogEntry[]> {
  return mockClient.get<HostingLogEntry[]>("/hosting/me/log");
}

/**
 * MyHosting:
 * Change password for the logged-in user's own hosting account.
 */
export async function changeMyHostingPassword(
  password: string,
): Promise<{ ok: true }> {
  return mockClient.put("/hosting/me/password", { password });
}

/**
 * MyHosting:
 * Sign the logged-in portal user out of their connected hosting account.
 *
 * Current backend can use a mock provider.
 * Later the company can plug in the real hosting environment behind this endpoint.
 */
export async function signOutMyHosting(): Promise<{
  ok: true;
  signedOutAt: string;
}> {
  return mockClient.post("/hosting/me/sign-out", {});
}

/**
 * Hosting Management:
 * Admin sign-out of a specific hosting account session.
 */
export async function signOutHostingAccount(id: string): Promise<{
  ok: true;
  signedOutAt: string;
}> {
  return mockClient.post(`/hosting/accounts/${id}/sign-out`, {});
}