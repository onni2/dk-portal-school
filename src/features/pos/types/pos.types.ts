/**
 * TypeScript types for the POS domain: service definitions and log entries.
 * Uses: nothing — standalone file
 * Exports: PosService, PosLogEntry, PosServiceType
 */
export interface PosService {
  id: string;
  name: string;
  display: string;
  server: string;
  state: "running" | "stopped";
  mode: string;
  path: string;
}

export interface PosLogEntry {
  id: string;
  serviceId: string;
  description: string;
  executedBy: string;
  createdAt: string;
}

export type PosServiceType = "dkpos" | "rest";
