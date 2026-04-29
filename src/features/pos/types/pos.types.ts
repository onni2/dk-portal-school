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
