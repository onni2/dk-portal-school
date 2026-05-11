import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthTokensPanel } from "../AuthTokensPanel";

const MOCK_TOKENS = [
  { id: "1", description: "Bókhaldskerfi", companyId: "c1", companyName: "DK ehf.", token: "tok-aaaa-bbbb-1234", createdAt: "2026-01-01" },
  { id: "2", description: "DK One tenging", companyId: "c1", companyName: "DK ehf.", token: "tok-cccc-dddd-5678", createdAt: "2026-01-02" },
];

const { mockUseAuthTokens, deleteAuthToken, createMutateAsync } = vi.hoisted(() => ({
  mockUseAuthTokens: vi.fn(() => ({ data: MOCK_TOKENS })),
  deleteAuthToken: vi.fn(() => Promise.resolve()),
  createMutateAsync: vi.fn(() => Promise.resolve()),
}));

vi.mock("@/features/dkplus/api/dkplus.queries", () => ({
  useAuthTokens: () => mockUseAuthTokens(),
  useCreateAuthToken: () => ({ mutateAsync: createMutateAsync, isPending: false }),
  useDeleteAuthToken: () => ({ mutateAsync: deleteAuthToken }),
}));

vi.mock("@/features/auth/store/auth.store", () => ({
  useAuthStore: () => ({
    user: { companyId: "c1" },
    companies: [{ id: "c1", name: "DK ehf." }],
  }),
}));

function renderPanel(onViewLogs = vi.fn()) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <AuthTokensPanel onViewLogs={onViewLogs} />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  mockUseAuthTokens.mockReturnValue({ data: MOCK_TOKENS });
  vi.clearAllMocks();
  Object.assign(navigator, { clipboard: { writeText: vi.fn() } });
});

describe("AuthTokensPanel — with tokens", () => {
  it("renders the panel title", () => {
    renderPanel();
    expect(screen.getByText("Auðkenningartákn")).toBeInTheDocument();
  });

  it("renders token descriptions", () => {
    renderPanel();
    expect(screen.getByText("Bókhaldskerfi")).toBeInTheDocument();
    expect(screen.getByText("DK One tenging")).toBeInTheDocument();
  });

  it("renders company name for each token", () => {
    renderPanel();
    expect(screen.getAllByText("DK ehf.").length).toBeGreaterThanOrEqual(2);
  });

  it("renders masked token values", () => {
    renderPanel();
    expect(screen.getByText("•••-••••-••••-1234")).toBeInTheDocument();
    expect(screen.getByText("•••-••••-••••-5678")).toBeInTheDocument();
  });

  it("renders page info in footer", () => {
    renderPanel();
    expect(screen.getByText(/Síða 1 af/)).toBeInTheDocument();
  });

  it("renders the create form", () => {
    renderPanel();
    expect(screen.getByPlaceholderText("Lýsing: t.d. Bókhaldskerfi, DK One tenging")).toBeInTheDocument();
  });
});

describe("AuthTokensPanel — empty state", () => {
  it("shows empty state message when no tokens exist", () => {
    mockUseAuthTokens.mockReturnValue({ data: [] });
    renderPanel();
    expect(screen.getByText("Engin auðkenningartákn skráð")).toBeInTheDocument();
  });

  it("does not render the token table when empty", () => {
    mockUseAuthTokens.mockReturnValue({ data: [] });
    renderPanel();
    expect(screen.queryByText("Lýsing")).not.toBeInTheDocument();
  });
});

describe("AuthTokensPanel — delete flow", () => {
  it("shows delete confirmation when Eyða is clicked", async () => {
    renderPanel();
    await userEvent.click(screen.getAllByText("Eyða")[0]!);
    expect(screen.getByText("Eyða varanlega?")).toBeInTheDocument();
  });

  it("hides confirmation when Hætta við is clicked", async () => {
    renderPanel();
    await userEvent.click(screen.getAllByText("Eyða")[0]!);
    await userEvent.click(screen.getByText("Hætta við"));
    expect(screen.queryByText("Eyða varanlega?")).not.toBeInTheDocument();
  });

  it("calls deleteAuthToken with the correct id when confirmed", async () => {
    renderPanel();
    await userEvent.click(screen.getAllByText("Eyða")[0]!);
    await userEvent.click(screen.getByText("Já, eyða"));
    expect(deleteAuthToken).toHaveBeenCalledWith("1");
  });

  it("calls deleteAuthToken only once per confirmation", async () => {
    renderPanel();
    await userEvent.click(screen.getAllByText("Eyða")[0]!);
    await userEvent.click(screen.getByText("Já, eyða"));
    expect(deleteAuthToken).toHaveBeenCalledTimes(1);
  });

  it("does not trigger delete for the other token", async () => {
    renderPanel();
    await userEvent.click(screen.getAllByText("Eyða")[0]!);
    await userEvent.click(screen.getByText("Já, eyða"));
    expect(deleteAuthToken).not.toHaveBeenCalledWith("2");
  });
});

describe("AuthTokensPanel — copy", () => {
  it("calls navigator.clipboard.writeText with the full token", async () => {
    renderPanel();
    await userEvent.click(screen.getAllByText("Afrita")[0]!);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("tok-aaaa-bbbb-1234");
  });

  it("changes button label to Afritað! after copying", async () => {
    renderPanel();
    await userEvent.click(screen.getAllByText("Afrita")[0]!);
    expect(screen.getByText("Afritað!")).toBeInTheDocument();
  });
});

describe("AuthTokensPanel — view logs", () => {
  it("calls onViewLogs with the correct token", async () => {
    const onViewLogs = vi.fn();
    renderPanel(onViewLogs);
    await userEvent.click(screen.getAllByText("Sjá notkun")[0]!);
    expect(onViewLogs).toHaveBeenCalledWith(
      expect.objectContaining({ id: "1", description: "Bókhaldskerfi" }),
    );
  });

  it("does not call onViewLogs for the second token when clicking the first", async () => {
    const onViewLogs = vi.fn();
    renderPanel(onViewLogs);
    await userEvent.click(screen.getAllByText("Sjá notkun")[0]!);
    expect(onViewLogs).not.toHaveBeenCalledWith(
      expect.objectContaining({ id: "2" }),
    );
  });
});

describe("AuthTokensPanel — create form validation", () => {
  it("does not call createMutateAsync when description is empty", async () => {
    renderPanel();
    await userEvent.click(screen.getByText("Stofna tákn"));
    expect(createMutateAsync).not.toHaveBeenCalled();
  });

  it("does not call createMutateAsync when description is only whitespace", async () => {
    renderPanel();
    await userEvent.type(screen.getByPlaceholderText("Lýsing: t.d. Bókhaldskerfi, DK One tenging"), "   ");
    await userEvent.click(screen.getByText("Stofna tákn"));
    expect(createMutateAsync).not.toHaveBeenCalled();
  });

  it("calls createMutateAsync with trimmed description when valid", async () => {
    renderPanel();
    await userEvent.type(screen.getByPlaceholderText("Lýsing: t.d. Bókhaldskerfi, DK One tenging"), "Nýtt kerfi");
    await userEvent.click(screen.getByText("Stofna tákn"));
    expect(createMutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({ description: "Nýtt kerfi", companyId: "c1" }),
    );
  });
});
