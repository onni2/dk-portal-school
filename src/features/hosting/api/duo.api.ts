/**
 * Duo MFA API functions for both the logged-in user's own account (MyHosting) and the admin view (Hosting Management).
 * Uses: @/shared/api/mockClient, ../types/duo.types
 * Exports: CreateDuoDevicePayload, CreateDuoDeviceResponse, DuoDeviceStatusResponse, UpdateDuoUserPayload, UpdateDuoUserResponse,
 *          fetchDuoUser, updateDuoUser, fetchDuoDevices, createDuoDevice, fetchDuoDeviceStatus, deleteDuoDevice,
 *          updateAdminDuoUser, fetchAdminDuoUser, fetchAdminDuoDevices, createAdminDuoDevice, fetchAdminDuoDeviceStatus, deleteAdminDuoDevice
 */
import { mockClient } from "@/shared/api/mockClient";
import type { DuoDevice, DuoUser } from "../types/duo.types";

export type CreateDuoDevicePayload =
  | {
      phoneNumber: string;
      platform: "ios" | "android";
      deviceDescription: string;
      activationMethod: "sms";
    }
  | {
      deviceDescription: string;
      activationMethod: "qr";
    };

export interface CreateDuoDeviceResponse {
  ok: true;
  deviceId: string;
  phoneNumber: string | null;
  deviceDescription: string;
  platform: string | null;
  status: "pending_activation" | "active";
  activationMethod: "sms" | "qr";
  smsSent: boolean;
  activationUrl: string | null;
  activationBarcode: string | null;
  activationExpiresAt: string | null;
  validSeconds: number;
}

export interface DuoDeviceStatusResponse {
  activated: boolean;
  status: "pending_activation" | "active";
  model: string | null;
  platform: string | null;
}

export interface UpdateDuoUserPayload {
  displayName?: string;
  email?: string;
}

export interface UpdateDuoUserResponse {
  ok: true;
  duoUserId: string;
  displayName: string | null;
  email: string | null;
  emailStatus: string | null;
}

/**
 * Fetch Duo user connected to the logged-in user's hosting account.
 */
export async function fetchDuoUser(): Promise<DuoUser> {
  return mockClient.get<DuoUser>("/duo/me");
}

/**
 * Update Duo user's display name and/or email.
 */
export async function updateDuoUser(
  payload: UpdateDuoUserPayload,
): Promise<UpdateDuoUserResponse> {
  return mockClient.patch<UpdateDuoUserResponse>("/duo/me", payload);
}

/**
 * Fetch devices connected to the logged-in user's Duo user.
 */
export async function fetchDuoDevices(): Promise<DuoDevice[]> {
  return mockClient.get<DuoDevice[]>("/duo/me/devices");
}

/**
 * Create a Duo device activation.
 *
 * SMS requires phoneNumber + platform.
 * QR only requires deviceDescription.
 */
export async function createDuoDevice(
  payload: CreateDuoDevicePayload,
): Promise<CreateDuoDeviceResponse> {
  return mockClient.post<CreateDuoDeviceResponse>("/duo/me/devices", payload);
}

/**
 * Poll activation status for a Duo device.
 */
export async function fetchDuoDeviceStatus(
  deviceId: string,
): Promise<DuoDeviceStatusResponse> {
  return mockClient.get<DuoDeviceStatusResponse>(
    `/duo/me/devices/${deviceId}/status`,
  );
}

/**
 * Delete Duo device from the logged-in user's Duo account.
 */
export async function deleteDuoDevice(
  deviceId: string,
): Promise<{ ok: true; hasMfa: boolean }> {
  return mockClient.delete<{ ok: true; hasMfa: boolean }>(
    `/duo/me/devices/${deviceId}`,
  );
}

// ─── Admin (Hosting Management) ──────────────────────────────────────────────

/** Update display name and/or email for a specific hosting account's Duo user. */
export async function updateAdminDuoUser(
  accountId: string,
  payload: UpdateDuoUserPayload,
): Promise<UpdateDuoUserResponse> {
  return mockClient.patch<UpdateDuoUserResponse>(
    `/duo/accounts/${accountId}`,
    payload,
  );
}

/** Fetch Duo user connected to a specific hosting account (admin view). */
export async function fetchAdminDuoUser(accountId: string): Promise<DuoUser> {
  return mockClient.get<DuoUser>(`/duo/accounts/${accountId}`);
}

/** Fetch devices connected to a specific hosting account's Duo user (admin view). */
export async function fetchAdminDuoDevices(accountId: string): Promise<DuoDevice[]> {
  return mockClient.get<DuoDevice[]>(`/duo/accounts/${accountId}/devices`);
}

/** Create a Duo device activation for a specific hosting account (admin view). SMS requires phoneNumber + platform; QR only requires deviceDescription. */
export async function createAdminDuoDevice(
  accountId: string,
  payload: CreateDuoDevicePayload,
): Promise<CreateDuoDeviceResponse> {
  return mockClient.post<CreateDuoDeviceResponse>(
    `/duo/accounts/${accountId}/devices`,
    payload,
  );
}

/** Poll activation status for a Duo device on a specific hosting account (admin view). */
export async function fetchAdminDuoDeviceStatus(
  accountId: string,
  deviceId: string,
): Promise<DuoDeviceStatusResponse> {
  return mockClient.get<DuoDeviceStatusResponse>(
    `/duo/accounts/${accountId}/devices/${deviceId}/status`,
  );
}

/** Delete a Duo device from a specific hosting account (admin view). */
export async function deleteAdminDuoDevice(
  accountId: string,
  deviceId: string,
): Promise<{ ok: true; hasMfa: boolean }> {
  return mockClient.delete<{ ok: true; hasMfa: boolean }>(
    `/duo/accounts/${accountId}/devices/${deviceId}`,
  );
}