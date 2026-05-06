import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AccountantCompanies } from "../AccountantCompanies";

const { mockSetToken, mockSetActiveCompany, mockAuthState, COMPANY_A, COMPANY_B } = vi.hoisted(() => {
  const EMPTY_PERMISSIONS = {
    invoices: false, subscription: false, hosting: false, pos: false,
    dkOne: false, dkPlus: false, timeclock: false, users: false,
  };
  const COMPANY_A = { id: "comp-a", name: "Fyrirtæki A", role: "admin" as const, permissions: { ...EMPTY_PERMISSIONS, invoices: true } };
  const COMPANY_B = { id: "comp-b", name: "Fyrirtæki B", role: "user" as const, permissions: EMPTY_PERMISSIONS };
  const mockSetToken = vi.fn();
  const mockSetActiveCompany = vi.fn();
  const mockAuthState = {
    companies: [COMPANY_A, COMPANY_B],
    user: { id: "u-1", name: "Jón Jónsson", email: "jon@dk.is", kennitala: "1234567890", companyId: "comp-a", mustResetPassword: false },
    setToken: mockSetToken,
    setActiveCompany: mockSetActiveCompany,
  };
  return { mockSetToken, mockSetActiveCompany, mockAuthState, COMPANY_A, COMPANY_B };
});

vi.mock("@/features/auth/store/auth.store", () => ({
  useAuthStore: (selector?: (s: unknown) => unknown) =>
    selector ? selector(mockAuthState) : mockAuthState,
}));

vi.mock("@/features/company/api/company.api", () => ({
  switchCompany: vi.fn(() => Promise.resolve({ token: "new-token", companyDkToken: "dk-tok", permissions: {} })),
}));

import { switchCompany } from "@/features/company/api/company.api";
const mockSwitchCompany = vi.mocked(switchCompany);

function renderComponent() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <AccountantCompanies />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  mockAuthState.companies = [COMPANY_A, COMPANY_B];
  mockAuthState.user = { id: "u-1", name: "Jón Jónsson", email: "jon@dk.is", kennitala: "1234567890", companyId: "comp-a", mustResetPassword: false };
  mockSwitchCompany.mockResolvedValue({ token: "new-token", companyDkToken: "dk-tok", permissions: {} });
});

describe("AccountantCompanies — heading", () => {
  it("shows the page title", () => {
    renderComponent();
    expect(screen.getByText("Fyrirtæki mín")).toBeInTheDocument();
  });
});

describe("AccountantCompanies — empty state", () => {
  it("shows empty message when there are no companies", () => {
    mockAuthState.companies = [];
    renderComponent();
    expect(screen.getByText("Engin fyrirtæki tengd við þinn aðgang.")).toBeInTheDocument();
  });
});

describe("AccountantCompanies — company cards", () => {
  it("renders company names", () => {
    renderComponent();
    expect(screen.getByText("Fyrirtæki A")).toBeInTheDocument();
    expect(screen.getByText("Fyrirtæki B")).toBeInTheDocument();
  });

  it("shows Virkt badge on the active company", () => {
    renderComponent();
    expect(screen.getByText("Virkt")).toBeInTheDocument();
  });

  it("shows Stjórnandi role badge for admin companies", () => {
    renderComponent();
    expect(screen.getByText("Stjórnandi")).toBeInTheDocument();
  });

  it("shows Staðall role badge for non-admin companies", () => {
    renderComponent();
    expect(screen.getByText("Staðall")).toBeInTheDocument();
  });

  it("shows Virkt fyrirtæki button for the active company", () => {
    renderComponent();
    expect(screen.getByRole("button", { name: "Virkt fyrirtæki" })).toBeInTheDocument();
  });

  it("shows Skipta yfir button for inactive companies", () => {
    renderComponent();
    expect(screen.getByRole("button", { name: "Skipta yfir" })).toBeInTheDocument();
  });

  it("disables the button for the active company", () => {
    renderComponent();
    expect(screen.getByRole("button", { name: "Virkt fyrirtæki" })).toBeDisabled();
  });

  it("enables the button for inactive companies", () => {
    renderComponent();
    expect(screen.getByRole("button", { name: "Skipta yfir" })).not.toBeDisabled();
  });

  it("renders enabled permission tags", () => {
    renderComponent();
    expect(screen.getByText("invoices")).toBeInTheDocument();
  });
});

describe("AccountantCompanies — switch company", () => {
  it("calls switchCompany with the correct company id", async () => {
    renderComponent();
    await userEvent.click(screen.getByRole("button", { name: "Skipta yfir" }));
    expect(mockSwitchCompany).toHaveBeenCalledWith("comp-b");
  });

  it("calls setToken with the new token on success", async () => {
    renderComponent();
    await userEvent.click(screen.getByRole("button", { name: "Skipta yfir" }));
    await waitFor(() => expect(mockSetToken).toHaveBeenCalledWith("new-token"));
  });

  it("calls setActiveCompany with the company id on success", async () => {
    renderComponent();
    await userEvent.click(screen.getByRole("button", { name: "Skipta yfir" }));
    await waitFor(() => expect(mockSetActiveCompany).toHaveBeenCalledWith("comp-b"));
  });

  it("shows Hleður... on the button while switching", async () => {
    mockSwitchCompany.mockImplementation(() => new Promise((r) => setTimeout(() => r({ token: "t", companyDkToken: "d", permissions: {} }), 300)));
    renderComponent();
    await userEvent.click(screen.getByRole("button", { name: "Skipta yfir" }));
    expect(screen.getByText("Hleður...")).toBeInTheDocument();
  });

  it("does not throw when switchCompany rejects", async () => {
    mockSwitchCompany.mockRejectedValue(new Error("Server error"));
    renderComponent();
    await expect(userEvent.click(screen.getByRole("button", { name: "Skipta yfir" }))).resolves.not.toThrow();
  });
});
