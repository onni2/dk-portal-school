import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchAuthTokens, createAuthToken, deleteAuthToken, fetchAuthTokenApiLogs, fetchCompanies } from "../dkplus.api";

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

describe("fetchAuthTokens", () => {
  it("calls the correct endpoint", async () => {
    mockGet.mockResolvedValue([]);
    await fetchAuthTokens();
    expect(mockGet).toHaveBeenCalledWith("/dkplus/tokens");
  });

  it("returns the resolved token list", async () => {
    const tokens = [
      { id: "1", description: "Test", companyId: "c1", companyName: "DK", token: "tok-abc-xyz-1234", createdAt: "2026-01-01" },
    ];
    mockGet.mockResolvedValue(tokens);
    const result = await fetchAuthTokens();
    expect(result).toEqual(tokens);
  });
});

describe("createAuthToken", () => {
  it("calls the correct endpoint with description and companyId", async () => {
    const created = { id: "2", description: "API key", companyId: "c1", companyName: "DK", token: "tok-new-abcd-5678", createdAt: "2026-01-02" };
    mockPost.mockResolvedValue(created);
    await createAuthToken("API key", "c1");
    expect(mockPost).toHaveBeenCalledWith("/dkplus/tokens", { description: "API key", companyId: "c1" });
  });

  it("returns the created token", async () => {
    const created = { id: "2", description: "API key", companyId: "c1", companyName: "DK", token: "tok-new-abcd-5678", createdAt: "2026-01-02" };
    mockPost.mockResolvedValue(created);
    const result = await createAuthToken("API key", "c1");
    expect(result).toEqual(created);
  });
});

describe("deleteAuthToken", () => {
  it("calls the correct endpoint with the token id", async () => {
    mockDelete.mockResolvedValue(undefined);
    await deleteAuthToken("token-id-1");
    expect(mockDelete).toHaveBeenCalledWith("/dkplus/tokens/token-id-1");
  });

  it("calls delete only once per call", async () => {
    mockDelete.mockResolvedValue(undefined);
    await deleteAuthToken("token-id-1");
    expect(mockDelete).toHaveBeenCalledTimes(1);
  });
});

describe("fetchAuthTokenApiLogs", () => {
  it("calls the correct endpoint for the given tokenId", async () => {
    mockGet.mockResolvedValue([]);
    await fetchAuthTokenApiLogs("tok-abc");
    expect(mockGet).toHaveBeenCalledWith("/dkplus/tokens/tok-abc/api-logs");
  });

  it("returns the log list", async () => {
    const logs = [
      {
        id: "log-1",
        tokenId: "tok-abc",
        userName: "admin",
        uri: "/api/v1/orders",
        method: "GET",
        query: "",
        statusCode: 200,
        ipAddress: "192.168.1.1",
        userAgent: "curl/7.68",
        bandwidthUpload: 0,
        bandwidthDownload: 1024,
        timeTaken: 45,
        error: null,
        createdAt: "2026-01-01T10:00:00Z",
      },
    ];
    mockGet.mockResolvedValue(logs);
    const result = await fetchAuthTokenApiLogs("tok-abc");
    expect(result).toEqual(logs);
  });
});

describe("fetchCompanies", () => {
  it("calls the correct endpoint", async () => {
    mockGet.mockResolvedValue([]);
    await fetchCompanies();
    expect(mockGet).toHaveBeenCalledWith("/companies");
  });

  it("returns the company list", async () => {
    const companies = [
      { id: "c1", name: "DK ehf." },
      { id: "c2", name: "Prófunar ehf." },
    ];
    mockGet.mockResolvedValue(companies);
    const result = await fetchCompanies();
    expect(result).toEqual(companies);
  });
});

describe("authTokensQueryOptions", () => {
  it("has the correct query key", async () => {
    const { authTokensQueryOptions } = await import("../dkplus.queries");
    expect(authTokensQueryOptions.queryKey).toEqual(["auth-tokens"]);
  });
});
