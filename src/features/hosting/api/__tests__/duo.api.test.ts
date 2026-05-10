import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  fetchDuoUser,
  updateDuoUser,
  fetchDuoDevices,
  createDuoDevice,
  fetchDuoDeviceStatus,
  deleteDuoDevice,
  updateAdminDuoUser,
  fetchAdminDuoUser,
  fetchAdminDuoDevices,
  createAdminDuoDevice,
  fetchAdminDuoDeviceStatus,
  deleteAdminDuoDevice,
} from "../duo.api";

vi.mock("@/shared/api/mockClient", () => ({
  mockClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

import { mockClient } from "@/shared/api/mockClient";

const mockGet = vi.mocked(mockClient.get);
const mockPost = vi.mocked(mockClient.post);
const mockPatch = vi.mocked(mockClient.patch);
const mockDelete = vi.mocked(mockClient.delete);

beforeEach(() => {
  vi.clearAllMocks();
});

// ─── My Hosting ──────────────────────────────────────────────────────────────

describe("fetchDuoUser", () => {
  it("calls GET /duo/me", async () => {
    mockGet.mockResolvedValue({ duoUserId: "d1", username: "jondoe" });
    await fetchDuoUser();
    expect(mockGet).toHaveBeenCalledWith("/duo/me");
  });

  it("returns the response", async () => {
    const user = { duoUserId: "d1", username: "jondoe", displayName: "Jón", email: null };
    mockGet.mockResolvedValue(user);
    expect(await fetchDuoUser()).toEqual(user);
  });
});

describe("updateDuoUser", () => {
  it("calls PATCH /duo/me with the payload", async () => {
    mockPatch.mockResolvedValue({ ok: true, duoUserId: "d1", displayName: "Jón", email: null, emailStatus: null });
    await updateDuoUser({ displayName: "Jón" });
    expect(mockPatch).toHaveBeenCalledWith("/duo/me", { displayName: "Jón" });
  });

  it("returns the response", async () => {
    const res = { ok: true, duoUserId: "d1", displayName: "Jón", email: null, emailStatus: null };
    mockPatch.mockResolvedValue(res);
    expect(await updateDuoUser({ displayName: "Jón" })).toEqual(res);
  });
});

describe("fetchDuoDevices", () => {
  it("calls GET /duo/me/devices", async () => {
    mockGet.mockResolvedValue([]);
    await fetchDuoDevices();
    expect(mockGet).toHaveBeenCalledWith("/duo/me/devices");
  });
});

describe("createDuoDevice", () => {
  it("calls POST /duo/me/devices with SMS payload", async () => {
    mockPost.mockResolvedValue({ ok: true, deviceId: "dev1" });
    const payload = { phoneNumber: "+3541234567", platform: "ios" as const, deviceDescription: "iPhone", activationMethod: "sms" as const };
    await createDuoDevice(payload);
    expect(mockPost).toHaveBeenCalledWith("/duo/me/devices", payload);
  });

  it("calls POST /duo/me/devices with QR payload", async () => {
    mockPost.mockResolvedValue({ ok: true, deviceId: "dev2" });
    const payload = { deviceDescription: "Tæki", activationMethod: "qr" as const };
    await createDuoDevice(payload);
    expect(mockPost).toHaveBeenCalledWith("/duo/me/devices", payload);
  });
});

describe("fetchDuoDeviceStatus", () => {
  it("calls GET /duo/me/devices/:deviceId/status", async () => {
    mockGet.mockResolvedValue({ activated: false, status: "pending_activation" });
    await fetchDuoDeviceStatus("dev1");
    expect(mockGet).toHaveBeenCalledWith("/duo/me/devices/dev1/status");
  });
});

describe("deleteDuoDevice", () => {
  it("calls DELETE /duo/me/devices/:deviceId", async () => {
    mockDelete.mockResolvedValue({ ok: true, hasMfa: false });
    await deleteDuoDevice("dev1");
    expect(mockDelete).toHaveBeenCalledWith("/duo/me/devices/dev1");
  });
});

// ─── Admin (Hosting Management) ──────────────────────────────────────────────

describe("fetchAdminDuoUser", () => {
  it("calls GET /duo/accounts/:accountId", async () => {
    mockGet.mockResolvedValue({ duoUserId: "d1", username: "jondoe" });
    await fetchAdminDuoUser("ha-abc");
    expect(mockGet).toHaveBeenCalledWith("/duo/accounts/ha-abc");
  });
});

describe("updateAdminDuoUser", () => {
  it("calls PATCH /duo/accounts/:accountId with the payload", async () => {
    mockPatch.mockResolvedValue({ ok: true, duoUserId: "d1", displayName: "Admin", email: null, emailStatus: null });
    await updateAdminDuoUser("ha-abc", { displayName: "Admin" });
    expect(mockPatch).toHaveBeenCalledWith("/duo/accounts/ha-abc", { displayName: "Admin" });
  });

  it("does NOT call /duo/me", async () => {
    mockPatch.mockResolvedValue({ ok: true, duoUserId: "d1", displayName: "Admin", email: null, emailStatus: null });
    await updateAdminDuoUser("ha-abc", { displayName: "Admin" });
    expect(mockPatch).not.toHaveBeenCalledWith("/duo/me", expect.anything());
  });

  it("returns the response", async () => {
    const res = { ok: true as const, duoUserId: "d1", displayName: "Admin", email: null, emailStatus: null };
    mockPatch.mockResolvedValue(res);
    expect(await updateAdminDuoUser("ha-abc", { displayName: "Admin" })).toEqual(res);
  });

  it("passes email in the payload when provided", async () => {
    mockPatch.mockResolvedValue({ ok: true, duoUserId: "d1", displayName: null, email: "a@b.is", emailStatus: "added" });
    await updateAdminDuoUser("ha-xyz", { email: "a@b.is" });
    expect(mockPatch).toHaveBeenCalledWith("/duo/accounts/ha-xyz", { email: "a@b.is" });
  });
});

describe("fetchAdminDuoDevices", () => {
  it("calls GET /duo/accounts/:accountId/devices", async () => {
    mockGet.mockResolvedValue([]);
    await fetchAdminDuoDevices("ha-abc");
    expect(mockGet).toHaveBeenCalledWith("/duo/accounts/ha-abc/devices");
  });
});

describe("createAdminDuoDevice", () => {
  it("calls POST /duo/accounts/:accountId/devices", async () => {
    mockPost.mockResolvedValue({ ok: true, deviceId: "dev1" });
    const payload = { deviceDescription: "Tæki", activationMethod: "qr" as const };
    await createAdminDuoDevice("ha-abc", payload);
    expect(mockPost).toHaveBeenCalledWith("/duo/accounts/ha-abc/devices", payload);
  });
});

describe("fetchAdminDuoDeviceStatus", () => {
  it("calls GET /duo/accounts/:accountId/devices/:deviceId/status", async () => {
    mockGet.mockResolvedValue({ activated: false, status: "pending_activation" });
    await fetchAdminDuoDeviceStatus("ha-abc", "dev1");
    expect(mockGet).toHaveBeenCalledWith("/duo/accounts/ha-abc/devices/dev1/status");
  });
});

describe("deleteAdminDuoDevice", () => {
  it("calls DELETE /duo/accounts/:accountId/devices/:deviceId", async () => {
    mockDelete.mockResolvedValue({ ok: true, hasMfa: false });
    await deleteAdminDuoDevice("ha-abc", "dev1");
    expect(mockDelete).toHaveBeenCalledWith("/duo/accounts/ha-abc/devices/dev1");
  });
});
