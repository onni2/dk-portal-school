/**
 * React Query options and hooks for maintenance locks. Refetches every 30 seconds.
 * Uses: ./maintenance.api
 * Exports: maintenanceQueryOptions, useMaintenanceLocks, useInvalidateMaintenance
 */
import { queryOptions, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchMaintenanceLocks } from "./maintenance.api";

export const maintenanceQueryOptions = queryOptions({
  queryKey: ["maintenance-locks"],
  queryFn: fetchMaintenanceLocks,
  refetchInterval: 30_000,
});

/** Hook that subscribes to maintenance locks. Does not throw so the dashboard still renders if the endpoint is down. */
export function useMaintenanceLocks() {
  return useQuery({ ...maintenanceQueryOptions, throwOnError: false });
}

/** Returns a function that invalidates the maintenance locks cache — call after lock/unlock mutations. */
export function useInvalidateMaintenance() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: maintenanceQueryOptions.queryKey });
}
