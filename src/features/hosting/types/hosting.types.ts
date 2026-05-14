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

export interface LinkedPortalUser {
  id: string;
  name: string;
  username: string;
}

export interface HostingAccount {
  id: string;
  username: string;
  displayName: string;
  duoDisplayName: string | null;
  hasMfa: boolean;
  hasPendingActivation: boolean;
  status: string | null;
  isLoggedIn: boolean | null;

  /**
   * All Mínar síður users connected to this hosting account.
   * Multiple portal users may share the same hosting account.
   */
  linkedPortalUsers: LinkedPortalUser[];

  /**
   * Backwards-compatible single user reference.
   * Backend returns the first linked user here, or null.
   */
  linkedPortalUser: LinkedPortalUser | null;
}

export interface HostingPortalUser {
  id: string;
  username: string;
  email: string | null;
  name: string;
  status: string | null;
  companyRole: "admin" | "user" | string;
  hasHostingPermission: boolean;
  hostingUsername: string | null;
  linkedHostingAccount: {
    id: string;
    username: string;
  } | null;
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
}