/**
 * POS service API: list, restart, and fetch logs for dkPOS and REST POS services.
 * Uses: @/shared/api/mockClient, ../types/pos.types
 * Exports: fetchPosServices, restartPosService, fetchPosServiceLogs, fetchPosRestServices, restartPosRestService, fetchPosRestServiceLogs
 */
import { mockClient } from "@/shared/api/mockClient";
import type { PosLogEntry, PosService } from "../types/pos.types";

/** Fetches the list of dkPOS services and their running state. */
export async function fetchPosServices(): Promise<PosService[]> {
  return mockClient.get<PosService[]>("/pos/services");
}

/** Triggers a restart of a dkPOS service and returns the updated service state. */
export async function restartPosService(id: string): Promise<PosService> {
  return mockClient.post<PosService>(`/pos/services/${id}/restart`, {});
}

/** Fetches the activity log for a specific dkPOS service. */
export async function fetchPosServiceLogs(id: string): Promise<PosLogEntry[]> {
  return mockClient.get<PosLogEntry[]>(`/pos/services/${id}/logs`);
}

/** Fetches the list of REST POS services and their running state. */
export async function fetchPosRestServices(): Promise<PosService[]> {
  return mockClient.get<PosService[]>("/pos/rest");
}

/** Triggers a restart of a REST POS service and returns the updated service state. */
export async function restartPosRestService(id: string): Promise<PosService> {
  return mockClient.post<PosService>(`/pos/rest/${id}/restart`, {});
}

/** Fetches the activity log for a specific REST POS service. */
export async function fetchPosRestServiceLogs(id: string): Promise<PosLogEntry[]> {
  return mockClient.get<PosLogEntry[]>(`/pos/rest/${id}/logs`);
}
