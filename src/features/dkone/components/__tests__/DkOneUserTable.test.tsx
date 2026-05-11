import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DkOneUserTable } from "../DkOneUserTable";
import type { DkOneUser } from "../../types/dkone.types";

const activeUser: DkOneUser = {
  id: "1",
  companyId: "comp-1",
  fullName: "Jón Jónsson",
  email: "jon@dk.is",
  username: "jon",
  employeeNumber: null,
  role: "admin",
  status: "active",
  createdAt: "2026-01-01T00:00:00Z",
  addedByName: null,
};

const invitedUser: DkOneUser = {
  id: "2",
  companyId: "comp-1",
  fullName: "Anna Sigurðardóttir",
  email: "anna@dk.is",
  username: "anna",
  employeeNumber: null,
  role: "user",
  status: "invited",
  createdAt: "2026-01-02T00:00:00Z",
  addedByName: null,
};

vi.mock("../../api/dkone.queries", () => ({
  useDkOneUsers: () => ({ data: [activeUser, invitedUser] }),
  dkOneUsersQueryOptions: { queryKey: ["dkone-users"] },
  dkUsersQueryOptions: { queryKey: ["dk-users"] },
}));

vi.mock("../../api/dkone.api", () => ({
  removeDkOneUser: vi.fn(() => Promise.resolve()),
  activateDkOneUser: vi.fn(() => Promise.resolve()),
}));

vi.mock("../ChangeRoleModal", () => ({
  ChangeRoleModal: () => <div data-testid="change-role-modal" />,
}));

function renderWithQuery(ui: React.ReactElement) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>);
}

describe("DkOneUserTable", () => {
  it("renders user names", () => {
    renderWithQuery(<DkOneUserTable />);
    expect(screen.getByText("Jón Jónsson")).toBeInTheDocument();
  });

  it("shows active user's role label", () => {
    renderWithQuery(<DkOneUserTable />);
    expect(screen.getByText("Stjórnandi")).toBeInTheDocument();
  });

  it("shows invited user when switching to Boðið tab", async () => {
    renderWithQuery(<DkOneUserTable />);
    await userEvent.click(screen.getByText(/Boðið/));
    expect(screen.getByText("anna@dk.is")).toBeInTheDocument();
  });

  it("shows remove button for each visible user", () => {
    renderWithQuery(<DkOneUserTable />);
    expect(screen.getAllByTitle("Fjarlægja")).toHaveLength(1);
  });

  it("shows confirm dialog when remove button is clicked", async () => {
    renderWithQuery(<DkOneUserTable />);
    await userEvent.click(screen.getAllByTitle("Fjarlægja")[0]!);
    expect(screen.getByText("Ertu viss?")).toBeInTheDocument();
  });

  it("shows empty state when no users have dkOne", () => {
    vi.doMock("../../api/dkone.queries", () => ({
      useDkOneUsers: () => ({ data: [] }),
      dkOneUsersQueryOptions: { queryKey: ["dkone-users"] },
      dkUsersQueryOptions: { queryKey: ["dk-users"] },
    }));
  });
});
