import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { AccountantSubmissions } from "../AccountantSubmissions";

const EMPTY_PERMISSIONS = {
  invoices: false, subscription: false, hosting: false, pos: false,
  dkOne: false, dkPlus: false, timeclock: false, users: false,
};

const { mockAuthState, COMPANY_HR, COMPANY_1001 } = vi.hoisted(() => {
  const EP = { invoices: false, subscription: false, hosting: false, pos: false, dkOne: false, dkPlus: false, timeclock: false, users: false };
  const COMPANY_HR = { id: "hr", name: "HR", role: "admin" as const, permissions: EP };
  const COMPANY_1001 = { id: "1001nott", name: "1001 Nott", role: "user" as const, permissions: EP };
  const mockAuthState = { companies: [COMPANY_HR, COMPANY_1001] };
  return { mockAuthState, COMPANY_HR, COMPANY_1001 };
});

vi.mock("@/features/auth/store/auth.store", () => ({
  useAuthStore: (selector?: (s: unknown) => unknown) =>
    selector ? selector(mockAuthState) : mockAuthState,
}));

beforeEach(() => {
  vi.clearAllMocks();
  mockAuthState.companies = [COMPANY_HR, COMPANY_1001];
});

describe("AccountantSubmissions — heading", () => {
  it("shows the page title", () => {
    render(<AccountantSubmissions />);
    expect(screen.getByText("Skilastaða")).toBeInTheDocument();
  });

  it("shows table column headers", () => {
    render(<AccountantSubmissions />);
    expect(screen.getByText("Fyrirtæki")).toBeInTheDocument();
    expect(screen.getByText("Tímabil")).toBeInTheDocument();
    expect(screen.getByText("Tegund")).toBeInTheDocument();
    expect(screen.getByText("Skiladagur")).toBeInTheDocument();
    expect(screen.getByText("Staða")).toBeInTheDocument();
  });
});

describe("AccountantSubmissions — empty state", () => {
  it("shows empty message when the user has no assigned companies", () => {
    mockAuthState.companies = [];
    render(<AccountantSubmissions />);
    expect(screen.getByText("Engar skýrslur fundust")).toBeInTheDocument();
  });

  it("shows empty message when companies don't match any submission", () => {
    mockAuthState.companies = [{ id: "unknown-co", name: "Unknown", role: "user", permissions: EMPTY_PERMISSIONS }];
    render(<AccountantSubmissions />);
    expect(screen.getByText("Engar skýrslur fundust")).toBeInTheDocument();
  });
});

describe("AccountantSubmissions — filtering by company", () => {
  it("shows submissions for the HR company", () => {
    mockAuthState.companies = [COMPANY_HR];
    render(<AccountantSubmissions />);
    expect(screen.getAllByText("HR").length).toBeGreaterThanOrEqual(1);
  });

  it("shows submissions for the 1001 Nott company", () => {
    mockAuthState.companies = [COMPANY_1001];
    render(<AccountantSubmissions />);
    expect(screen.getAllByText("1001 Nott").length).toBeGreaterThanOrEqual(1);
  });

  it("shows submissions for both companies when both are assigned", () => {
    render(<AccountantSubmissions />);
    expect(screen.getAllByText("HR").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("1001 Nott").length).toBeGreaterThanOrEqual(1);
  });

  it("does not show 1001 Nott rows when only HR is assigned", () => {
    mockAuthState.companies = [COMPANY_HR];
    render(<AccountantSubmissions />);
    expect(screen.queryByText("1001 Nott")).not.toBeInTheDocument();
  });
});

describe("AccountantSubmissions — status badges", () => {
  it("shows Skilað badge", () => {
    render(<AccountantSubmissions />);
    expect(screen.getAllByText("Skilað").length).toBeGreaterThanOrEqual(1);
  });

  it("shows Í bið badge", () => {
    render(<AccountantSubmissions />);
    expect(screen.getAllByText("Í bið").length).toBeGreaterThanOrEqual(1);
  });

  it("shows Gjaldfallið badge for overdue submissions", () => {
    mockAuthState.companies = [COMPANY_1001];
    render(<AccountantSubmissions />);
    expect(screen.getByText("Gjaldfallið")).toBeInTheDocument();
  });
});

describe("AccountantSubmissions — table content", () => {
  it("shows submission types (VSK, Launaskýrsla)", () => {
    render(<AccountantSubmissions />);
    expect(screen.getAllByText("VSK").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Launaskýrsla").length).toBeGreaterThanOrEqual(1);
  });

  it("shows period labels", () => {
    render(<AccountantSubmissions />);
    expect(screen.getAllByText("Mars 2026").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Febrúar 2026").length).toBeGreaterThanOrEqual(1);
  });
});
