import { describe, it, expect } from "vitest";
import { authRoleToUserRole } from "../role-mapping";

describe("authRoleToUserRole", () => {
  it("maps god to cop", () => {
    expect(authRoleToUserRole("god")).toBe("cop");
  });

  it("maps super_admin to cop", () => {
    expect(authRoleToUserRole("super_admin")).toBe("cop");
  });

  it("maps user to client", () => {
    expect(authRoleToUserRole("user")).toBe("client");
  });
});
