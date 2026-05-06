import { describe, it, expect, beforeEach } from "vitest";
import { usePortalUsersStore } from "../store/users.store";
import { SEED_USERS } from "@/mocks/users.mock";
import type { PortalUser } from "../types/users.types";

const NEW_USER: PortalUser = {
  id: "99",
  username: "nyr@dk.is",
  password: "dk",
  email: "nyr@dk.is",
  name: "Nýr Notandi",
  role: "user",
  status: "active",
  mustResetPassword: true,
  createdAt: new Date().toISOString(),
  kennitala: "0000000000",
};

beforeEach(() => {
  localStorage.removeItem("dk-portal-users");
  usePortalUsersStore.setState({ users: SEED_USERS });
});

describe("usePortalUsersStore", () => {
  it("starts with the 5 seed users", () => {
    expect(usePortalUsersStore.getState().users).toHaveLength(5);
  });

  it("seed users all have a name and email", () => {
    usePortalUsersStore.getState().users.forEach((u) => {
      expect(u.name).toBeTruthy();
      expect(u.email).toBeTruthy();
    });
  });

  it("addUser appends a user", () => {
    usePortalUsersStore.getState().addUser(NEW_USER);
    const users = usePortalUsersStore.getState().users;
    expect(users).toHaveLength(6);
    expect(users.find((u) => u.id === "99")).toBeDefined();
  });

  it("addUser does not mutate existing users", () => {
    const before = usePortalUsersStore.getState().users[0];
    usePortalUsersStore.getState().addUser(NEW_USER);
    const after = usePortalUsersStore.getState().users[0];
    expect(after).toEqual(before);
  });

  it("removeUser removes by id", () => {
    usePortalUsersStore.getState().removeUser("1");
    const users = usePortalUsersStore.getState().users;
    expect(users).toHaveLength(4);
    expect(users.find((u) => u.id === "1")).toBeUndefined();
  });

  it("removeUser keeps other users intact", () => {
    usePortalUsersStore.getState().removeUser("1");
    const users = usePortalUsersStore.getState().users;
    expect(users.find((u) => u.id === "2")).toBeDefined();
  });

  it("removeUser on unknown id does not change the list", () => {
    usePortalUsersStore.getState().removeUser("does-not-exist");
    expect(usePortalUsersStore.getState().users).toHaveLength(5);
  });

  it("updateUser patches only the specified fields", () => {
    usePortalUsersStore.getState().updateUser("1", { name: "Breytt Nafn" });
    const user = usePortalUsersStore.getState().users.find((u) => u.id === "1")!;
    expect(user.name).toBe("Breytt Nafn");
    expect(user.email).toBe(SEED_USERS[0]!.email);
  });

  it("updateUser does not affect other users", () => {
    usePortalUsersStore.getState().updateUser("1", { name: "X" });
    const user2 = usePortalUsersStore.getState().users.find((u) => u.id === "2")!;
    expect(user2.name).toBe(SEED_USERS[1]!.name);
  });

  it("updateUser on unknown id does not change the list length", () => {
    usePortalUsersStore.getState().updateUser("nope", { name: "Ghost" });
    expect(usePortalUsersStore.getState().users).toHaveLength(5);
  });
});
