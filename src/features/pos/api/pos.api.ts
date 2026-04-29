import { mockClient } from "@/shared/api/mockClient";
import type { PosLogEntry, PosService } from "../types/pos.types";

export async function fetchPosServices(): Promise<PosService[]> {
  return mockClient.get<PosService[]>("/pos/services");
}

export async function restartPosService(id: string): Promise<PosService> {
  return mockClient.post<PosService>(`/pos/services/${id}/restart`, {});
}

export async function fetchPosServiceLogs(id: string): Promise<PosLogEntry[]> {
  return mockClient.get<PosLogEntry[]>(`/pos/services/${id}/logs`);
}

export async function fetchPosRestServices(): Promise<PosService[]> {
  return mockClient.get<PosService[]>("/pos/rest");
}

export async function restartPosRestService(id: string): Promise<PosService> {
  return mockClient.post<PosService>(`/pos/rest/${id}/restart`, {});
}

export async function fetchPosRestServiceLogs(id: string): Promise<PosLogEntry[]> {
  return mockClient.get<PosLogEntry[]>(`/pos/rest/${id}/logs`);
}
