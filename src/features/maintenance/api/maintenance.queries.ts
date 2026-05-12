import { queryOptions, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchMaintenanceLocks } from "./maintenance.api";

export const maintenanceQueryOptions = queryOptions({
  queryKey: ["maintenance-locks"],
  queryFn: fetchMaintenanceLocks,
  refetchInterval: 30_000,
});

export function useMaintenanceLocks() {
  return useQuery({ ...maintenanceQueryOptions, throwOnError: false });
}

export function useInvalidateMaintenance() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: maintenanceQueryOptions.queryKey });
}
