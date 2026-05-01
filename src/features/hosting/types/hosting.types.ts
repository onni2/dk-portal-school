/**
 * Types for the hosted environment (Hýsing) feature.
 * Exports: HostingAccount, CreateHostingAccountPayload
 */

export interface HostingAccount {
  id: string;
  username: string;
  displayName: string;
  email: string | null;
  hasMfa: boolean;
  lastRestart: string | null;
  createdAt: string;
}

export interface CreateHostingAccountPayload {
  username: string;
  displayName: string;
  email?: string;
}

export interface HostingLogEntry {
  id: number;
  type: "login" | "logout" | "failed";
  when: string;
  ip: string;
  agent: string;
  status: "ok" | "failed";
}
