import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HostingPage } from "../HostingPage";

const MOCK_ACCOUNTS = [
  { id: "1", username: "jondoe", displayName: "Jón Dóe", email: "jon@dk.is", hasMfa: true, lastRestart: null, createdAt: "2026-01-01" },
  { id: "2", username: "annasig", displayName: "Anna Sigríður", email: null, hasMfa: false, lastRestart: "2026-04-01T08:00:00Z", createdAt: "2026-01-02" },
];

const { mockUseHostingAccounts, mockDeleteHostingAccount, mockResetHostingPassword, mockRestartHostingService } = vi.hoisted(() => ({
  mockUseHostingAccounts: vi.fn(() => ({ data: MOCK_ACCOUNTS })),
  mockDeleteHostingAccount: vi.fn(() => Promise.resolve()),
  mockResetHostingPassword: vi.fn(() => Promise.resolve({ tempPassword: "Temp!999" })),
  mockRestartHostingService: vi.fn(() => Promise.resolve({ restarted: "1" })),
}));

vi.mock("@/features/hosting/api/hosting.queries", () => ({
  useHostingAccounts: () => mockUseHostingAccounts(),
  useInvalidateHostingAccounts: () => vi.fn(),
}));

vi.mock("@/features/hosting/api/hosting.api", () => ({
  deleteHostingAccount: mockDeleteHostingAccount,
  resetHostingPassword: mockResetHostingPassword,
  restartHostingService: mockRestartHostingService,
  createHostingAccount: vi.fn(),
}));

vi.mock("../CreateHostingUserModal", () => ({
  CreateHostingUserModal: ({ onClose }: { onClose: () => void }) => (
    <div data-testid="create-modal">
      <button onClick={onClose}>Loka modal</button>
    </div>
  ),
}));

function renderPage() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <HostingPage />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  mockUseHostingAccounts.mockReturnValue({ data: MOCK_ACCOUNTS });
  vi.clearAllMocks();
  vi.spyOn(window, "confirm").mockReturnValue(true);
});

describe("HostingPage — rendering", () => {
  it("renders the page title", () => {
    renderPage();
    expect(screen.getByText("Hýsing")).toBeInTheDocument();
  });

  it("renders usernames for all accounts", () => {
    renderPage();
    expect(screen.getByText("jondoe")).toBeInTheDocument();
    expect(screen.getByText("annasig")).toBeInTheDocument();
  });

  it("renders display names for all accounts", () => {
    renderPage();
    expect(screen.getByText("Jón Dóe")).toBeInTheDocument();
    expect(screen.getByText("Anna Sigríður")).toBeInTheDocument();
  });

  it("renders email when present", () => {
    renderPage();
    expect(screen.getByText("jon@dk.is")).toBeInTheDocument();
  });

  it("renders — when email is null", () => {
    renderPage();
    expect(screen.getAllByText("—").length).toBeGreaterThanOrEqual(1);
  });

  it("renders Virkt badge for account with MFA", () => {
    renderPage();
    expect(screen.getByText("Virkt")).toBeInTheDocument();
  });

  it("renders Óvirkt badge for account without MFA", () => {
    renderPage();
    expect(screen.getByText("Óvirkt")).toBeInTheDocument();
  });

  it("renders — in last-restart column when lastRestart is null", () => {
    renderPage();
    // jondoe has null lastRestart, annasig has a date — at least one — for restart
    const dashes = screen.getAllByText("—");
    expect(dashes.length).toBeGreaterThanOrEqual(1);
  });
});

describe("HostingPage — empty state", () => {
  it("shows empty message when no accounts exist", () => {
    mockUseHostingAccounts.mockReturnValue({ data: [] });
    renderPage();
    expect(screen.getByText("Engir hýsingarnotendur skráðir.")).toBeInTheDocument();
  });

  it("does not render the table when empty", () => {
    mockUseHostingAccounts.mockReturnValue({ data: [] });
    renderPage();
    expect(screen.queryByText("Notendanafn")).not.toBeInTheDocument();
  });
});

describe("HostingPage — delete", () => {
  it("calls deleteHostingAccount with the correct id when confirmed", async () => {
    renderPage();
    await userEvent.click(screen.getAllByText("Eyða")[0]!);
    expect(mockDeleteHostingAccount).toHaveBeenCalledWith("1");
  });

  it("does not call deleteHostingAccount when confirm is cancelled", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(false);
    renderPage();
    await userEvent.click(screen.getAllByText("Eyða")[0]!);
    expect(mockDeleteHostingAccount).not.toHaveBeenCalled();
  });

  it("calls deleteHostingAccount only once per click", async () => {
    renderPage();
    await userEvent.click(screen.getAllByText("Eyða")[0]!);
    expect(mockDeleteHostingAccount).toHaveBeenCalledTimes(1);
  });

  it("does not delete the wrong account", async () => {
    renderPage();
    await userEvent.click(screen.getAllByText("Eyða")[0]!);
    expect(mockDeleteHostingAccount).not.toHaveBeenCalledWith("2");
  });
});

describe("HostingPage — reset password", () => {
  it("calls resetHostingPassword with the correct id", async () => {
    renderPage();
    await userEvent.click(screen.getAllByText("Endurstilla lykilorð")[0]!);
    expect(mockResetHostingPassword).toHaveBeenCalledWith("1");
  });

  it("shows the returned temp password after reset", async () => {
    renderPage();
    await userEvent.click(screen.getAllByText("Endurstilla lykilorð")[0]!);
    expect(screen.getByText("Temp!999")).toBeInTheDocument();
  });

  it("shows the account name in the reset result", async () => {
    renderPage();
    await userEvent.click(screen.getAllByText("Endurstilla lykilorð")[0]!);
    expect(screen.getByText(/Tímabundið lykilorð fyrir Jón Dóe/)).toBeInTheDocument();
  });

  it("dismisses the reset result when Loka is clicked", async () => {
    renderPage();
    await userEvent.click(screen.getAllByText("Endurstilla lykilorð")[0]!);
    await userEvent.click(screen.getByText("Loka"));
    expect(screen.queryByText("Temp!999")).not.toBeInTheDocument();
  });
});

describe("HostingPage — restart", () => {
  it("calls restartHostingService with the correct id", async () => {
    renderPage();
    await userEvent.click(screen.getAllByText("Endurræsa")[0]!);
    expect(mockRestartHostingService).toHaveBeenCalledWith("1");
  });

  it("calls restartHostingService only once per click", async () => {
    renderPage();
    await userEvent.click(screen.getAllByText("Endurræsa")[0]!);
    expect(mockRestartHostingService).toHaveBeenCalledTimes(1);
  });
});

describe("HostingPage — create modal", () => {
  it("does not show the modal on initial render", () => {
    renderPage();
    expect(screen.queryByTestId("create-modal")).not.toBeInTheDocument();
  });

  it("opens the create modal when + Nýr notandi is clicked", async () => {
    renderPage();
    await userEvent.click(screen.getByText("+ Nýr notandi"));
    expect(screen.getByTestId("create-modal")).toBeInTheDocument();
  });

  it("closes the modal when onClose is called", async () => {
    renderPage();
    await userEvent.click(screen.getByText("+ Nýr notandi"));
    await userEvent.click(screen.getByText("Loka modal"));
    expect(screen.queryByTestId("create-modal")).not.toBeInTheDocument();
  });
});
