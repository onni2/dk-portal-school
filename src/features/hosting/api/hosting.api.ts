/**
 * Hosting API functions.
 *
 * Hosting is split into two areas:
 *
 * 1. Hosting Management
 *    Used by users with hosting management permission.
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
  HostingPortalUser,
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
 * Fetch portal users in the active company so a hosting account can be linked
 * to one of them.
 */
export async function fetchHostingPortalUsers(): Promise<HostingPortalUser[]> {
  return mockClient.get<HostingPortalUser[]>("/hosting/portal-users");
}

/**
 * Hosting Management:
 * Create a new hosting account.
 *
 * The backend generates a temporary password and returns it once.
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
 * Change password for a specific hosting account.
 */
export async function changeHostingAccountPassword(
  id: string,
  password: string,
): Promise<{ ok: true }> {
  return mockClient.put(`/hosting/accounts/${id}/password`, { password });
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
 * Link an existing hosting account to a portal user.
 *
 * Multiple portal users may be connected to the same hosting account.
 * Backend updates portal_users.hosting_username.
 */
export async function linkHostingAccountToPortalUser({
  accountId,
  userId,
}: {
  accountId: string;
  userId: string;
}): Promise<{
  ok: true;
  linkedPortalUserId: string;
}> {
  return mockClient.post(`/hosting/accounts/${accountId}/link-user`, {
    userId,
  });
}

/**
 * Hosting Management:
 * Remove the link between a hosting account and a portal user.
 *
 * Backend clears portal_users.hosting_username only for the selected portal user.
 */
export async function unlinkHostingAccountFromPortalUser({
  accountId,
  userId,
}: {
  accountId: string;
  userId: string;
}): Promise<{ ok: true }> {
  return mockClient.post(`/hosting/accounts/${accountId}/unlink-user`, {
    userId,
  });
}

/**
 * Hosting Management:
 * Fetch login history for a specific hosting account.
 */
export async function fetchHostingAccountLog(
  id: string,
): Promise<HostingLogEntry[]> {
  return mockClient.get<HostingLogEntry[]>(`/hosting/accounts/${id}/log`);
}

/**
 * Hosting Management:
 * Sign out a specific hosting account session.
 */
export async function signOutHostingAccount(id: string): Promise<{
  ok: true;
  signedOutAt: string;
}> {
  return mockClient.post(`/hosting/accounts/${id}/sign-out`, {});
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
 */
export async function signOutMyHosting(): Promise<{
  ok: true;
  signedOutAt: string;
}> {
  return mockClient.post("/hosting/me/sign-out", {});
}