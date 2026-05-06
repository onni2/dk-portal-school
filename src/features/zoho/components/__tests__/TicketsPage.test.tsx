import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TicketsPage } from "../TicketsPage";
import type { Ticket } from "../../types/ticket.types";

function makeTicket(overrides: Partial<Ticket> = {}): Ticket {
  return {
    id: "t-1",
    number: "101",
    title: "Vandamál með reikning",
    preview: "Reikningur vantar...",
    status: "opið",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-02T00:00:00Z",
    messages: [
      { id: "m-1", from: "customer", senderName: "Jón Jónsson", body: "Hvenær kemur reikningurinn?", sentAt: "2026-01-01T10:00:00Z" },
    ],
    ...overrides,
  };
}

const TICKET_1 = makeTicket({ id: "t-1", number: "101", title: "Vandamál með reikning" });
const TICKET_2 = makeTicket({ id: "t-2", number: "102", title: "Annað mál" });

const { mockUseTickets, mockUseTicket } = vi.hoisted(() => ({
  mockUseTickets: vi.fn(() => ({ data: [TICKET_1, TICKET_2], isLoading: false })),
  mockUseTicket: vi.fn(() => ({ data: TICKET_1, isLoading: false })),
}));

vi.mock("@/features/zoho/api/tickets.queries", () => ({
  useTickets: () => mockUseTickets(),
  useTicket: (id: string | null) => mockUseTicket(id),
}));

vi.mock("@/features/auth/store/auth.store", () => ({
  useAuthStore: (selector?: (s: unknown) => unknown) => {
    const state = { user: { name: "Jón Jónsson" } };
    return selector ? selector(state) : state;
  },
}));

function renderPage() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <TicketsPage />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  mockUseTickets.mockReturnValue({ data: [TICKET_1, TICKET_2], isLoading: false });
  mockUseTicket.mockReturnValue({ data: TICKET_1, isLoading: false });
  vi.clearAllMocks();
});

describe("TicketsPage — loading state", () => {
  it("shows Hleður in the ticket list while loading", () => {
    mockUseTickets.mockReturnValue({ data: [], isLoading: true });
    mockUseTicket.mockReturnValue({ data: undefined, isLoading: false });
    renderPage();
    expect(screen.getByText("Hleður...")).toBeInTheDocument();
  });
});

describe("TicketsPage — ticket list", () => {
  it("renders all ticket titles", () => {
    renderPage();
    // TICKET_1 title appears in both the list card and the thread header
    expect(screen.getAllByText("Vandamál með reikning").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Annað mál")).toBeInTheDocument();
  });

  it("shows page heading", () => {
    renderPage();
    expect(screen.getByText("Þjónustubeiðnir")).toBeInTheDocument();
  });

  it("shows empty state when no tickets", () => {
    mockUseTickets.mockReturnValue({ data: [], isLoading: false });
    mockUseTicket.mockReturnValue({ data: undefined, isLoading: false });
    renderPage();
    expect(screen.getByText("Engar beiðnir fundust")).toBeInTheDocument();
  });
});

describe("TicketsPage — thread panel", () => {
  it("shows thread when a ticket is selected", () => {
    renderPage();
    expect(screen.getByText("Hvenær kemur reikningurinn?")).toBeInTheDocument();
  });

  it("shows Veldu beiðni when no ticket data is available", () => {
    mockUseTickets.mockReturnValue({ data: [], isLoading: false });
    mockUseTicket.mockReturnValue({ data: undefined, isLoading: false });
    renderPage();
    expect(screen.getByText("Veldu beiðni til að skoða")).toBeInTheDocument();
  });

  it("shows Hleður in the thread panel while loading thread", () => {
    mockUseTicket.mockReturnValue({ data: undefined, isLoading: true });
    renderPage();
    const loadingElements = screen.getAllByText("Hleður...");
    expect(loadingElements.length).toBeGreaterThanOrEqual(1);
  });
});

describe("TicketsPage — search", () => {
  it("filters tickets by title", async () => {
    renderPage();
    const input = screen.getByPlaceholderText("Leita...");
    await userEvent.type(input, "Annað");
    expect(screen.getByText("Annað mál")).toBeInTheDocument();
    // TICKET_1 is filtered from the list but still shown in the thread header (1 occurrence)
    expect(screen.getAllByText("Vandamál með reikning")).toHaveLength(1);
  });

  it("filters tickets by number", async () => {
    renderPage();
    const input = screen.getByPlaceholderText("Leita...");
    await userEvent.type(input, "102");
    expect(screen.getByText("Annað mál")).toBeInTheDocument();
    // TICKET_1 is filtered from the list but still shown in the thread header (1 occurrence)
    expect(screen.getAllByText("Vandamál með reikning")).toHaveLength(1);
  });

  it("filters tickets by preview text", async () => {
    const tickets = [
      makeTicket({ id: "t-1", title: "Mál 1", preview: "Uppfærsla á kerfi" }),
      makeTicket({ id: "t-2", title: "Mál 2", preview: "Reikningur vantar" }),
    ];
    mockUseTickets.mockReturnValue({ data: tickets, isLoading: false });
    renderPage();
    const input = screen.getByPlaceholderText("Leita...");
    await userEvent.type(input, "Uppfærsla");
    expect(screen.getByText("Mál 1")).toBeInTheDocument();
    expect(screen.queryByText("Mál 2")).not.toBeInTheDocument();
  });

  it("search is case-insensitive", async () => {
    renderPage();
    const input = screen.getByPlaceholderText("Leita...");
    await userEvent.type(input, "vandamál");
    // TICKET_1 matches — appears in list card + thread header (2 occurrences)
    expect(screen.getAllByText("Vandamál með reikning")).toHaveLength(2);
    expect(screen.queryByText("Annað mál")).not.toBeInTheDocument();
  });

  it("shows empty state when search matches nothing", async () => {
    renderPage();
    const input = screen.getByPlaceholderText("Leita...");
    await userEvent.type(input, "zzzznothing");
    expect(screen.getByText("Engar beiðnir fundust")).toBeInTheDocument();
  });
});
