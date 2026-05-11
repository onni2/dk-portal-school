/**
 * Types for the hosted environment (Hýsing) feature.
 *
 * Hosting is split into:
 * - Hosting Management: admins/manage hosting accounts for active company
 * - MyHosting: logged-in portal user's own connected hosting account
 *
 * Exports:
 * - HostingAccount
 * - CreateHostingAccountPayload
 * - HostingLogEntry
 */

export interface HostingAccount {
  id: string;
  username: string;
  displayName: string;
  duoDisplayName: string | null;
  hasMfa: boolean;
  hasPendingActivation: boolean;
  status: string | null;
  isLoggedIn: boolean | null;
  linkedPortalUser: { name: string; username: string } | null;
}

export interface CreateHostingAccountPayload {
  username: string;
  displayName: string;

  /**
   * Optional portal user id.
   * If provided, backend creates the hosting account and connects it to this portal user.
   */
  portalUserId?: string;
}

export interface HostingLogEntry {
  id: string;
  type: "login" | "logout" | "failed" | string;
  createdAt: string;
  ip: string | null;
  device: string | null;
  userAgent: string | null;
}