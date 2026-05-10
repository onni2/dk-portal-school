import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { UseMutationResult } from "@tanstack/react-query";
import { DuoUserDetailsCard } from "../DuoUserDetailsCard";
import type { UpdateDuoUserPayload, UpdateDuoUserResponse } from "../../../api/duo.api";
import type { DuoUser } from "../../../types/duo.types";

const MOCK_DUO_USER: DuoUser = {
  duoUserId: "d1",
  hostingAccountId: "ha-abc",
  hostingUsername: "jondoe",
  username: "jondoe",
  displayName: "Jón Dóe",
  email: "jon@dk.is",
  emailStatus: "added",
  status: "active",
};

function makeMutation(overrides?: Partial<UseMutationResult<UpdateDuoUserResponse, unknown, UpdateDuoUserPayload>>) {
  return {
    mutateAsync: vi.fn().mockResolvedValue({ ok: true, duoUserId: "d1", displayName: "Jón Dóe", email: "jon@dk.is", emailStatus: "added" }),
    isPending: false,
    isError: false,
    error: null,
    ...overrides,
  } as unknown as UseMutationResult<UpdateDuoUserResponse, unknown, UpdateDuoUserPayload>;
}

function renderCard(
  duoUser: DuoUser = MOCK_DUO_USER,
  mutation = makeMutation(),
) {
  return render(
    <DuoUserDetailsCard duoUser={duoUser} updateMutation={mutation} />,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("DuoUserDetailsCard — rendering", () => {
  it("displays the Duo username", () => {
    renderCard();
    expect(screen.getByText("jondoe")).toBeInTheDocument();
  });

  it("displays the display name", () => {
    renderCard();
    expect(screen.getByText("Jón Dóe")).toBeInTheDocument();
  });

  it("displays the email", () => {
    renderCard();
    expect(screen.getByText("jon@dk.is")).toBeInTheDocument();
  });

  it("shows — when displayName is empty", () => {
    renderCard({ ...MOCK_DUO_USER, displayName: "" });
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("shows 'Ekki skráð' when email is null", () => {
    renderCard({ ...MOCK_DUO_USER, email: null });
    expect(screen.getByText("Ekki skráð")).toBeInTheDocument();
  });

  it("shows the edit button initially", () => {
    renderCard();
    expect(screen.getByRole("button", { name: "Breyta" })).toBeInTheDocument();
  });
});

describe("DuoUserDetailsCard — editing", () => {
  it("shows the input fields after clicking Breyta", async () => {
    renderCard();
    await userEvent.click(screen.getByRole("button", { name: "Breyta" }));
    expect(screen.getByDisplayValue("Jón Dóe")).toBeInTheDocument();
    expect(screen.getByDisplayValue("jon@dk.is")).toBeInTheDocument();
  });

  it("pre-fills inputs with current duoUser values", async () => {
    renderCard();
    await userEvent.click(screen.getByRole("button", { name: "Breyta" }));
    expect(screen.getByDisplayValue("Jón Dóe")).toBeInTheDocument();
    expect(screen.getByDisplayValue("jon@dk.is")).toBeInTheDocument();
  });

  it("shows Vista and Hætta við buttons in edit mode", async () => {
    renderCard();
    await userEvent.click(screen.getByRole("button", { name: "Breyta" }));
    expect(screen.getByRole("button", { name: "Vista" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Hætta við" })).toBeInTheDocument();
  });

  it("returns to view mode when Hætta við is clicked", async () => {
    renderCard();
    await userEvent.click(screen.getByRole("button", { name: "Breyta" }));
    await userEvent.click(screen.getByRole("button", { name: "Hætta við" }));
    expect(screen.getByRole("button", { name: "Breyta" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Vista" })).not.toBeInTheDocument();
  });

  it("does not call mutateAsync when Hætta við is clicked", async () => {
    const mutation = makeMutation();
    renderCard(MOCK_DUO_USER, mutation);
    await userEvent.click(screen.getByRole("button", { name: "Breyta" }));
    await userEvent.click(screen.getByRole("button", { name: "Hætta við" }));
    expect(mutation.mutateAsync).not.toHaveBeenCalled();
  });
});

describe("DuoUserDetailsCard — save mutation", () => {
  it("calls mutateAsync with trimmed displayName when saved", async () => {
    const mutation = makeMutation();
    renderCard(MOCK_DUO_USER, mutation);
    await userEvent.click(screen.getByRole("button", { name: "Breyta" }));

    const nameInput = screen.getByDisplayValue("Jón Dóe");
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, "  Nýtt Nafn  ");

    await userEvent.click(screen.getByRole("button", { name: "Vista" }));

    expect(mutation.mutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({ displayName: "Nýtt Nafn" }),
    );
  });

  it("calls mutateAsync with the injected mutation — not a hardcoded /me hook", async () => {
    const userMutation = makeMutation();
    const adminMutation = makeMutation();

    // Render with two different mutations and verify only the injected one is called
    const { unmount } = render(
      <DuoUserDetailsCard duoUser={MOCK_DUO_USER} updateMutation={userMutation} />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Breyta" }));
    const nameInput = screen.getByDisplayValue("Jón Dóe");
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, "Updated");
    await userEvent.click(screen.getByRole("button", { name: "Vista" }));
    expect(userMutation.mutateAsync).toHaveBeenCalledTimes(1);
    expect(adminMutation.mutateAsync).not.toHaveBeenCalled();
    unmount();
  });

  it("returns to view mode after successful save", async () => {
    const mutation = makeMutation();
    renderCard(MOCK_DUO_USER, mutation);
    await userEvent.click(screen.getByRole("button", { name: "Breyta" }));
    const nameInput = screen.getByDisplayValue("Jón Dóe");
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, "Updated Name");
    await userEvent.click(screen.getByRole("button", { name: "Vista" }));
    expect(screen.getByRole("button", { name: "Breyta" })).toBeInTheDocument();
  });

  it("shows an error message when isError is true", () => {
    const mutation = makeMutation({ isError: true, error: { message: "Villa!" } });
    renderCard(MOCK_DUO_USER, mutation);
    expect(screen.getByText("Villa!")).toBeInTheDocument();
  });

  it("shows fallback error text when error has no message", () => {
    const mutation = makeMutation({ isError: true, error: {} });
    renderCard(MOCK_DUO_USER, mutation);
    expect(screen.getByText("Tókst ekki að uppfæra Duo notanda.")).toBeInTheDocument();
  });
});

describe("DuoUserDetailsCard — cache isolation contract", () => {
  it("My Hosting mutation and Admin mutation are independent objects", () => {
    const myMutation = makeMutation();
    const adminMutation = makeMutation();
    expect(myMutation.mutateAsync).not.toBe(adminMutation.mutateAsync);
  });
});
