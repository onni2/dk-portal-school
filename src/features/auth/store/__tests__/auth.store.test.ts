import { describe, it, expect, beforeEach } from "vitest";
import { useAuthStore } from "../auth.store";
import type { User, CompanyMembership } from "../../types/auth.types";

const MOCK_USER: User = {
  id: "u1",
  name: "Jón Jónsson",
  email: "jon@dk.is",
  role: "user",
  mustResetPassword: false,
  companyId: "c1",
};

const MOCK_COMPANIES: CompanyMembership[] = [
  {
    id: "c1",
    name: "HR ehf.",
    role: "admin",
    permissions: {
      invoices: true, subscription: true, hosting: false,
      pos: false, dkOne: false, dkPlus: false, timeclock: true, users: true,
    },
  },
  {
    id: "c2",
    name: "Bokhald ehf.",
    role: "user",
    permissions: {
      invoices: true, subscription: false, hosting: false,
      pos: false, dkOne: false, dkPlus: false, timeclock: false, users: false,
    },
  },
];

beforeEach(() => {
  localStorage.removeItem("dk-auth-user");
  localStorage.removeItem("dk-auth-token");
  localStorage.removeItem("dk-auth-companies");
  localStorage.removeItem("dk-auth-permissions");
  localStorage.removeItem("dk-company-token");
  useAuthStore.setState({
    user: null,
    token: null,
    companies: [],
    permissions: {
      invoices: false, subscription: false, hosting: false, pos: false,
      dkOne: false, dkPlus: false, timeclock: false, users: false,
    },
    isAuthenticated: false,
    isLoading: false,
  });
});

describe("useAuthStore", () => {
  it("starts unauthenticated with no user or token", () => {
    const { user, token, isAuthenticated } = useAuthStore.getState();
    expect(user).toBeNull();
    expect(token).toBeNull();
    expect(isAuthenticated).toBe(false);
  });

  it("setAuth sets user, token, companies and marks authenticated", () => {
    useAuthStore.getState().setAuth(MOCK_USER, "tok-123", MOCK_COMPANIES);
    const state = useAuthStore.getState();
    expect(state.user).toEqual(MOCK_USER);
    expect(state.token).toBe("tok-123");
    expect(state.companies).toEqual(MOCK_COMPANIES);
    expect(state.isAuthenticated).toBe(true);
  });

  it("setAuth derives permissions from the active company", () => {
    useAuthStore.getState().setAuth(MOCK_USER, "tok-123", MOCK_COMPANIES);
    const { permissions } = useAuthStore.getState();
    expect(permissions.invoices).toBe(true);
    expect(permissions.timeclock).toBe(true);
    expect(permissions.hosting).toBe(false);
  });

  it("setAuth persists to localStorage", () => {
    useAuthStore.getState().setAuth(MOCK_USER, "tok-123", MOCK_COMPANIES);
    expect(localStorage.getItem("dk-auth-token")).toBe("tok-123");
    expect(JSON.parse(localStorage.getItem("dk-auth-user")!)).toEqual(MOCK_USER);
  });

  it("setToken updates only the token", () => {
    useAuthStore.getState().setAuth(MOCK_USER, "old-tok", MOCK_COMPANIES);
    useAuthStore.getState().setToken("new-tok");
    const state = useAuthStore.getState();
    expect(state.token).toBe("new-tok");
    expect(state.user).toEqual(MOCK_USER);
  });

  it("setActiveCompany updates companyId on the user and derives permissions", () => {
    useAuthStore.getState().setAuth(MOCK_USER, "tok-123", MOCK_COMPANIES);
    useAuthStore.getState().setActiveCompany("c2");
    const state = useAuthStore.getState();
    expect(state.user?.companyId).toBe("c2");
    expect(state.permissions.invoices).toBe(true);
    expect(state.permissions.timeclock).toBe(false);
  });

  it("setActiveCompany accepts explicit permissions override", () => {
    useAuthStore.getState().setAuth(MOCK_USER, "tok-123", MOCK_COMPANIES);
    const override = { invoices: false, subscription: false, hosting: true, pos: true, dkOne: false, dkPlus: false, timeclock: false, users: false };
    useAuthStore.getState().setActiveCompany("c2", override);
    expect(useAuthStore.getState().permissions).toEqual(override);
  });

  it("setActiveCompany does nothing when not logged in", () => {
    useAuthStore.getState().setActiveCompany("c2");
    expect(useAuthStore.getState().user).toBeNull();
  });

  it("clearAuth resets all state and removes localStorage keys", () => {
    useAuthStore.getState().setAuth(MOCK_USER, "tok-123", MOCK_COMPANIES);
    useAuthStore.getState().clearAuth();
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.companies).toEqual([]);
    expect(state.isAuthenticated).toBe(false);
    expect(localStorage.getItem("dk-auth-token")).toBeNull();
    expect(localStorage.getItem("dk-auth-user")).toBeNull();
    expect(localStorage.getItem("dk-auth-permissions")).toBeNull();
  });

  it("setLoading toggles the loading flag", () => {
    useAuthStore.getState().setLoading(true);
    expect(useAuthStore.getState().isLoading).toBe(true);
    useAuthStore.getState().setLoading(false);
    expect(useAuthStore.getState().isLoading).toBe(false);
  });
});
