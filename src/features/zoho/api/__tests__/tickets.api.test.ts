import { describe, it, expect, vi, beforeEach } from "vitest";
import { getTickets, getTicket } from "../tickets.api";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

function okResponse(data: unknown) {
  return Promise.resolve({ ok: true, json: () => Promise.resolve(data) });
}

function errorResponse(status = 500) {
  return Promise.resolve({ ok: false, status });
}

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.setItem("dk-auth-token", "test-token");
});

const MOCK_TICKET = {
  id: "t-1",
  number: "101",
  title: "Vandamál með reikning",
  preview: "Reikningur vantar...",
  status: "opið" as const,
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-02T00:00:00Z",
  messages: [],
};

describe("getTickets", () => {
  it("calls the correct endpoint", async () => {
    mockFetch.mockReturnValue(okResponse([]));
    await getTickets();
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/tickets"),
      expect.any(Object),
    );
  });

  it("sends the Authorization header", async () => {
    mockFetch.mockReturnValue(okResponse([]));
    await getTickets();
    const [, options] = mockFetch.mock.calls[0]!;
    expect(options.headers["Authorization"]).toBe("Bearer test-token");
  });

  it("returns the ticket list", async () => {
    mockFetch.mockReturnValue(okResponse([MOCK_TICKET]));
    const result = await getTickets();
    expect(result).toEqual([MOCK_TICKET]);
  });

  it("returns empty array when no tickets", async () => {
    mockFetch.mockReturnValue(okResponse([]));
    const result = await getTickets();
    expect(result).toEqual([]);
  });

  it("throws when the response is not ok", async () => {
    mockFetch.mockReturnValue(errorResponse(500));
    await expect(getTickets()).rejects.toThrow("Failed to fetch tickets");
  });
});

describe("getTicket", () => {
  it("calls the correct endpoint with the ticket id", async () => {
    mockFetch.mockReturnValue(okResponse(MOCK_TICKET));
    await getTicket("t-1");
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/tickets/t-1"),
      expect.any(Object),
    );
  });

  it("sends the Authorization header", async () => {
    mockFetch.mockReturnValue(okResponse(MOCK_TICKET));
    await getTicket("t-1");
    const [, options] = mockFetch.mock.calls[0]!;
    expect(options.headers["Authorization"]).toBe("Bearer test-token");
  });

  it("returns the ticket", async () => {
    mockFetch.mockReturnValue(okResponse(MOCK_TICKET));
    const result = await getTicket("t-1");
    expect(result).toEqual(MOCK_TICKET);
  });

  it("throws when the response is not ok", async () => {
    mockFetch.mockReturnValue(errorResponse(404));
    await expect(getTicket("t-1")).rejects.toThrow("Failed to fetch ticket");
  });
});
