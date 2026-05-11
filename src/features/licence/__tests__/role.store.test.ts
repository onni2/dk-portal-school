import { describe, it, expect, beforeEach } from "vitest";
import { useRoleStore } from "../store/role.store";

beforeEach(() => {
  useRoleStore.setState({ role: "client" });
});

describe("useRoleStore", () => {
  it("starts as client when no auth user is set", () => {
    expect(useRoleStore.getState().role).toBe("client");
  });

  it("setRole sets to cop", () => {
    useRoleStore.getState().setRole("cop");
    expect(useRoleStore.getState().role).toBe("cop");
  });

  it("setRole sets back to client", () => {
    useRoleStore.getState().setRole("cop");
    useRoleStore.getState().setRole("client");
    expect(useRoleStore.getState().role).toBe("client");
  });

  it("toggleRole switches from client to cop", () => {
    useRoleStore.setState({ role: "client" });
    useRoleStore.getState().toggleRole();
    expect(useRoleStore.getState().role).toBe("cop");
  });

  it("toggleRole switches from cop to client", () => {
    useRoleStore.setState({ role: "cop" });
    useRoleStore.getState().toggleRole();
    expect(useRoleStore.getState().role).toBe("client");
  });

  it("toggling twice returns to original role", () => {
    useRoleStore.getState().toggleRole();
    useRoleStore.getState().toggleRole();
    expect(useRoleStore.getState().role).toBe("client");
  });
});
