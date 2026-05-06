import { describe, it, expect, vi, beforeEach } from "vitest";
import { getNotifications, markAsRead, markAllAsRead, deleteNotification } from "../notifications.api";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.setItem("dk-auth-token", "test-token");
});

function okResponse(data: unknown) {
  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve(data),
  });
}

function errorResponse(status = 500) {
  return Promise.resolve({ ok: false, status });
}

describe("getNotifications", () => {
  it("calls the correct endpoint", async () => {
    mockFetch.mockReturnValue(okResponse([]));
    await getNotifications();
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/notifications"),
      expect.any(Object),
    );
  });

  it("sends the Authorization header", async () => {
    mockFetch.mockReturnValue(okResponse([]));
    await getNotifications();
    const [, options] = mockFetch.mock.calls[0]!;
    expect(options.headers["Authorization"]).toBe("Bearer test-token");
  });

  it("returns the notification list", async () => {
    const notifications = [
      { id: "1", title: "Nýr reikningur", message: "Reikningur #100 er tilbúinn.", read: false, createdAt: "2026-01-01" },
    ];
    mockFetch.mockReturnValue(okResponse(notifications));
    const result = await getNotifications();
    expect(result).toEqual(notifications);
  });

  it("throws when the response is not ok", async () => {
    mockFetch.mockReturnValue(errorResponse(500));
    await expect(getNotifications()).rejects.toThrow("Failed to fetch notifications");
  });
});

describe("markAsRead", () => {
  it("calls the correct endpoint with PATCH", async () => {
    mockFetch.mockReturnValue(okResponse(undefined));
    await markAsRead("notif-1");
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/notifications/notif-1/read"),
      expect.objectContaining({ method: "PATCH" }),
    );
  });
});

describe("markAllAsRead", () => {
  it("calls the correct endpoint with PATCH", async () => {
    mockFetch.mockReturnValue(okResponse(undefined));
    await markAllAsRead();
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/notifications/read-all"),
      expect.objectContaining({ method: "PATCH" }),
    );
  });
});

describe("deleteNotification", () => {
  it("calls the correct endpoint with DELETE", async () => {
    mockFetch.mockReturnValue(okResponse(undefined));
    await deleteNotification("notif-1");
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/notifications/notif-1"),
      expect.objectContaining({ method: "DELETE" }),
    );
  });
});
