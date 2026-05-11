import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  createDuoDevice,
  deleteDuoDevice,
  fetchDuoDeviceStatus,
  fetchDuoDevices,
  fetchDuoUser,
  updateDuoUser,
  updateAdminDuoUser,
  fetchAdminDuoUser,
  fetchAdminDuoDevices,
  createAdminDuoDevice,
  fetchAdminDuoDeviceStatus,
  deleteAdminDuoDevice,
} from "./duo.api";
import type { CreateDuoDevicePayload, UpdateDuoUserPayload } from "./duo.api";
import { hostingQueryKeys } from "./hosting.queries";

export const duoQueryKeys = {
  me: ["duo", "me"] as const,
  devices: ["duo", "me", "devices"] as const,
  deviceStatus: (deviceId: string) =>
    ["duo", "me", "devices", deviceId, "status"] as const,
};

export const duoUserQueryOptions = queryOptions({
  queryKey: duoQueryKeys.me,
  queryFn: fetchDuoUser,
  retry: false,
});

export function useDuoUser() {
  return useQuery(duoUserQueryOptions);
}

export function useDuoUserOptional(enabled = true) {
  return useQuery({
    ...duoUserQueryOptions,
    enabled,
    retry: false,
  });
}

export const duoDevicesQueryOptions = queryOptions({
  queryKey: duoQueryKeys.devices,
  queryFn: fetchDuoDevices,
  retry: false,
});

export function useDuoDevices() {
  return useQuery(duoDevicesQueryOptions);
}

export function useDuoDevicesOptional(enabled = true) {
  return useQuery({
    ...duoDevicesQueryOptions,
    enabled,
    retry: false,
  });
}

export function useDuoDeviceStatus(deviceId: string, enabled = true) {
  return useQuery({
    queryKey: duoQueryKeys.deviceStatus(deviceId),
    queryFn: () => fetchDuoDeviceStatus(deviceId),
    enabled: enabled && Boolean(deviceId),
    retry: false,
    refetchInterval: (query) => {
      const data = query.state.data;

      if (data?.activated) return false;

      return 5000;
    },
  });
}

export function useUpdateDuoUser() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: updateDuoUser,
    onSuccess: async () => {
      await qc.invalidateQueries({
        queryKey: duoQueryKeys.me,
      });
    },
  });
}

export function useCreateDuoDevice() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: createDuoDevice,
    onSuccess: async () => {
      await qc.invalidateQueries({
        queryKey: duoQueryKeys.devices,
      });
    },
  });
}

export function useDeleteDuoDevice() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: deleteDuoDevice,
    onSuccess: async () => {
      await qc.invalidateQueries({
        queryKey: duoQueryKeys.devices,
      });
    },
  });
}

export function useInvalidateDuoDevices() {
  const qc = useQueryClient();

  return () =>
    qc.invalidateQueries({
      queryKey: duoQueryKeys.devices,
    });
}

// ─── Admin (Hosting Management) ──────────────────────────────────────────────

export const adminDuoQueryKeys = {
  user: (accountId: string) => ["duo", "accounts", accountId] as const,
  devices: (accountId: string) =>
    ["duo", "accounts", accountId, "devices"] as const,
  deviceStatus: (accountId: string, deviceId: string) =>
    ["duo", "accounts", accountId, "devices", deviceId, "status"] as const,
};

export function useAdminDuoUser(accountId: string, enabled = true) {
  return useQuery({
    queryKey: adminDuoQueryKeys.user(accountId),
    queryFn: () => fetchAdminDuoUser(accountId),
    enabled: enabled && Boolean(accountId),
    retry: false,
  });
}

export function useUpdateAdminDuoUser(accountId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateDuoUserPayload) =>
      updateAdminDuoUser(accountId, payload),
    onSuccess: async () => {
      await qc.invalidateQueries({
        queryKey: adminDuoQueryKeys.user(accountId),
      });
    },
  });
}

export function useAdminDuoDevices(accountId: string, enabled = true) {
  return useQuery({
    queryKey: adminDuoQueryKeys.devices(accountId),
    queryFn: () => fetchAdminDuoDevices(accountId),
    enabled: enabled && Boolean(accountId),
    retry: false,
  });
}

export function useAdminDuoDeviceStatus(
  accountId: string,
  deviceId: string,
  enabled = true,
) {
  return useQuery({
    queryKey: adminDuoQueryKeys.deviceStatus(accountId, deviceId),
    queryFn: () => fetchAdminDuoDeviceStatus(accountId, deviceId),
    enabled: enabled && Boolean(accountId) && Boolean(deviceId),
    retry: false,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data?.activated) return false;
      return 5000;
    },
  });
}

export function useCreateAdminDuoDevice(accountId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateDuoDevicePayload) =>
      createAdminDuoDevice(accountId, payload),
    onSuccess: async () => {
      await qc.invalidateQueries({
        queryKey: adminDuoQueryKeys.devices(accountId),
      });
    },
  });
}

export function useDeleteAdminDuoDevice(accountId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (deviceId: string) => deleteAdminDuoDevice(accountId, deviceId),
    onSuccess: async () => {
      await qc.invalidateQueries({
        queryKey: adminDuoQueryKeys.devices(accountId),
      });
      await qc.invalidateQueries({ queryKey: hostingQueryKeys.accounts });
    },
  });
}

export function useInvalidateAdminDuoDevices(accountId: string) {
  const qc = useQueryClient();

  return () =>
    qc.invalidateQueries({ queryKey: adminDuoQueryKeys.devices(accountId) });
}
