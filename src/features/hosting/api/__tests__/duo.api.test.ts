import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchDuoStatus, enrollDuoPhone, resendDuoActivation, deleteDuoPhone } from "../duo.api";

vi.mock("@/shared/api/mockClient", () => ({
  mockClient: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

import { mockClient } from "@/shared/api/mockClient";

const mockGet = vi.mocked(mockClient.get);
const mockPost = vi.mocked(mockClient.post);
const mockDelete = vi.mocked(mockClient.delete);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("fetchDuoStatus", () => {
  it("calls the correct endpoint", async () => {
    mockGet.mockResolvedValue({ user: {}, phones: [] });
    await fetchDuoStatus();
    expect(mockGet).toHaveBeenCalledWith("/duo/status");
  });

  it("returns the status object", async () => {
    const status = {
      user: { user_id: "u1", username: "jondoe", realname: "Jón Dóe", email: "jon@dk.is", status: "active" },
      phones: [{ phone_id: "p1", number: "+354 555 0000", name: "iPhone", model: "iPhone 15", type: "smartphone", platform: "iOS", activated: true }],
    };
    mockGet.mockResolvedValue(status);
    const result = await fetchDuoStatus();
    expect(result).toEqual(status);
  });
});

describe("enrollDuoPhone", () => {
  it("calls the correct endpoint with the phone number", async () => {
    mockPost.mockResolvedValue({ phone_id: "p1" });
    await enrollDuoPhone("+354 555 0000");
    expect(mockPost).toHaveBeenCalledWith("/duo/phones", { number: "+354 555 0000" });
  });

  it("returns the activation response", async () => {
    const response = { phone_id: "p1", activation_barcode: "data:image/png;base64,abc" };
    mockPost.mockResolvedValue(response);
    const result = await enrollDuoPhone("+354 555 0000");
    expect(result).toEqual(response);
  });
});

describe("resendDuoActivation", () => {
  it("calls the correct endpoint for the given phoneId", async () => {
    mockPost.mockResolvedValue({ phone_id: "p1" });
    await resendDuoActivation("p1");
    expect(mockPost).toHaveBeenCalledWith("/duo/phones/p1/resend", {});
  });

  it("returns the new activation response", async () => {
    const response = { phone_id: "p1", activation_msg: "SMS sent" };
    mockPost.mockResolvedValue(response);
    const result = await resendDuoActivation("p1");
    expect(result).toEqual(response);
  });
});

describe("deleteDuoPhone", () => {
  it("calls the correct endpoint for the given phoneId", async () => {
    mockDelete.mockResolvedValue({ ok: true });
    await deleteDuoPhone("p1");
    expect(mockDelete).toHaveBeenCalledWith("/duo/phones/p1");
  });

  it("returns ok: true", async () => {
    mockDelete.mockResolvedValue({ ok: true });
    const result = await deleteDuoPhone("p1");
    expect(result).toEqual({ ok: true });
  });
});
