import { queryOptions, useSuspenseQuery, useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import {
  fetchPosServices,
  fetchPosServiceLogs,
  fetchPosRestServices,
  fetchPosRestServiceLogs,
  restartPosService,
  restartPosRestService,
} from "./pos.api";

export const posServicesQueryOptions = queryOptions({
  queryKey: ["pos-services"],
  queryFn: fetchPosServices,
});

export const posRestServicesQueryOptions = queryOptions({
  queryKey: ["pos-rest-services"],
  queryFn: fetchPosRestServices,
});

export function usePosServices() {
  return useSuspenseQuery({
    ...posServicesQueryOptions,
    refetchInterval: (query) =>
      query.state.data?.some((s) => s.state === "stopped") ? 2000 : false,
  });
}

export function usePosRestServices() {
  return useSuspenseQuery({
    ...posRestServicesQueryOptions,
    refetchInterval: (query) =>
      query.state.data?.some((s) => s.state === "stopped") ? 2000 : false,
  });
}

export function usePosServiceLogs(serviceId: string) {
  return useQuery({
    queryKey: ["pos-service-logs", "dkpos", serviceId],
    queryFn: () => fetchPosServiceLogs(serviceId),
    enabled: !!serviceId,
  });
}

export function usePosRestServiceLogs(serviceId: string) {
  return useQuery({
    queryKey: ["pos-service-logs", "rest", serviceId],
    queryFn: () => fetchPosRestServiceLogs(serviceId),
    enabled: !!serviceId,
  });
}

export function useRestartPosService(serviceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => restartPosService(serviceId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pos-services"] });
      qc.invalidateQueries({ queryKey: ["pos-service-logs", "dkpos", serviceId] });
    },
  });
}

export function useRestartPosRestService(serviceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => restartPosRestService(serviceId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pos-rest-services"] });
      qc.invalidateQueries({ queryKey: ["pos-service-logs", "rest", serviceId] });
    },
  });
}
