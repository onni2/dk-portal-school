/**
 * React Query hooks and options for Duo MFA. Covers both the logged-in user (MyHosting) and the admin view (Hosting Management).
 * Uses: ./duo.api, ./hosting.queries
 * Exports: duoQueryKeys, duoUserQueryOptions, duoDevicesQueryOptions, adminDuoQueryKeys,
 *          useDuoUser, useDuoUserOptional, useDuoDevices, useDuoDevicesOptional, useDuoDeviceStatus,
 *          useUpdateDuoUser, useCreateDuoDevice, useDeleteDuoDevice, useInvalidateDuoDevices,
 *          useAdminDuoUser, useUpdateAdminDuoUser, useAdminDuoDevices, useAdminDuoDeviceStatus,
 *          useCreateAdminDuoDevice, useDeleteAdminDuoDevice, useInvalidateAdminDuoDevices
 */
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

/** Fetch the Duo user linked to the logged-in user's hosting account. Returns undefined if not connected. */
export function useDuoUser() {
  return useQuery(duoUserQueryOptions);
}

/** Non-throwing version of useDuoUser — skip the query when the hosting account is not yet confirmed. */
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

/** Fetch all Duo devices for the logged-in user's hosting account. */
export function useDuoDevices() {
  return useQuery(duoDevicesQueryOptions);
}

/** Non-throwing version of useDuoDevices — skip the query until the hosting account is confirmed. */
export function useDuoDevicesOptional(enabled = true) {
  return useQuery({
    ...duoDevicesQueryOptions,
    enabled,
    retry: false,
  });
}

/** Poll activation status for a Duo device. Polls every 5 s until activated. */
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

/** Update display name and/or email for the logged-in user's Duo account. */
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

/** Create a Duo device activation (SMS or QR) for the logged-in user's hosting account. */
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

/** Delete a Duo device from the logged-in user's Duo account. */
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

/** Returns an imperative invalidator for the current user's Duo devices cache. */
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

/** Fetch Duo user linked to a specific hosting account (admin view). */
export function useAdminDuoUser(accountId: string, enabled = true) {
  return useQuery({
    queryKey: adminDuoQueryKeys.user(accountId),
    queryFn: () => fetchAdminDuoUser(accountId),
    enabled: enabled && Boolean(accountId),
    retry: false,
  });
}

/** Update display name and/or email for a specific hosting account's Duo user (admin view). */
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

/** Fetch Duo devices for a specific hosting account. Gate on enabled to avoid a race with useAdminDuoUser. */
export function useAdminDuoDevices(accountId: string, enabled = true) {
  return useQuery({
    queryKey: adminDuoQueryKeys.devices(accountId),
    queryFn: () => fetchAdminDuoDevices(accountId),
    enabled: enabled && Boolean(accountId),
    retry: false,
  });
}

/** Poll activation status for a Duo device on a specific hosting account. Polls every 5 s until activated. */
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

/** Create a Duo device activation (SMS or QR) for a specific hosting account (admin view). */
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

/** Delete a Duo device from a specific hosting account and invalidate both device and account caches (admin view). */
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

/** Returns an imperative invalidator for a specific hosting account's Duo devices cache. */
export function useInvalidateAdminDuoDevices(accountId: string) {
  const qc = useQueryClient();

  return () =>
    qc.invalidateQueries({ queryKey: adminDuoQueryKeys.devices(accountId) });
}
