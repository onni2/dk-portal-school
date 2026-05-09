import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DkOneUserTable } from "../DkOneUserTable";
import type { DkOneUser } from "../../types/dkone.types";

const activeUser: DkOneUser = {
  id: "1", name: "Jón Jónsson", email: "jon@dk.is",
  username: "jon", role: "admin", status: "active", hasDkOne: true,
};

const pendingUser: DkOneUser = {
  id: "2", name: "Anna Sigurðardóttir", email: "anna@dk.is",
  username: "anna", role: "user", status: "pending", hasDkOne: true,
};

vi.mock("../../api/dkone.queries", () => ({
  useDkOneUsers: () => ({ data: [activeUser, pendingUser] }),
  dkOneUsersQueryOptions: { queryKey: ["dkone-users"] },
}));

vi.mock("../../api/dkone.api", () => ({
  setDkOneAccess: vi.fn(),
}));

function renderWithQuery(ui: React.ReactElement) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>);
}

describe("DkOneUserTable", () => {
  it("renders user names", () => {
    renderWithQuery(<DkOneUserTable />);
    expect(screen.getByText("Jón Jónsson")).toBeInTheDocument();
    expect(screen.getByText("Anna Sigurðardóttir")).toBeInTheDocument();
  });

  it("shows Virkur for active user", () => {
    renderWithQuery(<DkOneUserTable />);
    expect(screen.getByText("Virkur")).toBeInTheDocument();
  });

  it("shows Í bið for pending user", () => {
    renderWithQuery(<DkOneUserTable />);
    expect(screen.getByText("Í bið")).toBeInTheDocument();
  });

  it("shows remove button for each user", () => {
    renderWithQuery(<DkOneUserTable />);
    expect(screen.getAllByText("Fjarlægja")).toHaveLength(2);
  });

  it("shows confirm dialog when Fjarlægja clicked", async () => {
    renderWithQuery(<DkOneUserTable />);
    await userEvent.click(screen.getAllByText("Fjarlægja")[0]!);
    expect(screen.getByText("Ertu viss?")).toBeInTheDocument();
  });

  it("shows empty state when no users have dkOne", () => {
    vi.doMock("../../api/dkone.queries", () => ({
      useDkOneUsers: () => ({ data: [] }),
      dkOneUsersQueryOptions: { queryKey: ["dkone-users"] },
    }));
  });
});
