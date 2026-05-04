import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  fetchHostingAccounts,
  createHostingAccount,
  deleteHostingAccount,
  resetHostingPassword,
  restartHostingService,
  fetchMyHostingAccount,
  fetchMyHostingLog,
  changeMyHostingPassword,
} from "../hosting.api";

vi.mock("@/shared/api/mockClient", () => ({
  mockClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

import { mockClient } from "@/shared/api/mockClient";

const mockGet = vi.mocked(mockClient.get);
const mockPost = vi.mocked(mockClient.post);
const mockPut = vi.mocked(mockClient.put);
const mockDelete = vi.mocked(mockClient.delete);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("fetchHostingAccounts", () => {
  it("calls the correct endpoint", async () => {
    mockGet.mockResolvedValue([]);
    await fetchHostingAccounts();
    expect(mockGet).toHaveBeenCalledWith("/hosting/accounts");
  });

  it("returns the account list", async () => {
    const accounts = [
      { id: "1", username: "jondoe", displayName: "Jón Dóe", email: "jon@dk.is", hasMfa: true, lastRestart: null, createdAt: "2026-01-01" },
    ];
    mockGet.mockResolvedValue(accounts);
    const result = await fetchHostingAccounts();
    expect(result).toEqual(accounts);
  });
});

describe("createHostingAccount", () => {
  it("calls the correct endpoint with the payload", async () => {
    const payload = { username: "newuser", displayName: "Nýr Notandi", email: "new@dk.is" };
    mockPost.mockResolvedValue({ account: {}, tempPassword: "abc123" });
    await createHostingAccount(payload);
    expect(mockPost).toHaveBeenCalledWith("/hosting/accounts", payload);
  });

  it("returns the created account and temp password", async () => {
    const response = {
      account: { id: "2", username: "newuser", displayName: "Nýr Notandi", email: "new@dk.is", hasMfa: false, lastRestart: null, createdAt: "2026-01-02" },
      tempPassword: "Temp!1234",
    };
    mockPost.mockResolvedValue(response);
    const result = await createHostingAccount({ username: "newuser", displayName: "Nýr Notandi" });
    expect(result).toEqual(response);
  });
});

describe("deleteHostingAccount", () => {
  it("calls the correct endpoint with the account id", async () => {
    mockDelete.mockResolvedValue(undefined);
    await deleteHostingAccount("acc-1");
    expect(mockDelete).toHaveBeenCalledWith("/hosting/accounts/acc-1");
  });

  it("calls delete only once per call", async () => {
    mockDelete.mockResolvedValue(undefined);
    await deleteHostingAccount("acc-1");
    expect(mockDelete).toHaveBeenCalledTimes(1);
  });
});

describe("resetHostingPassword", () => {
  it("calls the correct endpoint", async () => {
    mockPost.mockResolvedValue({ tempPassword: "NewTemp!99" });
    await resetHostingPassword("acc-1");
    expect(mockPost).toHaveBeenCalledWith("/hosting/accounts/acc-1/reset-password", {});
  });

  it("returns the temp password", async () => {
    mockPost.mockResolvedValue({ tempPassword: "NewTemp!99" });
    const result = await resetHostingPassword("acc-1");
    expect(result).toEqual({ tempPassword: "NewTemp!99" });
  });
});

describe("restartHostingService", () => {
  it("calls the correct endpoint", async () => {
    mockPost.mockResolvedValue({ restarted: "acc-1" });
    await restartHostingService("acc-1");
    expect(mockPost).toHaveBeenCalledWith("/hosting/accounts/acc-1/restart", {});
  });

  it("returns the restarted id", async () => {
    mockPost.mockResolvedValue({ restarted: "acc-1" });
    const result = await restartHostingService("acc-1");
    expect(result).toEqual({ restarted: "acc-1" });
  });
});

describe("fetchMyHostingAccount", () => {
  it("calls the correct endpoint", async () => {
    mockGet.mockResolvedValue({});
    await fetchMyHostingAccount();
    expect(mockGet).toHaveBeenCalledWith("/hosting/me");
  });
});

describe("fetchMyHostingLog", () => {
  it("calls the correct endpoint", async () => {
    mockGet.mockResolvedValue([]);
    await fetchMyHostingLog();
    expect(mockGet).toHaveBeenCalledWith("/hosting/me/log");
  });

  it("returns the log entries", async () => {
    const log = [
      { id: 1, type: "login", when: "2026-01-01T10:00:00Z", ip: "192.168.1.1", agent: "Firefox", status: "ok" },
    ];
    mockGet.mockResolvedValue(log);
    const result = await fetchMyHostingLog();
    expect(result).toEqual(log);
  });
});

describe("changeMyHostingPassword", () => {
  it("calls the correct endpoint with the new password", async () => {
    mockPut.mockResolvedValue(undefined);
    await changeMyHostingPassword("NewPass!123");
    expect(mockPut).toHaveBeenCalledWith("/hosting/me/password", { password: "NewPass!123" });
  });
});

describe("query options keys", () => {
  it("hostingAccountsQueryOptions has the correct query key", async () => {
    const { hostingAccountsQueryOptions } = await import("../hosting.queries");
    expect(hostingAccountsQueryOptions.queryKey).toEqual(["hosting-accounts"]);
  });

  it("myHostingAccountQueryOptions has the correct query key", async () => {
    const { myHostingAccountQueryOptions } = await import("../hosting.queries");
    expect(myHostingAccountQueryOptions.queryKey).toEqual(["hosting", "me"]);
  });

  it("myHostingLogQueryOptions has the correct query key", async () => {
    const { myHostingLogQueryOptions } = await import("../hosting.queries");
    expect(myHostingLogQueryOptions.queryKey).toEqual(["hosting", "me", "log"]);
  });
});
