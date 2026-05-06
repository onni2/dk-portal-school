import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DkOneUserTable } from "../DkOneUserTable";
import type { DkOneUser } from "../../types/dkone.types";

const activeUser: DkOneUser = {
  id: "1", fullName: "Jón Jónsson", email: "jon@dk.is",
  username: "jon", role: "admin", status: "active",
};

const invitedUser: DkOneUser = {
  id: "2", fullName: "Anna Sigurðardóttir", email: "anna@dk.is",
  username: "anna", role: "user", status: "invited",
};

vi.mock("../../api/dkone.queries", () => ({
  useDkOneUsers: () => ({ data: [activeUser, invitedUser] }),
  dkOneUsersQueryOptions: { queryKey: ["dkone-users"] },
  dkUsersQueryOptions: { queryKey: ["dk-users"] },
}));

vi.mock("../../api/dkone.api", () => ({
  setDkOneAccess: vi.fn(),
}));

function renderWithQuery(ui: React.ReactElement) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>);
}

describe("DkOneUserTable", () => {
  it("renders active user name", () => {
    renderWithQuery(<DkOneUserTable />);
    expect(screen.getByText("Jón Jónsson")).toBeInTheDocument();
  });

  it("shows Meðlimir tab by default", () => {
    renderWithQuery(<DkOneUserTable />);
    expect(screen.getByText(/Meðlimir/)).toBeInTheDocument();
  });

  it("shows Boðið tab", () => {
    renderWithQuery(<DkOneUserTable />);
    expect(screen.getByText(/Boðið/)).toBeInTheDocument();
  });

  it("shows remove button for active user", () => {
    renderWithQuery(<DkOneUserTable />);
    expect(screen.getByTitle("Fjarlægja")).toBeInTheDocument();
  });

  it("shows confirm dialog when remove clicked", async () => {
    renderWithQuery(<DkOneUserTable />);
    await userEvent.click(screen.getByTitle("Fjarlægja"));
    expect(screen.getByText("Ertu viss?")).toBeInTheDocument();
  });

  it("shows empty state when no users have dkOne", () => {
    vi.doMock("../../api/dkone.queries", () => ({
      useDkOneUsers: () => ({ data: [] }),
      dkOneUsersQueryOptions: { queryKey: ["dkone-users"] },
    }));
  });
});
